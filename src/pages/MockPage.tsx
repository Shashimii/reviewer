import { CircleCheck, CircleX, Lock, Timer } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import exam from '@/config/exam.json'
import { getPracticeQuestions, getSubject, getTopics } from '@/content'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { blendFor, createMock, isMockActive, mockSettings, mockUnlockStatus, scoreMock } from '@/progress/mock'
import { getLearner, startMock, useLearner, type MockKind } from '@/progress/store'

function hoursAndMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
}

export function MockPage() {
  const learner = useLearner()
  const navigate = useNavigate()
  const [now] = useState(() => Date.now())
  const [override, setOverride] = useState(false)
  const active = learner.mocks.find((m) => isMockActive(m, now))
  const { unlocked, missing } = mockUnlockStatus(learner)
  const history = learner.mocks.filter((m) => m.submittedAt).reverse()

  function start(kind: MockKind) {
    const mock = createMock(kind, getLearner())
    startMock(mock)
    navigate(`/mock/${mock.id}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Mock exam</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Exam conditions: no hints, no feedback until the end, and no calculator. The timer keeps running if you
          leave the app, as on exam day.
        </p>
      </div>

      {active ? (
        <Alert>
          <Timer />
          <AlertTitle className="text-base">You have a mock exam in progress</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3 text-base">
            <span>
              {Object.keys(active.answers).length} of {active.itemIds.length} answered.
            </span>
            <Link to={`/mock/${active.id}`} className={cn(buttonVariants(), 'h-11 px-4 text-base')}>
              Go back to the exam
            </Link>
          </AlertDescription>
        </Alert>
      ) : !unlocked && !override ? (
        <Alert>
          <Lock />
          <AlertTitle className="text-base">Unlocks when you master one topic in each subject</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3 text-base">
            <span>Still to master a topic in: {missing.join(', ')}.</span>
            <Button variant="outline" className="h-11 px-4 text-base" onClick={() => setOverride(true)}>
              Take one anyway
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(['full', 'half'] as const).map((kind) => {
            const settings = mockSettings(kind)
            const available = blendFor(kind).reduce(
              (sum, [subjectId, count]) =>
                sum + Math.min(count, getTopics(subjectId).flatMap((t) => getPracticeQuestions(t.id)).length),
              0,
            )
            return (
              <Card key={kind}>
                <CardHeader>
                  <CardTitle className="text-lg">{kind === 'full' ? 'Full mock' : 'Half mock'}</CardTitle>
                  <CardDescription className="text-base">
                    {settings.items} items · {hoursAndMinutes(settings.minutes)}
                    {available < settings.items && ` · only ${available} items available yet`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="h-11 w-full text-base" onClick={() => start(kind)} disabled={available === 0}>
                    Start {kind === 'full' ? 'full' : 'half'} mock
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">What's in a full mock</h2>
        <ul className="grid gap-1 text-base sm:grid-cols-2">
          {blendFor('full').map(([subjectId, count]) => (
            <li key={subjectId} className="flex justify-between gap-4 border-b py-1.5">
              <span>{getSubject(subjectId)?.name}</span>
              <span className="text-muted-foreground tabular-nums">{count} items</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{exam.mock.blendNote}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Past mocks</h2>
        {history.length === 0 ? (
          <p className="text-base text-muted-foreground">No mock exams yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((m) => {
              const result = scoreMock(m)
              return (
                <li key={m.id}>
                  <Link
                    to={`/mock/${m.id}/results`}
                    className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted"
                  >
                    {result.passed ? (
                      <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <CircleX className="size-5 shrink-0 text-destructive" aria-hidden />
                    )}
                    <span className="flex flex-1 flex-col">
                      <span className="text-base font-medium">
                        {m.kind === 'full' ? 'Full mock' : 'Half mock'} · {formatDate(m.startedAt)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.correct} of {result.total} correct · {result.passed ? 'At or above 80%' : 'Below 80%'}
                      </span>
                    </span>
                    <span className="font-heading text-lg font-semibold tabular-nums">
                      {Math.round(result.score * 100)}%
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
