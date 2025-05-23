/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-preview-gallery-buybox-grouped-product', () => import('./preview'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-block-gallery-buybox-grouped-product', () => import('./component'));

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsBlock({
    name: 'gallery-buybox-grouped-product',
    label: 'Gallery Buybox Grouped Product',
    category: 'commerce',
    component: 'sw-cms-block-gallery-buybox-grouped-product',
    previewComponent: 'sw-cms-preview-gallery-buybox-grouped-product',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed',
    },
    slots: {
        left: 'image-gallery',
        right: 'buy-box-grouped-product',
    },
});
