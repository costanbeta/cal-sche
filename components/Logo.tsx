import { Command } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
}

const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6', xl: 'h-7 w-7' }
const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Command className={cn(iconSizes[size], 'text-foreground')} />
      {showText && (
        <span
          className={cn(
            'font-semibold text-foreground',
            textSizes[size],
            textClassName
          )}
        >
          Croodle
        </span>
      )}
    </div>
  )
}
