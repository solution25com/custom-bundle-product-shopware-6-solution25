import template from './bundle-configurator-create.html.twig';
import './bundle-configurator-create.scss';

const { Context, Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('bundle-configurator-create', {
    template,

    inject: ['repositoryFactory'],

    mixins: [
        Mixin.getByName('notification'),
    ],

    data() {
        return {
            bundles: [
                {
                    bundleName: '',
                    discount: null,
                    discountType: null,
                    bundleProducts: [],
                },
            ],
            discountTypeOptions: [
                { value: 'fixed', label: 'Fixed Discount' },
                { value: 'percentage', label: 'Percentage Discount' },
            ],
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        productBundleRepository() {
            return this.repositoryFactory.create('product_bundle');
        },
        productBundleAssignedProductsRepository() {
            return this.repositoryFactory.create('product_bundle_assigned_products');
        },
        getDiscountSymbol() {
            return (discountType) => {
                if (discountType === 'fixed') return '$';
                if (discountType === 'percentage') return '%';
                return '';
            };
        },
    },

    methods: {
        productFilter(bundleIndex) {
            const criteria = new Criteria();

            criteria.addAssociation('options.group');

            const mainProductId = this.$route.params.id;

            const selectedProductIds = this.bundles
                .flatMap(bundle => bundle.bundleProducts)
                .filter(product => product.productId)
                .map(product => product.productId);

            selectedProductIds.push(mainProductId);

            if (selectedProductIds.length > 0) {
                criteria.addFilter(
                    Criteria.not('AND', selectedProductIds.map(id => Criteria.equals('id', id)))
                );
            }

            return criteria;
        },

        getVariantLabel(bundleProduct) {
            if (!bundleProduct.productId) return '';

            const product = this.$store.state.product.products.find(p => p.id === bundleProduct.productId);

            let label = product ? product.name : '';

            if (product && product.options) {
                const options = product.options.map(option =>
                    option.values.map(value => `${option.name}: ${value.translated.name}`).join(', ')
                ).join(', ');

                label += ' - ' + options;
            }

            return label;
        },

        async checkProductStock(productId, quantity) {
            try {
                const product = await this.productRepository.get(productId, Context.api);
                if (product.stock < quantity) {
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error checking product stock:', error);
                return false;
            }
        },

        addNewBundle() {
            this.bundles.push({
                bundleName: '',
                discount: null,
                discountType: null,
                bundleProducts: [],
            });
        },

        validateBundles() {
            let isValid = true;
            this.bundles.forEach((bundle) => {
                if (!bundle.bundleName.trim() || !bundle.discountType || bundle.bundleProducts.length === 0) {
                    isValid = false;
                    this.createNotificationError({
                        title: 'Validation Error',
                        message: 'Please fill out all required fields.',
                    });
                }

                bundle.bundleProducts.forEach((product) => {
                    if (!product.productId || !product.quantity) {
                        isValid = false;
                        this.createNotificationError({
                            title: 'Validation Error',
                            message: 'The assigned products section is missing fields.',
                        });
                    }
                });
            });
            return isValid;
        },

        async storeAllBundles() {
            if (!this.validateBundles()) return;

            try {
                for (const bundle of this.bundles) {
                    const newBundle = this.productBundleRepository.create(Context.api);
                    newBundle.productId = this.$route.params.id;
                    newBundle.name = bundle.bundleName;
                    newBundle.discount = bundle.discount ?? null;
                    newBundle.discountType = bundle.discountType ?? null;

                    const assignments = [];

                    for (const product of bundle.bundleProducts) {
                        const isStockValid = await this.checkProductStock(product.productId, product.quantity);
                        if (!isStockValid) {
                            this.createNotificationError({
                                title: 'Stock Error',
                                message: `The product with ID: "${product.id}" does not have sufficient stock for the quantity of ${product.quantity}.`,
                            });
                            return;
                        }

                        const assignment = this.productBundleAssignedProductsRepository.create(Context.api);
                        assignment.bundleId = newBundle.id;
                        assignment.productId = product.productId;
                        assignment.quantity = parseInt(product.quantity, 10);
                        assignments.push(assignment);
                    }

                    const savedBundle = await this.productBundleRepository.save(newBundle, Context.api);
                    await Promise.all(assignments.map((assignment) => this.productBundleAssignedProductsRepository.save(assignment, Context.api)));
                }

                this.createNotificationSuccess({
                    title: 'Success',
                    message: 'All bundles saved successfully.',
                });

                this.bundles = [
                    {
                        bundleName: '',
                        discount: null,
                        discountType: null,
                        bundleProducts: [],
                    },
                ];
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to save bundles.',
                });
                console.error('Error saving bundles:', error);
            }

            this.$router.push({
                name: 'sw.product.detail.bundle',
                params: { id: this.$route.params.id },
            });
        },

        deleteBundle(index) {
                this.bundles.splice(index, 1);
        },

        async addBundleProduct(bundleIndex) {
            const bundle = this.bundles[bundleIndex];

            if (bundle.bundleProducts.some(product => product.productId === null)) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Please select a product for the current row before adding a new one.',
                });
                return;
            }

            if (bundle.bundleProducts.some(product => product.productId === this.$route.params.id)) {
                this.createNotificationError({
                    title: 'Validation Error',
                    message: 'You cannot include the main product in the bundle.',
                });
                return;
            }

            const productIds = bundle.bundleProducts.map(product => product.productId).filter(id => id !== null);
            if (new Set(productIds).size !== productIds.length) {
                this.createNotificationError({
                    title: 'Validation Error',
                    message: 'A product has been added multiple times to the bundle. Please remove duplicates.',
                });
                return;
            }

            const newProduct = {
                productId: null,
                quantity: 1,
            };

            bundle.bundleProducts.push(newProduct);

            this.$watch(
                () => newProduct.productId,
                async (productId) => {
                    if (productId) {
                        const isStockValid = await this.checkProductStock(productId, newProduct.quantity);
                        if (!isStockValid) {
                            this.createNotificationError({
                                title: 'Stock Error',
                                message: `The selected product does not have sufficient stock for the quantity of ${newProduct.quantity}.`,
                            });
                            bundle.bundleProducts.pop();
                        }
                    }
                }
            );
        },
    },

    watch: {
        bundles: {
            deep: true,
            handler() {
                this.$forceUpdate();
            },
        },
    },
});