<?php

declare(strict_types=1);

namespace BundleConfigurator\Storefront\Controller;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class BrandCategoryRedirectController extends StorefrontController
{
    private EntityRepository $categoryRepository;

    public function __construct(EntityRepository $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    #[Route(path: '/brand-category-redirect', name: 'frontend.brand.category.redirect', methods: ['GET'])]
    public function redirectToBrandCategory(Request $request, SalesChannelContext $context): RedirectResponse
    {
        $brandName = $request->query->get('brandName');
        $salesChannelId = $context->getSalesChannel()->getId();

        if (empty($brandName)) {
            $this->addFlash('error', 'Brand name is required');
            return $this->redirectToRoute('frontend.home.page');
        }

        $criteria = new Criteria();

        if ($brandName) {
            $criteria->addFilter(new EqualsFilter('name', $brandName));
        }

        $criteria->addAssociation('seoUrls');
        $criteria->addFilter(new EqualsFilter('seoUrls.salesChannelId', $salesChannelId));
        $criteria->addAssociation('children');
        $criteria->addAssociation('parent');


        $categories = $this->categoryRepository->search(
            $criteria,
            $context->getContext()
        )->getElements();

        if (empty($categories)) {
            $this->addFlash('info', 'No matching brand category found');
            return $this->redirectToRoute('frontend.home.page');
        }

        if (count($categories) > 1) {
            $parentIds = [];
            foreach ($categories as $category) {
                if ($category->getParentId()) {
                    $parentIds[] = $category->getParentId();
                }
            }

            $uniqueParents = array_unique($parentIds);
            if (count($uniqueParents) === 1) {
                return $this->redirectToRoute(
                    'frontend.navigation.page',
                    ['navigationId' => $uniqueParents[0]]
                );
            }
        }

        $firstCategory = array_values($categories)[0];
        return $this->redirectToRoute(
            'frontend.navigation.page',
            ['navigationId' => $firstCategory->getId()]
        );
    }
}