import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { MinutesChart } from '@/components/charts/minutes-chart'
import { ScoreHistoryChart } from '@/components/charts/score-history-chart'
import { ReadinessMeter } from '@/components/learning/readiness-meter'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubjects, getTopics } from '@/content'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { minutesByDay, readiness, studyStreak, weakAreas } from '@/progress/insights'
import { STATE_LABELS, topicState, topicStats } from '@/progress/mastery'
import { PASS_MARK, scoreMock } from '@/progress/mock'
import { useLearner } from '@/progress/store'

export function ProgressPage() {
  const learner = useLearner()
  const [now] = useState(() => Date.now())
  const estimate = readiness(learner)
  const streak = studyStreak(learner, now)
  const days = minutesByDay(learner, now)
  const weak = weakAreas(learner)
  const mocks = learner.mocks.filter((m) => m.submittedAt)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Progress</h1>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {estimate.basis === 'none' ? (
            <p className="text-base text-muted-foreground">Answer some questions to see your estimated score.</p>
          ) : (
            <>
              <ReadinessMeter value={estimate.value} passMark={PASS_MARK} />
              <p className="text-sm text-muted-foreground">
                {estimate.basis === 'mocks'
                  ? `Based on your last ${Math.min(mocks.length, 3)} mock ${mocks.length === 1 ? 'exam' : 'exams'} and your accuracy across topics.`
                  : 'Based on your accuracy across topics only. Take a mock exam for a better estimate.'}{' '}
                A target to aim for, not a guarantee.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Study streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} />
        <Stat label="Minutes today" value={`${days.at(-1)?.minutes ?? 0}${learner.profile.dailyMinutes ? ` of ${learner.profile.dailyMinutes}` : ''}`} />
        <Stat label="Questions answered" value={learner.attempts.length.toLocaleString('en-PH')} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minutes studied, last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <MinutesChart days={days} goal={learner.profile.dailyMinutes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mock exam scores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {mocks.length === 0 ? (
            <p className="text-base text-muted-foreground">No mock exams yet. Your scores will show here.</p>
          ) : (
            <>
              <ScoreHistoryChart
                passMark={PASS_MARK}
                points={mocks.map((m, i) => ({
                  label: formatDate(m.startedAt),
                  detail: `Mock ${i + 1} · ${m.kind === 'full' ? 'full' : 'half'}`,
                  value: scoreMock(m).score,
                }))}
              />
              <ul className="flex flex-col">
                {mocks.map((m, i) => (
                  <li key={m.id}>
                    <Link to={`/mock/${m.id}/results`} className="flex min-h-11 items-center justify-between gap-4 border-b py-2 hover:bg-muted">
                      <span className="text-base">
                        Mock {i + 1} · {m.kind === 'full' ? 'full' : 'half'} · {formatDate(m.startedAt)}
                      </span>
                      <span className="font-semibold tabular-nums">{Math.round(scoreMock(m).score * 100)}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weak areas</CardTitle>
        </CardHeader>
        <CardContent>
          {weak.length === 0 ? (
            <p className="text-base text-muted-foreground">Answer at least 5 questions in a topic to see your weak areas.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {weak.map(({ topic, stats }) => (
                <li key={topic.id} className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2">
                  <span className="flex flex-1 flex-col">
                    <span className="text-base font-medium">{topic.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(stats.accuracy * 100)}% correct over the last {stats.count} answers
                    </span>
                  </span>
                  <Link to={`/topics/${topic.id}/lesson`} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-3 text-base')}>
                    Fix this
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Every topic</h2>
        {getSubjects().map((subject) => (
          <div key={subject.id} className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-base">
              <caption className="pb-2 text-left text-sm font-semibold">{subject.name}</caption>
              <thead className="text-sm text-muted-foreground">
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4 font-medium">Topic</th>
                  <th scope="col" className="py-2 pr-4 font-medium">State</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">Correct</th>
                  <th scope="col" className="py-2 text-right font-medium">Time per item</th>
                </tr>
              </thead>
              <tbody>
                {getTopics(subject.id).map((topic) => {
                  const stats = topicStats(learner.attempts, topic.id)
                  return (
                    <tr key={topic.id} className="border-b">
                      <th scope="row" className="py-2 pr-4 font-normal">
                        <Link to={`/topics/${topic.id}`} className="underline-offset-4 hover:underline">
                          {topic.name}
                        </Link>
                      </th>
                      <td className="py-2 pr-4 text-sm text-muted-foreground">{STATE_LABELS[topicState(learner.topics[topic.id])]}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{stats ? `${Math.round(stats.accuracy * 100)}%` : '–'}</td>
                      <td className="py-2 text-right tabular-nums">{stats ? `${Math.round(stats.avgSeconds)} s` : '–'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  )
}
