import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { STATE_LABELS, type TopicState } from '@/progress/mastery'

const RADIUS = 15
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Progress ring for a topic or subject. The state is always written out, never shown by colour alone.
function MasteryRing({
  state,
  progress,
  showLabel = true,
  className,
}: {
  state: TopicState
  progress: number
  // Hide the label only where the state is already written next to the ring.
  showLabel?: boolean
  className?: string
}) {
  const mastered = state === 'mastered'
  return (
    <span data-slot="mastery-ring" data-state={state} className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative inline-flex size-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="18" cy="18" r={RADIUS} fill="none" strokeWidth="4" className="stroke-muted" />
          {progress > 0 && (
            <circle
              cx="18"
              cy="18"
              r={RADIUS}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(progress, 1))}
              className={mastered ? 'stroke-success' : 'stroke-primary'}
            />
          )}
        </svg>
        {mastered && <Check className="size-4 text-success" aria-hidden />}
      </span>
      {showLabel && <span className="text-sm text-muted-foreground">{STATE_LABELS[state]}</span>}
    </span>
  )
}

export { MasteryRing }
