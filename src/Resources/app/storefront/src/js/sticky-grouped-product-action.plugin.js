import Plugin from 'src/plugin-system/plugin.class';

export default class StickyGroupedProductActionPlugin extends Plugin {
    
    init() {
        this.container = document.querySelector('#bundle-price-container');
        this.originalAction = document.querySelector('.grouped-product-action');
        
        if (!this.container || !this.originalAction) {
            console.warn('Elementët e nevojshëm nuk u gjetën.');
            return;
        }

        this.stickyActive = false;
        this.lastScrollY = window.scrollY;
        this.quantityChanged = false;

        this._registerEvents();
    }

    _registerEvents() {
        window.addEventListener('scroll', this._onScroll.bind(this));

        this.container.addEventListener('input', this._onInput.bind(this));
    }

    _onScroll() {
        const currentScrollY = window.scrollY;
        const scrolledUp = currentScrollY < this.lastScrollY;

        if (this._isInViewport(this.originalAction)) {
            this._removeSticky();
        }

        if (this.quantityChanged && scrolledUp && !this._isInViewport(this.originalAction) && !this.stickyActive) {
            this._showSticky();
        }

        this.lastScrollY = currentScrollY;
    }

    _onInput(event) {
        if (event.target.matches('.sixth-row input[type="number"]')) {

            if (this._isInViewport(this.originalAction)) {
                return;
            }

            console.log('U ndryshua quantity:', event.target.value);

            this.quantityChanged = true;
            this._showSticky();
        }
    }

    _isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        );
    }

    _showSticky() {
        this._removeSticky();
    
        const clone = this.originalAction.cloneNode(true);
        clone.classList.add('sticky-clone');
    
        Array.from(clone.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                clone.removeAttribute(attr.name);
            }
        });
    
        Object.assign(clone.style, {
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            zIndex: '10'
        });
    
        document.body.appendChild(clone);
        this.stickyActive = true;
    
        const addAllBtnClone = clone.querySelector('.product-grouped .add-all') || clone.querySelector('.add-all');
        const addAllBtnOriginal = this.originalAction.querySelector('.product-grouped .add-all') || this.originalAction.querySelector('.add-all');
    
        if (addAllBtnClone && addAllBtnOriginal) {
            addAllBtnClone.addEventListener('click', (e) => {
                e.preventDefault();
                addAllBtnOriginal.click();
            });
        }
    }
    

    _removeSticky() {
        const existing = document.querySelector('.grouped-product-action.sticky-clone');
        if (existing) {
            existing.remove();
        }
        this.stickyActive = false;
    }
}
