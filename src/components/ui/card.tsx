import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-3xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md",
        glass: "glass border-white/20 dark:border-gray-600/20 backdrop-blur-sm",
        gradient: "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700",
        modern: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1",
        elevated: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl",
        interactive: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:-translate-y-1",
        vibrant: "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-purple-300 dark:border-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-1",
        rainbow: "bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 border-purple-300 dark:border-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-1",
        neon: "bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-1 neon-glow",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean
  glow?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, size }),
        hover && "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        glow && "animate-glow",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight text-gray-900 dark:text-gray-100 text-shadow",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-300 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced Stats Card Component
interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'vibrant' | 'rainbow' | 'neon'
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  description,
  trend,
  className,
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'vibrant':
        return 'neon-glow'
      case 'rainbow':
        return 'neon-glow-pink'
      case 'neon':
        return 'neon-glow-blue'
      default:
        return ''
    }
  }

  return (
    <Card variant="modern" hover className={cn("text-center", getVariantClasses(), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center animate-pulse-slow">
            {icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="text-3xl font-bold gradient-text-animate">
            {value}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
          
          {trend && (
            <div className="flex items-center justify-center space-x-1 text-sm">
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {trend.isPositive ? "↗" : "↘"}
              </span>
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                +{trend.value}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatsCard } 