<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundle\Aggregate\ProductBundleTranslation;

use BundleConfigurator\Core\Content\ProductBundle\ProductBundleDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityTranslationDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\ApiAware;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class ProductBundleTranslationDefinition extends EntityTranslationDefinition
{

    const ENTITY_NAME = 'product_bundle_translation';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getCollectionClass(): string
    {
        return ProductBundleTranslationCollection::class;
    }


    public function getEntityClass(): string
    {
        return ProductBundleTranslationEntity::class;
    }

    protected function getParentDefinitionClass(): string
    {
        return ProductBundleDefinition::class;
    }


    public function defineFields(): FieldCollection
    {
       return new FieldCollection([
           (new StringField('name','name'))->addFlags(new Required(), new ApiAware()),
       ]);
    }
}