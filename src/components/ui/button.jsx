import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

// xAI buttons: pill-shaped, outline-on-dark canonical, white-filled rare primary
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-normal whitespace-nowrap transition-all duration-150 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:opacity-90 active:duration-75 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        // Default = xAI outline-on-dark pill (the canonical interactive shape)
        default:
          "bg-transparent text-white border border-[var(--border-translucent)] hover:bg-white/[0.04] hover:border-white/[0.32]",
        // Primary = rare white-filled pill (Sign Up / Run-style CTA)
        primary:
          "bg-white text-[var(--bg-primary)] border border-white hover:bg-white/95",
        destructive:
          "bg-transparent text-white border border-[var(--red-border)] hover:bg-[var(--red-bg)]",
        outline:
          "bg-transparent text-white border border-[var(--border-translucent)] hover:bg-white/[0.04] hover:border-white/[0.32]",
        secondary:
          "bg-[var(--bg-card)] text-white border border-[var(--border)] hover:bg-[var(--bg-card-hover)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-white",
        link: "text-white underline-offset-4 hover:underline rounded-none",
        gold:
          "bg-transparent text-[var(--accent-sunset-soft,var(--accent-gold))] border border-[var(--amber-border)] hover:bg-[var(--amber-bg)]",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-5",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
