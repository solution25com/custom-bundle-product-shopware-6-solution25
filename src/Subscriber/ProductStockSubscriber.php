<?php declare(strict_types=1);

namespace BundleConfigurator\Subscriber;

use Shopware\Core\Content\Product\Events\ProductListingResultEvent;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\Struct\ArrayStruct;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ProductStockSubscriber implements EventSubscriberInterface
{
    private EntityRepository $productRepository;

    public function __construct(EntityRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public static function getSubscribedEvents()
    {
        return [
            ProductListingResultEvent::class => 'onProductListingResult',
        ];
    }

    public function onProductListingResult(ProductListingResultEvent $event): void
    {
        $parentProducts = $event->getResult()->getElements();
        $parentProductsIds = [];


        foreach ($parentProducts as $product) {
            $parentProductsIds[] = $product->getId();
        }

        if (empty($parentProductsIds)) {
            return;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsAnyFilter('parentId', $parentProductsIds));

        $childProducts = $this->productRepository->search($criteria, $event->getContext());

        $stockGroupedByParent = [];

        foreach ($childProducts as $childProduct) {
            $parentId = $childProduct->getParentId();
            $stockGroupedByParent[$parentId][] = $childProduct->getStock();
        }

        foreach ($parentProducts as $product) {
            $parentId = $product->getId();
            $childStocks = $stockGroupedByParent[$parentId] ?? [];

            $product->addExtension('childProducts', new ArrayStruct($childStocks, 'childProducts'));
        }
    }
}