import './module/sw-cms/blocks/gallery-buybox-bundles';
import './module/sw-cms/blocks/gallery-buybox-grouped-product';
import './module/sw-cms/elements/buy-box-bundles';
import './module/sw-cms/elements/buy-box-grouped-product';
import './module/sw-product/page/sw-product-detail';
import './module/sw-product/view/bundle-configurator/bundle-configurator-detail';
import './module/sw-product/view/bundle-configurator/bundle-configurator-create';


Shopware.Module.register('bundle-configurator', {
    routeMiddleware(next, currentRoute){
        const productDetailBundleRoute = 'sw.product.detail.bundle';
        const productDetailBundleCreateRoute = 'sw.product.detail.bundle.create';

        if(currentRoute.name === 'sw.product.detail' && currentRoute.children.every((currentRoute) => currentRoute.name !== productDetailBundleRoute)){
            currentRoute.children.push({
                name: 'sw.product.detail.bundle',
                path: '/sw/product/detail/:id/bundle',
                component: 'bundle-configurator-detail',
                meta: {
                    parentPath: 'sw.product.index',
                    privilege: 'product.viewer'
                }
            });
        }

        if(currentRoute.name === 'sw.product.detail' && currentRoute.children.every((currentRoute) => currentRoute.name !== productDetailBundleCreateRoute)){
            currentRoute.children.push({
                name: productDetailBundleCreateRoute,
                path: '/sw/product/detail/:id/bundle/create',
                component: 'bundle-configurator-create',
                meta: {
                    parentPath: 'sw.product.index',
                    privilege: 'product.editor'
                }
            });
        }

        next(currentRoute)
    }
})