<?php

declare(strict_types=1);

namespace BundleConfigurator\Storefront\Controller;

use Shopware\Core\Checkout\Cart\Price\Struct\CalculatedPrice;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class CustomBundleController extends AbstractExtension
{
    private EntityRepository $bundleRepository;
    private EntityRepository $productRepository;

    public function __construct(
        EntityRepository $bundleRepository,
        EntityRepository $productRepository
    )
    {
        $this->bundleRepository = $bundleRepository;
        $this->productRepository = $productRepository;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getBundleSet', [$this, 'getBundleSet']),
            new TwigFunction('getBundleTotal', [$this, 'getBundleTotal']),
            new TwigFunction('getShoppingListStock',[$this,'getShoppingListStock']),
            new TwigFunction('compareShoppingListStock', [$this, 'compareShoppingListStock']),
        ];
    }

    /**
     * Get all bundles assigned to a product
     */
    public function getBundleSet(string $productId): ?array
    {
        $criteria = new Criteria();
        $criteria->addAssociation('bundleAssignedProducts');
        $criteria->addAssociation('bundleAssignedProducts.product.prices');
        $criteria->addAssociation('bundleAssignedProducts.product.prices.rule');
        $criteria->addAssociation('bundleAssignedProducts.product.options.group');
        $criteria->addAssociation('bundleAssignedProducts.product.customPrice');
        $criteria->addAssociation('bundleAssignedProducts.product.options');
        $criteria->addAssociation('bundleAssignedProducts.product.properties');
        $criteria->addFilter(new EqualsFilter('productId', $productId));

        return $this->bundleRepository
            ->search($criteria, Context::createDefaultContext())
            ->getElements();
    }

    /**
     * Get the total and name for a specific bundle
     */
    public function getBundleTotal(array $bundles, string $bundleId): ?array
    {
        if (!isset($bundles[$bundleId])) {
            return null;
        }

        $bundleItems = $bundles[$bundleId];
        $bundleTotal = 0;
        $bundleName = $this->getBundleName($bundleId) ?? "Unnamed Bundle";
        $selectedProducts = [];

        foreach ($bundleItems as $item) {
            $price = $item['price'] ?? 0;
            $discount = $item['discount'] ?? 0;
            $discountType = $item['discountType'] ?? 'percentage';
            $productName = $this->getProductName($item['id']) ?? "Unnamed Product";

            if ($discountType === 'percentage') {
                $discountedPrice = $price * (1 - ($discount / 100));
            } elseif ($discountType === 'fixed') {
                $discountedPrice = max(0, $price - $discount);
            } else {
                $discountedPrice = $price;
            }

            $bundleTotal += $discountedPrice;
            $selectedProducts[] = $productName;
        }

        return [
            'name' => $bundleName,
            'total' => $bundleTotal,
            'selectedProducts' => $selectedProducts,
        ];
    }

    public function getShoppingListStock(array $productItems): array
    {
        $referencedIds = array_map(fn($item) => $item['referencedId'], $productItems);

        $criteria = new Criteria($referencedIds);
        $criteria->addAssociation('prices');

        $products = $this->productRepository
            ->search($criteria, Context::createDefaultContext())
            ->getEntities();

        $filteredItems = [];

        foreach ($productItems as $key => $item) {
            $product = $products->get($item['referencedId']);

            if (!$product || $product->getStock() <= 0) {
                continue;
            }

            $price = $product->getPrice()?->first();
            $item['price'] = $price ? $price->getGross() : 0.0;

            $filteredItems[$key] = $item;
        }

        return $filteredItems;
    }

    public function compareShoppingListStock(array $productItems,  $shoppingListItems): array
    {

        $validProductKeys = array_keys($productItems);

        $result = [];

        foreach ($shoppingListItems->getElements() as $key => $item) {
            if (!in_array($key, $validProductKeys, true)) {

                $price = $item->getPrice();

                if ($price instanceof CalculatedPrice) {
                    $zeroPrice = new CalculatedPrice(
                        0.0,
                        0.0,
                        $price->getCalculatedTaxes(),
                        $price->getTaxRules(),
                        $price->getQuantity()
                    );

                    $item->setPrice($zeroPrice);
                }
            }

            $result[$key] = $item;
        }

        return $result;
    }


    /**
     * Get the name of a specific bundle
     */
    private function getBundleName(string $bundleId): ?string
    {
        $criteria = new Criteria([$bundleId]);
        $bundle = $this->bundleRepository
            ->search($criteria, Context::createDefaultContext())
            ->first();

        return $bundle ? $bundle->getTranslation('name') : null;
    }

    private function getProductName(string $productId): ?string
    {
        $criteria = new Criteria([$productId]);
        $criteria->addAssociation('options');
        $criteria->addAssociation('options.group.name');

        $bundle = $this->productRepository
            ->search($criteria, Context::createDefaultContext())
            ->first();

        if (!$bundle) {
            return null;
        }

        $productName = $bundle->getTranslation('name') ?? '';

        $variantSelection = $bundle->getOptions()?->getElements() ?? [];

        $firstOption = reset($variantSelection);
        if (!$firstOption) {
            return trim($productName);
        }

        $groupName = $firstOption->getGroup()?->getName() ?? '';
        $optionName = $firstOption->getName() ?? '';

        $variantFullName = trim("{$productName} {$groupName} {$optionName}");

        return $variantFullName !== '' ? $variantFullName : null;
    }

}