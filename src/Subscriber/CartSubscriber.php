<?php declare(strict_types=1);

namespace BundleConfigurator\Subscriber;

use Shopware\Commercial\B2B\ShoppingList\Event\ShoppingListLineItemsLoadedEvent;
use Shopware\Core\Checkout\Cart\Event\BeforeLineItemAddedEvent;
use Shopware\Core\Checkout\Cart\Price\Struct\CalculatedPrice;
use Shopware\Core\Checkout\Cart\Tax\Struct\CalculatedTaxCollection;
use Shopware\Core\Checkout\Cart\Tax\Struct\TaxRuleCollection;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Storefront\Page\Product\ProductPageLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;

class CartSubscriber implements EventSubscriberInterface
{
    private EntityRepository $productRepository;
    private RequestStack $requestStack;

    public function __construct(
        EntityRepository $productRepository,
        RequestStack     $requestStack
    )
    {
        $this->productRepository = $productRepository;
        $this->requestStack = $requestStack;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            BeforeLineItemAddedEvent::class => 'onBeforeLineItemAdded',
            ProductPageLoadedEvent::class => 'onProductPageLoaded',
            ShoppingListLineItemsLoadedEvent::class => 'onShoppingListLineItemsLoaded',
        ];
    }

    /**
     * Handles logic before a line item is added to the cart.
     */
    public function onBeforeLineItemAdded(BeforeLineItemAddedEvent $event): void
    {
        $request = $this->requestStack->getCurrentRequest();
        $bundleSelection = $this->getDecodedBundleSelection($request);
        
        if (empty($bundleSelection)) {
            return;
        }

        $lineItem = $event->getLineItem();
        $cart = $event->getCart();

            foreach ($bundleSelection as $bundleId => $items) {
                if (!isset($items[0]['parentProductId']) || $items[0]['parentProductId'] !== $lineItem->getReferencedId()) {
                    return;
                }

                foreach ($items as $item) {
                    $newLineItem = $this->createBundleLineItem($lineItem, $item, $bundleId);

                    if ($this->isDuplicateItem($cart, $newLineItem)) {
                        $newLineItem->setId(Uuid::randomHex());
                    }

                    $cart->add($newLineItem);
                }
            }

        $cart->remove($lineItem->getId());
    }

    private function getDecodedBundleSelection(?Request $request): array
    {
        if (!$request) {
            return [];
        }

        $cookieValue = $request->cookies->get('bundleSelection');
        if (!$cookieValue) {
            return [];
        }

        try {
            $decoded = json_decode($cookieValue, true, 512, JSON_THROW_ON_ERROR);
            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function createBundleLineItem(LineItem $baseLineItem, array $itemData, string $bundleId): LineItem
    {

        $lineItem = new LineItem(
            Uuid::randomHex(),
            LineItem::PRODUCT_LINE_ITEM_TYPE,
            $itemData['id'],
            $baseLineItem->getQuantity() * $itemData['bundleQuantity']
        );

        if($baseLineItem->getPayloadValue('isSubscription') === true)
        {
            $lineItem->setPayloadValue('isSubscription', true);
            $lineItem->setPayloadValue('subscriptionData', $baseLineItem->getPayloadValue('subscriptionData'));
            $lineItem->setPayloadValue('subscriptionInterval', $baseLineItem->getPayloadValue('subscriptionInterval'));
            $lineItem->setPayloadValue('subscriptionId', $baseLineItem->getPayloadValue('subscriptionId'));
        }


        $lineItem->setPayloadValue('bundleId', $bundleId);
        $lineItem->setPayloadValue('bundleName', $itemData['bundleName']);
        $lineItem->setPayloadValue('discount', $itemData['discount']);
        $lineItem->setPayloadValue('discountType', $itemData['discountType']);
        $lineItem->setStackable(false);
        $lineItem->setRemovable(true);
        return $lineItem;
    }

    private function isDuplicateItem($cart, $lineItem): bool
    {
        foreach ($cart->getLineItems() as $existingLineItem) {
            if ($existingLineItem->getReferencedId() === $lineItem->getReferencedId()) {
                return true;
            }
        }
        return false;
    }

    public function onProductPageLoaded(ProductPageLoadedEvent $event)
    {
        $product = $event->getPage()->getProduct();
        $parentProductId = $event->getPage()->getProduct()->getParentId();

        if ($parentProductId === null) {
            $parentProductId = $product->getId();
        }

        $context = $event->getContext();
        $salesChannelId = $event->getSalesChannelContext()->getSalesChannelId();

        $criteria = new Criteria();
        $parentCriteria = new Criteria([$parentProductId]);
        $criteria->addAssociation('translations');

        $criteria->addFilter(
            new EqualsFilter('parentId', $parentProductId)
        );

        $criteria->addFilter(
            new EqualsFilter('visibilities.salesChannelId', $salesChannelId)
        );

        $criteria->addAssociation('visibilities');
        $criteria->addAssociation('options.group');
        $parentCriteria->addAssociation('options.group');
        $criteria->addAssociation('properties');
        $criteria->addAssociation('customPrice');
        $parentCriteria->addAssociation('properties');
        $parentCriteria->addAssociation('children');
        $parentCriteria->addAssociation('customPrice');
        $criteria->addAssociation('prices');
        $parentCriteria->addAssociation('prices');
        $parentProduct = $this->productRepository->search($parentCriteria, $context)->first();
        $variants = $this->productRepository->search($criteria, $context);

        $possibleVariantOptions = [];

        foreach ($variants as $variant) {

            $possibleVariantOptions[] = $variant;
        }

        $event->getPage()->addArrayExtension('variants', ['parentProduct' => $parentProduct, 'variants' => $possibleVariantOptions]);

    }

    public function onShoppingListLineItemsLoaded(ShoppingListLineItemsLoadedEvent $event): void
    {

        $totalPrice = 0;

        $lineItems = $event->getShoppingLists();

        foreach ($lineItems as $item) {
            $product = $item->getProduct();

            if ($product && $product->getAvailableStock() === 0) {
                $originalPrice = $item->getPrice();

                $zeroPrice = new CalculatedPrice(
                    0.0,
                    0.0,
                    $originalPrice instanceof CalculatedPrice ? $originalPrice->getCalculatedTaxes() : new CalculatedTaxCollection(),
                    $originalPrice instanceof CalculatedPrice ? $originalPrice->getTaxRules() : new TaxRuleCollection(),
                    $originalPrice instanceof CalculatedPrice ? $originalPrice->getQuantity() : 1
                );

                $item->assign(['price' => $zeroPrice]);
                $item->getProduct()->assign(['price' => $zeroPrice]);
            } else {
                $totalPrice += $item->getPrice()->getTotalPrice();

            }
        }

        $event->getSalesChannelContext()->addArrayExtension('totalPriceShoppingList', [$totalPrice]);
    }

}