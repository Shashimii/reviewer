import { ChevronRight, Layers, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { MasteryRing } from '@/components/learning/mastery-ring'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubjects, getTopics } from '@/content'
import { cn } from '@/lib/utils'
import {
  dueReviews,
  masteredTopicIds,
  STATE_LABELS,
  STEPS,
  topicState,
  topicStats,
} from '@/progress/mastery'
import { useLearner } from '@/progress/store'

export function LearnPage() {
  const learner = useLearner()
  const [now] = useState(() => Date.now())
  const due = dueReviews(learner.reviews, now).length
  const scheduled = Object.keys(learner.reviews).length
  const hasMastered = masteredTopicIds(learner).length > 0

  const subjects = getSubjects().map((subject) => ({ subject, topics: getTopics(subject.id) }))
  const ready = subjects.filter((s) => s.topics.length > 0)
  const comingSoon = subjects.filter((s) => s.topics.length === 0)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Take each topic in order: lesson, worked example, practice, then the mastery check.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" aria-hidden />
              Mistakes deck
            </CardTitle>
            <CardDescription>
              {due > 0
                ? `${due} due today.`
                : scheduled > 0
                  ? `Nothing due today. ${scheduled} coming back later.`
                  : 'Questions you get wrong come back after 1, 3 and 7 days.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {due > 0 ? (
              <Link to="/mistakes" className={cn(buttonVariants(), 'h-11 w-full text-base')}>
                Review {due} {due === 1 ? 'mistake' : 'mistakes'}
              </Link>
            ) : (
              <Button variant="outline" className="h-11 w-full text-base" disabled>
                Nothing to review
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4" aria-hidden />
              Quick practice
            </CardTitle>
            <CardDescription>
              {hasMastered
                ? '10 random questions from topics you have mastered.'
                : 'Unlocks when you master your first topic.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasMastered ? (
              <Link to="/quick" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full text-base')}>
                Start quick practice
              </Link>
            ) : (
              <Button variant="outline" className="h-11 w-full text-base" disabled>
                Locked
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {ready.map(({ subject, topics }) => {
        const masteredCount = topics.filter((t) => learner.topics[t.id]?.mastered).length
        return (
          <section key={subject.id} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-lg font-semibold">{subject.name}</h2>
              <p className="text-sm text-muted-foreground">
                {masteredCount} of {topics.length} mastered
              </p>
            </div>
            <ol className="flex flex-col gap-2">
              {topics.map((topic) => {
                const record = learner.topics[topic.id]
                const stats = topicStats(learner.attempts, topic.id)
                const state = topicState(record)
                return (
                  <li key={topic.id}>
                    <Link
                      to={`/topics/${topic.id}`}
                      className="flex min-h-16 items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
                        {topic.order}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-base font-medium">{topic.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {STATE_LABELS[state]}
                          {stats && ` · ${Math.round(stats.accuracy * 100)}% correct`}
                        </span>
                      </span>
                      <MasteryRing
                        state={state}
                        progress={(record?.completed.length ?? 0) / STEPS.length}
                        showLabel={false}
                      />
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}

      {comingSoon.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-lg font-semibold">Coming later</h2>
          <ul className="flex flex-col gap-1 text-base text-muted-foreground">
            {comingSoon.map(({ subject }) => (
              <li key={subject.id}>{subject.name}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
