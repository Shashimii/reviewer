import {
  ArrowRight,
  BookOpen,
  Clock,
  Landmark,
  ListChecks,
  PencilLine,
  Puzzle,
  Sigma,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import exam from '@/config/exam.json'
import { getQuestion, getTopic } from '@/content'
import { cn } from '@/lib/utils'

const AREA_ICONS: Record<string, LucideIcon> = {
  verbal: BookOpen,
  numerical: Sigma,
  analytical: Puzzle,
  'general-information': Landmark,
}

const TEACHING_LOOP = [
  {
    title: 'Lesson',
    body: 'A short explanation in plain words. Every term is defined the first time it appears.',
  },
  {
    title: 'Worked example',
    body: 'One question solved one step at a time, saying what is done and why.',
  },
  {
    title: 'Guided practice',
    body: 'Similar questions with up to three hints: a nudge, the first step, then the full method.',
  },
  {
    title: 'Independent practice',
    body: 'No hints. The full solution appears after every answer, right or wrong.',
  },
  {
    title: 'Mastery check',
    body: 'Mixed questions on the topic. Score 80% to master it, or go back to the exact step you missed.',
  },
]

const FEATURED_QUESTION_ID = 'num-series-0007'

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

const secondsPerItem = Math.round((exam.timeLimitMinutes * 60) / exam.scoredItems)

const EXAM_FACTS: { icon: LucideIcon; value: string; label: string }[] = [
  {
    icon: ListChecks,
    value: String(exam.scoredItems),
    label: 'scored items',
  },
  {
    icon: Clock,
    value: formatDuration(exam.timeLimitMinutes),
    label: `about ${secondsPerItem} s per item`,
  },
  {
    icon: Target,
    value: `${exam.passingRating}%`,
    label: 'general rating to pass',
  },
  {
    icon: PencilLine,
    value: exam.calculatorAllowed ? 'Calculator' : 'No calculator',
    label: exam.calculatorAllowed ? 'allowed on exam day' : 'everything by hand',
  },
]

export function IndexPage() {
  const featured = getQuestion(FEATURED_QUESTION_ID)
  const featuredTopic = featured && getTopic(featured.topicId)

  return (
    <>
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="secondary">
              {exam.name} · {exam.level} level
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Learn it before you're tested on it
            </h1>
            <p className="text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              A reviewer for the {exam.level} level that assumes you know
              nothing. Every topic is taught first, and every question shows
              how to solve it, step by step.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button className="h-11 px-5 text-base">
                Start learning
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button variant="outline" className="h-11 px-5 text-base">
                Check your basics first
              </Button>
            </div>
          </div>

          {featured && (
            <Card className="w-full">
              <CardHeader>
                <CardDescription>Try one · {featuredTopic?.name}</CardDescription>
                <CardTitle className="text-lg">{featured.stem}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
                  {featured.choices.map((choice, i) => (
                    <li key={choice}>
                      <span className="font-semibold text-muted-foreground">
                        {'ABCDE'[i]}.
                      </span>{' '}
                      {choice}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">
                  Stuck? Up to three hints, then the full solution one step at a
                  time.
                </p>
                <Link
                  to={`/questions/${featured.id}`}
                  className={cn(buttonVariants(), 'h-11 px-5 text-base')}
                >
                  Try this question
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="border-y bg-muted/40">
          <ul className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
            {EXAM_FACTS.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex flex-col gap-1">
                <Icon className="mb-1 size-5 text-muted-foreground" aria-hidden />
                <span className="font-heading text-2xl font-semibold">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            What the exam covers
          </h2>
          <p className="mt-2 max-w-prose text-base text-muted-foreground">
            The four areas in the official scope. CSC doesn't publish how many
            items come from each, so the app never claims a breakdown.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {exam.scope.map((area) => {
              const Icon = AREA_ICONS[area.id] ?? BookOpen
              return (
                <Card key={area.id}>
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <CardDescription>In {area.languages}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-wrap gap-2">
                      {area.topics.map((topic) => (
                        <li key={topic}>
                          <Badge variant="outline">{topic}</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Separator className="mx-auto max-w-5xl" />

        <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            How every topic works
          </h2>
          <p className="mt-2 max-w-prose text-base text-muted-foreground">
            The same five steps, every time. You're never tested on something
            you haven't been taught.
          </p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {TEACHING_LOOP.map((step, i) => (
              <li key={step.title} className="flex gap-3 lg:flex-col">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-base font-medium">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground">
          <p>
            Not affiliated with the Civil Service Commission. All practice
            questions are original, not real exam items.
          </p>
          <p>
            Exam details from{' '}
            <a
              href={exam.source.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {exam.source.label}
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  )
}
