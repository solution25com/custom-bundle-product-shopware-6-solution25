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

            setTimeout(() => {
                button.style.pointerEvents = '';
                button.style.opacity = '';
                hasBeenClicked = false;

            }, 1000);
        });

    }
}
