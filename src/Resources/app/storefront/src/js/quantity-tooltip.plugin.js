// storefront/src/plugin/quantity-tooltip.plugin.js

import Plugin from 'src/plugin-system/plugin.class';

export default class QuantityTooltipPlugin extends Plugin {
    init() {
        this.quantityInputs = this.el.querySelectorAll('.quantity-input');

        this.quantityInputs.forEach(input => {
            const max = parseInt(input.getAttribute('max'));
            const min = parseInt(input.getAttribute('min')) || 0;

            input.addEventListener('focus', () => {
                const value = parseInt(input.value) || 0;
                this.clearTooltip(input);

                if (value >= max) {
                    this.setTooltip(input, `LIMIT: ${max} Per Day`);
                } else if (value < min && min > 1) {
                    this.setTooltip(input, `Min Order QTY ${min}`);
                }
            });

            input.addEventListener('input', () => this.clearTooltip(input));
            input.addEventListener('blur', () => this.clearTooltip(input));
        });
    }

    setTooltip(input, message) {
        input.setAttribute('data-bs-title', message);
        input.setAttribute('data-bs-toggle', 'tooltip');
        input.setAttribute('data-bs-placement', 'bottom');
        input.setAttribute('data-bs-custom-class', 'custom-tooltip');
        const tooltip = new bootstrap.Tooltip(input);
        tooltip.show();
    }

    clearTooltip(input) {
        const existingTooltip = bootstrap.Tooltip.getInstance(input);
        if (existingTooltip) {
            existingTooltip.dispose();
        }
        input.removeAttribute('data-bs-title');
        input.removeAttribute('data-bs-toggle');
        input.removeAttribute('data-bs-placement');
        input.removeAttribute('data-bs-custom-class');
    }
}