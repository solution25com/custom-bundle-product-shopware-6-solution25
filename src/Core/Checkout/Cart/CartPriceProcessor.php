<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Price\Struct\QuantityPriceDefinition;
use Shopware\Core\Content\Product\ProductEntity;
use Shopware\Core\Content\Product\SalesChannel\SalesChannelProductEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Pricing\PriceCollection;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Context;
use Shopware\Core\Checkout\Cart\Price\QuantityPriceCalculator;

class CartPriceProcessor implements CartProcessorInterface
{
    private EntityRepository $productRepository;
    private QuantityPriceCalculator $calculator;

    public function __construct(
        EntityRepository        $productRepository,
        QuantityPriceCalculator $calculator
    )
    {
        $this->productRepository = $productRepository;
        $this->calculator = $calculator;
    }

    public function process(CartDataCollection $data, Cart $original, Cart $toCalculate, SalesChannelContext $context, CartBehavior $behavior): void
    {
        $bundleLineItems = $original->getLineItems()->filterType('product');
        $dataFiltered = $data->filterInstance(SalesChannelProductEntity::class);

        if (!$dataFiltered || \count($bundleLineItems) === 0) {
            return;
        }

        foreach ($bundleLineItems as $bundleLineItem) {
            $product = $dataFiltered->get('product-'.$bundleLineItem->getReferencedId());
            if (!$product instanceof SalesChannelProductEntity || !$product->hasExtension('bundle')) {
                continue;
            }

            $taxRules = $bundleLineItem->getPrice()?->getTaxRules();
            $quantity = $bundleLineItem->getQuantity();

            if ($taxRules === null || $quantity === 0) {
                throw new \RuntimeException('Invalid tax rules or quantity for bundle line item.');
            }

            $definition = new QuantityPriceDefinition(
                $this->calculateBundleTotal($bundleLineItem, $product),
                $bundleLineItem->getPrice()->getTaxRules(),
                $bundleLineItem->getPrice()->getQuantity()
            );

            $calculatedPrice = $this->calculator->calculate($definition, $context);

            $bundleLineItem->setPrice($calculatedPrice);
            $bundleLineItem->setPriceDefinition($definition);
        }
    }

    private function calculateBundleTotal(LineItem $lineItem, SalesChannelProductEntity $product): float
    {

        $bundles = $lineItem->getPayloadValue('selected_bundles');
        if (isset($bundles['bundles'])) {
            $totalAll = 0;
        }else{
            $totalAll = $this->getProductDefaultPrice($product);
        }

        if (empty($bundles['bundles'])) {
            return $this->getProductDefaultPrice($product);
        }
        foreach ($bundles['bundles'] as $bundle) {
            foreach ($bundle as $item) {
              $price = $item['bundleQuantity'] * $item['price'] ?? 0;
                $discount = $item['discount'] ?? 0;
                $discountType = $item['discountType'] ?? 'percentage';

                if ($discountType === 'percentage') {
                    $discountedPrice = $price * (1 - ($discount / 100));
                } elseif ($discountType === 'fixed') {
                    $discountedPrice = max(0, $price - $discount);
                } else {
                    $discountedPrice = $price;
                }

                $totalAll += $discountedPrice;
            }
        }

        return $totalAll;
    }

    private function getProductDefaultPrice(SalesChannelProductEntity $product): float
    {
        $priceCollection = $product->getPrice();

        if (!$priceCollection || $priceCollection->count() === 0) {
            throw new \RuntimeException("Price not found for product with ID {$product->getId()}.");
        }

        $price = $priceCollection->first();
        return $price->getGross();
    }

}
