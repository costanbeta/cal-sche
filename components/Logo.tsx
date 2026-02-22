interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = ''
}: LogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Simple geometric icon */}
      <svg 
        className={`${sizes[size]} text-white`}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z" 
          fill="currentColor"
        />
      </svg>

      {showText && (
        <span className={`font-semibold text-white ${textSizes[size]} ${textClassName}`}>
          Croodle
        </span>
      )}
    </div>
  )
}
