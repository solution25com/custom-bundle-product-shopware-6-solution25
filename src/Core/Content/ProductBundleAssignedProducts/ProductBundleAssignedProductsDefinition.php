<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundleAssignedProducts;

use BundleConfigurator\Core\Content\ProductBundle\ProductBundleDefinition;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\CascadeDelete;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;

class ProductBundleAssignedProductsDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'product_bundle_assigned_products';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getEntityClass(): string
    {
        return ProductBundleAssignedProductsEntity::class;
    }

    public function getCollectionClass(): string
    {
        return ProductBundleAssignedProductsCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            (new FkField('bundle_id', 'bundleId', ProductBundleDefinition::class))->addFlags(new Required(), new CascadeDelete()),
            (new FkField('product_id', 'productId', ProductDefinition::class))->addFlags(new Required()),
            (new IntField('quantity', 'quantity'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            (new DateTimeField('updated_at', 'updatedAt')),
            (new ManyToOneAssociationField('product', 'product_id', ProductDefinition::class, 'id', true))->addFlags(new CascadeDelete()),
        ]);
    }
}
