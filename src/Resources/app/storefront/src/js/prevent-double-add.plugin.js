import Plugin from 'src/plugin-system/plugin.class';

export default class PreventDoubleAddPlugin extends Plugin {
    init() {
        this._registerEvents();
    }

    _registerEvents() {
        const button = this.el;

        if (!button) {
            return;
        }

        let hasBeenClicked = false;

        button.addEventListener('click', (e) => {
            if (hasBeenClicked) {
                e.preventDefault();
                return;
            }

            hasBeenClicked = true;

            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
            // button.textContent = 'Add to shopping cart';

            setTimeout(() => {
                button.style.pointerEvents = '';
                button.style.opacity = '';
                // button.textContent = 'Add to shopping cart';
                hasBeenClicked = false;

            }, 1000);
        });

    }
}
