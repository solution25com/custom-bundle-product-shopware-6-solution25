/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-preview-gallery-buybox-bundles', () => import('./preview'));
/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('sw-cms-block-gallery-buybox-bundles', () => import('./component'));

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsBlock({
    name: 'gallery-buybox-bundles',
    label: 'Gallery Buybox bundles',
    category: 'commerce',
    component: 'sw-cms-block-gallery-buybox-bundles',
    previewComponent: 'sw-cms-preview-gallery-buybox-bundles',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed',
    },
    slots: {
        left: 'image-gallery',
        right: 'buy-box-bundles',
    },
});
