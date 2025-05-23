import template from './sw-cms-preview-gallery-buybox-bundles.html.twig';
import './sw-cms-preview-gallery-buybox-bundles.scss';

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
