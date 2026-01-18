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
      {/* Logo Icon - Calendar with Clock */}
      <svg 
        className={`${sizes[size]} text-blue-600`}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Calendar body */}
        <rect 
          x="3" 
          y="6" 
          width="18" 
          height="15" 
          rx="2" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="currentColor"
          fillOpacity="0.1"
        />
        {/* Calendar top bar */}
        <path 
          d="M3 10H21" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        {/* Calendar hangers */}
        <path 
          d="M7 3V7" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M17 3V7" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        {/* Clock/Lightning bolt for "instant" scheduling */}
        <path 
          d="M13 14L11 16L13 18" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]} ${textClassName}`}>
          SchedulePro
        </span>
      )}
    </div>
  )
}
