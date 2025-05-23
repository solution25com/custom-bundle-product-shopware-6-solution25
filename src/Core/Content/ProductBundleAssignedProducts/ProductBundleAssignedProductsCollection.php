<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundleAssignedProducts;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void add(ProductBundleAssignedProductsEntity $entity)
 * @method void set(string $key, ProductBundleAssignedProductsEntity $entity)
 * @method ProductBundleAssignedProductsEntity[] getIterator()
 * @method ProductBundleAssignedProductsEntity[] getElements()
 * @method ProductBundleAssignedProductsEntity|null get(string $key)
 * @method ProductBundleAssignedProductsEntity|null first()
 * @method ProductBundleAssignedProductsEntity|null last()
 */
class ProductBundleAssignedProductsCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ProductBundleAssignedProductsEntity::class;
    }
}
