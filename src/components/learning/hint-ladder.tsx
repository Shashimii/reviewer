import { Lightbulb, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// The three rungs reveal the method gradually.
const RUNG_NAMES = ['Nudge', 'First step', 'Full method']

function HintLadder({
  hints,
  revealed,
  onReveal,
  className,
}: {
  hints: readonly string[]
  revealed: number
  onReveal: () => void
  className?: string
}) {
  const label = (i: number) => `Hint ${i + 1}: ${RUNG_NAMES[i] ?? ''}`

  return (
    <section data-slot="hint-ladder" aria-label="Hints" className={cn('flex flex-col gap-2', className)}>
      <ol className="flex flex-col gap-2" aria-live="polite">
        {hints.slice(0, revealed).map((hint, i) => (
          <li key={i} className="rounded-lg bg-muted px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Lightbulb className="size-4" aria-hidden />
              {label(i)}
            </p>
            <p className="mt-1 text-base leading-relaxed">{hint}</p>
          </li>
        ))}
      </ol>
      {/* Kept as one element so keyboard focus stays on it while the rungs unlock. */}
      {revealed < hints.length && (
        <Button variant="outline" className="h-11 justify-start px-3 text-base" onClick={onReveal}>
          <Lightbulb data-icon="inline-start" />
          Show hint {revealed + 1}: {RUNG_NAMES[revealed]}
        </Button>
      )}
      {hints.length > revealed + 1 && (
        <ul className="flex flex-col gap-2">
          {hints.slice(revealed + 1).map((_, offset) => {
            const i = revealed + 1 + offset
            return (
              <li
                key={i}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-muted-foreground"
              >
                <Lock className="size-4" aria-hidden />
                {label(i)}
                <span className="sr-only">(locked)</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export { HintLadder }
