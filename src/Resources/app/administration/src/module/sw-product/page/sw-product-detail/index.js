import template from './sw-product-detail.html.twig';

Shopware.Component.override('sw-product-detail', {
    template,

    data() {
        return {
            showBundleTab: true,
        };
    },

});