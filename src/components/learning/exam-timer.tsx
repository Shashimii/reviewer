import { Clock, TriangleAlert } from 'lucide-react'

import { formatClock } from '@/lib/format'
import { cn } from '@/lib/utils'

// Countdown with a calm state and a behind-pace state. Behind pace shows an icon and words,
// never colour alone.
function ExamTimer({ secondsLeft, behindPace }: { secondsLeft: number; behindPace: boolean }) {
  return (
    <div
      data-slot="exam-timer"
      data-state={behindPace ? 'behind' : 'calm'}
      role="timer"
      aria-label={`Time left: ${formatClock(secondsLeft)}${behindPace ? ', behind pace' : ''}`}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-base font-semibold tabular-nums',
        behindPace ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'bg-card',
      )}
    >
      {behindPace ? <TriangleAlert className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
      <span aria-hidden>{formatClock(secondsLeft)}</span>
      {behindPace && (
        <span className="text-sm font-medium" aria-hidden>
          Behind pace
        </span>
      )}
    </div>
  )
}

export { ExamTimer }
