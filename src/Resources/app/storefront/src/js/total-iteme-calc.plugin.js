import Plugin from 'src/plugin-system/plugin.class';

export default class ItemCalc extends Plugin {
    init() {
        this._setInitialSelectedItemsQuantity();
        this.registerEvents(); 
    }

   
    _setInitialSelectedItemsQuantity() {
        const selectedItemsElement = this.el.querySelector('.selected-items');
        if (selectedItemsElement) {
            selectedItemsElement.textContent = "0"; 
        }
    }

   
    registerEvents() {
        this.el.addEventListener('change', (event) => {
            if (event.target && event.target.matches('#quantity-select')) {
                this.calculateSelectedItemsQuantity();
            }
        });
    }

   
    calculateSelectedItemsQuantity() {
        let totalQuantity = 0;
        let hasValidSelection = false; 

        const productBoxes = this.el.querySelectorAll('.product-box');
        productBoxes.forEach((productBox) => {
            const quantityElement = productBox.querySelector('#quantity-select');

            if (quantityElement) {
                const quantity = parseInt(quantityElement.value, 10);

                if (!isNaN(quantity) && quantity > 0) {
                    totalQuantity += quantity;
                    hasValidSelection = true;
                }
            }
        });

        const selectedItemsElement = this.el.querySelector('.selected-items');
        if (selectedItemsElement) {
            selectedItemsElement.textContent = hasValidSelection ? `${totalQuantity}` : "0";
        } else {
            console.warn('No .selected-items element found');
        }
    }
}
