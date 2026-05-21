import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full h-1 w-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full"
          style={{
            background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-teal-soft))',
            boxShadow: '0 0 8px rgba(20, 184, 166, 0.4)',
          }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-4 shrink-0 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-115 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: '#ffffff',
            border: '2px solid var(--accent-teal)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), 0 0 0 4px rgba(20, 184, 166, 0.15)',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
