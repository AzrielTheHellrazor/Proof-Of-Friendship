import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 dark:from-gray-100 dark:to-gray-300 dark:text-gray-900 dark:hover:from-gray-200 dark:hover:to-gray-400",
        destructive: "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg hover:shadow-xl",
        outline: "border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500",
        ghost: "text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-900/20 dark:hover:text-purple-300",
        link: "text-purple-600 underline-offset-4 hover:underline dark:text-purple-400",
        gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 shadow-lg hover:shadow-xl",
        glass: "glass border-white/20 text-gray-700 hover:bg-white/20 dark:text-gray-300 dark:hover:bg-gray-800/20",
        modern: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl animate-glow",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg hover:shadow-xl",
        rainbow: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 shadow-lg hover:shadow-xl animate-pulse-slow",
        cyan: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg hover:shadow-xl",
        vibrant: "bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-red-400 shadow-lg hover:shadow-xl neon-glow",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg font-semibold",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = e.currentTarget
        const circle = document.createElement("span")
        const diameter = Math.max(button.clientWidth, button.clientHeight)
        const radius = diameter / 2

        circle.style.width = circle.style.height = `${diameter}px`
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`
        circle.classList.add("ripple")

        const ripple = button.getElementsByClassName("ripple")[0]

        if (ripple) {
          ripple.remove()
        }

        button.appendChild(circle)
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <span className="relative z-10">
          {props.children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 