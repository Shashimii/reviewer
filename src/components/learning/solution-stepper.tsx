import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Solution } from '@/content'
import { cn } from '@/lib/utils'

// Reveals a solution one step at a time. Steps with a "why" get an expander.
function SolutionStepper({ solution, className }: { solution: Solution; className?: string }) {
  const [shown, setShown] = useState(1)
  const total = solution.steps.length
  const done = shown >= total

  return (
    <section data-slot="solution-stepper" aria-label="Step-by-step solution" className={cn('flex flex-col gap-4', className)}>
      <ol className="flex flex-col gap-4" aria-live="polite">
        {solution.steps.slice(0, shown).map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <div className="flex-1 pt-0.5">
              <p className="text-base leading-relaxed">{step.action}</p>
              {step.why && (
                <details className="group">
                  <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
                    Why?
                  </summary>
                  <p className="border-l-2 pl-3 text-base leading-relaxed text-muted-foreground">
                    {step.why}
                  </p>
                </details>
              )}
            </div>
          </li>
        ))}
      </ol>
      {done ? (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-base">
          <span className="font-medium">Method:</span> {solution.methodName}
        </p>
      ) : (
        <div className="flex gap-2">
          <Button className="h-11 flex-1 text-base" onClick={() => setShown((n) => n + 1)}>
            Next step ({shown + 1} of {total})
          </Button>
          <Button variant="ghost" className="h-11 text-base" onClick={() => setShown(total)}>
            Show all
          </Button>
        </div>
      )}
    </section>
  )
}

export { SolutionStepper }
