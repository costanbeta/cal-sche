# Custom Branding Setup Guide

## Quick Start

You've successfully implemented a comprehensive custom branding system for your scheduling app! Here's how to set it up and use it.

---

## 🚀 Step 1: Update Your Database

Run the database migration to add branding fields:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_branding_fields
```

This adds the following fields to the `users` table:
- `brand_logo_url` - Custom logo URL
- `brand_color` - Brand color (default: #2563EB)
- `brand_name` - Custom brand name
- `hide_powered_by` - Hide "Powered by" badge (default: false)
- `custom_footer_text` - Custom footer message

---

## 📋 Step 2: Test the Features

### As a Free User
1. Login to your account
2. Visit `/dashboard/branding`
3. You'll see an upgrade prompt
4. Custom branding is locked

### As a Pro User
1. Upgrade to Pro plan at `/pricing`
2. Visit `/dashboard/branding`
3. Set your branding:
   - Enter brand name
   - Pick brand color
   - Add logo URL
   - Add custom footer text
4. See live preview on the right
5. Click "Save Branding Settings"
6. Visit your booking page at `/@username` to see changes

### As a Business User
1. Upgrade to Business plan
2. All Pro features available
3. PLUS: Can hide "Powered by SchedulePro"
4. Full white-label experience

---

## 🎨 Branding Features

### What Users Can Customize

**Pro Plan (₹999/month):**
- ✅ Custom logo on booking page
- ✅ Custom brand color (buttons, links, accents)
- ✅ Custom brand name
- ✅ Custom footer text
- ⚠️ "Powered by SchedulePro" remains visible

**Business Plan (₹2,499/month):**
- ✅ Everything from Pro
- ✅ Hide "Powered by SchedulePro"
- ✅ Full white-label experience

### Where Branding Appears

1. **Booking Page** (`/@username`)
   - Logo at top
   - Brand color on buttons and hover effects
   - Brand name in header
   - Custom footer text
   - Optional powered by badge

2. **Email Confirmations**
   - Logo in email header
   - Brand color for header background
   - Brand color for buttons and links
   - Optional powered by badge

3. **Booking Confirmation Page**
   - Brand color scheme
   - Consistent branding

---

## 💻 For Developers

### Adding Branding to New Pages

```typescript
// Fetch user with branding
const user = await prisma.user.findUnique({
  where: { username },
  select: {
    name: true,
    username: true,
    brandLogoUrl: true,
    brandColor: true,
    brandName: true,
    hidePoweredBy: true,
    customFooterText: true,
    subscriptionTier: true,
  },
})

// Get processed branding settings
import { getBrandingSettings } from '@/lib/branding'
const branding = getBrandingSettings(user)

// Use in JSX
<div style={{ backgroundColor: branding.brandColor }}>
  {branding.brandName || user.name}
</div>
```

### Utility Functions

```typescript
import { 
  canUseBranding, 
  canHidePoweredBy,
  validateBrandColor,
  getBrandColorRGB 
} from '@/lib/branding'

// Check if user can use branding
if (canUseBranding(user.subscriptionTier)) {
  // Show branding settings
}

// Check if user can hide powered by
if (canHidePoweredBy(user.subscriptionTier)) {
  // Allow hiding powered by
}

// Validate color format
if (validateBrandColor('#FF5733')) {
  // Color is valid hex format
}
```

### Components Available

```typescript
import Logo from '@/components/Logo'
import BrandedFooter from '@/components/BrandedFooter'

// Logo with different sizes
<Logo size="sm" />    // Small
<Logo size="md" />    // Medium (default)
<Logo size="lg" />    // Large
<Logo size="xl" />    // Extra large

// Logo without text
<Logo showText={false} />

// Branded footer variants
<BrandedFooter variant="minimal" />  // Simple footer
<BrandedFooter variant="full" />     // Full footer with links

// Custom footer
<BrandedFooter 
  showPoweredBy={false}
  customText="Your custom message"
