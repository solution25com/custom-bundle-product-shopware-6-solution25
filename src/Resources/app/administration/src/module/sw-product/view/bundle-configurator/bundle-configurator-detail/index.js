import template from './bundle-configurator-detail.html.twig';
import './bundle-configurator-detail.scss';

const { Data, Context, Component, Mixin } = Shopware;
const { mapState, mapGetters } = Component.getComponentHelper();
const { Criteria } = Data;

Component.register('bundle-configurator-detail', {
    template,

    inject: ['repositoryFactory', 'acl'],

    mixins: [
        Mixin.getByName('notification'),
    ],

    data() {
        return {
            bundles: [],
            showBundleTab: true,
            showBundleDeleteModal: false,
            deleteBundle: null,
            editingProductId: null,
            editingDiscount: false,
            newDiscount: null,
            editingDiscountType: false,
            newDiscountType: null,
            editingBundleName: false,
            newBundleName: null,
            products: [],
            selectedProductId: null,
            selectedQuantity: 1,
            addingToBundle: null,
            showingBundleFormForId: null,
            parentProductNames: {},
            assignedProductColumns: [
                {
                    property: 'productNumber',
                    label: this.$tc('product_bundle.list.productNumber'),
                    rawData: true
                },
                {
                    property: 'productName',
                    label: this.$tc('product_bundle.list.productName'),
                    rawData: true
                },
                {
                    property: 'quantity',
                    label: this.$tc('product_bundle.list.quantity'),
                    rawData: true,
                    width: '150px'
                },
            ],
        };
    },

    async created() {
        this.getBundle();
        await this.fetchProducts();
    },

    watch: {
        product: {
            immediate: true,
            handler(newVal) {
                if (newVal && newVal.id) {
                    this.getBundle();
                }
            }
        },

        'bundles': {
            handler(newBundles) {
                if (newBundles && newBundles.length) {
                    newBundles.forEach(bundle => {
                        this.fetchParentNamesForBundle(bundle.bundleAssignedProducts);
                    });
                }
            },
            immediate: true,
            deep: true
        },
    },

    computed: {
        ...mapState('swProductDetail', ['product']),
        ...mapGetters('swProductDetail', ['isLoading']),

        bundleRepository() {
            return this.repositoryFactory.create('product_bundle');
        },

        bundleCriteria() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('productId', this.product.id));
            criteria.addAssociation('bundleAssignedProducts.product');
            criteria.addAssociation('bundleAssignedProducts.product.options.group');


            return criteria;
        },

        productCriteria() {
            const criteria = new Criteria();


            criteria.addFilter(Criteria.not('and', [
                Criteria.equals('id', this.$route.params.id)
            ]));


            criteria.addAssociation('options.group');
            criteria.addAssociation('properties.group');

            return criteria;
        },


        bundleAssignedProductsRepository() {
            return this.repositoryFactory.create('product_bundle_assigned_products');
        },

        productRepository() {
            return this.repositoryFactory.create('product');
        },
    },

    methods: {
        async getBundle() {
            if (!this.product || !this.product.id) {
                return;
            }

            try {
                const criteria = new Criteria();
                criteria.addFilter(Criteria.equals('productId', this.product.id));
                criteria.addAssociation('bundleAssignedProducts.product');
                criteria.addAssociation('bundleAssignedProducts.product.options.group');

                this.bundles = await this.bundleRepository.search(criteria, Context.api);

            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to fetch bundles.',
                });
            }
        },

        async fetchProducts() {
            try {
                const productRepository = this.repositoryFactory.create('product');
                const criteria = new Criteria();
                criteria.addSorting(Criteria.sort('name', 'ASC'));
                criteria.addAssociation('options.group');

                this.products = await productRepository.search(criteria, Context.api);
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to fetch products for the dropdown.',
                });
            }
        },

        startAddingToBundle(bundle) {
            this.showingBundleFormForId = bundle.id;
            this.selectedProductId = null;
            this.selectedQuantity = 1;
        },

        async fetchParentNamesForBundle(products) {
            for (const product of products) {
                if (product.product.parentId && !this.parentProductNames[product.product.parentId]) {
                    await this.loadParentProductName(product.product.parentId);
                }
            }
        },
        async loadParentProductName(parentId) {
            if (this.parentProductNames[parentId]) {
                return;
            }

            try {
                const productRepository = this.repositoryFactory.create('product');
                const parentProduct = await productRepository.get(parentId, Shopware.Context.api);


                this.$set(this.parentProductNames, parentId, parentProduct.translated.name);
            } catch (error) {
                console.error('Error fetching parent product name:', error);
                this.$set(this.parentProductNames, parentId, 'No Parent');
            }
        },

        cancelAddingToBundle() {
            this.showingBundleFormForId = null;
        },

        editQuantity(item) {
            console.log('Editing quantity for item:', item);
            this.editingProductId = item.productId;
            this.$set(item, 'newQuantity', item.quantity);
        },

        cancelSaveQuantity(item) {
            console.log('Cancelling quantity edit for item:', item);
            this.editingProductId = null;
        },

        async saveQuantity(item) {
            console.log('Saving new quantity for item:', item);

            try {
                const product = await this.productRepository.get(item.productId, Context.api);

                if (item.newQuantity > product.stock) {
                    this.createNotificationError({
                        title: 'Error',
                        message: `The entered quantity (${item.newQuantity}) exceeds the available stock (${product.stock}).`,
                    });
                    return;
                }

                const criteria = new Criteria();
                criteria.addFilter(Criteria.equals('productId', item.productId));
                criteria.addFilter(Criteria.equals('bundleId', item.bundleId));
                console.log('Search criteria:', criteria);

                const result = await this.bundleAssignedProductsRepository.search(criteria, Context.api);
                console.log('Search result:', result);

                if (result.total > 0) {
                    const assignedProduct = result.first();
                    console.log('Assigned product found:', assignedProduct);

                    assignedProduct.quantity = item.newQuantity;
                    console.log('Updated product quantity:', assignedProduct);

                    await this.bundleAssignedProductsRepository.save(assignedProduct, Context.api);
                    console.log('Product saved successfully');

                    this.editingProductId = null;
                    this.createNotificationSuccess({
                        title: 'Success',
                        message: 'Quantity updated successfully.',
                    });


                    console.log('Refreshing bundle data...');
                    this.getBundle();
                } else {
                    console.error('Product not found in bundle.');
                    throw new Error('Product not found in bundle.');
                }
            } catch (error) {
                console.error('Error occurred during saveQuantity:', error);

                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to update quantity. Please check the logs for more details.',
                });
            }
        },

        async addProductToBundle() {
            if (!this.showingBundleFormForId || !this.selectedProductId || this.selectedQuantity < 1) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Please select a product and quantity.',
                });
                return;
            }

            if (this.selectedProductId === this.product.id) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'You cannot add the main product to the bundle.',
                });
                return;
            }

            try {
                const criteria = new Criteria();
                criteria.addFilter(Criteria.equals('productId', this.selectedProductId));
                criteria.addFilter(Criteria.equals('bundleId', this.showingBundleFormForId));
                const result = await this.bundleAssignedProductsRepository.search(criteria, Context.api);

                if (result.total > 0) {
                    this.createNotificationError({
                        title: 'Error',
                        message: 'This product is already part of the bundle.',
                    });
                    return;
                }

                const product = await this.productRepository.get(this.selectedProductId, Context.api);
                if (this.selectedQuantity > product.stock) {
                    this.createNotificationError({
                        title: 'Error',
                        message: `The selected quantity (${this.selectedQuantity}) exceeds the available stock (${product.stock}).`,
                    });
                    return;
                }

                const newAssignedProduct = this.bundleAssignedProductsRepository.create(Context.api);
                newAssignedProduct.productId = this.selectedProductId;
                newAssignedProduct.bundleId = this.showingBundleFormForId;
                newAssignedProduct.quantity = this.selectedQuantity;

                await this.bundleAssignedProductsRepository.save(newAssignedProduct, Context.api);

                this.createNotificationSuccess({
                    title: 'Success',
                    message: 'Product added to the bundle successfully.',
                });

                this.showingBundleFormForId = null;
                this.getBundle();
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to add product to bundle.',
                });
            }
        },

        async saveBundleChanges(bundle) {
            if (!bundle) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'No bundle selected for update.',
                });
                return;
            }

            try {
                const updatedFields = {};

                if (this.newDiscount !== null && bundle.discount !== this.newDiscount) {
                    updatedFields.discount = this.newDiscount;
                }

                if (this.newDiscountType !== null && bundle.discountType !== this.newDiscountType) {
                    updatedFields.discountType = this.newDiscountType;
                }

                if (this.newBundleName !== null && bundle.name !== this.newBundleName) {
                    updatedFields.name = this.newBundleName;
                }

                Object.assign(bundle, updatedFields);

                const saveBundleData = await this.bundleRepository.save(bundle, Context.api);
                const addProductBundle = await this.addProductToBundle();

                if (saveBundleData && addProductBundle) {
                    this.createNotificationSuccess({
                        title: 'Success',
                        message: 'Bundle updated successfully.',
                    });
                }

                this.editingDiscount = false;
                this.editingDiscountType = false;
                this.editingBundleName = false;
                this.newDiscount = null;
                this.newDiscountType = null;
                this.newBundleName = null;

                this.getBundle();
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to update bundle.',
                });
            }
        },

        delete(bundle) {
            try {
                this.bundleRepository.delete(bundle.id, Context.api).then(() => {
                    this.createNotificationSuccess({
                        title: 'Success',
                        message: 'Bundle deleted successfully.'
                    });
                    this.getBundle();
                });
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to delete bundle.'
                });
            }
        },

        onStartBundleDelete(bundle) {
            if (!this.acl.can('product.editor')) {
                this.createNotificationError({
                    title: 'Permission denied!',
                    message: 'You cannot delete a bundle that was not created by you.',
                });
                return;
            }

            this.deleteBundle = bundle;
            this.onShowBundleDeleteModal();
        },

        onCancelBundleDelete() {
            this.deleteBundle = null;
            this.onCloseBundleDeleteModal();
        },

        onShowBundleDeleteModal() {
            this.showBundleDeleteModal = true;
        },

        onCloseBundleDeleteModal() {
            this.showBundleDeleteModal = false;
        },

        onConfirmBundleDelete() {
            this.onCloseBundleDeleteModal();
            this.delete(this.deleteBundle);
        },

        async deleteProductFromBundle(productId, bundleId) {
            try {
                const criteria = new Criteria();
                criteria.addFilter(Criteria.equals('productId', productId));
                criteria.addFilter(Criteria.equals('bundleId', bundleId));
                const result = await this.bundleAssignedProductsRepository.search(criteria, Context.api);

                if (result.total > 0) {
                    await this.bundleAssignedProductsRepository.delete(result.first().id, Context.api);

                    const remainingCriteria = new Criteria();
                    remainingCriteria.addFilter(Criteria.equals('bundleId', bundleId));
                    const remainingProducts = await this.bundleAssignedProductsRepository.search(remainingCriteria, Context.api);

                    if (remainingProducts.total === 0) {
                        await this.bundleRepository.delete(bundleId, Context.api);
                        this.createNotificationSuccess({
                            title: 'Success',
                            message: 'Product deleted and bundle removed as it has no remaining products.'
                        });
                    } else {
                        this.createNotificationSuccess({
                            title: 'Success',
                            message: 'Product deleted from bundle successfully.'
                        });
                    }

                    this.getBundle();
                } else {
                    throw new Error('Product not found in bundle.');
                }
            } catch (error) {
                this.createNotificationError({
                    title: 'Error',
                    message: 'Failed to delete product from bundle.'
                });
            }
        },
    },
});