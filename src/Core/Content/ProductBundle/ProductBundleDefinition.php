<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundle;

use BundleConfigurator\Core\Content\ProductBundle\Aggregate\ProductBundleTranslation\ProductBundleTranslationDefinition;
use BundleConfigurator\Core\Content\ProductBundleAssignedProducts\ProductBundleAssignedProductsDefinition;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\ApiAware;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\TranslatedField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\TranslationsAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Storefront\Page\Product\ProductPageLoadedEvent;


class ProductBundleDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'product_bundle';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getEntityClass(): string
    {
        return ProductBundleEntity::class;
    }

    public function getCollectionClass(): string
    {
        return ProductBundleCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            (new FkField('product_id','productId', ProductDefinition::class))->addFlags(new Required()),
            (new TranslatedField('name'))->addFlags(new ApiAware(), new Required()),
            (new IntField('discount','discount')),
            (new StringField('discount_type','discountType')),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            (new DateTimeField('updated_at', 'updatedAt')),
            (new TranslationsAssociationField(
                ProductBundleTranslationDefinition::class,
                'product_bundle_id'
            ))->addFlags(new ApiAware(), new Required()),
            (new OneToManyAssociationField('bundleAssignedProducts',ProductBundleAssignedProductsDefinition::class,'bundle_id','id')),
            new OneToOneAssociationField('product', 'product_id', 'id', ProductDefinition::class, false),
        ]);
    }
}
