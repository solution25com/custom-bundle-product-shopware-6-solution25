import Plugin from 'src/plugin-system/plugin.class';

export default class BrandImageClonePlugin extends Plugin {
    
    init() {
        this.brandImageContainer = this.el;

        if (!this.brandImageContainer) {
            return;
        }

        this._initObserver();
    }

    _initObserver() {
        this.observer = new MutationObserver(this._handleMutation.bind(this));
        
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    _handleMutation() {
        const logo = document.querySelector('.bulk-brandproduct-logo');

        if (logo && !this.brandImageContainer.querySelector('.cloned-brand-logo')) {
            const clonedLogo = logo.cloneNode(true);
            clonedLogo.classList.remove('d-none');
            clonedLogo.classList.add('cloned-brand-logo');

            this.brandImageContainer.innerHTML = '';
            this.brandImageContainer.appendChild(clonedLogo);

            this.observer.disconnect();
        }
    }
}