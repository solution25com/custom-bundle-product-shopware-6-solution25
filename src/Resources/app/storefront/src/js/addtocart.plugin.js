import Plugin from 'src/plugin-system/plugin.class';

export default class AddAllCart extends Plugin {
    init() {
        this.groupedWrapper = document.querySelector('.product-grouped');

        if (!this.groupedWrapper) {
            return;
        }

        this._registerAddAllButtonClick();
        this._registerQuantityChange();
    }

    _registerAddAllButtonClick() {
        const addAllButtons = document.querySelectorAll('.add-all');

    
        if (addAllButtons.length === 0) {
            console.warn('[AddAllCart] No add-all buttons found, aborting.');
            return;
        }
    
        addAllButtons.forEach(addAllButton => {
            addAllButton.addEventListener('click', (event) => {
                event.preventDefault();
    
                const groupedWrapper = addAllButton.closest('.product-grouped');
                if (!groupedWrapper) {
                    console.warn('[AddAllCart] No .product-grouped container found for this button. Using document as fallback.');
                }
    
                const container = groupedWrapper || document;
    
                const groupedProductTable = container.querySelector('.grouped-product-table');
                if (!groupedProductTable) {
                    return;
                }
    
                const productBoxes = groupedProductTable.querySelectorAll('.product-box');
                if (productBoxes.length === 0) {
                    return;
                }
    
                const lineItemsData = this._collectAllProductData(productBoxes);
    
                if (lineItemsData.length > 0) {
                    this._checkCartBeforeAdding(lineItemsData);
                } else {
                    alert('Please select at least one product to add.');
                }
            });
        });
    }
    
    
    
    _registerQuantityChange() {
        const quantitySelects = this.groupedWrapper.querySelectorAll('#quantity-select');
    
        quantitySelects.forEach(select => {
            let zeroOption = select.querySelector('option[value="0"]');
            if (!zeroOption) {
                zeroOption = document.createElement('option');
                zeroOption.value = "0";
                zeroOption.textContent = "0";
                select.prepend(zeroOption);
            }
    
            select.value = "0";
    
            const productBox = select.closest('.product-box');
            const hiddenQuantityInput = productBox?.querySelector('input[name*="[quantity]"]');
            const calculatedPrice = productBox?.querySelector('.calculated-price');
    
            if (hiddenQuantityInput) {
                hiddenQuantityInput.value = newQuantity; 
            }
    
            if (calculatedPrice) {
                calculatedPrice.dataset.originalPrice = calculatedPrice.textContent;
                calculatedPrice.textContent = "$0.00";
            }
    
            select.addEventListener('change', event => {
                const newQuantity = event.target.value;
    
                const productBox = select.closest('.product-box');
                const hiddenQuantityInput = productBox?.querySelector('input[name*="[quantity]"]');
                const calculatedPrice = productBox?.querySelector('.calculated-price');
    
                if (hiddenQuantityInput) {
                    hiddenQuantityInput.value = newQuantity;
                }
    
                if (calculatedPrice) {
                    if (newQuantity === "0") {
                        calculatedPrice.textContent = "$0.00";
                    } else {
                        calculatedPrice.textContent = calculatedPrice.dataset.originalPrice || "$0.00";
                    }
                }
    
                this._calculateSelectedItemsTotal();
            });
        });
    }
    
    _collectAllProductData(productBoxes) {
        const lineItemsData = [];
    
        productBoxes.forEach(productBox => {
            const inputs = productBox.querySelectorAll('input[type="hidden"]');
            const quantityInput = productBox.querySelector('.quantity-input');
    
            if (!inputs.length || !quantityInput) {
                console.warn('[AddAllCart] Missing inputs or quantity input, skipping productBox');
                return;
            }
    
            const quantity = parseInt(quantityInput.value, 10) || 0;
    
            if (quantity <= 0) {
                return;
            }
    
            const itemData = {};
            inputs.forEach(input => {
                const match = input.name.match(/lineItems\[(.*?)\]\[(.*?)\]/);
                if (match) {
                    const [, , fieldName] = match;
                    itemData[fieldName] = input.value;
                }
            });
    
            itemData['quantity'] = quantity;
    
            if (itemData['id'] && itemData['referencedId'] && itemData['type'] === 'product') {
                lineItemsData.push(itemData);
            } else {
                console.warn('[AddAllCart] Incomplete item data, skipping:', itemData);
            }
        });
    
        return lineItemsData;
    }
    
    
    
