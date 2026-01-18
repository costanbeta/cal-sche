import { BrandingSettings } from '@/types'

export const DEFAULT_BRANDING: BrandingSettings = {
  brandColor: '#2563EB',
  hidePoweredBy: false,
}

export function canUseBranding(subscriptionTier?: string): boolean {
  return subscriptionTier === 'pro' || subscriptionTier === 'business'
}

export function canHidePoweredBy(subscriptionTier?: string): boolean {
  return subscriptionTier === 'business'
}

export function getBrandingSettings(user: {
  subscriptionTier?: string
  brandLogoUrl?: string | null
  brandColor?: string | null
  brandName?: string | null
  hidePoweredBy?: boolean | null
  customFooterText?: string | null
}): BrandingSettings {
  const canBrand = canUseBranding(user.subscriptionTier)
  const canHide = canHidePoweredBy(user.subscriptionTier)

  if (!canBrand) {
    return DEFAULT_BRANDING
  }

  return {
    brandLogoUrl: user.brandLogoUrl || undefined,
    brandColor: user.brandColor || DEFAULT_BRANDING.brandColor,
    brandName: user.brandName || undefined,
    hidePoweredBy: canHide ? (user.hidePoweredBy || false) : false,
    customFooterText: user.customFooterText || undefined,
  }
}

export function validateBrandColor(color: string): boolean {
  // Validate hex color format
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

export function getBrandColorRGB(hexColor: string): string {
  // Convert hex to RGB for use in CSS
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

export function applyBrandColors(brandColor?: string): string {
  if (!brandColor) return ''
  
  return `
    --brand-primary: ${brandColor};
    --brand-primary-rgb: ${getBrandColorRGB(brandColor)};
  `
}
