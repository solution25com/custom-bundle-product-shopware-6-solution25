<?php declare(strict_types=1);

namespace BundleConfigurator\Subscriber;

use Shopware\Core\Checkout\Cart\Event\BeforeLineItemAddedEvent;
use Shopware\Core\Checkout\Cart\Event\BeforeLineItemQuantityChangedEvent;
use Shopware\Core\Checkout\Cart\Event\CheckoutOrderPlacedEvent;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Context;
use Shopware\Storefront\Page\Product\ProductPageLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Checkout\Cart\SalesChannel\CartService;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Exception\InvalidCartException;
use Shopware\Core\Framework\Log\Package;

class CartSubscriber implements EventSubscriberInterface
{
  private EntityRepository $productRepository;
  private RequestStack $requestStack;
  private EntityRepository $productBundleRepository;
  private CartService $cartService;

  public function __construct(
    EntityRepository $productRepository,
    RequestStack     $requestStack,
    EntityRepository $productBundleRepository,
    CartService      $cartService
  )
  {
    $this->productRepository = $productRepository;
    $this->requestStack = $requestStack;
    $this->productBundleRepository = $productBundleRepository;
    $this->cartService = $cartService;
  }

  public static function getSubscribedEvents(): array
  {
    return [
      BeforeLineItemAddedEvent::class => 'onBeforeLineItemAdded',
      CheckoutOrderPlacedEvent::class => 'onOrderPlaced',
      BeforeLineItemQuantityChangedEvent::class => 'onBeforeLineItemQuantityChangedEvent',
      ProductPageLoadedEvent::class => 'onProductPageLoaded',
    ];
  }

  public function onBeforeLineItemQuantityChangedEvent(BeforeLineItemQuantityChangedEvent $event): void
  {
    $lineItem = $event->getLineItem();
    $cart = $event->getCart();
    $salesChannelContext = $event->getSalesChannelContext();
    $context = $event->getContext();

    $bundles = $lineItem->getPayload()['selected_bundles']['bundles'] ?? [];

    if (empty($bundles)) {
      return;
    }

    $allStocks = [];
    $firstProductName = null;

    foreach ($bundles as $bundleId => $bundleProducts) {
      foreach ($bundleProducts as $product) {
        $productId = $product['id'] ?? null;

        if (!$productId) {
          continue;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('bundleId', $bundleId));
        $criteria->addFilter(new EqualsFilter('productId', $productId));
        $criteria->addAssociation('product');

        $productBundleEntity = $this->productBundleRepository
          ->search($criteria, $context)
          ->getEntities()
          ->first();

        if (!$productBundleEntity || !$productBundleEntity->getProduct()) {
          continue;
        }

        $stock = $productBundleEntity->getProduct()->getStock();
        $allStocks[] = $stock;

        if ($firstProductName === null) {
          $firstProductName = $productBundleEntity->getProduct()->getName();
        }
      }
    }

    $minStock = !empty($allStocks) ? min($allStocks) : 0;

    if ($lineItem->getQuantity() > $minStock) {
      if ($firstProductName !== null) {
        $this->addFlashMessage($firstProductName);
      }


      $this->cartService->remove($cart, $lineItem->getId(), $salesChannelContext);

      $newLineItem = new LineItem(
        $lineItem->getId(),
        $lineItem->getType(),
        $lineItem->getReferencedId(),
        $minStock
      );

      $newLineItem->setPayload($lineItem->getPayload());
      $newLineItem->setPriceDefinition($lineItem->getPriceDefinition());
      $newLineItem->setStackable(true);
      $newLineItem->setRemovable(true);

      $this->cartService->add($cart, $newLineItem, $salesChannelContext);
    }
  }


