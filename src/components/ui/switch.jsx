import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-all duration-200",
        "focus-visible:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-transparent data-[state=unchecked]:border data-[state=unchecked]:border-[var(--border-translucent)]",
        "data-[state=checked]:bg-white",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "relative pointer-events-none block h-[16px] w-[16px] rounded-full ring-0",
          "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[3px]",
          "data-[state=checked]:bg-[var(--bg-primary)] data-[state=unchecked]:bg-white"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
