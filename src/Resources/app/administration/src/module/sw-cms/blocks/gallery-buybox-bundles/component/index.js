import template from './sw-cms-block-gallery-buybox-bundles.html.twig';
import './sw-cms-block-gallery-buybox-bundles.scss';

const { Store } = Shopware;

/**
 * @private
 * @package buyers-experience
 */
export default {
    template,

    compatConfig: Shopware.compatConfig,

    computed: {
        currentDeviceView() {
            return Store.get('cmsPageState').currentCmsDeviceView;
        },

        currentDeviceViewClass() {
            if (this.currentDeviceView) {
                return `is--${this.currentDeviceView}`;
            }

            return null;
        },
    },
};
