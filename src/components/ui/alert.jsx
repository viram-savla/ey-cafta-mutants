import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3 [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-card-foreground",
        destructive:
          "bg-[var(--red-bg)] border-[var(--red-border)] text-[var(--red)] [&>svg]:text-[var(--red)]",
        success:
          "bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)] [&>svg]:text-[var(--green)]",
        warning:
          "bg-[var(--amber-bg)] border-[var(--amber-border)] text-[var(--amber)] [&>svg]:text-[var(--amber)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({ className, variant, ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("mb-0.5 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-xs opacity-90", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
