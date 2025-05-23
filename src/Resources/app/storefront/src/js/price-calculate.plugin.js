import Plugin from 'src/plugin-system/plugin.class';

export default class BundlePriceUpdate extends Plugin {
    init() {
        console.info(this);

        this.bundleGroups = document.querySelectorAll('.bundles-select-group .bundle-set');
        this.priceDisplay = document.getElementById('bundle-price');
        // this.bundlesQuery = {{ bundlesQuery|json_encode() }};
        this.selectedOptions = this.parseBundlesQuery(this.bundlesQuery);

        this.initializeBundleGroups();
        this.calculateTotalPrice();
    }

    parseBundlesQuery(bundlesQuery) {
        let selectedOptions = {};
        if (bundlesQuery) {
            try {
                selectedOptions = JSON.parse(bundlesQuery);
            } catch (e) {
                console.error("Error parsing bundlesQuery:", e);
            }
        }
        return selectedOptions;
    }

    initializeBundleGroups() {
        this.bundleGroups.forEach((group) => {
            const dropdown = group.querySelector('.dropdown-options');
            const bundleId = dropdown.id;
            const checkboxes = dropdown.querySelectorAll('.bundle-checkbox');
            const toggle = group.querySelector('.bundle-dropdown-toggle');

            // Store original text of the toggle
            toggle.dataset.originalText = toggle.textContent.trim();

            // Prefill selected options based on bundlesQuery
            if (this.selectedOptions[bundleId]) {
                const selectedIds = this.selectedOptions[bundleId].map(item => item.id);
                checkboxes.forEach((checkbox) => {
                    if (selectedIds.includes(checkbox.value)) {
                        checkbox.checked = true;

                        // Update toggle text based on the associated label
                        const label = this.findLabelForCheckbox(checkbox);
                        toggle.textContent = label ? label.textContent.trim() : toggle.dataset.originalText;
                    }
                });
            }

            // Add change event listener to checkboxes
            this.addCheckboxChangeListener(checkboxes, toggle, dropdown);
        });
    }

    findLabelForCheckbox(checkbox) {
        // Check for a wrapping label
        let label = checkbox.closest('label');
        if (label) return label;

        // Fallback: Find a <label> with "for" attribute matching checkbox ID
        if (checkbox.id) {
            label = document.querySelector(`label[for="${checkbox.id}"]`);
        }

        return label;
    }

    addCheckboxChangeListener(checkboxes, toggle, dropdown) {
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                // Enforce single selection within the same bundle
                if (checkbox.checked) {
                    checkboxes.forEach((otherCheckbox) => {
                        if (otherCheckbox !== checkbox && otherCheckbox.getAttribute('data-id') === checkbox.getAttribute('data-id')) {
                            otherCheckbox.checked = false;
                        }
                    });
                }

                // Update toggle text based on the selected label
                const label = this.findLabelForCheckbox(checkbox);
                toggle.textContent = checkbox.checked && label
                    ? label.textContent.trim()
                    : toggle.dataset.originalText;

                // Update parameters and price
                this.updateSingleBundleParam(dropdown.id);
                this.calculateTotalPrice();
            });
        });
    }

    calculateTotalPrice() {
        let totalPrice = parseFloat("{{ grossPrice }}") || 0;

        this.bundleGroups.forEach((group) => {
            const checkboxes = group.querySelectorAll('.bundle-checkbox:checked');
            checkboxes.forEach((checkbox) => {
                const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
                totalPrice += price;
            });
        });
        // Calculate the total price by summing up selected checkboxes' prices

        const priceElements = document.querySelectorAll('.calculated-price');
        priceElements.forEach((priceElement) => {
            priceElement.textContent = totalPrice.toFixed(2);
        });
    }


    updateSingleBundleParam(bundleId) {
        const url = new URL(window.location.href);
        const bundleData = url.searchParams.get('bundles')
            ? JSON.parse(url.searchParams.get('bundles'))
            : {};

        const dropdown = document.getElementById(bundleId);
        const discount = parseFloat(dropdown.getAttribute('data-discount')) || 0;
        const discountType = dropdown.getAttribute('data-discount-type');

        const selectedProductData = [];
        const checkboxes = dropdown.querySelectorAll('.bundle-checkbox:checked');
        checkboxes.forEach((checkbox) => {
            selectedProductData.push({
                id: checkbox.value,
                price: parseFloat(checkbox.getAttribute('data-price')) || 0,
                discount,
                discountType
            });
        });

        if (selectedProductData.length) {
            bundleData[bundleId] = selectedProductData;
        } else {
            delete bundleData[bundleId];
        }

        url.searchParams.set('bundles', JSON.stringify(bundleData));
        window.location.href = url.toString();
    }
}
