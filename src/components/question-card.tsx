import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import {
  AnswerChoice,
  AnswerChoiceGroup,
  type AnswerChoiceState,
} from '@/components/learning/answer-choice'
import { HintLadder } from '@/components/learning/hint-ladder'
import { SolutionStepper } from '@/components/learning/solution-stepper'
import { Markdown } from '@/components/markdown'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import type { Question } from '@/content'
import { cn } from '@/lib/utils'

const LETTERS = 'ABCDE'

// guided: hints, then feedback and a step-by-step solution.
// practice: no hints; feedback and the full solution after answering.
// test: no hints and no feedback (mastery check).
export type QuestionMode = 'guided' | 'practice' | 'test'

export interface AnswerResult {
  choice: string
  correct: boolean
  seconds: number
  hintsUsed: number
}

export function QuestionCard({
  question,
  mode,
  onAnswered,
  onNext,
  nextLabel = 'Next question',
  review,
}: {
  question: Question
  mode: QuestionMode
  onAnswered?: (result: AnswerResult) => void
  // Without onNext the card offers "Try again" instead.
  onNext?: () => void
  nextLabel?: string
  // Shows an earlier answer (null = left blank) with the full solution, e.g. in mock exam review.
  review?: { choice: string | null }
}) {
  const [selected, setSelected] = useState<string | null>(review ? review.choice : null)
  const [checked, setChecked] = useState(Boolean(review))
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [startedAt, setStartedAt] = useState(() => Date.now())

  const isCorrect = selected === question.answer
  const letterOf = (choice: string) => LETTERS[question.choices.indexOf(choice)]
  const selectedTrap = !isCorrect && selected ? question.trapNotes?.[selected] : undefined
  // The chosen choice's trap note is shown on its own, above the solution.
  const otherTraps = Object.entries(question.trapNotes ?? {}).filter(([choice]) => choice !== selected)

  function stateOf(choice: string): AnswerChoiceState {
    if (!checked || mode === 'test') return choice === selected ? 'selected' : 'default'
    if (choice === question.answer) return 'correct'
    if (choice === selected) return 'wrong'
    return 'default'
  }

  function answer() {
    if (selected === null) return
    setChecked(true)
    onAnswered?.({
      choice: selected,
      correct: selected === question.answer,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      hintsUsed: hintsRevealed,
    })
  }

  function tryAgain() {
    setSelected(null)
    setChecked(false)
    setHintsRevealed(0)
    setStartedAt(Date.now())
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Difficulty {question.difficulty} of 3</Badge>
        {question.status !== 'live' && <Badge variant="outline">Not yet reviewed</Badge>}
      </div>

      {question.passage && <Markdown source={question.passage} className="rounded-lg border bg-muted/30 p-4" />}

      <h2 className="font-heading text-xl leading-snug font-semibold whitespace-pre-line">{question.stem}</h2>

      <AnswerChoiceGroup legend="Choose an answer">
        {question.choices.map((choice, i) => (
          <AnswerChoice
            key={choice}
            name={question.id}
            value={choice}
            letter={LETTERS[i]}
            state={stateOf(choice)}
            checked={selected === choice}
            disabled={checked}
            onChange={() => setSelected(choice)}
          >
            {choice}
          </AnswerChoice>
        ))}
      </AnswerChoiceGroup>

      {mode === 'test' ? (
        <Button
          className="h-11 text-base"
          disabled={selected === null}
          onClick={() => {
            answer()
            onNext?.()
          }}
        >
          {nextLabel}
        </Button>
      ) : !checked ? (
        <>
          {mode === 'guided' && (
            <HintLadder
              hints={question.hints}
              revealed={hintsRevealed}
              onReveal={() => setHintsRevealed((n) => n + 1)}
            />
          )}
          <Button className="h-11 text-base" disabled={selected === null} onClick={answer}>
            Check answer
          </Button>
        </>
      ) : (
        <>
          {isCorrect ? (
            <Alert className="border-success/40 bg-success/10">
              <CircleCheck className="text-success" />
              <AlertTitle className="text-base">Correct</AlertTitle>
              {mode === 'guided' && (
                <AlertDescription>
                  {hintsRevealed === 0
                    ? 'Solved without hints.'
                    : `Solved with ${hintsRevealed} of ${question.hints.length} hints.`}
                </AlertDescription>
              )}
            </Alert>
          ) : (
            <Alert className="border-destructive/40 bg-destructive/10">
              <CircleX className="text-destructive" />
              <AlertTitle className="text-base">Incorrect</AlertTitle>
              <AlertDescription>
                {selected === null ? 'You left this blank.' : `You chose ${letterOf(selected)}.`} The answer is{' '}
                {letterOf(question.answer)}, {question.answer}.
              </AlertDescription>
            </Alert>
          )}

          {selectedTrap && (
            <Alert>
              <TriangleAlert />
              <AlertTitle className="text-base">Trap</AlertTitle>
              <AlertDescription className="text-base text-foreground">{selectedTrap}</AlertDescription>
            </Alert>
          )}

          <section className="flex flex-col gap-4">
            <h3 className="font-heading text-lg font-semibold">Step-by-step solution</h3>
            <SolutionStepper solution={question.solution} revealAll={mode === 'practice' || Boolean(review)} />
          </section>

          {otherTraps.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="font-heading text-lg font-semibold">Why the other choices are wrong</h3>
              <ul className="flex flex-col gap-2">
                {otherTraps.map(([choice, note]) => (
                  <li key={choice} className="flex gap-3 text-base leading-relaxed">
                    <span className="shrink-0 font-semibold">
                      {letterOf(choice)}. {choice}
                    </span>
                    <span className="text-muted-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {review ? null : onNext ? (
            <Button className="h-11 text-base" onClick={onNext}>
              {nextLabel}
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="h-11 px-4 text-base" onClick={tryAgain}>
                Try again
              </Button>
              <Link to="/learn" className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 px-4 text-base')}>
                Go to lessons
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
