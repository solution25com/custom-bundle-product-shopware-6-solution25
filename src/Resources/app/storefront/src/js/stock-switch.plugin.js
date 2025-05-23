import Plugin from 'src/plugin-system/plugin.class';

export default class stockSwitch extends Plugin {
    init() {
        const switchInput = document.getElementById('switchInput');
        const cardBody = document.querySelector('.card-body.no-stock');

        if (switchInput && cardBody) {
            switchInput.addEventListener('change', () => {
                switchInput.checked
                    ? cardBody.classList.add('hidde')
                    : cardBody.classList.remove('hidde');
            });
        }
    }
}