    _checkCartBeforeAdding(lineItemsData) {
        fetch('/bundle/cart-by-customer', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(res => {
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            return res.json();
        })
        .then(data => {

            if (!data.success) {
                alert(data.message || 'Failed to fetch cart info.');
                return;
            }
    
            const cartQuantities = {};
            data.lineItems.forEach(item => {
                const productId = item.referencedId;
                const quantity = parseInt(item.quantity, 10);
                cartQuantities[productId] = (cartQuantities[productId] || 0) + quantity;
            });
    
            lineItemsData.forEach(item => {
                const referencedId = item.referencedId;
                const quantityToAdd = parseInt(item.quantity, 10);
                const currentInCart = cartQuantities[referencedId] || 0;
    
                const productBox = this.groupedWrapper.querySelector(`.product-box[data-product-id="${referencedId}"]`);
                if (!productBox) {
                    console.warn('[AddAllCart] No productBox for', referencedId);
                    return;
                }
    
                const stockElement = productBox.querySelector('.stock');
                const stockText = stockElement?.textContent?.trim() ?? '';
                const stockMatch = stockText.match(/\d+/);
                const availableStock = stockMatch ? parseInt(stockMatch[0], 10) : null;
    
                if (availableStock === null) {
                    console.warn('[AddAllCart] No valid stock for', referencedId);
                    return;
                }
    
                const remainingStock = Math.max(availableStock - currentInCart, 0);
    
                if (stockElement) {
                    stockElement.textContent = `${remainingStock}`;
                }
    
                const select = productBox.querySelector('.quantity-select');
                if (select) {
                    select.innerHTML = '';
                    for (let i = 0; i <= remainingStock; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = i;
                        select.appendChild(option);
                    }
    
                    const newValue = Math.min(quantityToAdd, remainingStock);
                    select.value = newValue;
    
                    const hiddenQuantityInput = productBox.querySelector('input[name*="[quantity]"]');
                    if (hiddenQuantityInput) {
                        hiddenQuantityInput.value = newValue;
                    }
    
                    item.quantity = newValue;
                }
    
                if (remainingStock <= 0 || item.quantity <= 0) {
                    item.skip = true;
                }
            });
    
            const validItems = lineItemsData.filter(item => !item.skip && parseInt(item.quantity, 10) > 0);
    
            if (validItems.length === 0) {
                alert('No valid products to add to the cart.');
                return;
            }
    
            this._submitValidLineItems(validItems);
        })
        .catch(err => {
            console.error('[AddAllCart] Error during cart check:', err);
            alert('Something went wrong while checking your cart. Please try again.');
        });
    }
    
    
    _submitValidLineItems(lineItemsData) {
        const url = '/checkout/line-item/add';
        const formData = new FormData();
    
        lineItemsData.forEach((item, index) => {
            Object.entries(item).forEach(([key, value]) => {
                formData.append(`lineItems[${index}][${key}]`, value);
            });
        });
    
        formData.append('redirectTo', 'frontend.cart.offcanvas');
        formData.append('redirectParameters', JSON.stringify({}));
    
        const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = csrfTokenMeta ? { 'X-CSRF-Token': csrfTokenMeta.getAttribute('content') } : {};
    
        fetch(url, {
            method: 'POST',
            body: formData,
            headers: csrfToken,
        })
        .then(response => {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(() => {
            const cartButton = document.querySelector('.btn.header-cart-btn.header-actions-btn');
            if (cartButton) {
                cartButton.click();
            }
        })
        .catch((error) => {
            console.error('Error adding items to cart:', error);
        });
    }
    
    _registerQuantityChange() {
        const quantityInputs = this.groupedWrapper.querySelectorAll('.quantity-input');
    
        quantityInputs.forEach(input => {
            const productBox = input.closest('.product-box');
            const hiddenQuantityInput = productBox?.querySelector('input[name*="[quantity]"]');
            const calculatedPrice = productBox?.querySelector('.calculated-price');
    
            if (hiddenQuantityInput) {
                hiddenQuantityInput.value = "0";
            }
    
            if (calculatedPrice) {
                calculatedPrice.dataset.originalPrice = calculatedPrice.textContent;
                calculatedPrice.textContent = "$0.00";
            }
    
            input.addEventListener('input', (event) => {
                let newQuantity = parseInt(event.target.value, 10) || 0;
                const maxQuantity = parseInt(input.max, 10) || Infinity;
    
                if (newQuantity < 0) newQuantity = 0;
                if (newQuantity > maxQuantity) newQuantity = maxQuantity;
    
                input.value = newQuantity;
    
                if (hiddenQuantityInput) {
                    hiddenQuantityInput.value = newQuantity;
                }
    
                if (calculatedPrice) {
                    const originalPrice = parseFloat(calculatedPrice.dataset.originalPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
                    calculatedPrice.textContent = newQuantity > 0 ? `$${(originalPrice * newQuantity).toFixed(2)}` : "$0.00";
                }
    
                this._calculateSelectedItemsTotal();
            });
        });
    }
    
        
_calculateSelectedItemsTotal() {
    let total = 0;
    let totalItems = 0;

    const productBoxes = this.groupedWrapper.querySelectorAll('.product-box');

    productBoxes.forEach(box => {
        const quantityInput = box.querySelector('.quantity-input');
        const priceElement = box.querySelector('.calculated-price');

        if (!quantityInput || !priceElement) return;

        const quantity = parseInt(quantityInput.value, 10) || 0;
        const originalPrice = parseFloat(priceElement.dataset.originalPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

        total += quantity * originalPrice;
        totalItems += quantity;
    });

    const totalDisplay = this.groupedWrapper.querySelector('.grouped-total-price');
    if (totalDisplay) {
        totalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    const selectedItemsCount = this.groupedWrapper.querySelector('.selected-items');
    if (selectedItemsCount) {
        selectedItemsCount.textContent = totalItems;
    }
}

    
}
