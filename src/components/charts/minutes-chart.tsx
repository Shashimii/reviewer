import { useState } from 'react'

import { useElementWidth } from '@/lib/use-element-width'

export interface DayMinutes {
  key: string
  label: string
  minutes: number
}

const HEIGHT = 160
const PAD = { top: 20, right: 8, bottom: 26, left: 36 }
const MAX_BAR = 24

// A column with a 4px rounded top and a square base.
function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, h, w / 2)
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}

// Minutes studied per day, one series, with the daily goal line. Hover or focus shows each day.
export function MinutesChart({ days, goal }: { days: DayMinutes[]; goal?: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const max = Math.max(goal ?? 0, ...days.map((d) => d.minutes), 10)
  const top = Math.ceil(max / 10) * 10
  const innerW = Math.max(width - PAD.left - PAD.right, 0)
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const band = innerW / days.length
  const barW = Math.min(MAX_BAR, band * 0.6)
  const y = (m: number) => PAD.top + (1 - m / top) * innerH
  const bandX = (i: number) => PAD.left + i * band
  const last = days.length - 1

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg width={width} height={HEIGHT} aria-hidden>
          {[0, top / 2, top].map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-xs tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {goal !== undefined && goal > 0 && (
            <g>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(goal)} y2={y(goal)} className="stroke-foreground/70" strokeWidth={1} />
              <text x={width - PAD.right} y={y(goal) - 6} textAnchor="end" className="fill-foreground text-xs">
                Goal {goal} min
              </text>
            </g>
          )}
          {days.map((d, i) => {
            const h = PAD.top + innerH - y(d.minutes)
            const bx = bandX(i) + (band - barW) / 2
            return (
              <g key={d.key}>
                {h > 0 && (
                  <path d={columnPath(bx, y(d.minutes), barW, h)} className={active === i ? 'fill-primary/80' : 'fill-primary'} />
                )}
                <text x={bandX(i) + band / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-xs">
                  {d.label}
                </text>
                {i === last && d.minutes > 0 && active === null && (
                  <text x={bandX(i) + band / 2} y={y(d.minutes) - 6} textAnchor="middle" className="fill-foreground text-xs font-semibold tabular-nums">
                    {d.minutes}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}

      {/* Hit areas: the whole day band, bigger than the bar, for hover and keyboard focus. */}
      {width > 0 &&
        days.map((d, i) => (
          <button
            key={d.key}
            type="button"
            aria-label={`${d.label}: ${d.minutes} minutes`}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="absolute rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ left: bandX(i), top: PAD.top, width: band, height: innerH }}
          />
        ))}

      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col rounded-md border bg-popover px-2.5 py-1.5 text-popover-foreground shadow-sm"
          style={{ left: bandX(active) + band / 2, top: y(days[active].minutes) - 8 }}
        >
          <span className="text-sm font-semibold tabular-nums">{days[active].minutes} min</span>
          <span className="text-xs text-muted-foreground">{days[active].label}</span>
        </div>
      )}

      <table className="sr-only">
        <caption>Minutes studied per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{d.minutes} minutes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
