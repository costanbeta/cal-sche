# Custom Branding Feature - Complete Implementation

## Overview

A comprehensive custom branding system has been implemented for SchedulePro, allowing Pro and Business subscribers to customize their booking pages with their own branding.

---

## ✅ What's Implemented

### 1. Database Schema Updates
- Added branding fields to User model:
  - `brandLogoUrl` - URL to custom logo image
  - `brandColor` - Hex color code for brand color
  - `brandName` - Custom brand name
  - `hidePoweredBy` - Option to hide "Powered by SchedulePro" (Business only)
  - `customFooterText` - Custom footer message

### 2. UI Components
- **Logo Component** (`components/Logo.tsx`)
  - Reusable logo component with gradient text
  - Used across the application
  - Supports different sizes (sm, md, lg, xl)

- **BrandedFooter Component** (`components/BrandedFooter.tsx`)
  - Full footer with links and social media
  - Minimal footer for booking pages
  - Supports custom text and hiding powered by

### 3. Branding Settings Page
- Location: `/dashboard/branding`
- Features:
  - Brand name input
  - Color picker with hex input
  - Logo URL input
  - Custom footer text
  - Hide "Powered by" checkbox (Business only)
  - Live preview panel
  - Plan gate for free users

### 4. API Endpoints
- **GET /api/users/branding** - Fetch user's branding settings
- **PUT /api/users/branding** - Update branding settings
  - Validates subscription tier
  - Validates color format
  - Validates logo URL
  - Enforces Business plan requirement for hiding powered by

### 5. User Booking Pages
- **Updated `app/[username]/page.tsx`**
  - Displays custom logo if set
  - Uses custom brand color for accents and buttons
  - Shows custom brand name
  - Respects hidePoweredBy setting
  - Shows custom footer text

### 6. Email Templates
- **Updated `lib/email.ts`**
  - Added branding support to BookingConfirmationData interface
  - Email header uses brand color
  - Logo displayed in email header
  - Links and buttons use brand color
  - Respects hidePoweredBy setting

### 7. Landing Page Enhancements
- **Updated `app/page.tsx`**
  - New logo in header
  - Enhanced hero section with gradient text
  - Trust indicators
  - Improved feature cards with icons
  - Added testimonials section
  - Enhanced CTA sections
  - Full footer with links

### 8. Global Styling
- **Updated `app/globals.css`**
  - Added CSS variables for brand colors
  - Created utility classes:
    - `.brand-gradient` - Gradient background
    - `.brand-shadow` - Branded shadow effect
    - `.btn-brand-primary` - Primary button style
    - `.btn-brand-secondary` - Secondary button style
    - `.card-brand` - Card style with hover effects

### 9. Utilities
- **Created `lib/branding.ts`**
  - `canUseBranding()` - Check if user has access to branding
  - `canHidePoweredBy()` - Check if user can hide powered by
  - `getBrandingSettings()` - Get branding settings with defaults
  - `validateBrandColor()` - Validate hex color format
  - `getBrandColorRGB()` - Convert hex to RGB
  - `applyBrandColors()` - Generate CSS for brand colors

### 10. Type Definitions
- **Updated `types/index.ts`**
  - Added `BrandingSettings` interface
  - Added branding to User interface

---

## 🎨 Branding Features by Plan

### Free Plan
- ❌ No custom branding
- Shows "Powered by SchedulePro"
- Default blue color scheme

### Pro Plan (₹999/month)
- ✅ Custom logo
- ✅ Custom brand color
- ✅ Custom brand name
- ✅ Custom footer text
- ⚠️ Shows "Powered by SchedulePro" (cannot hide)

### Business Plan (₹2,499/month)
- ✅ Everything from Pro
- ✅ Hide "Powered by SchedulePro"
- ✅ Full white-label experience

---

## 📋 Usage Instructions

### For Users

1. **Upgrade to Pro or Business**
   - Visit `/pricing` to select a plan
   - Complete payment via Razorpay

2. **Access Branding Settings**
   - Go to dashboard
   - Click "Custom Branding" card
   - Or navigate to `/dashboard/branding`

