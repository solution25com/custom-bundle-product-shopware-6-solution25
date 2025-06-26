
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

![administration_layout_configuration (1)](https://github.com/user-attachments/assets/87d1d0e2-cc31-4758-bda8-e3573fe6211f)

### 2️⃣ Assign Layout to a Product
- Go to **Catalog > Products** in administration.
- Edit the product where you want to display the bundle.
- In the **Layout** tab, assign the newly created bundle layout to this product.

![administration_bundle_set_create (1)](https://github.com/user-attachments/assets/b4e4c17a-be4b-4648-aa45-48ac92c11de9)

### 3️⃣ Configure Bundles
- In the **Bundle** tab within the product edit page:
  - Click **Add bundle** to create a new bundle.
  - Set the bundle name.
  - Choose the discount type (**percentage** or **fixed**) and enter the discount value.
  - Add products to the bundle and adjust the quantities as needed.
  - Save the bundle.

![administration_quantity_edit](https://github.com/user-attachments/assets/65874b3a-7d0f-454c-b454-e0df719582f5)

### 4️⃣ Adjust Quantity in Bundles
- After adding products to the bundle, you can change the quantity of each product directly in the **Bundle** tab.


### 5️⃣ Storefront Display
- Once configured, the bundles will be visible in the storefront for the assigned product.
- The displayed price will be automatically calculated based on the selected bundle products and discounts.

![storefront_bundle](https://github.com/user-attachments/assets/d8dc1ce6-f242-477f-b240-89e8f4e863d5)

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

# Bundle Plugin - API Documentation
 
This document describes the API endpoints provided by the Bundle Plugin for Shopware 6. These endpoints allow authorized users to create, update, delete, and fetch bundle data associated with products.
 
---
 
## Create or Update Product Bundle
 
**Endpoint**  
`POST /api/bundle/upsert`
 
### Description
 
Creates or updates a product bundle for a specified main product (identified by `productNumber`).  
If an empty `products` array is provided, the existing bundle will be deleted.
 
### Validation
 
The system validates:
 
- Existence of the main product by `productNumber`.
- Validity and presence of each assigned product’s `productNumber` and `quantity`.
- Proper input format.
 
### Request Headers
 
```
Authorization: Bearer <your-access-token>
Content-Type: application/json
```
 
> **Note**: The access token must be obtained from the Shopware Admin API using a valid integration or user login.
 
### Example Request Body
 
```json
{
  "id": "b2f47e1c6d1247cf9f3f1b4d4c43f784",
  "productNumber": "SW10123",
  "name": "Summer Bundle",
  "discount": 15,
  "discountType": "percentage",
  "products": [
    {
      "productNumber": "SW20100",
      "quantity": 2
    },
    {
      "productNumber": "SW20200",
      "quantity": 1
    }
  ]
}
```
 
### Successful Response
 
```json
{
  "status": "success",
  "data": "Bundle b2f47e1c6d1247cf9f3f1b4d4c43f784 successfully updated"
}
```
 
### Example Error Response
 
```json
{
  "error": "Product not found"
}
```
 
---
 
## Get Customer Cart Line Items
 
**Endpoint**  
`GET /bundle/cart-by-customer`
 
### Description
 
Returns the current cart items for the logged-in customer.
 
### Request Headers
 
```
Accept: application/json
```
 
### Query Parameters
 
- `customerId` (optional)
 
### Successful Response
 
```json
{
  "success": true,
  "customerId": "e45fe67c39424bc8aab0a7b99a91545b",
  "lineItems": [
    {
      "id": "lineItem1",
      "referencedId": "productId1",
      "quantity": 2
    },
    {
      "id": "lineItem2",
      "referencedId": "productId2",
      "quantity": 1
    }
  ]
}
```
 
### Example Error Response
 
```json
{
  "success": false,
  "message": "Access denied. You can only access your own cart."
}
```
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
