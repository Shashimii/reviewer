import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import {
  AnswerChoice,
  AnswerChoiceGroup,
  type AnswerChoiceState,
} from '@/components/learning/answer-choice'
import { HintLadder } from '@/components/learning/hint-ladder'
import { SolutionStepper } from '@/components/learning/solution-stepper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { getQuestion, getSubject, getTopic, type Question } from '@/content'
import { cn } from '@/lib/utils'
import { NotFoundPage } from '@/pages/NotFoundPage'

const LETTERS = 'ABCDE'

export function QuestionPage() {
  const { questionId = '' } = useParams()
  const question = getQuestion(questionId)
  if (!question) return <NotFoundPage />
  // Keyed so moving to another question starts with fresh state.
  return <GuidedQuestion key={question.id} question={question} />
}

// Guided practice: hints before answering, the full solution after.
function GuidedQuestion({ question }: { question: Question }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)

  const topic = getTopic(question.topicId)
  const subject = topic && getSubject(topic.subjectId)
  const isCorrect = selected === question.answer
  const letterOf = (choice: string) => LETTERS[question.choices.indexOf(choice)]
  const selectedTrap = !isCorrect && selected ? question.trapNotes?.[selected] : undefined
  // The chosen choice's trap note is shown on its own, above the solution.
  const otherTraps = Object.entries(question.trapNotes ?? {}).filter(([choice]) => choice !== selected)

  function stateOf(choice: string): AnswerChoiceState {
    if (!checked) return choice === selected ? 'selected' : 'default'
    if (choice === question.answer) return 'correct'
    if (choice === selected) return 'wrong'
    return 'default'
  }

  function tryAgain() {
    setSelected(null)
    setChecked(false)
    setHintsRevealed(0)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {[subject?.name, topic?.name].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Guided practice</Badge>
          <Badge variant="outline">Difficulty {question.difficulty} of 3</Badge>
          {question.status !== 'live' && <Badge variant="outline">Not yet reviewed</Badge>}
        </div>
      </div>

      <h1 className="font-heading text-xl leading-snug font-semibold">{question.stem}</h1>

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

      {!checked ? (
        <>
          <HintLadder
            hints={question.hints}
            revealed={hintsRevealed}
            onReveal={() => setHintsRevealed((n) => n + 1)}
          />
          <Button
            className="h-11 text-base"
            disabled={selected === null}
            onClick={() => setChecked(true)}
          >
            Check answer
          </Button>
        </>
      ) : (
        <>
          {isCorrect ? (
            <Alert className="border-success/40 bg-success/10">
              <CircleCheck className="text-success" />
              <AlertTitle className="text-base">Correct</AlertTitle>
              <AlertDescription>
                {hintsRevealed === 0
                  ? 'Solved without hints.'
                  : `Solved with ${hintsRevealed} of ${question.hints.length} hints.`}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-destructive/40 bg-destructive/10">
              <CircleX className="text-destructive" />
              <AlertTitle className="text-base">Incorrect</AlertTitle>
              <AlertDescription>
                You chose {letterOf(selected!)}. The answer is {letterOf(question.answer)},{' '}
                {question.answer}.
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
            <h2 className="font-heading text-lg font-semibold">Step-by-step solution</h2>
            <SolutionStepper solution={question.solution} />
          </section>

          {otherTraps.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">Why the other choices are wrong</h2>
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="h-11 px-4 text-base" onClick={tryAgain}>
              Try again
            </Button>
            <Link to="/" className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 px-4 text-base')}>
              Back to home
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