3. **Customize Your Brand**
   - **Brand Name**: Enter your company/personal name
   - **Brand Color**: Use color picker or enter hex code (#RRGGBB)
   - **Logo URL**: Upload logo to image hosting service, paste URL
   - **Footer Text**: Add custom message (200 chars max)
   - **Hide Powered By**: Check to remove branding (Business only)

4. **Preview Changes**
   - See live preview on the right
   - Changes apply immediately to booking page

5. **Share Your Branded Page**
   - Your booking link: `yourapp.com/@username`
   - Visitors see your custom branding

### For Developers

**To apply custom branding in a new component:**

```typescript
import { getBrandingSettings } from '@/lib/branding'

// Get user with branding fields
const user = await prisma.user.findUnique({
  where: { username },
  select: {
    brandLogoUrl: true,
    brandColor: true,
    brandName: true,
    hidePoweredBy: true,
    customFooterText: true,
    subscriptionTier: true,
  },
})

// Get processed branding settings
const branding = getBrandingSettings(user)

// Use in component
<div style={{ color: branding.brandColor }}>
  {branding.brandName}
</div>
```

**To add branding to emails:**

```typescript
await sendBookingConfirmation({
  // ... other data
  brandColor: user.brandColor || undefined,
  brandLogoUrl: user.brandLogoUrl || undefined,
  hidePoweredBy: user.hidePoweredBy || undefined,
})
```

---

## 🔧 Database Migration

Run this to add branding fields to your database:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_branding_fields
```

The schema changes are already in `prisma/schema.prisma`:
- `brandLogoUrl`
- `brandColor` (default: #2563EB)
- `brandName`
- `hidePoweredBy` (default: false)
- `customFooterText`

---

## 🎯 Testing

### Test as Free User
1. Sign up or login as free user
2. Visit `/dashboard/branding`
3. Should see upgrade prompt
4. Cannot save branding settings

### Test as Pro User
1. Upgrade account to Pro
2. Visit `/dashboard/branding`
3. Can set logo, color, name, footer
4. Cannot hide "Powered by"
5. Visit `/@username` to see changes
6. Check confirmation email for branding

### Test as Business User
1. Upgrade account to Business
2. All Pro features work
3. Can hide "Powered by"
4. Full white-label experience

---

## 🚀 Features

### Visual Customization
- ✅ Custom logo on booking page
- ✅ Custom logo in emails
- ✅ Brand color for buttons, links, accents
- ✅ Custom brand name display
- ✅ Custom footer message

### Access Control
- ✅ Plan-based feature gating
- ✅ Validation of branding fields
- ✅ Business-only features protected

### User Experience
- ✅ Live preview in settings
- ✅ Immediate application of changes
- ✅ Clear upgrade prompts
- ✅ Helpful tooltips and guidance

### Technical
- ✅ Type-safe branding utilities
- ✅ Validation on API endpoints
- ✅ Default values for missing branding
- ✅ Responsive design
- ✅ Email template support

---

## 📁 Files Modified/Created

### New Files
```
components/Logo.tsx
components/BrandedFooter.tsx
lib/branding.ts
app/dashboard/branding/page.tsx
app/api/users/branding/route.ts
BRANDING_IMPLEMENTATION.md (this file)
```

### Modified Files
```
prisma/schema.prisma
types/index.ts
app/globals.css
app/page.tsx
app/layout.tsx
app/dashboard/page.tsx
app/[username]/page.tsx
app/api/users/[username]/route.ts
lib/email.ts
```

---

## 💡 Best Practices

### For Logo URLs
- Use CDN or image hosting service (Cloudinary, ImgBB, etc.)
- Recommended size: 250x80px max
- Format: PNG with transparency preferred
- Ensure URL is accessible publicly

### For Brand Colors
- Use hex format: #RRGGBB
- Ensure good contrast with white text
- Test on both light and dark backgrounds
- Consider accessibility (WCAG compliance)

### For Brand Names
- Keep it concise (under 50 characters)
- Use your company or personal brand name
- Will be displayed prominently on booking page

### For Footer Text
- Keep it brief (under 200 characters)
- Include important info or tagline
- Will be displayed at bottom of booking page

---

## 🐛 Troubleshooting

### Logo Not Displaying
- Check if URL is publicly accessible
- Verify URL format is correct
- Check browser console for errors
- Try a different image hosting service

### Color Not Applying
- Ensure hex format: #RRGGBB
- Clear browser cache
- Check if changes saved successfully
- Try different color to test

### "Upgrade Required" Message
- Check subscription status in billing
- Verify payment was successful
- Contact support if issue persists

### Changes Not Showing
- Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
- Check if changes were saved (look for success message)
- Try logging out and back in
- Clear browser cache

---

## 🎉 Summary

The custom branding feature is fully implemented and ready for use! It provides:

- Professional branding for Pro/Business users
- Easy-to-use settings interface
- Live preview of changes
- Email template support
- Plan-based access control
- Full white-label option for Business users

Users can now create a fully branded scheduling experience that matches their company identity.

---

**Implementation Date:** January 2026
**Status:** ✅ Complete and Production-Ready
