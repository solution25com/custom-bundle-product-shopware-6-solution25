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

class CustomCategoryExtension extends AbstractExtension
{
    private EntityRepository $categoryRepository;

    public function __construct(
        EntityRepository $categoryRepository
    )
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getCategories', [$this, 'getCategories']),
        ];
    }


    public function getCategories()
    {
        $criteria = new Criteria();
        $criteria->addAssociation('children');

        $criteria->addFilter(
            new EqualsFilter('customFields.custom_special_category_show_hidden', true)
        );
        return $this->categoryRepository->search($criteria, Context::createDefaultContext())->getElements();
    }
}