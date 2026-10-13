import { ArrowRight, CircleCheck, CircleX, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { QuestionCard, type AnswerResult, type QuestionMode } from '@/components/question-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import {
  getPracticeQuestions,
  getQuestion,
  getTopic,
  getTopics,
  type Question,
  type Topic,
} from '@/content'
import { cn } from '@/lib/utils'
import {
  dueReviews,
  isStepUnlocked,
  MASTERY_PASS,
  masteredTopicIds,
  pickQuestions,
  SESSION_SIZE,
} from '@/progress/mastery'
import {
  completeStep,
  getLearner,
  recordAttempt,
  recordMasteryCheck,
  useLearner,
  type Mode,
} from '@/progress/store'
import { LockedStep } from '@/pages/LockedStep'
import { NotFoundPage } from '@/pages/NotFoundPage'

type TopicSessionKind = 'guided' | 'practice' | 'mastery'
type SessionKind = TopicSessionKind | 'review' | 'quick'

const TITLES: Record<SessionKind, string> = {
  guided: 'Guided practice',
  practice: 'Independent practice',
  mastery: 'Mastery check',
  review: 'Mistakes deck',
  quick: 'Quick practice',
}

const CARD_MODE: Record<SessionKind, QuestionMode> = {
  guided: 'guided',
  practice: 'practice',
  mastery: 'test',
  review: 'practice',
  quick: 'practice',
}

const NEXT_STEP: Partial<Record<SessionKind, { path: string; label: string }>> = {
  guided: { path: 'practice', label: 'Next: independent practice' },
  practice: { path: 'mastery', label: 'Next: mastery check' },
}

// Guided practice, independent practice and the mastery check for one topic.
export function TopicSessionPage({ kind }: { kind: TopicSessionKind }) {
  const { topicId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const learner = useLearner()
  const topic = getTopic(topicId)
  if (!topic) return <NotFoundPage />
  if (!isStepUnlocked(learner.topics[topicId], kind)) {
    return <LockedStep topicId={topicId} message="Finish the steps before this one first." />
  }

  // After a failed mastery check, guided practice can focus on the missed skills.
  const skills = searchParams.get('skills')?.split(',').filter(Boolean) ?? []
  const pick = () => {
    const pool = getPracticeQuestions(topicId)
    const focused = pool.filter((q) => skills.includes(q.skill))
    return pickQuestions(focused.length > 0 ? focused : pool, SESSION_SIZE[kind], getLearner().attempts)
  }
  return (
    <Session
      key={`${kind}:${topicId}:${skills.join(',')}`}
      kind={kind}
      topic={topic}
      pick={pick}
      exitTo={`/topics/${topicId}`}
    />
  )
}

// The Mistakes deck: questions answered wrongly that are due again today.
export function MistakesPage() {
  const pick = () =>
    dueReviews(getLearner().reviews, Date.now())
      .slice(0, SESSION_SIZE.review)
      .map((r) => getQuestion(r.questionId))
      .filter((q): q is Question => Boolean(q))
  return <Session kind="review" pick={pick} exitTo="/learn" />
}

// Quick practice: a daily mix from topics already mastered.
export function QuickPracticePage() {
  const pick = () => {
    const learner = getLearner()
    const pool = masteredTopicIds(learner).flatMap(getPracticeQuestions)
    return pickQuestions(pool, SESSION_SIZE.quick, learner.attempts)
  }
  return <Session kind="quick" pick={pick} exitTo="/learn" />
}

interface Result {
  question: Question
  choice: string
  correct: boolean
}

function Session({
  kind,
  topic,
  pick,
  exitTo,
}: {
  kind: SessionKind
  topic?: Topic
  pick: () => Question[]
  exitTo: string
}) {
  const [questions] = useState(pick)
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const finished = questions.length > 0 && index >= questions.length

  function handleAnswered(question: Question, result: AnswerResult) {
    recordAttempt({
      questionId: question.id,
      topicId: question.topicId,
      ...result,
      mode: kind satisfies Mode,
      at: Date.now(),
    })
    const next = [...results, { question, choice: result.choice, correct: result.correct }]
    setResults(next)
    if (next.length < questions.length || !topic) return
    // Last answer of the session: save the step or the mastery result.
    if (kind === 'mastery') {
      const score = next.filter((r) => r.correct).length / next.length
      recordMasteryCheck(topic.id, score, score >= MASTERY_PASS)
    } else if (kind === 'guided' || kind === 'practice') {
      completeStep(topic.id, kind)
    }
  }

  const question = questions[index]
  const isLast = index === questions.length - 1

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-base font-semibold">{TITLES[kind]}</h1>
            {topic && <p className="text-sm text-muted-foreground">{topic.name}</p>}
          </div>
          <Link
            to={exitTo}
            className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 px-3 text-base')}
          >
            <X data-icon="inline-start" />
            Exit
          </Link>
        </div>
        {questions.length > 0 && !finished && (
          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-label="Session progress"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={index}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(index / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {index + 1} of {questions.length}
            </span>
          </div>
        )}
      </header>

      {questions.length === 0 ? (
        <EmptySession kind={kind} exitTo={exitTo} />
      ) : finished ? (
        <Summary kind={kind} topic={topic} results={results} exitTo={exitTo} />
      ) : (
        <QuestionCard
          key={question.id}
          question={question}
          mode={CARD_MODE[kind]}
          onAnswered={(result) => handleAnswered(question, result)}
          onNext={() => setIndex((i) => i + 1)}
          nextLabel={isLast ? 'See results' : 'Next question'}
        />
      )}
    </main>
  )
}

function EmptySession({ kind, exitTo }: { kind: SessionKind; exitTo: string }) {
  const message =
    kind === 'review'
      ? 'No mistakes are due today. Questions you get wrong come back after 1, 3 and 7 days.'
      : kind === 'quick'
        ? 'Quick practice uses questions from topics you have mastered. Master a topic first.'
        : 'There are no questions for this topic yet.'
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-base text-muted-foreground">{message}</p>
      <Link to={exitTo} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
        Go back
      </Link>
    </div>
  )
}

