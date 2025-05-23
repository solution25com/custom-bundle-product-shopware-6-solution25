<?php declare(strict_types=1);

namespace BundleConfigurator\Controller;

use Shopware\Core\Content\Product\ProductEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
#[Package('checkout')]
class BundleController extends AbstractController
{

    private EntityRepository $productRepository;
    private EntityRepository $productBundleRepository;
    private EntityRepository $productBundleAssignedProductRepository;

    public function __construct(
        EntityRepository $productRepository,
        EntityRepository $productBundleRepository,
        EntityRepository $productBundleAssignedProductRepository,
    )
    {
        $this->productRepository = $productRepository;
        $this->productBundleRepository = $productBundleRepository;
        $this->productBundleAssignedProductRepository = $productBundleAssignedProductRepository;
    }

    #[Route(path: '/api/bundle/upsert', name: 'api.product_bundle.upsert', methods: ['POST'])]
    public function upsertProductBundle(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['productNumber']) || !isset($data['products'])) {
            return new JsonResponse(['error' => 'Invalid input data'], 400);
        }

        $context = Context::createDefaultContext();
        $productNumber = (string)$data['productNumber'];
        $products = $data['products'];

        try {
            $product = $this->findProductByNumber($productNumber, $context);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 404);
        }

        $bundleId = $this->createOrUpdateBundle($product->getId(), $context, $data);

        if (empty($products)) {
            $this->deleteBundle($bundleId, $context);
        } else {
            $this->syncAssignedProducts($bundleId, $products, $context);
        }

        $message = empty($products)
            ? 'Bundle ' . $bundleId . ' successfully deleted'
            : 'Bundle ' . $bundleId . ' successfully updated';

        return new JsonResponse(['status' => 'success', 'data' => $message], 200);
    }

    private function createOrUpdateBundle(string $productId, Context $context, array $data): string
    {
        $criteria = (new Criteria())->addFilter(new EqualsFilter('productId', $productId));

        $bundleId = $data['id'] ?? Uuid::randomHex();
        $now = new \DateTime();

        $data = [
            'id' => $bundleId,
            'productId' => $productId,
            'updatedAt' => $now,
            'name' => $data['name'],
            'discount' => $data['discount'],
            'discountType' => $data['discountType'],
        ];

        $this->productBundleRepository->upsert([$data], $context);

        return $bundleId;
    }

    private function deleteBundle(string $bundleId, Context $context): void
    {
        $this->productBundleRepository->delete([['id' => $bundleId]], $context);
    }

    private function syncAssignedProducts(string $bundleId, array $products, Context $context): void
    {
        $criteria = (new Criteria())->addFilter(new EqualsFilter('bundleId', $bundleId));
        $assignedProducts = $this->productBundleAssignedProductRepository->search($criteria, $context)->getEntities();

        $deleteIds = [];
        foreach ($assignedProducts as $assignedProduct) {
            $deleteIds[] = ['id' => $assignedProduct->getId()];
        }

        if (!empty($deleteIds)) {
            $this->productBundleAssignedProductRepository->delete($deleteIds, $context);
        }

        if (empty($products)) {
            return;
        }

        $upsertData = [];
        foreach ($products as $productData) {
            if (!is_array($productData) || !isset($productData['productNumber'], $productData['quantity'])) {
                continue;
            }

            try {
                $product = $this->findProductByNumber($productData['productNumber'], $context);
            } catch (\Exception $e) {
                continue;
            }

            $upsertData[] = [
                'id' => Uuid::randomHex(),
                'bundleId' => $bundleId,
                'productId' => $product->getId(),
                'quantity' => $productData['quantity'],
                'createdAt' => new \DateTime(),
                'updatedAt' => new \DateTime(),
            ];
        }

        if (!empty($upsertData)) {
            $this->productBundleAssignedProductRepository->upsert($upsertData, $context);
        }
    }

    private function findProductByNumber(string $productNumber, Context $context): ProductEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('productNumber', $productNumber));
        $product = $this->productRepository->search($criteria, $context)->first();

        if (!($product instanceof ProductEntity)) {
            throw new \Exception('Product not found');
        }

        return $product;
    }
}
