import Plugin from 'src/plugin-system/plugin.class';

export default class StickybuttonPlugin extends Plugin {
    init() {
        this.productGrouped = document.querySelector('.product-grouped');
        this.groupedProductAction = document.querySelector('.grouped-product-action');
        this.clone = null;

        if (this.productGrouped && this.groupedProductAction) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        this.createClone();
                    } else {
                        this.removeClone();
                    }
                });
            }, { threshold: 0 });

            this.observer.observe(this.productGrouped);
        }

        this.productListing = document.querySelector('.cms-element-product-listing');
        this.addAllButton = document.querySelector('.bundle-add-all');
        this.cloneAddAll = null;

        if (this.productListing && this.addAllButton) {
            this.listingObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        this.createAddAllClone();
                    } else {
                        this.removeAddAllClone();
                    }
                });
            }, { threshold: 0 });

            this.listingObserver.observe(this.productListing);
        }
    }

    createClone() {
        if (!this.clone && this.groupedProductAction) {
            this.clone = this.groupedProductAction.cloneNode(true);
            this.clone.classList.add('scrolled-past-clone');
            document.body.appendChild(this.clone);

            const cloneAddAllButton = this.clone.querySelector('.add-all');
            const originalAddAllButton = this.groupedProductAction.querySelector('.add-all');

            if (cloneAddAllButton && originalAddAllButton) {
                cloneAddAllButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    originalAddAllButton.click();
                });
            }
        }
    }

    removeClone() {
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
    }

    createAddAllClone() {
        if (!this.cloneAddAll && this.addAllButton) {
            this.cloneAddAll = this.addAllButton.cloneNode(true);
            this.cloneAddAll.classList.add('bundle-add-all-cloned');
            document.body.appendChild(this.cloneAddAll);

            this.cloneAddAll.addEventListener('click', (event) => {
                event.preventDefault();
                this.addAllButton.click();
            });
        }
    }

    removeAddAllClone() {
        if (this.cloneAddAll) {
            this.cloneAddAll.remove();
            this.cloneAddAll = null;
        }
    }
}
