<?php declare(strict_types=1);

namespace BundleConfigurator\Core\Content\ProductBundle\Aggregate\ProductBundleTranslation;

use BundleConfigurator\Core\Content\ProductBundle\ProductBundleEntity;
use Shopware\Core\Framework\DataAbstractionLayer\TranslationEntity;

class ProductBundleTranslationEntity extends TranslationEntity
{
    protected string $bundleId;

    protected ?string $name;


    protected ProductBundleEntity $bundle;

    public function getBundleId(): string
    {
        return $this->bundleId;
    }

    public function setBundleId(string $bundleId): void
    {
        $this->bundleId = $bundleId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getBundle(): ProductBundleEntity
    {
        return $this->bundle;
    }

    public function setBundle(ProductBundleEntity $bundle): void
    {
        $this->bundle = $bundle;
    }


}