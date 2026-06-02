import { cn } from "../../lib/utils"

const Skeleton = ({
    className,
    variant = "default",
    ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        {
          // Default: rounded rectangle
          "rounded-md": variant === "default",
          
          // Text line style
          "h-4 rounded": variant === "text",
          
          // Circle style
          "rounded-full": variant === "circle",
          
          // Rectangle (no border radius)
          "rounded-none": variant === "rect",
        },
        className
      )}
      {...props}
    />
  )
}

Skeleton.displayName = "Skeleton"

export { Skeleton }