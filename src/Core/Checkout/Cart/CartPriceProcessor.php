<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Price\Struct\QuantityPriceDefinition;
use Shopware\Core\Content\Product\SalesChannel\SalesChannelProductEntity;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Checkout\Cart\Price\QuantityPriceCalculator;

class CartPriceProcessor implements CartProcessorInterface
{
    private QuantityPriceCalculator $calculator;

    public function __construct(
        QuantityPriceCalculator $calculator
    )
    {
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
            if (!isset($bundleLineItem->getPayload()['bundleId'])) {
                continue;
            }

            $taxRules = $bundleLineItem->getPrice()?->getTaxRules();
            $quantity = $bundleLineItem->getQuantity();

            if ($taxRules === null || $quantity === 0) {
                throw new \RuntimeException('Invalid tax rules or quantity for bundle line item.');
            }

            $definition = new QuantityPriceDefinition(
                $this->calculateBundleTotal($bundleLineItem),
                $bundleLineItem->getPrice()->getTaxRules(),
                $bundleLineItem->getPrice()->getQuantity()
            );

            $bundleLineItem->setStackable(false);
            $bundleLineItem->setRemovable(true);

            $calculatedPrice = $this->calculator->calculate($definition, $context);

            $bundleLineItem->setPrice($calculatedPrice);
            $bundleLineItem->setPriceDefinition($definition);
        }
    }

    private function calculateBundleTotal(LineItem $lineItem): float
    {
        $price = $lineItem->getPrice()->getUnitPrice() ?? 0;
        $discount = $lineItem->getPayload()['discount'] ?? 0;
        $discountType = $lineItem->getPayload()['discountType'] ?? 'percentage';

        if ($discountType === 'percentage') {
            $discountedPrice = $price * (1 - ($discount / 100));
        } elseif ($discountType === 'fixed') {
            $discountedPrice = $price - ($discount * $lineItem->getQuantity());
        } else {
            $discountedPrice = $price;
        }
        return $discountedPrice;
    }
}
