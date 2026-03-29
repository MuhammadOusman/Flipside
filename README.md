# 🚀 FLIPSIDE - Comic-Brutalism E-Commerce Store

A modern thrift shoe store for Pakistan featuring **Comic-Brutalism** design with bold typography, hard shadows, and playful animations.

## 🎨 Design Features

- **Comic-Brutalism Style**: Hard borders (2-4px), bold shadows, halftone patterns
- **Typography**: Bangers (headings), Space Grotesk (body)
- **Color Palette**: Red (#FF3333), Purple (#6A0DAD), Green (#50C878)
- **Animations**: Framer Motion spring physics (stiffness: 300, damping: 20)

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (cart)
- **CMS**: Sanity.io
- **Animation**: Framer Motion
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity.io

1. Create a Sanity account: https://www.sanity.io/
2. Create a new project
3. Copy your Project ID and create an API token with write access
4. Create `.env.local` file:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Panel Access

Navigate to `/admin/login`

**Demo Credentials**:
- Username: `admin`
- Password: `admin123`

### Admin Features:

- **Dashboard**: Stats overview, low stock alerts, recent orders
- **Products**: Full CRUD operations, image uploads, stock management
- **Orders**: View and update order status, customer details
- **Settings**: Store configuration, Sanity integration

## ✨ Complete Features

### 🛍️ Customer Pages
- **Homepage**: Hero section, featured products, category panels, CTA sections
- **Shop Page**: Advanced filters (size, brand, price, condition), responsive product grid
- **Product Detail**: Image gallery, condition bar, add to cart with POW animation
- **Shopping Cart**: Sliding drawer with animations, item management
- **Checkout**: Complete form with COD, order summary, Pakistan cities dropdown
- **About Page**: Store story and contact info
- **404 Page**: Custom error page with comic styling

### 🎨 Design System
- **Comic-Brutalism**: Hard borders (2-4px), no blur shadows, halftone patterns
- **Fonts**: Bangers (headings), Space Grotesk (body)
- **Colors**: Red #FF3333, Purple #6A0DAD, Green #50C878
- **Animations**: Spring physics (stiffness 300, damping 20)
- **Speech Bubbles**: POW/ZAP/BOOM/BAM components

### 🔥 Advanced Features
- ✅ **Admin Dashboard** with full inventory management
- ✅ **Image Upload** system with drag & drop
- ✅ **Order Management** with status tracking
- ✅ **Scroll to Top** button with smooth animation
- ✅ **WhatsApp** floating button for instant contact
- ✅ **Loading States** with comic book animation
- ✅ **Custom Scrollbar** themed to match design
- ✅ **Smooth Scroll** behavior
- ✅ **Mobile Responsive** - works perfectly on all devices
- ✅ **SEO Optimized** metadata

### 🎭 Components Library
- `ComicButton` - Animated button with variants
- `ProductCard` - Product display with hover effects
- `CartDrawer` - Sliding cart panel
- `Navbar` - Navigation with cart counter
- `Footer` - Complete footer with links
- `SpeechBubble` - Comic speech bubbles
- `ScrollToTop` - Scroll button


## 📁 Project Structure

```
Flipside/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── shop/page.tsx            # Shop with filters
│   ├── product/[slug]/page.tsx  # Product detail
│   ├── checkout/page.tsx        # Checkout form
│   ├── about/page.tsx           # About page
│   ├── not-found.tsx            # 404 page
│   ├── loading.tsx              # Loading state
│   └── admin/                   # Admin Dashboard
│       ├── layout.tsx           # Admin sidebar layout
│       ├── login/page.tsx       # Admin authentication
│       ├── dashboard/page.tsx   # Dashboard with stats
│       ├── products/
│       │   ├── page.tsx         # Product list & management
│       │   └── new/page.tsx     # Add new product
│       ├── orders/page.tsx      # Order management
│       └── settings/page.tsx    # Settings & Sanity config
├── components/
│   ├── ComicButton.tsx          # Reusable button
│   ├── ProductCard.tsx          # Product display card
│   ├── CartDrawer.tsx           # Sliding cart
│   ├── Navbar.tsx               # Navigation
│   ├── Footer.tsx               # Footer with social links
│   ├── SpeechBubble.tsx         # Comic speech bubbles
│   ├── ScrollToTop.tsx          # Scroll-to-top button
│   └── WhatsAppButton.tsx       # WhatsApp contact
├── store/
│   └── cart.ts                  # Zustand cart store
├── lib/
│   ├── sanity.ts                # Sanity client config
│   ├── queries.ts               # Sanity queries
│   └── sanity-mutations.ts      # CRUD operations
└── sanity/
    ├── product.schema.ts        # Product schema
    └── order.schema.ts          # Order schema
```

## 🔌 Sanity Integration

### Product Operations

```typescript
import { createProduct, updateProduct, deleteProduct } from '@/lib/sanity-mutations';

// Create product
await createProduct({
  name: "Jordan 4 Military Black",
  slug: "jordan-4-military-black",
  brand: "Nike",
  size: "UK 9",
  price: 48000,
  condition: 95,
  stock: 1,
  images: [{ asset: { _ref: imageAssetId } }]
});

// Update product
await updateProduct(productId, { price: 50000, stock: 2 });

// Delete product
await deleteProduct(productId);
```

### Image Upload

```typescript
import { uploadImage, uploadMultipleImages } from '@/lib/sanity-mutations';

// Single image
const result = await uploadImage(file);
const imageAssetId = result.data._id;

// Multiple images
const results = await uploadMultipleImages([file1, file2, file3]);
```

## 🛠️ Development Guide

### Adding New Products (Admin Panel)
1. Navigate to `/admin/products/new`
2. Upload images via drag & drop or file browser
3. Fill in product details (name, brand, size, price, condition)
4. Adjust condition slider (50-100%)
5. Set stock quantity
6. Click "CREATE PRODUCT"

### Managing Orders
1. Go to `/admin/orders`
2. View all orders with status indicators
3. Click eye icon to view full order details
4. Update order status from dropdown (Pending → Processing → Shipped → Delivered)
5. Changes sync to Sanity automatically

### Updating Settings
1. Navigate to `/admin/settings`
2. Configure store information (name, email, phone, address)
3. Set inventory preferences (low stock threshold)
4. Add Sanity credentials (Project ID, Dataset, API Token)
5. Enable/disable notifications

## 🎯 Pages & Routes

### Customer Pages
- `/` - Homepage
- `/shop` - All products with filters
- `/product/[slug]` - Product detail
- `/checkout` - Checkout form
- `/about` - About page

### Admin Pages
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Dashboard overview
- `/admin/products` - Product management
- `/admin/products/new` - Add new product
- `/admin/orders` - Order management
- `/admin/settings` - Settings & configuration

## 🚨 Important Notes

1. **Admin Authentication**: Currently uses localStorage (demo only). For production, implement proper authentication (NextAuth, Clerk, Auth0)

2. **Image Optimization**: Update `next.config.js` to allow Sanity image domains:
```js
images: {
  domains: ['cdn.sanity.io'],
}
```

3. **Environment Variables**: Never commit `.env.local` to version control

4. **Sanity Token**: Use tokens with appropriate permissions:
   - Read-only for public frontend
   - Write access for admin panel

## 📦 Build for Production

```bash
npm run build
npm run start
```

## 🎨 Design System

### Colors (CSS Variables)
```css
--comic-red: #FF3333
--comic-purple: #6A0DAD
--comic-green: #50C878
```

### Typography
- **Headings**: `font-heading` class → Bangers
- **Body**: Default → Space Grotesk

### Shadows & Borders
```css
.shadow-hard: 4px 4px 0 black
.shadow-hard-sm: 2px 2px 0 black
```
- Default borders: `border-2` or `border-4` (always black)

## 🎨 Design Features

- Hard shadows (no blur)
- 2-4px black borders everywhere
- Halftone dot patterns
- Spring-based animations
- Comic speech bubbles
- Rotated elements
- High contrast colors
- Custom scrollbar
- Smooth scrolling

## 📱 Mobile Optimized

- Responsive grid layouts
- Mobile-friendly filters
- Touch-optimized buttons
- Hamburger menu
- Optimized images

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## 📝 Next Steps

1. Add your Sanity credentials
2. Create products in Sanity Studio
3. Update WhatsApp number in `WhatsAppButton.tsx`
4. Add social media links in `Footer.tsx`
5. Add real product images
6. Deploy to Vercel

## 💡 Tips

- Logo is in `public/logo.png`
- Mock data is in each page (replace with Sanity)
- All animations use spring physics
- Custom scrollbar matches theme
- WhatsApp button is floating bottom-right

---

**Made with ❤️ and lots of comic books**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
