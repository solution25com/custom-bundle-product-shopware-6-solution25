/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-preview-buy-box-grouped-product', () => import('./preview'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-config-buy-box-grouped-product', () => import('./config'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-el-buy-box-grouped-product', () => import('./component'));

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsElement({
    name: 'buy-box-grouped-product',
    label: 'Buy Box Grouped Product',
    component: 'sw-cms-el-buy-box-grouped-product',
    configComponent: 'sw-cms-el-config-buy-box-grouped-product',
    previewComponent: 'sw-cms-el-preview-buy-box-grouped-product',
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
