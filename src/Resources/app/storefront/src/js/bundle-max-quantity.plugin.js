import Plugin from 'src/plugin-system/plugin.class';

export default class MaxBundleQuantity extends Plugin {
    init() {
        this._updateMaxFromSelected();

        this.el.addEventListener('change', (event) => {
            if (event.target.matches('.bundle-checkbox')) {
                this._updateMaxFromSelected();
            }
        });
    }

    _updateMaxFromSelected() {
        const checked = Array.from(
            this.el.querySelectorAll('.dropdown-options input[type="checkbox"]:checked')
        );

        const quantities = checked
            .map(cb => {
                const span = cb.closest('li')?.querySelector('.max-quantity');
                return span ? parseInt(span.textContent.trim(), 10) : NaN;
            })
            .filter(n => !isNaN(n));

        if (quantities.length === 0) {
            this.el.removeAttribute('data-max-quantity');
            return;
        }

        const lowest = Math.min(...quantities);
        this.el.dataset.maxQuantity = lowest;

        document
            .querySelectorAll('.quantity-selector-group-input')
            .forEach(input => {
                input.setAttribute('max', lowest);
                const val = parseInt(input.value, 10);
                if (!isNaN(val) && val > lowest) {
                    input.value = lowest;
                }
            });
    }
}
