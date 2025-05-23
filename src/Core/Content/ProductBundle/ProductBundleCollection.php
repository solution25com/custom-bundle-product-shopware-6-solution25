<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundle;

use Shopware\Core\Checkout\Cart\Order\CartConvertedEvent;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;


/**
 * @method void add(ProductBundleEntity $entity)
 * @method void set(string $key, ProductBundleEntity $entity)
 * @method ProductBundleEntity[] getIterator()
 * @method ProductBundleEntity[] getElements()
 * @method ProductBundleEntity|null get(string $key)
 * @method ProductBundleEntity|null first()
 * @method ProductBundleEntity|null last()
 */
class ProductBundleCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ProductBundleEntity::class;
    }
}
