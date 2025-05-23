/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-preview-buy-box-bundles', () => import('./preview'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-config-buy-box-bundles', () => import('./config'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-buy-box-bundles', () => import('./component'));

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsElement({
    name: 'buy-box-bundles',
    label: 'Buy Box Bundles',
    component: 'sw-cms-el-buy-box-bundles',
    configComponent: 'sw-cms-el-config-buy-box-bundles',
    previewComponent: 'sw-cms-el-preview-buy-box-bundles',
    defaultConfig: {
        content: {
            source: 'static',
            value: `
                <div class="bundle-select-preview">
                    <p class="title">Bundle Product</p>
                    <div class="bundle-select">
                        <div class="select"></div>
                        <div class="select"></div>
                        <div class="select"></div>
                        <div class="select"></div>
                    </div>
                    <div class="price"> 20€</div>
                    <div class="buy-button">
                        <div class="quantity">+ 1 -</div>
                        <div class="button"> Add to cart</div>
                    </div>
            
                </div>
            `.trim(),
        },
        verticalAlign: {
            source: 'static',
            value: null,
        },
    },
});
