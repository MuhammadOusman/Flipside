# 🛠️ FLIPSIDE ADMIN PANEL GUIDE

Complete guide to using the Flipside admin inventory management system.

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Settings](#settings)
6. [Sanity Integration](#sanity-integration)

---

## 🚀 Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login` in your browser
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click "LOGIN" to access the dashboard

> ⚠️ **Security Note**: These are demo credentials. For production, implement proper authentication (NextAuth.js, Clerk, or Auth0).

---

## 📊 Dashboard Overview

**Route**: `/admin/dashboard`

The dashboard provides a quick overview of your store:

### Stats Cards
- **Total Products**: Number of products in inventory
- **Total Orders**: Number of orders received
- **Revenue**: Total sales revenue (PKR)
- **Avg. Order Value**: Average order amount

### Low Stock Alert
- Shows products with critically low inventory
- Red highlight for items with ≤ stock threshold
- Quick link to manage inventory

### Recent Orders
- Last 3 orders with status indicators
- Order ID, customer, product, and amount
- Color-coded status badges:
  - 🟡 Yellow = Pending
  - 🔵 Blue = Shipped
  - 🟢 Green = Delivered

### Quick Actions
- **+ ADD PRODUCT**: Create new product listing
- **📦 MANAGE ORDERS**: View all orders
- **👁️ VIEW STORE**: Preview customer-facing site

---

## 🛍️ Product Management

### Viewing Products

**Route**: `/admin/products`

**Features**:
- Search by product name
- Filter by brand, size, stock, condition
- View product images, specs, and stock levels
- Sortable table with:
  - Product name and ID
  - Brand
  - Size
  - Price
  - Condition bar (visual representation)
  - Stock quantity

**Status Indicators**:
- 🟢 Green badge: Good stock (>3 units)
- 🟡 Yellow badge: Low stock (1-3 units)
- 🔴 Red badge: Out of stock (0 units)

### Adding New Products

**Route**: `/admin/products/new`

**Step 1: Upload Images**
1. Drag and drop images into the upload area
2. Or click "BROWSE FILES" to select images
3. Upload multiple images (first image = primary)
4. Remove images by clicking the X button
5. Images are marked as "PRIMARY" automatically

**Step 2: Fill Product Details**
- **Product Name**: Full shoe name (e.g., "Jordan 4 Military Black")
- **Brand**: Select from dropdown (Nike, Adidas, Jordan, etc.)
- **Size**: UK size (e.g., "UK 9")
- **Price**: Price in PKR (e.g., 48000)
- **Condition**: Slider from 50-100% (auto-color coded)
  - 🟢 90-100% = Excellent (Green)
  - 🟡 80-89% = Good (Yellow)
  - 🔴 50-79% = Fair (Red)
- **Stock Quantity**: Number of units available
- **Description**: Optional details (flaws, authenticity, etc.)

**Step 3: Submit**
1. Review all details
2. Click "CREATE PRODUCT" to save
3. Product will sync to Sanity CMS (if configured)

### Editing Products

**Route**: `/admin/products/edit/[id]` (Coming Soon)

Click the purple **Edit** button (pencil icon) on any product in the list.

### Deleting Products

Click the red **Delete** button (trash icon) on any product.
- Confirmation modal appears
- Choose "CANCEL" or "DELETE"
- Deletion syncs to Sanity CMS

---

## 📦 Order Management

**Route**: `/admin/orders`

### Order List Features

**Stats Overview**:
- Count of orders by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Quick visual indicators with icons

**Order Cards**:
Each order displays:
- Order number (e.g., ORD-001)
- Customer name and city
- Order date
- Status badge with icon
- Eye button to view details

**Filters**:
- Search by order ID or customer name
- Filter by status, city, or date range

### Viewing Order Details

Click the **Eye** icon on any order to open the detail modal.

**Modal Contents**:
- **Customer Information**:
  - Name, phone, email
  - Complete address and city
- **Items Ordered**:
  - Product name, size, quantity
  - Individual price per item
  - Total amount
- **Status Update Dropdown**:
  - Change order status:
    - Pending → Processing → Shipped → Delivered
    - Or mark as Cancelled
  - Updates sync immediately

**Order Statuses**:
- 🟡 **Pending**: Order received, awaiting processing
- 🔵 **Processing**: Order being prepared
- 🟣 **Shipped**: Order sent to customer
- 🟢 **Delivered**: Order successfully delivered
- 🔴 **Cancelled**: Order cancelled

---

## ⚙️ Settings

**Route**: `/admin/settings`

### Store Information
- **Store Name**: Your business name (e.g., "Flipside")
- **Store Email**: Contact email
- **Store Phone**: Contact number
- **WhatsApp Number**: WhatsApp contact (format: +923001234567)
- **Store Address**: Physical location

### Inventory Settings
- **Currency**: Select PKR, USD, or EUR
- **Low Stock Alert Threshold**: Number triggering low stock alerts (default: 5)
- **Auto Archive Sold**: Automatically hide sold products

### Notifications
- **Browser Notifications**: Enable/disable browser alerts
- **Email Alerts**: Receive email for new orders

### Sanity CMS Integration
Configure your Sanity.io connection:
- **Project ID**: Your Sanity project ID
- **Dataset**: Usually "production"
- **API Token**: Write-access token for admin operations

> ⚠️ **Important**: After entering Sanity credentials here, add them to your `.env.local` file for the integration to work.

**Save Settings**:
- Click "SAVE ALL SETTINGS" at the bottom
- Changes persist in localStorage (demo mode)

---

## 🔌 Sanity Integration

### Setting Up Sanity

**Step 1: Create Sanity Project**
1. Go to https://www.sanity.io/
2. Create account and new project
3. Choose "Clean project" template
4. Note your **Project ID**

**Step 2: Get API Token**
1. Go to https://www.sanity.io/manage
2. Select your project
3. Navigate to API → Tokens
4. Click "Add API token"
5. Name it "Admin Panel"
6. Set permissions to "Editor" (write access)
7. Copy the token (starts with `sk...`)

**Step 3: Configure Environment**

Create `.env.local` file in project root:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
```

**Step 4: Deploy Schemas**
1. Copy `sanity/product.schema.ts` to your Sanity Studio
2. Copy `sanity/order.schema.ts` to your Sanity Studio
3. Deploy schemas: `sanity deploy`

### Using Sanity in Admin

Once configured, all admin operations automatically sync to Sanity:

**Product Operations**:
- ✅ Create → Syncs to Sanity as new document
- ✅ Update → Patches existing document
- ✅ Delete → Removes from Sanity
- ✅ Image Upload → Uploads to Sanity CDN

**Order Operations**:
- ✅ Create → Stores order in Sanity
- ✅ Update Status → Patches order document

**Real-time Benefits**:
- Changes visible in Sanity Studio instantly
- Frontend queries latest data automatically
- Image optimization via Sanity CDN
- Backup and version control

---

## 🎯 Best Practices

### Product Management
1. Always upload high-quality images (first image is primary)
2. Be accurate with condition ratings (affects customer trust)
3. Update stock immediately when sold
4. Write detailed descriptions for high-value items
5. Use consistent naming conventions

### Order Management
1. Update order status within 24 hours
2. Mark as "Processing" when preparing shipment
3. Update to "Shipped" with tracking info
4. Confirm "Delivered" after customer confirmation
5. Contact customer before cancelling

### Inventory
1. Set low stock threshold appropriately (recommended: 3-5)
2. Enable notifications for low stock alerts
3. Archive sold items to keep inventory clean
4. Regular inventory audits

### Security
1. Change default admin password immediately
2. Implement proper authentication for production
3. Use secure API tokens with minimum required permissions
4. Never commit `.env.local` to version control
5. Rotate API tokens periodically

---

## 🚨 Troubleshooting

### "Products not saving"
- Check Sanity credentials in `.env.local`
- Verify API token has write permissions
- Check browser console for errors

### "Images not uploading"
- Verify Sanity API token is valid
- Check file size (max 10MB recommended)
- Ensure image format is supported (JPG, PNG, WebP)

### "Orders not updating"
- Refresh page to see latest data
- Check network connection
- Verify Sanity dataset is correct

### "Can't access admin panel"
- Clear browser localStorage
- Use correct URL: `/admin/login`
- Try incognito/private mode

---

## 📞 Support

For technical support:
- **Email**: contact@flipside.pk
- **WhatsApp**: +92 300 1234567
- **Documentation**: Check README.md

---

**Built with ❤️ for Flipside Pakistan**
