import { ArrowRight, CircleCheck, CircleX } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { getTopic } from '@/content'
import { formatSeconds } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PASS_MARK, scoreMock } from '@/progress/mock'
import { useLearner } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function MockResultsPage() {
  const { mockId = '' } = useParams()
  const learner = useLearner()
  const mock = learner.mocks.find((m) => m.id === mockId)
  if (!mock) return <NotFoundPage />
  if (!mock.submittedAt) return <Navigate to={`/mock/${mock.id}`} replace />

  const result = scoreMock(mock)
  const pct = Math.round(result.score * 100)
  const pass = Math.round(PASS_MARK * 100)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {mock.kind === 'full' ? 'Full mock' : 'Half mock'} results
        </p>
        <h1 className="font-heading text-5xl font-semibold tracking-tight">{pct}%</h1>
        <p className="mt-1 text-base text-muted-foreground">
          {result.correct} of {result.total} correct
        </p>
      </div>

      {result.passed ? (
        <Alert className="border-success/40 bg-success/10">
          <CircleCheck className="text-success" />
          <AlertTitle className="text-base">At or above the {pass}% pass mark</AlertTitle>
          <AlertDescription>A practice score, not an official rating. Keep it up across several mocks.</AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-destructive/40 bg-destructive/10">
          <CircleX className="text-destructive" />
          <AlertTitle className="text-base">Below the {pass}% pass mark</AlertTitle>
          <AlertDescription>
            {pass - pct} points to go. Review the items below, then work on your weakest subject.
          </AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">By subject</h2>
        <ul className="flex flex-col gap-4">
          {result.bySubject.map((s) => {
            const subjectPct = Math.round((s.correct / s.total) * 100)
            return (
              <li key={s.subjectId} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-base font-medium">{s.name}</span>
                  <span className="text-base font-semibold tabular-nums">{subjectPct}%</span>
                </div>
                <div className="relative h-2.5 rounded-full bg-primary/15" aria-hidden>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${subjectPct}%` }} />
                  <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground" style={{ left: `${pass}%` }} />
                </div>
                <span className="text-sm text-muted-foreground">
                  {s.correct} of {s.total} correct · {formatSeconds(s.seconds)} spent
                </span>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-muted-foreground">The line on each bar is the {pass}% pass mark.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Slowest items</h2>
        <ul className="flex flex-col gap-2">
          {result.slowest.map(({ question, index, seconds }) => (
            <li key={question.id}>
              <Link
                to={`/mock/${mock.id}/review?item=${index + 1}`}
                className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted"
              >
                <span className="w-12 shrink-0 text-sm font-medium text-muted-foreground">#{index + 1}</span>
                <span className="flex flex-1 flex-col">
                  <span className="line-clamp-1 text-base">{question.stem}</span>
                  <span className="text-sm text-muted-foreground">{getTopic(question.topicId)?.name}</span>
                </span>
                <span className="text-sm whitespace-nowrap tabular-nums">{formatSeconds(seconds)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to={`/mock/${mock.id}/review`} className={cn(buttonVariants(), 'h-11 px-4 text-base')}>
          Review every item
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Link to="/mock" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
          Back to mock exams
        </Link>
      </div>
    </main>
  )
}