/>
```

---

## 🎯 API Endpoints

### GET /api/users/branding
Fetch current user's branding settings.

**Response:**
```json
{
  "branding": {
    "brandLogoUrl": "https://example.com/logo.png",
    "brandColor": "#2563EB",
    "brandName": "My Company",
    "hidePoweredBy": false,
    "customFooterText": "Book with confidence"
  },
  "canUseBranding": true
}
```

### PUT /api/users/branding
Update branding settings (requires Pro/Business plan).

**Request:**
```json
{
  "brandLogoUrl": "https://example.com/logo.png",
  "brandColor": "#FF5733",
  "brandName": "My Company",
  "hidePoweredBy": false,
  "customFooterText": "Book with confidence"
}
```

**Validations:**
- Subscription tier check (Pro or Business)
- Color format validation (hex)
- Logo URL validation
- Business plan required for `hidePoweredBy`

---

## 🖼️ Logo Guidelines

### Where to Host Logos
- **Cloudinary** (recommended) - Free tier available
- **ImgBB** - Free image hosting
- **Imgur** - Popular image host
- **Your own CDN** - Best for production

### Logo Specifications
- **Format:** PNG with transparency (preferred) or JPG
- **Size:** 250x80px maximum
- **File size:** Under 500KB
- **Aspect ratio:** Wide/horizontal format works best
- **Background:** Transparent or white

### Example Upload Process
1. Create account on Cloudinary/ImgBB
2. Upload your logo
3. Copy the direct image URL
4. Paste URL in branding settings
5. Logo appears immediately

---

## 🎨 Color Guidelines

### Choosing Brand Colors
- Use your company's primary brand color
- Ensure good contrast with white text
- Test readability on light backgrounds
- Consider accessibility (WCAG AA compliance)

### Color Format
- Must be hex format: `#RRGGBB`
- Examples: `#2563EB`, `#10B981`, `#F59E0B`
- Color picker provided in settings

### Testing Colors
1. Choose color in settings
2. See live preview immediately
3. Check buttons, links, accents
4. Adjust if needed

---

## 📧 Email Branding

Emails automatically include your branding:

- Logo in header
- Brand color for header background
- Brand color for buttons
- Brand color for links
- Custom footer (if set)
- Powered by badge (if not hidden)

**No additional setup required** - Just configure branding once and it applies everywhere!

---

## 🐛 Troubleshooting

### Logo Not Showing
**Problem:** Logo URL not displaying on booking page

**Solutions:**
- Verify URL is publicly accessible (open in browser)
- Check URL format (must be direct image link)
- Ensure no CORS restrictions on hosting
- Try different image hosting service
- Check browser console for errors

### Color Not Applying
**Problem:** Brand color not changing appearance

**Solutions:**
- Ensure hex format: `#RRGGBB` (6 digits)
- Save settings and wait for confirmation
- Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
- Clear browser cache
- Check if changes saved in database

### "Upgrade Required" Message
**Problem:** Can't access branding settings

**Solutions:**
- Check subscription status at `/dashboard/billing`
- Verify payment completed successfully
- Wait 5 minutes for webhook to process
- Contact support if issue persists
- Check subscription_tier in database

### Can't Hide "Powered By"
**Problem:** Checkbox is disabled

**This is correct behavior:**
- Only Business plan can hide powered by
- Pro plan users see disabled checkbox
- Upgrade to Business to enable
- Clear indicator shown in UI

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Database migration completed
- [ ] Can access `/dashboard/branding`
- [ ] Free users see upgrade prompt
- [ ] Pro users can set branding
- [ ] Business users can hide powered by
- [ ] Logo displays on booking page
- [ ] Color applies to buttons/links
- [ ] Custom text shows in footer
- [ ] Email includes branding
- [ ] Preview updates in real-time
- [ ] Changes persist after logout
- [ ] Mobile view looks good

---

## 🎉 You're All Set!

Your custom branding system is ready to use. Users can now:

1. Upgrade to Pro or Business
2. Customize their booking page
3. Add their logo and colors
4. Create a professional brand experience
5. Generate more bookings with trust signals

The branding applies automatically to:
- Booking pages
- Email templates
- Confirmation pages
- All user-facing interfaces

**No code changes needed for future users!**

---

## 📚 Additional Resources

- **Full Documentation:** `BRANDING_IMPLEMENTATION.md`
- **Pricing Info:** `PRICING_IMPLEMENTATION.md`
- **API Reference:** Check individual API route files
- **Component Docs:** See component files for props

---

**Questions or Issues?**

Check the troubleshooting section or refer to the full implementation documentation.

**Happy Branding! 🎨**
