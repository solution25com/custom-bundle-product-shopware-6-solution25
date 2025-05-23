import Plugin from 'src/plugin-system/plugin.class';

export default class BundlePricePlugin extends Plugin {
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._initializePlugin());
        } else {
            this._initializePlugin();
        }
    }

    _initializePlugin() {
        this.bundleGroups = document.querySelectorAll('.bundles-select-group .bundle-set');
        this.priceDisplay = document.getElementById('bundle-price');
        this.subscriptionSinglePriceDisplay = document.getElementById('bundle-subscription-price-single');
        this.subscriptionDiscountDisplay = document.getElementById('bundle-subscription-price');
        this.subPriceInput = document.getElementById('sub-bundle-price');
        this.grossPrice = parseFloat(document.getElementById('bundle-price-container')?.dataset.bundlePriceUpdateOptions || 0);
        this.activeCurrency = this.el.dataset.activeCurrency || '';
        this.productPriceElement = document.querySelector('.product-detail-price');
        this.bundlePriceElement = document.getElementById('bundle-price-display');
        this.quantityInput = document.querySelector('.cms-block-gallery-buybox-bundles #quantity-select input[type="number"]');
        this.bundlesData = {};

        const bundlesQuery = document.getElementById('bundle-price-container')?.dataset.bundlesQuery;
        if (bundlesQuery) {
            this._parseBundlesQuery(bundlesQuery);
        }

        this._registerEvents();
        this._interceptAddToCart();
        this.calculateTotalPrice();

        if (this.quantityInput) {
            this.quantityInput.addEventListener('input', () => this.calculateTotalPrice());
            this.quantityInput.addEventListener('change', () => this.calculateTotalPrice());

            const quantityContainer = this.quantityInput.closest('.quantity-selector-group');
            if (quantityContainer) {
                const minusBtn = quantityContainer.querySelector('.js-btn-minus');
                const plusBtn = quantityContainer.querySelector('.js-btn-plus');
                if (minusBtn) minusBtn.addEventListener('click', () => setTimeout(() => this.calculateTotalPrice(), 0));
                if (plusBtn) plusBtn.addEventListener('click', () => setTimeout(() => this.calculateTotalPrice(), 0));
            }
        }
    }

    _parseBundlesQuery(bundlesQuery) {
        try {
            const decodedBundles = JSON.parse(atob(bundlesQuery));
            for (const bundleId in decodedBundles) {
                const dropdown = document.getElementById(bundleId);
                if (dropdown) {
                    const bundleButton = dropdown.closest('.bundles-select').querySelector('.bundle-dropdown-toggle');
                    decodedBundles[bundleId].forEach(item => {
                        const checkbox = dropdown.querySelector(`.bundle-checkbox[value="${item.id}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            bundleButton.textContent = checkbox.nextElementSibling.textContent.trim();
                        }
                    });
                }
            }
            this.bundlesData = decodedBundles;
        } catch (e) {
            console.error('Failed to parse bundle query:', e);
        }
    }

    _registerEvents() {
        this.bundleGroups.forEach(group => {
            const checkboxes = group.querySelectorAll('.bundle-checkbox');
            const bundleButton = group.querySelector('.bundle-dropdown-toggle');

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => this._onCheckboxChange(checkbox, checkboxes, bundleButton));
            });
        });
    }

    _onCheckboxChange(currentCheckbox, checkboxes, bundleButton) {
        checkboxes.forEach(box => {
            if (box !== currentCheckbox) box.checked = false;
        });

        const dropdownOptions = currentCheckbox.closest('.dropdown-options');
        const groupId = dropdownOptions.id;
        const discount = parseFloat(dropdownOptions.dataset.discount || '0');
        const discountType = dropdownOptions.dataset.discountType || 'none';

        this.bundlesData[groupId] = [];

        checkboxes.forEach(box => {
            if (box.checked) {
                this.bundlesData[groupId].push({
                    id: box.value,
                    price: parseFloat(box.dataset.price) || 0,
                    bundleQuantity: parseInt(box.dataset.bundleQuantity) || 0,
                    discount: discount,
                    discountType: discountType
                });
                bundleButton.textContent = box.nextElementSibling.textContent.trim();
            }
        });

        if (this.bundlesData[groupId].length === 0) {
            delete this.bundlesData[groupId];
        }

        this._updateCookie();
        this.calculateTotalPrice();
    }

    _updateCookie() {
        if (Object.keys(this.bundlesData).length > 0) {
            document.cookie = `bundleSelection=${JSON.stringify(this.bundlesData)}; path=/; max-age=86400`; // 1 day
        } else {
            document.cookie = 'bundleSelection=; path=/; max-age=0';
        }
    }

    _interceptAddToCart() {
        const cartForms = document.querySelectorAll('form[action="/checkout/cart"]');
        if (!cartForms.length) return;

        cartForms.forEach(form => {
            form.addEventListener('submit', () => {
                const bundleDataRaw = localStorage.getItem('bundleSelection');
                if (!bundleDataRaw) return;

                const bundleData = JSON.parse(bundleDataRaw);
                for (const groupId in bundleData) {
                    bundleData[groupId].forEach((item, index) => {
                        const baseName = `lineItems[0][payload][bundles][${groupId}][${index}]`;
                        const entries = {
                            [`${baseName}[id]`]: item.id,
                            [`${baseName}[price]`]: item.price,
                            [`${baseName}[bundleQuantity]`]: item.bundleQuantity,
                            [`${baseName}[discount]`]: item.discount,
                            [`${baseName}[discountType]`]: item.discountType,
                        };
                        Object.entries(entries).forEach(([name, value]) => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = name;
                            input.value = value;
                            form.appendChild(input);
                        });
                    });
                }
            });
        });
    }

    updateCheckboxPricesByQuantity(quantity) {
        const checkboxes = document.querySelectorAll('.bundle-checkbox');

        checkboxes.forEach(checkbox => {
            const productId = checkbox.value;
            const tierWrapper = document.querySelector(`.price-tiers[data-id="${productId}"]`);
            if (!tierWrapper) return;

            const dataset = tierWrapper.dataset;
            const tierPrices = [];

            for (const key in dataset) {
                const match = key.match(/^price(\d+)$/);
                if (match) {
                    const minQty = parseInt(match[1], 10);
                    const priceVal = parseFloat(dataset[key]);
                    if (!isNaN(minQty) && !isNaN(priceVal)) {
                        tierPrices.push({ minQty, price: priceVal });
                    }
                }
            }

            tierPrices.sort((a, b) => a.minQty - b.minQty);

            let selectedPrice = parseFloat(checkbox.dataset.price || 0);
            for (let i = 0; i < tierPrices.length; i++) {
                if (quantity >= tierPrices[i].minQty) {
                    selectedPrice = tierPrices[i].price;
                }
            }

            checkbox.setAttribute('data-price', selectedPrice.toFixed(2));
        });
    }

    calculateTotalPrice() {
        let quantity = 1;
        if (this.quantityInput) {
            const v = parseInt(this.quantityInput.value, 10);
            if (!isNaN(v) && v > 0) {
                quantity = v;
            }
        }
    
        this.updateCheckboxPricesByQuantity(quantity);
    
        const hasBundleSelected = Object.keys(this.bundlesData).length > 0;
        let totalPrice = 0;
    
        if (hasBundleSelected) {
            for (const groupId in this.bundlesData) {
                this.bundlesData[groupId].forEach(item => {
                    const cb = document.querySelector(`.bundle-checkbox[value="${item.id}"]`);
    
                    let unitPrice = cb && cb.dataset.price
                        ? parseFloat(cb.dataset.price)
                        : 0;
    
                    if (item.discountType === 'percentage') {
                        unitPrice -= (unitPrice * item.discount) / 100;
                    } else if (item.discountType === 'fixed') {
                        unitPrice -= item.discount;
                    }
                    unitPrice = Math.max(0, unitPrice);
    
                    const bundleQty = item.bundleQuantity
                        || (cb ? parseInt(cb.dataset.bundleQuantity, 10) : 1)
                        || 1;
    
                    totalPrice += unitPrice * bundleQty * quantity;
                });
            }
        } else {
            totalPrice = this.grossPrice;
        }
    
        if (totalPrice <= 0) {
            totalPrice = this.grossPrice;
        }
    
        const formattedPrice = `${this.activeCurrency}${totalPrice.toFixed(2)}*`;
    
        if (this.priceDisplay) {
            this.priceDisplay.textContent = formattedPrice;
        }
        if (this.subscriptionSinglePriceDisplay) {
            this.subscriptionSinglePriceDisplay.textContent = formattedPrice;
        }
        if (this.subPriceInput) {
            this.subPriceInput.value = totalPrice.toFixed(2);
        }
    
        if (this.productPriceElement && this.bundlePriceElement) {
            if (hasBundleSelected) {
                this.bundlePriceElement.style.display = 'block';
                this.productPriceElement.style.display = 'none';
            } else {
                this.bundlePriceElement.style.display = 'none';
                this.productPriceElement.style.display = 'block';
            }
        }
    
        const listPriceWrapper = document.querySelector('.product-detail-list-price-wrapper');
        if (listPriceWrapper) {
            listPriceWrapper.style.display = hasBundleSelected ? 'none' : '';
        }
    
        const stickyUnitPrice = document.querySelector('.sticky-unit-price');
        if (stickyUnitPrice) {
            stickyUnitPrice.innerHTML = `<span>Subtotal:</span> <span class="bundle-subtotal-value">${formattedPrice}</span>`;
        }
    }
    
}
