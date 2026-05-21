import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-white/10",
        "data-[state=checked]:bg-[var(--accent-teal)]",
        "data-[state=checked]:shadow-[0_0_0_1px_rgba(20,184,166,0.45),0_4px_14px_rgba(20,184,166,0.35)]",
        "data-[state=unchecked]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {/* Glow halo (visible when checked) */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 group-data-[state=checked]:opacity-100"
        style={{
          background: 'radial-gradient(60% 100% at 75% 50%, rgba(20,184,166,0.35), transparent 70%)',
        }}
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "relative pointer-events-none block h-[18px] w-[18px] rounded-full bg-white ring-0",
          "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
          "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-[2px]",
          "data-[state=checked]:shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_8px_rgba(255,255,255,0.5)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
