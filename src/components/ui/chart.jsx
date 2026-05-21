import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "../../lib/utils"

// Context passes chartConfig to tooltip/legend content components
const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within <ChartContainer />")
  return context
}

// Injects CSS variables like --color-desktop, --color-mobile per chart config entry
function ChartStyle({ id, config }) {
  const entries = Object.entries(config).filter(([, c]) => c.color || c.theme)
  if (!entries.length) return null

  const lightVars = entries
    .map(([key, c]) => (c.color ? `  --color-${key}: ${c.color};` : `  --color-${key}: ${c.theme?.light ?? ""};`))
    .join("\n")

  const darkVars = entries
    .map(([key, c]) => (c.theme?.dark ? `  --color-${key}: ${c.theme.dark};` : null))
    .filter(Boolean)
    .join("\n")

  return (
    <style>{`
[data-chart="${id}"] {\n${lightVars}\n}
${darkVars ? `.dark [data-chart="${id}"] {\n${darkVars}\n}` : ""}
    `}</style>
  )
}

function ChartContainer({ id, className, children, config, ...props }) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        id={chartId}
        className={cn(
          "flex justify-center text-xs",
          // Axis tick labels: slightly muted but legible
          "[&_.recharts-cartesian-axis-tick_text]:fill-[var(--text-muted)]",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/20",
          "[&_.recharts-reference-line_[stroke='#666']]:stroke-border",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Direct re-export so callers can still use <ChartTooltip cursor={false} ... />
const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = labelKey || item?.dataKey || item?.name || "value"
    const itemConfig = getItemConfig(config, item, String(key))
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div
          className={cn("pb-1.5 mb-0.5 font-medium text-[10.5px]", labelClassName)}
          style={{
            color: 'var(--text-muted)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {labelFormatter(value, payload)}
        </div>
      )
    }
    if (!value) return null
    return (
      <div
        className={cn("pb-1.5 mb-0.5 font-medium text-[10.5px]", labelClassName)}
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {value}
      </div>
    )
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-[9rem] items-start gap-1.5 rounded-xl px-3 py-2.5 text-xs",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        className
      )}
      style={{
        background: 'rgba(13, 18, 28, 0.97)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(nameKey || item.name || item.dataKey || "value")
          const itemConfig = getItemConfig(config, item, key)
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey}
              className="flex w-full items-center gap-2"
            >
              {formatter && item?.value !== undefined && item.name ? (() => {
                const result = formatter(item.value, item.name, item, index, item.payload)

                // When formatter returns [formattedValue, label] — render as proper value/label row
                if (Array.isArray(result)) {
                  const [formattedValue, formattedLabel] = result
                  return (
                    <>
                      {!hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px]",
                            indicator === "dot" && "size-2",
                            indicator === "line" && "w-0.5 self-stretch rounded-full",
                            indicator === "dashed" && "w-0 border border-dashed bg-transparent",
                          )}
                          style={{
                            backgroundColor: indicator !== "dashed" ? indicatorColor : undefined,
                            borderColor: indicator === "dashed" ? indicatorColor : undefined,
                          }}
                        />
                      )}
                      <div className="flex flex-1 items-center justify-between gap-4 leading-none min-w-0">
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                          {formattedLabel}
                        </span>
                        <span
                          className="font-mono font-semibold tabular-nums"
                          style={{ color: 'var(--text-primary)', fontSize: 12 }}
                        >
                          {formattedValue}
                        </span>
                      </div>
                    </>
                  )
                }

                // formatter returns JSX directly — render as-is
                return result
              })() : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px]",
                          indicator === "dot" && "size-2 translate-y-[1px]",
                          indicator === "line" && "w-0.5 self-stretch rounded-full",
                          indicator === "dashed" &&
                            "w-0 border-[1.5px] border-dashed bg-transparent",
                          nestLabel && indicator === "dashed" && "my-0.5"
                        )}
                        style={{
                          backgroundColor:
                            indicator !== "dashed" ? indicatorColor : undefined,
                          borderColor:
                            indicator === "dashed" ? indicatorColor : undefined,
                        }}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && (
                      <span
                        className="font-mono font-semibold tabular-nums"
                        style={{ color: 'var(--text-primary)', fontSize: 12 }}
                      >
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = String(nameKey || item.dataKey || "value")
        const itemConfig = getItemConfig(config, item, key)

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {itemConfig?.label || item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function getItemConfig(config, payload, key) {
  if (!payload || typeof payload !== "object") return undefined
  const payloadData =
    "payload" in payload && payload.payload && typeof payload.payload === "object"
      ? payload.payload
      : undefined

  let configKey = key
  if (!(key in config) && payloadData && key in payloadData) {
    const val = payloadData[key]
    if (typeof val === "string" && val in config) configKey = val
  }

  return configKey in config ? config[configKey] : undefined
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}
