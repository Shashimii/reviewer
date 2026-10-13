import { ArrowRight, BarChart3, BookOpen, Flame, Timer } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { ReadinessMeter } from '@/components/learning/readiness-meter'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { minutesByDay, nextBestStep, readiness, studyStreak } from '@/progress/insights'
import { PASS_MARK } from '@/progress/mock'
import { useLearner } from '@/progress/store'

const DAY_MS = 24 * 60 * 60 * 1000

// For returning learners: what to do next, and how close they are to the pass mark.
export function HomePage() {
  const learner = useLearner()
  const [now] = useState(() => Date.now())
  const step = nextBestStep(learner, now)
  const estimate = readiness(learner)
  const streak = studyStreak(learner, now)
  const today = minutesByDay(learner, now, 1)[0].minutes
  const goal = learner.profile.dailyMinutes
  const examDate = learner.profile.examDate ? new Date(`${learner.profile.examDate}T00:00:00`) : undefined
  const daysLeft = examDate ? Math.ceil((examDate.getTime() - now) / DAY_MS) : undefined

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
        {examDate && daysLeft !== undefined && (
          <p className="mt-1 text-base text-muted-foreground">
            {daysLeft > 0
              ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to your exam on ${examDate.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}.`
              : daysLeft === 0
                ? 'Your exam is today. Good luck!'
                : 'Your exam date has passed. You can set a new one on the welcome screen.'}
          </p>
        )}
      </div>

      <Card className="ring-2 ring-primary">
        <CardHeader>
          <CardDescription>Next best step</CardDescription>
          <CardTitle className="text-xl">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-base text-muted-foreground">{step.description}</p>
          <Link to={step.to} className={cn(buttonVariants(), 'h-11 w-full px-4 text-base sm:w-fit')}>
            {step.action}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            {estimate.basis === 'none' ? (
              <p className="text-base text-muted-foreground">Your estimated score appears after your first answers.</p>
            ) : (
              <ReadinessMeter value={estimate.value} passMark={PASS_MARK} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="size-4" aria-hidden />
              Study streak
            </span>
            <span className="font-heading text-4xl font-semibold">
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
            <span className="text-sm text-muted-foreground">
              {today} {goal ? `of ${goal} ` : ''}minutes today
            </span>
          </CardContent>
        </Card>
      </div>

      <nav aria-label="Sections" className="grid gap-2 sm:grid-cols-3">
        {[
          { to: '/learn', icon: BookOpen, label: 'Lessons and practice' },
          { to: '/mock', icon: Timer, label: 'Mock exam' },
          { to: '/progress', icon: BarChart3, label: 'Progress' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 hover:bg-muted">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
            <span className="text-base font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
