import { cn } from '@/lib/utils'

// Score bar with a fixed pass line. Shows a target, not a guarantee.
function ReadinessMeter({
  value,
  passMark,
  label = 'Estimated score',
  className,
}: {
  value: number
  passMark: number
  label?: string
  className?: string
}) {
  const pct = Math.round(value * 100)
  const pass = Math.round(passMark * 100)
  const gap = pass - pct

  return (
    <div data-slot="readiness-meter" className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">Pass mark {pass}%</span>
      </div>
      <p className="font-heading text-4xl font-semibold">{pct}%</p>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}%, pass mark ${pass}%`}
        className="relative h-3 rounded-full bg-primary/15"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
        <div className="absolute -top-1.5 -bottom-1.5 w-0.5 rounded-full bg-foreground" style={{ left: `${pass}%` }} aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">
        {gap > 0 ? `${gap} points below the pass mark.` : `At or above the pass mark by ${-gap} points.`}
      </p>
    </div>
  )
}

export { ReadinessMeter }
