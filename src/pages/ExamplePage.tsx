import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { SolutionStepper } from '@/components/learning/solution-stepper'
import { Button } from '@/components/ui/button'
import { getLesson, getQuestion, getTopic, type Question } from '@/content'
import { cn } from '@/lib/utils'
import { isStepUnlocked } from '@/progress/mastery'
import { completeStep, useLearner } from '@/progress/store'
import { LockedStep } from '@/pages/LockedStep'
import { NotFoundPage } from '@/pages/NotFoundPage'

const LETTERS = 'ABCDE'

export function ExamplePage() {
  const { topicId = '' } = useParams()
  const learner = useLearner()
  const topic = getTopic(topicId)
  const lesson = getLesson(topicId)
  const question = lesson && getQuestion(lesson.workedExampleId)
  if (!topic || !question) return <NotFoundPage />
  if (!isStepUnlocked(learner.topics[topicId], 'example')) {
    return <LockedStep topicId={topicId} message="Read the lesson first." />
  }
  return <WorkedExample key={question.id} topicId={topicId} topicName={topic.name} question={question} />
}

function WorkedExample({
  topicId,
  topicName,
  question,
}: {
  topicId: string
  topicName: string
  question: Question
}) {
  const navigate = useNavigate()
  const [solved, setSolved] = useState(question.solution.steps.length <= 1)

  function finish() {
    completeStep(topicId, 'example')
    navigate(`/topics/${topicId}/guided`)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <div className="flex flex-col gap-2">
        <Link
          to={`/topics/${topicId}`}
          className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {topicName}
        </Link>
        <p className="text-sm font-medium text-muted-foreground">Worked example</p>
        <h1 className="font-heading text-xl leading-snug font-semibold">{question.stem}</h1>
        <p className="text-base text-muted-foreground">
          Watch how this one is solved. Tap "Next step" to see each step and why it is done.
        </p>
      </div>

      <ul className="grid gap-2">
        {question.choices.map((choice, i) => {
          const isAnswer = solved && choice === question.answer
          return (
            <li
              key={choice}
              className={cn(
                'flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-base',
                isAnswer && 'border-success bg-success/10',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold',
                  isAnswer && 'bg-success text-success-foreground',
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1">{choice}</span>
              {isAnswer && (
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  <Check className="size-4" aria-hidden />
                  Answer
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <SolutionStepper solution={question.solution} onDone={() => setSolved(true)} />

      {solved && (
        <Button className="h-11 text-base" onClick={finish}>
          Next: guided practice
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </main>
  )
}
