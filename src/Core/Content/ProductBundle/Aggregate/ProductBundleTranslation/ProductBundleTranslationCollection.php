<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundle\Aggregate\ProductBundleTranslation;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void add(ProductBundleTranslationEntity $entity)
 * @method void set(string $key, ProductBundleTranslationEntity $entity)
 * @method ProductBundleTranslationEntity[] getIterator()
 * @method ProductBundleTranslationEntity[] getElements()
 * @method ProductBundleTranslationEntity|null get(string $key)
 * @method ProductBundleTranslationEntity|null first()
 * @method ProductBundleTranslationEntity|null last()
 */
class ProductBundleTranslationCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ProductBundleTranslationEntity::class;
    }
}
