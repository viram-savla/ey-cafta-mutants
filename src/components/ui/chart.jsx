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
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
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
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }
    if (!value) return null
    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg px-3 py-2 text-xs",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        className
      )}
      style={{
        background: 'rgba(21, 27, 38, 0.92)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.04)',
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
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px]",
                          indicator === "dot" && "size-2.5 translate-y-[2px]",
                          indicator === "line" && "w-1 self-stretch",
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
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
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
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-muted-foreground text-xs">
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
