import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 2s infinite',
      }}
      {...props}
    />
  )
}

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl border border-gray-100 p-6 shadow-sm', className)}>
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
)

// Event card skeleton
export const EventCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
)

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-gray-100">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
)

// Profile skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="space-y-1">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
)

// Button skeleton
export const ButtonSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-9 w-20',
    md: 'h-11 w-24',
    lg: 'h-13 w-32',
  }
  
  return <Skeleton className={cn('rounded-xl', sizeClasses[size])} />
}

// Header skeleton
export const HeaderSkeleton: React.FC = () => (
  <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  </div>
)

// Loading grid
export const LoadingGrid: React.FC<{ 
  count?: number
  CardComponent?: React.ComponentType
}> = ({ 
  count = 6, 
  CardComponent = EventCardSkeleton 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
) 