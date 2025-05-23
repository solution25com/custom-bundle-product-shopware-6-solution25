<?php

declare(strict_types=1);

namespace BundleConfigurator\Storefront\Controller;

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
            new TwigFunction('getBundleTotal', [$this, 'getBundleTotal'])
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
        $criteria->addAssociation('bundleAssignedProducts.product.options.group');
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
        $bundle = $this->productRepository
            ->search($criteria, Context::createDefaultContext())
            ->first();

        return $bundle ? $bundle->getTranslation('name') : null;
    }
}
