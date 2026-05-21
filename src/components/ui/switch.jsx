import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-white/10",
        "data-[state=checked]:bg-[var(--accent-teal)]",
        "data-[state=checked]:shadow-[0_0_0_1px_rgba(20,184,166,0.4),0_4px_12px_rgba(20,184,166,0.25)]",
        "data-[state=unchecked]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-[18px] w-[18px] rounded-full bg-white ring-0 transition-transform",
          "shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
          "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
