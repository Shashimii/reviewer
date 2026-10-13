import { Check, X } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

export type AnswerChoiceState = 'default' | 'selected' | 'correct' | 'wrong'

const CHOICE_STYLES: Record<AnswerChoiceState, string> = {
  default: 'border-border bg-card has-enabled:hover:bg-muted has-disabled:opacity-60',
  selected: 'border-primary bg-primary/5 ring-1 ring-primary',
  correct: 'border-success bg-success/10',
  wrong: 'border-destructive bg-destructive/10',
}

const LETTER_STYLES: Record<AnswerChoiceState, string> = {
  default: 'bg-muted text-foreground',
  selected: 'bg-primary text-primary-foreground',
  correct: 'bg-success text-success-foreground',
  wrong: 'bg-destructive text-white',
}

function AnswerChoiceGroup({
  legend,
  className,
  children,
  ...props
}: React.ComponentProps<'fieldset'> & { legend: string }) {
  return (
    <fieldset data-slot="answer-choice-group" className={cn('grid gap-2', className)} {...props}>
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  )
}

// A radio styled as a full-width option. Correct and wrong always show an icon and a word,
// never colour alone.
function AnswerChoice({
  letter,
  state = 'default',
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type' | 'children'> & {
  letter: string
  state?: AnswerChoiceState
  children: React.ReactNode
}) {
  return (
    <label
      data-slot="answer-choice"
      data-state={state}
      className={cn(
        'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-base transition-colors has-disabled:cursor-default has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
        CHOICE_STYLES[state],
        className,
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          LETTER_STYLES[state],
        )}
      >
        {letter}
      </span>
      <span className="flex-1">{children}</span>
      {state === 'correct' && (
        <span className="flex items-center gap-1 text-sm font-medium text-success">
          <Check className="size-4" aria-hidden />
          Correct
        </span>
      )}
      {state === 'wrong' && (
        <span className="flex items-center gap-1 text-sm font-medium text-destructive">
          <X className="size-4" aria-hidden />
          Wrong
        </span>
      )}
    </label>
  )
}

export { AnswerChoice, AnswerChoiceGroup }
