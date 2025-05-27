
# Bundle Product Plugin for Shopware 6

This plugin adds the ability to create and manage product bundles in Shopware 6. It allows you to assign products as bundles, configure discounts, and display them in the storefront.

---

## Features

✅ Create bundle sets for products  
✅ Assign products to bundles with custom quantities  
✅ Configure bundle discounts (percentage or fixed)  
✅ Display bundles in the storefront with adjusted pricing  

---

## Installation

You can install the plugin in two ways:

### 1️⃣ Via Composer
```bash
composer require solution25/bundle-configurator
```

### 2️⃣ Clone from Git
```bash
git clone https://github.com/solution25/bundle-configurator.git
```

After installation, activate the plugin in the Shopware 6 administration panel.

---

## How to Use

### 1️⃣ Create a New Layout for Bundle Products
- In **Shopping Experiences** (CMS), create a new layout specifically for bundle products.
- Assign the required blocks (including the **Buy box**) to this layout.
- Save the layout.

**See screenshot:** `screenshots/layout-creation.png`

### 2️⃣ Assign Layout to a Product
- Go to **Catalog > Products** in administration.
- Edit the product where you want to display the bundle.
- In the **Layout** tab, assign the newly created bundle layout to this product.

**See screenshot:** `screenshots/assign-layout.png`

### 3️⃣ Configure Bundles
- In the **Bundle** tab within the product edit page:
  - Click **Add bundle** to create a new bundle.
  - Set the bundle name.
  - Choose the discount type (**percentage** or **fixed**) and enter the discount value.
  - Add products to the bundle and adjust the quantities as needed.
  - Save the bundle.

**See screenshot:** `screenshots/bundle-creation.png`

### 4️⃣ Adjust Quantity in Bundles
- After adding products to the bundle, you can change the quantity of each product directly in the **Bundle** tab.

**See screenshot:** `screenshots/edit-quantity.png`

### 5️⃣ Storefront Display
- Once configured, the bundles will be visible in the storefront for the assigned product.
- The displayed price will be automatically calculated based on the selected bundle products and discounts.

**See screenshot:** `screenshots/storefront-view.png`

---

## Example Workflow

1. Create a layout called **Bundle Product** in the CMS.
2. Assign it to a product in the **Layout** tab.
3. In the **Bundle** tab, create a bundle set:
   - Set name and discount (percentage or fixed).
   - Add products and adjust their quantities.
4. Save the product.
5. Visit the storefront and see the bundle displayed with calculated prices.

---

## Best Practices

- **Use meaningful names for your bundles**: This helps customers understand what they're getting.  
- **Test bundle combinations thoroughly**: Check how discounts and quantities affect the storefront display.  
- **Maintain layout consistency**: Ensure the bundle layout is uniform across similar product types.  
- **Leverage Shopware’s translation features**: Provide localized bundle names and descriptions for international stores.

---

## Troubleshooting

**Problem: Buy box missing in the layout**  
✅ Solution: Ensure the **Buy box** block is added to your layout in the CMS.

**Problem: Discounts not reflected in storefront**  
✅ Solution: Check that the bundle discount is set correctly in the **Bundle** tab and the layout is assigned to the product.

**Problem: Bundles not showing in the storefront**  
✅ Solution:  
- Verify that the layout with the **Buy box** is assigned to the product.  
- Clear the cache and reindex data in Shopware.

**Problem: Quantity updates not saved**  
✅ Solution: Ensure you click **Save bundle** after updating product quantities in the bundle.

---

## Frequently Asked Questions (FAQ)

**Q1: Can I use this plugin with any theme?**  
A1: Yes, the plugin works with any theme that supports Shopware's CMS system. Just ensure your layout includes the **Buy box** element.

**Q2: Does the plugin support variable product discounts?**  
A2: Currently, you can only set percentage or fixed discounts on the whole bundle, not per product.

**Q3: What happens if I remove a product from a bundle?**  
A3: The product will no longer be part of that bundle in the storefront, and the price will update automatically.

**Q4: Is the plugin compatible with the latest Shopware 6 version?**  
A4: Yes, it is tested with Shopware 6.6 and above.

**Q5: Can I translate bundle names and descriptions?**  
A5: Yes, use Shopware’s built-in translation feature to localize your bundles.

---

## Notes

- The plugin is compatible with Shopware 6.6 and later.  
- The **Buy box** element is required in the layout to ensure bundles can be purchased in the storefront.  

---
