import { ChevronRight, Layers, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { MasteryRing } from '@/components/learning/mastery-ring'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubjects, getTopics } from '@/content'
import { cn } from '@/lib/utils'
import { dueReviews, masteredTopicIds } from '@/progress/mastery'
import { useLearner } from '@/progress/store'

export function LearnPage() {
  const learner = useLearner()
  const [now] = useState(() => Date.now())
  const due = dueReviews(learner.reviews, now).length
  const scheduled = Object.keys(learner.reviews).length
  const hasMastered = masteredTopicIds(learner).length > 0

  const subjects = getSubjects().map((subject) => ({ subject, topics: getTopics(subject.id) }))
  const ready = subjects.filter((s) => s.topics.length > 0)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Pick a subject, then take its topics in order: lesson, worked example, practice, then the mastery check.
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

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Subjects</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ready.map(({ subject, topics }) => {
            const mastered = topics.filter((t) => learner.topics[t.id]?.mastered).length
            const started = topics.some((t) => (learner.topics[t.id]?.completed.length ?? 0) > 0)
            const optional = subject.id === 'foundations'
            return (
              <li key={subject.id}>
                <Link
                  to={`/subjects/${subject.id}`}
                  className="flex min-h-20 items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-base font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {optional ? 'Optional refresher · ' : ''}
                      {mastered} of {topics.length} topics mastered
                    </span>
                  </span>
                  <MasteryRing
                    state={mastered === topics.length ? 'mastered' : started ? 'learning' : 'not-started'}
                    progress={mastered / topics.length}
                    showLabel={false}
                  />
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
