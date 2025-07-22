// storefront/src/plugin/bundle-quantity-validation.plugin.js

import Plugin from 'src/plugin-system/plugin.class';

export default class BundleQuantityValidationPlugin extends Plugin {
    init() {
        this.quantityInput = this.el.querySelector('.quantity-selector-group-input');
        if (!this.quantityInput) return;

        this.bundleCheckboxes = this.el.querySelectorAll('.bundle-checkbox');
        this.stockAlert = this.getOrCreateStockAlert();

        this.quantityInput.addEventListener('input', this.updateBundleQuantities.bind(this));
        this.quantityInput.addEventListener('change', this.updateBundleQuantities.bind(this));

        this.updateBundleQuantities();
    }

    getOrCreateStockAlert() {
        let alertBox = document.getElementById('bundle-stock-alert');

        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'bundle-stock-alert';
            alertBox.style.position = 'fixed';
            alertBox.style.top = '100px';
            alertBox.style.right = '-400px';
            alertBox.style.background = '#f44336';
            alertBox.style.color = '#fff';
            alertBox.style.padding = '15px 25px';
            alertBox.style.borderRadius = '5px';
            alertBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            alertBox.style.zIndex = '9999';
            alertBox.style.transition = 'right 0.5s ease';
            alertBox.style.whiteSpace = 'nowrap';
            alertBox.style.minWidth = 'max-content';
            alertBox.style.maxWidth = '400px';
            alertBox.style.fontSize = '14px';
            document.body.appendChild(alertBox);
        }

        return alertBox;
    }

    showAlert(message) {
        this.stockAlert.textContent = message;
        this.stockAlert.style.right = '20px';
        setTimeout(() => {
            this.stockAlert.style.right = '-400px';
        }, 3000);
    }

    updateBundleQuantities() {
        const inputQuantity = parseInt(this.quantityInput.value) || 0;

        this.bundleCheckboxes.forEach(checkbox => {
            const bundleQuantity = parseInt(checkbox.dataset.bundleQuantity) || 0;
            const maxStock = parseInt(checkbox.dataset.bundleMaxStock) || 0;
            const totalQuantity = inputQuantity * bundleQuantity;

            checkbox.dataset.calculatedQuantity = totalQuantity;

            const li = checkbox.closest('li');
            if (!li) return;

            if (totalQuantity > maxStock) {
                li.classList.add('no-quantity-list');

                if (checkbox.checked) {
                    checkbox.click();
                    const message = checkbox.dataset.bundleInfo || 'The selected product has been removed from selection because the available stock has been exceeded.';
                    this.showAlert(message);
                }
            } else {
                li.classList.remove('no-quantity-list');
            }
        });
    }
}