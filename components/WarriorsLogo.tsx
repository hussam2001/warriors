'use client'

import Image from 'next/image'

interface WarriorsLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function WarriorsLogo({ size = 'md', showText = true, className = '' }: WarriorsLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/logo/warriors logo.png"
          alt="Warriors Gym Logo"
          width={128}
          height={128}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-yellow-600 ${textSizeClasses[size]} leading-tight`} style={{fontFamily: 'Oswald, system-ui, sans-serif'}}>
            WARRIORS
          </h1>
          <p className={`font-medium text-yellow-500 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} -mt-1`} style={{fontFamily: 'Oswald, system-ui, sans-serif'}}>
            FITNESS & MMA
          </p>
        </div>
      )}
    </div>
  )
}
