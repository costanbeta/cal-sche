import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullPage?: boolean
}

export default function LoadingSpinner({
  className,
  size = 'md',
  label = 'Loading...',
  fullPage = false,
}: LoadingSpinnerProps) {
  const iconSize = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-screen' : 'flex-1',
        className
      )}
    >
      <Loader2 className={cn(iconSize, 'animate-spin text-muted-foreground')} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  )
}
