import template from './sw-cms-preview-gallery-buybox-grouped-product.html.twig';
import './sw-cms-preview-gallery-buybox-grouped-product.scss';

/**
 * @private
 * @package buyers-experience
 */
export default {
    template,

    compatConfig: Shopware.compatConfig,

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },
    },
};
