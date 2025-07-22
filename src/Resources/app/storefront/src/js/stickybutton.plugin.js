import Plugin from 'src/plugin-system/plugin.class';

export default class StickybuttonPlugin extends Plugin {
    init() {
        this.groupedProductAction = document.querySelector('.grouped-product-action');
        this.clone = null;
        this.quantityChanged = false;

        this.container = document.querySelector('#bundle-price-container');

        if (this.groupedProductAction) {
            this.registerScrollHandler();
            this.registerGlobalClickHandler();
            this.registerInputHandler();
        }
    }

    createClone() {
        this.removeClone();

        if (this.groupedProductAction) {
            this.clone = this.groupedProductAction.cloneNode(true);
            this.clone.classList.add('scrolled-past-clone');

            this.clone.removeAttribute('data-add-all-cart');
            this.clone.removeAttribute('data-sticky-grouped-product');

            document.body.appendChild(this.clone);
        }
    }

    removeClone() {
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
    }

    registerScrollHandler() {
        window.addEventListener('scroll', () => {
            if (this._isInViewport(this.groupedProductAction)) {
                this.removeClone();
                return;
            }

            const elementRect = this.groupedProductAction.getBoundingClientRect();
            const triggerOffset = 150;
            const isScrolledPast = elementRect.top < triggerOffset;

            if (isScrolledPast || this.quantityChanged) {
                this.createClone();
            } else {
                this.removeClone();
            }
        }, { passive: true });
    }

    registerInputHandler() {
        if (!this.container) {
            return;
        }

        this.container.addEventListener('input', (event) => {
            if (event.target.matches('.sixth-row input[type="number"]')) {

                if (this._isInViewport(this.groupedProductAction)) {
                    return;
                }

                this.quantityChanged = true;
                this.createClone();
            }
        });
    }

    registerGlobalClickHandler() {
        document.addEventListener('click', (event) => {
            if (event.target.closest('.scrolled-past-clone .add-all')) {
                event.preventDefault();

                const originalAddAll = document.querySelector('.product-grouped .grouped-product-action .add-all');
                if (originalAddAll) {
                    originalAddAll.click();
                }
            }
        });
    }

    _isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        );
    }
}