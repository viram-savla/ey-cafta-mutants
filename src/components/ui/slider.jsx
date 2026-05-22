import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  formatBubble,
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

  const [dragging, setDragging] = React.useState(false)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}
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
          className="absolute h-full rounded-full"
          style={{
            background: '#ffffff',
          }}
        />
      </SliderPrimitive.Track>
      {_values.map((v, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-4 shrink-0 rounded-full transition-transform cursor-pointer hover:scale-110 active:scale-115 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: '#ffffff',
            border: '1px solid #ffffff',
            boxShadow: dragging
              ? '0 0 0 6px rgba(255, 255, 255, 0.12)'
              : '0 0 0 0 rgba(255, 255, 255, 0)',
            transition: 'box-shadow 180ms ease, transform 180ms ease',
          }}
        >
          {formatBubble && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-9 px-2 py-1 rounded-md text-[11px] font-mono tabular-nums font-semibold pointer-events-none whitespace-nowrap"
              style={{
                background: 'var(--bg-popover)',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-md)',
                opacity: dragging ? 1 : 0,
                transform: `translate(-50%, ${dragging ? '0' : '4px'})`,
                transition: 'opacity 180ms ease, transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {formatBubble(v)}
              {/* arrow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
                style={{
                  background: 'var(--bg-popover)',
                  borderRight: '1px solid var(--border-accent)',
                  borderBottom: '1px solid var(--border-accent)',
                }}
              />
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