function Summary({
  kind,
  topic,
  results,
  exitTo,
}: {
  kind: SessionKind
  topic?: Topic
  results: Result[]
  exitTo: string
}) {
  const correct = results.filter((r) => r.correct).length
  const score = correct / results.length
  const passed = score >= MASTERY_PASS
  const missed = results.filter((r) => !r.correct)
  const missedSkills = topic?.skills.filter((s) => missed.some((r) => r.question.skill === s.id)) ?? []
  const nextTopic = topic && getTopics(topic.subjectId).find((t) => t.order > topic.order)
  const next = topic && NEXT_STEP[kind]

  return (
    <div className="flex flex-col gap-6">
      <p className="font-heading text-2xl font-semibold">
        {correct} of {results.length} correct
      </p>

      {kind === 'mastery' &&
        (passed ? (
          <Alert className="border-success/40 bg-success/10">
            <CircleCheck className="text-success" />
            <AlertTitle className="text-base">Topic mastered</AlertTitle>
            <AlertDescription>
              You scored {Math.round(score * 100)}%. Questions from this topic now appear in Quick practice.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-destructive/40 bg-destructive/10">
            <CircleX className="text-destructive" />
            <AlertTitle className="text-base">Not mastered yet</AlertTitle>
            <AlertDescription>
              You scored {Math.round(score * 100)}%. You need {Math.round(MASTERY_PASS * 100)}% to master this
              topic. Practise the skills below, then try again.
            </AlertDescription>
          </Alert>
        ))}

      {kind === 'mastery' && !passed && missedSkills.length > 0 && topic && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Skills to practise</h2>
          <ul className="list-disc pl-5 text-base">
            {missedSkills.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
          <Link
            to={`/topics/${topic.id}/guided?skills=${missedSkills.map((s) => s.id).join(',')}`}
            className={cn(buttonVariants(), 'h-11 text-base')}
          >
            Practise these with hints
          </Link>
        </section>
      )}

      {kind === 'mastery' && missed.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Questions you missed</h2>
          <ul className="flex flex-col gap-3">
            {missed.map((r) => (
              <li key={r.question.id} className="flex flex-col gap-1 rounded-lg border p-3">
                <p className="text-base">{r.question.stem}</p>
                <p className="text-sm text-muted-foreground">
                  You chose {r.choice}. The answer is {r.question.answer}.
                </p>
                <Link
                  to={`/questions/${r.question.id}`}
                  className="flex min-h-11 w-fit items-center text-sm font-medium underline underline-offset-4"
                >
                  See the solution
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {next && topic && (
          <Link to={`/topics/${topic.id}/${next.path}`} className={cn(buttonVariants(), 'h-11 px-4 text-base')}>
            {next.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        )}
        {kind === 'mastery' && passed && nextTopic && (
          <Link to={`/topics/${nextTopic.id}`} className={cn(buttonVariants(), 'h-11 px-4 text-base')}>
            Go to the next topic
            <ArrowRight data-icon="inline-end" />
          </Link>
        )}
        <Link to={exitTo} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
          {topic ? 'Back to the topic' : 'Back to lessons'}
        </Link>
      </div>
    </div>
  )
}
