import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getLearner, updateProfile } from '@/progress/store'

const DAILY_OPTIONS = [15, 30, 45, 60]

// First run: a target exam date and a daily study goal, then the optional basics check.
export function WelcomePage() {
  const navigate = useNavigate()
  const saved = getLearner().profile
  const [examDate, setExamDate] = useState(saved.examDate ?? '')
  const [dailyMinutes, setDailyMinutes] = useState(saved.dailyMinutes ?? 30)

  function save(next: string) {
    updateProfile({ examDate: examDate || undefined, dailyMinutes, onboardedAt: saved.onboardedAt ?? Date.now() })
    navigate(next)
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Let's set your goal</h1>
        <p className="mt-1 text-base text-muted-foreground">Both are optional. You can change them later.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="exam-date" className="text-base font-medium">
          When is your exam?
        </label>
        <input
          id="exam-date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="h-11 rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-medium">How many minutes a day can you study?</legend>
        <div className="grid grid-cols-4 gap-2">
          {DAILY_OPTIONS.map((minutes) => (
            <label
              key={minutes}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded-lg border text-base has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                dailyMinutes === minutes && 'border-primary bg-primary text-primary-foreground',
              )}
            >
              <input
                type="radio"
                name="daily-minutes"
                value={minutes}
                checked={dailyMinutes === minutes}
                onChange={() => setDailyMinutes(minutes)}
                className="sr-only"
              />
              {minutes} min
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className="text-base text-muted-foreground">
          New to this, or years out of school? A 15-question basics check shows whether a short refresher on
          fractions, percent, tables and grammar would help first.
        </p>
        <Button className="h-11 text-base" onClick={() => save('/diagnostic')}>
          Take the basics check
        </Button>
        <Button variant="outline" className="h-11 text-base" onClick={() => save('/')}>
          Skip for now
        </Button>
      </div>
    </main>
  )
}
