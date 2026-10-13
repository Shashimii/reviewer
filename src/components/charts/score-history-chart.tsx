import { useState } from 'react'

import { useElementWidth } from '@/lib/use-element-width'

export interface ScorePoint {
  label: string
  detail: string
  value: number
}

const HEIGHT = 200
const PAD = { top: 16, right: 20, bottom: 28, left: 40 }
const TICKS = [0, 0.25, 0.5, 0.75, 1]

// Mock exam scores over time, one series, with the pass line. Hover or focus shows each score;
// the mock history list on the page is the table view.
export function ScoreHistoryChart({ points, passMark }: { points: ScorePoint[]; passMark: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const innerW = Math.max(width - PAD.left - PAD.right, 0)
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + (1 - v) * innerH
  const pct = (v: number) => `${Math.round(v * 100)}%`
  const last = points.length - 1
  const showAllLabels = points.length <= 6

  function nearest(clientX: number, rect: DOMRect) {
    const px = clientX - rect.left
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    })
    return best
  }

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Mock exam scores: ${points.map((p) => `${p.label} ${pct(p.value)}`).join(', ')}`}
          onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => setActive(null)}
          className="touch-pan-y"
        >
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-xs tabular-nums">
                {pct(t)}
              </text>
            </g>
          ))}
          <line x1={PAD.left} x2={width - PAD.right} y1={y(passMark)} y2={y(passMark)} className="stroke-foreground/70" strokeWidth={1} />
          <text x={width - PAD.right} y={y(passMark) - 6} textAnchor="end" className="fill-foreground text-xs">
            Pass {pct(passMark)}
          </text>

          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-muted-foreground/50" strokeWidth={1} />
          )}

          <path
            d={points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ')}
            fill="none"
            className="stroke-primary"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g
              key={i}
              tabIndex={0}
              role="img"
              aria-label={`${p.label}: ${pct(p.value)}`}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="outline-none"
            >
              <circle cx={x(i)} cy={y(p.value)} r={12} fill="transparent" />
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r={active === i ? 6 : 4.5}
                className="fill-primary stroke-background"
                strokeWidth={2}
              />
              {(showAllLabels || i === 0 || i === last) && (
                <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-xs">
                  {p.label}
                </text>
              )}
            </g>
          ))}

          {active === null && points.length > 0 && (
            <text x={x(last)} y={y(points[last].value) - 12} textAnchor="middle" className="fill-foreground text-xs font-semibold tabular-nums">
              {pct(points[last].value)}
            </text>
          )}
        </svg>
      )}

      {active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col rounded-md border bg-popover px-2.5 py-1.5 text-popover-foreground shadow-sm"
          style={{ left: x(active), top: y(points[active].value) - 12 }}
        >
          <span className="text-sm font-semibold tabular-nums">{pct(points[active].value)}</span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">{points[active].detail}</span>
        </div>
      )}
    </div>
  )
}