  /**
   * Handles logic before a line item is added to the cart.
   */
  public function onBeforeLineItemAdded(BeforeLineItemAddedEvent $event): void
  {
    $request = $this->requestStack->getCurrentRequest();
    $lineItem = $event->getLineItem();
    $cart = $event->getCart();


    $bundleSelectionCookie = $request->cookies->get('bundleSelection');
    if (!$bundleSelectionCookie) {
      return;
    }

    $decodedBundleSelection = [];
    try {
      $decodedBundleSelection = json_decode($bundleSelectionCookie, true, 512, JSON_THROW_ON_ERROR);
    } catch (\Throwable $e) {
      dump($e->getMessage());
      return;
    }

    if (empty($decodedBundleSelection)) {
      return;
    }

    $validatedBundles = ['bundles' => $decodedBundleSelection];

    foreach ($validatedBundles['bundles'] as $bundleId => $bundleItems) {
      $criteria = new Criteria();
      $criteria->addFilter(new EqualsFilter('bundleId', $bundleId));
      $criteria->addFilter(new EqualsFilter('productId', $bundleItems[0]['id']));

      $productBundleEntity = $this->productBundleRepository->search($criteria, $event->getContext())->getEntities()->first();
      if (!$productBundleEntity) {
        unset($validatedBundles['bundles'][$bundleId]);
        continue;
      }

      if ($lineItem->getQuantity() > $productBundleEntity->getQuantity()) {
        $this->addFlashMessage($productBundleEntity->getProduct()->getName());
        unset($validatedBundles['bundles'][$bundleId]);
      }
    }

    $productId = $lineItem->getId();
    if ($lineItem->getPayloadValue('isSubscription')) {
      $productId = $lineItem->getReferencedId();
    }

    if ($this->isProductBundle($productId, $event->getContext())) {
      $lineItem->setStackable(true);
      $lineItem->setRemovable(true);

      $lineItem->setId(Uuid::randomHex());
      $lineItem->setPayloadValue('selected_bundles', $validatedBundles);

      if ($this->isDuplicateItem($cart, $lineItem)) {
        $lineItem->setId(Uuid::randomHex());
      }
    }
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

  /**
   * Handles logic when an order is placed.
   */
  public function onOrderPlaced(CheckoutOrderPlacedEvent $event): void
  {
    $order = $event->getOrder();
    $lineItems = $order->getLineItems();

    foreach ($lineItems as $lineItem) {
      $lineItemPayload = $lineItem->getPayload();
      $selectedBundles = $lineItemPayload['selected_bundles'] ?? [];

      if (empty($selectedBundles['bundles'])) {
        continue;
      }

      foreach ($selectedBundles['bundles'] as $bundleKey => $bundles) {
        foreach ($bundles as $bundle) {
          $this->processBundleUpdate(
            $bundleKey,
            $bundle['id'] ?? '',
            $lineItem->getQuantity(),
            $event->getContext()
          );
        }
      }
    }
  }

  /**
   * Updates the quantity of a product bundle.
   */
  private function processBundleUpdate(string $bundleId, string $productBundleId, int $quantityToDeduct, Context $context): void
  {
    if ($bundleId === '' || $bundleId === null) {
      throw new \InvalidArgumentException('Invalid bundleId provided.');
    }
    if ($productBundleId === null) {
      throw new \InvalidArgumentException('Invalid productBundleId provided.');
    }

    if ($quantityToDeduct <= 0) {
      throw new \InvalidArgumentException('Invalid quantityToDeduct provided.');
    }

    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('bundleId', $bundleId));
    $criteria->addFilter(new EqualsFilter('productId', $productBundleId));

    $productBundleEntity = $this->productBundleRepository->search($criteria, $context)->getEntities()->first();
    if (!$productBundleEntity) {
      throw new \RuntimeException("Product bundle with ID {$bundleId} not found.");
    }

    $currentQuantity = $productBundleEntity->getQuantity() ?? 0;
    if ($currentQuantity < $quantityToDeduct) {
      throw new \RuntimeException("Cannot update bundle. Current quantity for product with ID {$productBundleId} is too high.");
    }

    if ($currentQuantity < 1) {
      throw new \RuntimeException("Cannot update bundle. Current quantity for product with ID {$productBundleId} is too low.");
    }

    $newQuantity = max(0, $currentQuantity - $quantityToDeduct);
    $this->productBundleRepository->update([
      [
        'id' => $productBundleEntity->getId(),
        'bundleId' => $bundleId,
        'quantity' => $newQuantity,
      ],
    ], $context);
  }

  /**
   * Checks if a product is a bundle based on its ID.
   */
  private function isProductBundle(string $productId, Context $context): bool
  {
    $criteria = new Criteria([$productId]);
    $product = $this->productRepository->search($criteria, $context)->first();

    if ($product === null) {
      return false;
    }

    return isset($product->getExtensions()['bundle']);
  }

  /**
   * Extracts query parameters from the current request.
   */
  private function extractQueryParamsFromRequest(?Request $request): array
  {
    if (!$request) {
      return [];
    }

    $referer = $request->headers->get('referer');
    if ($referer && str_contains($referer, '?')) {
      $parsedUrl = parse_url($referer);
      if (isset($parsedUrl['query'])) {
        parse_str($parsedUrl['query'], $queryParams);

        if (isset($queryParams['bundles'])) {
          $decodedBundles = base64_decode($queryParams['bundles']);
          $queryParams['bundles'] = json_decode($decodedBundles, true);
        }

        return $queryParams;
      }
    }

    return [];
  }

  /**
   * Displays a message in cart for products that has limited quantity in bundle configuration
   */
  private function addFlashMessage(string $productName): void
  {
    $request = $this->requestStack->getCurrentRequest();
    if ($request) {
      $session = $request->getSession();
      $session->getFlashBag()->add('warning', "Cannot update bundle. Current quantity for product with name " . $productName . " is too high.");
    }
  }

  public function onProductPageLoaded(ProductPageLoadedEvent $event)
  {
    $product = $event->getPage()->getProduct();
    $parentProductId = $event->getPage()->getProduct()->getParentId();

    if ($parentProductId === null) {
      $parentProductId = $product->getId();
    }

    $criteria = new Criteria();
    $parentCriteria = new Criteria([$parentProductId]);
    $criteria->addAssociation('translations');

    $criteria->addFilter(
      new EqualsFilter('parentId', $parentProductId)
    );
    $criteria->addAssociation('options.group');
    $parentCriteria->addAssociation('options.group');
    $criteria->addAssociation('properties');
    $parentCriteria->addAssociation('properties');
    $parentCriteria->addAssociation('children');
    $criteria->addAssociation('prices');$parentCriteria->addAssociation('prices');
    $criteria->addAssociation('calculatedPrices');$parentCriteria->addAssociation('calculatedPrices');
    $criteria->addAssociation('calculatedPrice');$parentCriteria->addAssociation('calculatedPrice');
    $parentProduct = $this->productRepository->search($parentCriteria, Context::createDefaultContext())->first();
    $variants = $this->productRepository->search($criteria, Context::createDefaultContext());

    $possibleVariantOptions = [];

    foreach ($variants as $variant) {

      $possibleVariantOptions[] = $variant;
    }

    $event->getPage()->addArrayExtension('variants', ['parentProduct' => $parentProduct, 'variants' => $possibleVariantOptions]);

  }

}