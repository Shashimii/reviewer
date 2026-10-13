import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { MasteryRing } from '@/components/learning/mastery-ring'
import { buttonVariants } from '@/components/ui/button'
import { getSubject, getTopics } from '@/content'
import { cn } from '@/lib/utils'
import { STATE_LABELS, STEPS, topicState, topicStats } from '@/progress/mastery'
import { useLearner } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function SubjectPage() {
  const { subjectId = '' } = useParams()
  const learner = useLearner()
  const subject = getSubject(subjectId)
  if (!subject) return <NotFoundPage />
  const topics = getTopics(subject.id)
  const masteredCount = topics.filter((t) => learner.topics[t.id]?.mastered).length

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <Link to="/learn" className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Learn
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{subject.name}</h1>
        <p className="mt-1 text-base text-muted-foreground">
          {masteredCount} of {topics.length} topics mastered. Take them in order: each one builds on the ones before.
        </p>
      </div>

      {subject.id === 'foundations' && (
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-muted/40 p-4">
          <p className="text-base">
            Optional refreshers. Not on the exam itself, but the other subjects need them.
            {learner.diagnostic ? ' Your basics check results are on each topic below.' : ''}
          </p>
          <Link to="/diagnostic" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
            {learner.diagnostic ? 'Retake the basics check' : 'Take the basics check'}
          </Link>
        </div>
      )}

      <ol className="flex flex-col gap-2">
        {topics.map((topic) => {
          const record = learner.topics[topic.id]
          const state = topicState(record)
          const stats = topicStats(learner.attempts, topic.id)
          const check = learner.diagnostic?.scores[topic.id]
          return (
            <li key={topic.id}>
              <Link
                to={`/topics/${topic.id}`}
                className="flex min-h-16 items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">{topic.order}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base font-medium">{topic.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {STATE_LABELS[state]}
                    {stats && ` · ${Math.round(stats.accuracy * 100)}% correct`}
                    {check && ` · Basics check ${check.correct} of ${check.total}`}
                  </span>
                </span>
                <MasteryRing state={state} progress={(record?.completed.length ?? 0) / STEPS.length} showLabel={false} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
