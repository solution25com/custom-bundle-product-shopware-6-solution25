import Plugin from 'src/plugin-system/plugin.class';

export default class DropdownPlugin extends Plugin {
    init() {
        window.onload = () => {
            this._handlePageReload();
        };

        this._initializeDropdowns();
        this._updateBuyButtonState();
    }

    _handlePageReload() {
        const isPageReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
        console.log('performance', performance);
        console.log('isPageReload', isPageReload);

        if (isPageReload) {
            this._resetCheckboxes();
            this._resetUrlParameters();
        }

        this._initializeDropdowns();
        this._updateBuyButtonState();
    }

    _initializeDropdowns() {
        const dropdownToggles = [...this.el.querySelectorAll('.bundle-dropdown-toggle')];

        if (!dropdownToggles.length) {
            return;
        }

        dropdownToggles.forEach((toggle) => {
            toggle.dataset.originalText = toggle.textContent.trim();

            toggle.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleDropdown(toggle);
            });
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.bundles-select')) {
                this._closeAllDropdowns();
            }
        });

        const checkboxes = [...this.el.querySelectorAll('.bundle-checkbox')];
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => {
                this._updateToggleText(event.target);
                this._updateBuyButtonState();
            });
        });
    }

    _toggleDropdown(toggle) {
        const parentContainer = toggle.closest('.bundles-select');
        const dropdown = parentContainer.querySelector('.dropdown-options');

        if (!dropdown) {
            return;
        }

        this._closeAllDropdowns();

        dropdown.classList.add('is-open');
        toggle.classList.add('is-open');
    }

    _closeAllDropdowns() {
        const openDropdowns = this.el.querySelectorAll('.dropdown-options.is-open');
        const openToggles = this.el.querySelectorAll('.bundle-dropdown-toggle.is-open');

        openDropdowns.forEach((dropdown) => dropdown.classList.remove('is-open'));
        openToggles.forEach((toggle) => toggle.classList.remove('is-open'));
    }

    _updateToggleText(checkbox) {
        const parentContainer = checkbox.closest('.bundles-select');
        const toggle = parentContainer.querySelector('.bundle-dropdown-toggle');

        if (!toggle) {
            return;
        }

        const allCheckboxes = parentContainer.querySelectorAll('.bundle-checkbox');
        allCheckboxes.forEach((box) => {
            if (box !== checkbox) {
                box.checked = false;
            }
        });

        const selectedOption = checkbox.checked ? checkbox.nextElementSibling.textContent.trim() : toggle.dataset.originalText;

        toggle.textContent = selectedOption;
    }


    _updateBuyButtonState() {
        const buyButton = document.querySelector('.cms-block-gallery-buybox-bundles button.btn-buy');
        const subscribeButton = document.getElementById('s25-subscribe-button');
        if (!buyButton) return;

        const bundles = document.querySelectorAll(".bundles-select");

        let shouldDisableButton = false;
        let totalValidBundles = 0;
        let totalValidBundlesPassed = 0;

        bundles.forEach(bundle => {
            const dropdown = bundle.querySelector(".dropdown-options");
            if (!dropdown) return;

            const liElements = dropdown.querySelectorAll('li');
            const validCheckboxes = Array.from(dropdown.querySelectorAll('.bundle-checkbox')).filter(cb => {
                return !cb.disabled && !cb.closest('li')?.classList.contains('no-quantity-list');
            });

            const allLiInvalid = Array.from(liElements).every(li => {
                const checkbox = li.querySelector('.bundle-checkbox');
                return !checkbox || checkbox.disabled || li.classList.contains('no-quantity-list');
            });

            if (allLiInvalid) {
                shouldDisableButton = true;
                return;
            }

            if (validCheckboxes.length > 0) {
                totalValidBundles++;

                const selectedValidCheckboxes = validCheckboxes.filter(cb => cb.checked);
                if (selectedValidCheckboxes.length > 0) {
                    totalValidBundlesPassed++;
                }
            }
        });

        if (shouldDisableButton || totalValidBundles === 0 || totalValidBundlesPassed < totalValidBundles) {
            buyButton.classList.add('is-disabled');
            buyButton.textContent = 'Please Choose a Bundle';
            buyButton.style.opacity = '0.5';
            buyButton.style.pointerEvents = 'none';
            buyButton.style.cursor = 'not-allowed';
            buyButton.disabled = true;

            if (subscribeButton) {
                subscribeButton.style.opacity = '0.5';
                subscribeButton.style.pointerEvents = 'none';
                subscribeButton.style.cursor = 'not-allowed';
                subscribeButton.disabled = true;
            }
        } else {
            buyButton.classList.remove('is-disabled');
            buyButton.textContent = 'Buy Now';
            buyButton.style.opacity = '1';
            buyButton.style.pointerEvents = 'auto';
            buyButton.style.cursor = 'pointer';
            buyButton.disabled = false;

            if (subscribeButton) {
                subscribeButton.style.opacity = '1';
                subscribeButton.style.pointerEvents = 'auto';
                subscribeButton.style.cursor = 'pointer';
                subscribeButton.disabled = false;
            }
        }
    }


    _resetUrlParameters() {
        const url = new URL(window.location.href);
        const params = url.searchParams;

        if (params.has('bundles')) {
            params.delete('bundles');
            window.history.replaceState({}, document.title, url.pathname);
        }

    }

    _resetCheckboxes() {
        const checkboxes = [...this.el.querySelectorAll('.bundle-checkbox')];

        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;

            const label = checkbox.closest('li').querySelector('label');
            if (label) {
                label.classList.remove('checked');
                label.classList.remove('is-checked');
            }

            checkbox.dispatchEvent(new Event('change'));
        });

    }

}
