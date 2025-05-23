import template from './sw-cms-el-buy-box-grouped-product.html.twig';
import './sw-cms-el-buy-box-grouped-product.scss';

const { Mixin } = Shopware;

/**
 * @private
 * @package buyers-experience
 */
export default {
    template,

    compatConfig: Shopware.compatConfig,

    emits: ['element-update'],

    mixins: [
        Mixin.getByName('cms-element'),
    ],

    data() {
        return {
            editable: true,
            demoValue: '',
        };
    },

    watch: {
        'cmsPageState.currentDemoEntity': {
            handler() {
                this.updateDemoValue();
            },
        },
        'element.config.content.source': {
            handler() {
                this.updateDemoValue();
            },
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('buy-box-grouped-product');
        },

        updateDemoValue() {
            if (this.element.config.content.source === 'mapped') {
                this.demoValue = this.getDemoValue(this.element.config.content.value);
            }
        },

        onBlur(content) {
            this.emitChanges(content);
        },

        onInput(content) {
            this.emitChanges(content);
        },

        emitChanges(content) {
            if (content !== this.element.config.content.value) {
                this.element.config.content.value = content;
                this.$emit('element-update', this.element);
            }
        },
    },
};
