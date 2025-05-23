import Plugin from 'src/plugin-system/plugin.class';

export default class GroupedPricePlugin extends Plugin {
    init() {
        this._setInitialTotalPrice();
        this._moveGroupNameToTitle();
        this._bindEvents();
    }

    _setInitialTotalPrice() {
        const selectedItemsElement = document.querySelector('.total-calculated-price');
        if (selectedItemsElement) {
            selectedItemsElement.textContent = "$0.00";
        }
    }

 
    _moveGroupNameToTitle() {
        const groupNameEl = this.el.querySelector('.fourth-row .group-name');
        const titleFourthRow = document.querySelector('.title .fourth-row');

        if (groupNameEl && titleFourthRow) {
            titleFourthRow.textContent = groupNameEl.textContent.trim();
        }
    }

    
    _bindEvents() {
        document.querySelectorAll('.product-box').forEach((productBox) => {
            const quantityInput = productBox.querySelector('.quantity-input');
            const priceElement = productBox.querySelector('.price-product');
            const calculatedPriceElement = productBox.querySelector('.calculated-price');
    
            if (quantityInput && priceElement && calculatedPriceElement) {
                calculatedPriceElement.textContent = "Not Selected";
    
                quantityInput.addEventListener('input', (event) => {
                    this._updateCalculatedPrice(event, priceElement, calculatedPriceElement);
                    this._calculateSelectedItemsTotal();
                });
            }
        });
    
        const bundleContainer = document.querySelector('#bundle-price-container');
        if (bundleContainer) {
            bundleContainer.addEventListener('input', (event) => {
                if (event.target && event.target.matches('.quantity-input')) {
                    this._calculateSelectedItemsTotal();
                }
            });
        }
    }
    
    _updateCalculatedPrice(event, priceElement, calculatedPriceElement) {
        const price = parseFloat(priceElement.textContent.trim().replace(/[^0-9.]/g, ''));
        let quantity = parseInt(event.target.value, 10) || 0;
    
        const maxQuantity = parseInt(event.target.max, 10) || Infinity;
        if (quantity > maxQuantity) {
            quantity = maxQuantity;
            event.target.value = maxQuantity;
        }
    
        if (!isNaN(price) && quantity > 0) {
            const total = price * quantity;
            calculatedPriceElement.textContent = `$${total.toFixed(2)}`;
        } else {
            calculatedPriceElement.textContent = "$0.00";
        }
    }
    

    _calculateSelectedItemsTotal() {
        const bundleContainer = document.querySelector('#bundle-price-container');
        const selectedItemsElement = document.querySelector('.total-calculated-price');
        let total = 0;
        let hasSelectedProduct = false;
    
        if (bundleContainer) {
            const productBoxes = bundleContainer.querySelectorAll('.product-box');
    
            productBoxes.forEach((productBox) => {
                const priceElement = productBox.querySelector('.price-product');
                const quantityInput = productBox.querySelector('.quantity-input');
                const calculatedPriceElement = productBox.querySelector('.calculated-price');
    
                if (priceElement && quantityInput && calculatedPriceElement) {
                    const price = parseFloat(priceElement.textContent.trim().replace(/[^0-9.]/g, '')) || 0;
                    const quantity = parseInt(quantityInput.value, 10) || 0;
    
                    if (!isNaN(price) && quantity > 0) {
                        const productTotal = price * quantity;
                        total += productTotal;
                        calculatedPriceElement.textContent = `$${productTotal.toFixed(2)}`;
                        hasSelectedProduct = true;
                    } else {
                        calculatedPriceElement.textContent = "$0.00";
                    }
                }
            });
    
            if (selectedItemsElement) {
                selectedItemsElement.textContent = hasSelectedProduct ? `$${total.toFixed(2)}` : "$0.00";
            }
        }
    }
    
}
