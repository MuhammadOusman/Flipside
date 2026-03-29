# ✅ FLIPSIDE - PRE-LAUNCH CHECKLIST

Use this checklist before launching your store to production.

---

## 🔧 Technical Setup

### Environment Configuration
- [ ] Create Sanity.io account
- [ ] Create new Sanity project
- [ ] Copy Project ID to `.env.local`
- [ ] Generate API token with Editor permissions
- [ ] Add API token to `.env.local`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Deploy Sanity schemas (product & order)

### Development Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` without errors
- [ ] Visit homepage (`/`)
- [ ] Browse shop page (`/shop`)
- [ ] View product detail page (`/product/[slug]`)
- [ ] Test cart functionality (add/remove items)
- [ ] Complete checkout flow
- [ ] Visit about page (`/about`)
- [ ] Test 404 page (visit invalid URL)

### Admin Panel Testing
- [ ] Access admin login (`/admin/login`)
- [ ] Login with demo credentials
- [ ] View dashboard (`/admin/dashboard`)
- [ ] Navigate to products page (`/admin/products`)
- [ ] Create new product (`/admin/products/new`)
  - [ ] Upload images (drag & drop)
  - [ ] Fill all required fields
  - [ ] Submit successfully
- [ ] View orders page (`/admin/orders`)
- [ ] Update order status
- [ ] Access settings (`/admin/settings`)
- [ ] Test sidebar navigation
- [ ] Test logout functionality

---

## 🎨 Design & Content

### Branding
- [ ] Replace logo (upload to `/public/logo.png`)
- [ ] Update store name in settings
- [ ] Customize color scheme (if needed)
- [ ] Add store tagline/slogan
- [ ] Update about page content

### Product Setup
- [ ] Add at least 10 products for testing
- [ ] Upload high-quality product images
- [ ] Write accurate product descriptions
- [ ] Set correct condition ratings
- [ ] Verify prices are correct
- [ ] Set appropriate stock levels

### Content Pages
- [ ] Review homepage copy
- [ ] Update about page with your story
- [ ] Add contact information
- [ ] Verify WhatsApp number
- [ ] Update footer links
- [ ] Check social media links

---

## 🔐 Security

### Authentication
- [ ] Change default admin password
- [ ] **CRITICAL**: Implement proper authentication for production
  - Options: NextAuth.js, Clerk, Auth0, Supabase Auth
- [ ] Set up password reset flow
- [ ] Add 2FA (optional but recommended)

### API Security
- [ ] Verify API tokens have minimum required permissions
- [ ] Use separate tokens for dev/production
- [ ] Never commit `.env.local` to Git
- [ ] Add `.env.local` to `.gitignore`
- [ ] Use environment variables on hosting platform

### Data Protection
- [ ] Review data stored in localStorage
- [ ] Implement HTTPS (automatic on Vercel)
- [ ] Add rate limiting for API routes (optional)
- [ ] Set up CORS policies

---

## 📱 Responsive Testing

### Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Check navigation menu (hamburger)
- [ ] Verify cart drawer works
- [ ] Test product filters on mobile
- [ ] Check checkout form on mobile
- [ ] Verify images scale properly

### Tablet Testing
- [ ] Test on iPad/tablet
- [ ] Check product grid layout
- [ ] Verify navigation
- [ ] Test cart functionality

### Desktop Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Verify all breakpoints

---

## 🚀 Performance

### Build & Optimization
- [ ] Run `npm run build` successfully
- [ ] Check for build warnings/errors
- [ ] Run `npm run start` to test production build
- [ ] Verify images are optimized
- [ ] Check page load times
- [ ] Test animations are smooth

### Image Configuration
- [ ] Add Sanity CDN to `next.config.js`:
```js
images: {
  domains: ['cdn.sanity.io'],
}
```
- [ ] Optimize uploaded images (max 2MB recommended)
- [ ] Use WebP format when possible
- [ ] Test image loading on slow connections

---

## 📊 SEO & Analytics

### SEO Setup
- [ ] Verify page titles are descriptive
- [ ] Check meta descriptions
- [ ] Add Open Graph images
- [ ] Create `robots.txt`
- [ ] Create `sitemap.xml`
- [ ] Test with Google Search Console
- [ ] Add structured data (optional)

### Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Add Facebook Pixel
- [ ] Set up conversion tracking
- [ ] Add heatmap tool (Hotjar, etc.)

---

## 💳 Payment & Checkout

### Checkout Flow
- [ ] Test full checkout process
- [ ] Verify COD is working
- [ ] Test form validation
- [ ] Check order confirmation
- [ ] Verify order emails (if implemented)

### Payment Methods (Future)
- [ ] Plan for JazzCash integration
- [ ] Plan for Easypaisa integration
- [ ] Plan for bank transfer option
- [ ] Set up payment gateway

---

## 📧 Communication

### Customer Communication
- [ ] Set up order confirmation emails
- [ ] Create order status update emails
- [ ] Add WhatsApp auto-reply (optional)
- [ ] Create shipping notification template

### Admin Notifications
- [ ] Set up new order alerts
- [ ] Configure low stock notifications
- [ ] Add email alerts for admin

---

## 🌐 Hosting & Deployment

### Vercel Deployment (Recommended)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel
- [ ] Deploy to preview environment
- [ ] Test preview deployment
- [ ] Deploy to production
- [ ] Set up custom domain (optional)

### Domain Setup (If Using Custom Domain)
- [ ] Purchase domain
- [ ] Configure DNS settings
- [ ] Add domain to Vercel
- [ ] Verify SSL certificate
- [ ] Test domain access

---

## 📦 Backup & Maintenance

### Backup Strategy
- [ ] Export Sanity dataset regularly
- [ ] Backup `.env.local` securely
- [ ] Save product images separately
- [ ] Document configuration

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor error logs
- [ ] Check Sanity usage limits
- [ ] Monitor hosting costs

---

## 📄 Legal & Compliance

### Policies
- [ ] Create Privacy Policy
- [ ] Create Terms of Service
- [ ] Create Refund/Return Policy
- [ ] Create Shipping Policy
- [ ] Add cookie consent (if using analytics)

### Business
- [ ] Register business (if required)
- [ ] Set up payment processing
- [ ] Arrange shipping/logistics
- [ ] Plan inventory storage

---

## 🎓 Training & Documentation

### Admin Training
- [ ] Read `ADMIN_GUIDE.md` thoroughly
- [ ] Practice adding products
- [ ] Practice managing orders
- [ ] Test all admin features
- [ ] Document custom workflows

### Team Training (If Applicable)
- [ ] Train staff on admin panel
- [ ] Create internal documentation
- [ ] Set up support procedures
- [ ] Define roles and permissions

---

## 🚨 Pre-Launch Final Checks

### 24 Hours Before Launch
- [ ] Final build test (`npm run build`)
- [ ] Test production deployment
- [ ] Verify all environment variables
- [ ] Check all links work
- [ ] Test checkout end-to-end
- [ ] Verify admin panel access
- [ ] Clear test data
- [ ] Add real products

### Launch Day
- [ ] Deploy to production
- [ ] Verify site is live
- [ ] Test from external network
- [ ] Monitor error logs
- [ ] Test first real order
- [ ] Announce launch on social media
- [ ] Monitor performance

### Post-Launch (First Week)
- [ ] Monitor daily traffic
- [ ] Check for errors
- [ ] Respond to customer inquiries
- [ ] Process orders promptly
- [ ] Gather customer feedback
- [ ] Make quick fixes if needed

---

## 🎯 Success Metrics

Track these KPIs after launch:
- [ ] Daily visitors
- [ ] Conversion rate
- [ ] Average order value
- [ ] Cart abandonment rate
- [ ] Customer return rate
- [ ] Page load times
- [ ] Mobile vs desktop traffic

---

## 📞 Emergency Contacts

Add your essential contacts:
- **Hosting Support**: _________________
- **Domain Registrar**: _________________
- **Payment Gateway**: _________________
- **Developer**: _________________
- **Sanity Support**: support@sanity.io

---

## ✅ Launch Approval

Sign off when ready:

- [ ] **Technical Lead**: _______________  Date: _______
- [ ] **Design Review**: _______________  Date: _______
- [ ] **Content Review**: _______________  Date: _______
- [ ] **Security Review**: _______________  Date: _______
- [ ] **Final Approval**: _______________  Date: _______

---

**🚀 Once all items are checked, you're ready to launch!**

**Good luck with your Flipside store! 🇵🇰**
