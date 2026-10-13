import { ArrowLeft, Check, Lock } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { MasteryRing } from '@/components/learning/mastery-ring'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { getLesson, getSubject, getTopic, type Topic } from '@/content'
import { cn } from '@/lib/utils'
import { isStepUnlocked, nextStep, STEPS, topicState, topicStats } from '@/progress/mastery'
import { useLearner } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function TopicPage() {
  const { topicId = '' } = useParams()
  const learner = useLearner()
  const topic = getTopic(topicId)
  if (!topic) return <NotFoundPage />

  const subject = getSubject(topic.subjectId)
  const record = learner.topics[topic.id]
  const stats = topicStats(learner.attempts, topic.id)
  const current = nextStep(record)
  const notMasteredFirst = topic.prerequisites
    .map(getTopic)
    .filter((t): t is Topic => Boolean(t) && !learner.topics[t!.id]?.mastered)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <Link
        to={`/subjects/${topic.subjectId}`}
        className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {subject?.name ?? 'Learn'}
      </Link>

      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{topic.name}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <MasteryRing state={topicState(record)} progress={(record?.completed.length ?? 0) / STEPS.length} />
          {stats && (
            <p className="text-sm text-muted-foreground">
              {Math.round(stats.accuracy * 100)}% correct · {Math.round(stats.avgSeconds)} s per question
              <span className="sr-only"> (last {stats.count} answers)</span>
            </p>
          )}
        </div>
      </div>

      {notMasteredFirst.length > 0 && (
        <Alert>
          <AlertTitle className="text-base">Recommended first</AlertTitle>
          <AlertDescription className="text-base">
            This topic uses{' '}
            {notMasteredFirst.map((t, i) => (
              <span key={t.id}>
                {i > 0 && ' and '}
                <Link to={`/topics/${t.id}`}>{t.name}</Link>
              </span>
            ))}
            . You can start here anyway.
          </AlertDescription>
        </Alert>
      )}

      {getLesson(topic.id) ? (
        <ol className="flex flex-col">
          {STEPS.map((step, i) => {
            const done = Boolean(record?.completed.includes(step.id))
            const unlocked = isStepUnlocked(record, step.id)
            const isCurrent = step.id === current && !done
            const last = i === STEPS.length - 1
            return (
              <li key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      done && 'bg-success text-success-foreground',
                      isCurrent && 'bg-primary text-primary-foreground',
                      !done && !isCurrent && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? (
                      <Check className="size-4" aria-hidden />
                    ) : unlocked ? (
                      i + 1
                    ) : (
                      <Lock className="size-3.5" aria-hidden />
                    )}
                  </span>
                  {!last && <span className="w-px flex-1 bg-border" aria-hidden />}
                </div>
                <div className={cn('flex flex-1 flex-col gap-2', !last && 'pb-6')}>
                  <div>
                    <h2 className="font-heading text-base font-semibold">
                      {step.title}
                      <span className="sr-only">
                        {done ? ' (done)' : unlocked ? '' : ' (locked)'}
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.id === 'mastery' && record?.lastMasteryScore !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        Last score: {Math.round(record.lastMasteryScore * 100)}%
                      </p>
                    )}
                  </div>
                  {unlocked ? (
                    <Link
                      to={`/topics/${topic.id}/${step.id}`}
                      className={cn(
                        buttonVariants({ variant: isCurrent ? 'default' : 'outline' }),
                        'h-11 w-fit px-4 text-base',
                      )}
                    >
                      {isCurrent ? 'Start' : step.id === 'mastery' ? 'Retake' : 'Review'}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">Finish the step above to unlock.</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-base text-muted-foreground">The lesson for this topic is coming soon.</p>
      )}
    </main>
  )
}
