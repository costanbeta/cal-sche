import Link from 'next/link'
import Logo from './Logo'
import { cn } from '@/lib/utils'

interface BrandedFooterProps {
  variant?: 'full' | 'minimal'
  showPoweredBy?: boolean
  customText?: string
  className?: string
}

export default function BrandedFooter({
  variant = 'minimal',
  showPoweredBy = true,
  customText,
  className = '',
}: BrandedFooterProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('text-center text-muted-foreground text-sm py-4', className)}>
        {customText && <p className="mb-2">{customText}</p>}
        {showPoweredBy && (
          <div className="flex items-center justify-center gap-2">
            <span>Powered by</span>
            <Logo size="sm" showText />
          </div>
        )}
      </div>
    )
  }

  return (
    <footer className={cn('border-t border-border bg-background', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="lg" showText className="mb-4" />
            <p className="text-muted-foreground text-sm">
              Making scheduling effortless for professionals worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-xs">
          <p>&copy; {new Date().getFullYear()} Croodle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
