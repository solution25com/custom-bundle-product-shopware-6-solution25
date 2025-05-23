<?php declare(strict_types=1);

namespace BundleConfigurator\Controller;

use Shopware\Core\Checkout\Cart\SalesChannel\CartService;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class CartInfoController extends AbstractController
{
    #[Route(path: '/bundle/cart-by-customer', name: 'frontend.bundle.cart_by_customer', methods: ['GET'], defaults: ['_httpCache' => false])]
    public function cartByCustomer(
        Request $request,
        CartService $cartService,
        SalesChannelContext $salesChannelContext
    ): JsonResponse {
        $requestedCustomerId = $request->query->get('customerId');
        $customer = $salesChannelContext->getCustomer();

        if ($customer) {
            if ($requestedCustomerId && $requestedCustomerId !== $customer->getId()) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Access denied. You can only access your own cart.'
                ], 403);
            }
            $cart = $cartService->getCart($salesChannelContext->getToken(), $salesChannelContext);
        } else {
            $cart = $cartService->getCart($salesChannelContext->getToken(), $salesChannelContext);
        }

        $items = [];
        foreach ($cart->getLineItems() as $item) {
            if ($item->getType() === 'product') {
                $items[] = [
                    'id' => $item->getId(),
                    'referencedId' => $item->getReferencedId(),
                    'quantity' => $item->getQuantity(),
                ];
            }
        }

        return new JsonResponse([
            'success' => true,
            'customerId' => $customer ? $customer->getId() : null, 
            'lineItems' => $items
        ]);
    }
}
