import { ArrowLeft, ArrowRight, Flag, LayoutGrid, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'

import { AnswerChoice, AnswerChoiceGroup } from '@/components/learning/answer-choice'
import { ExamTimer } from '@/components/learning/exam-timer'
import { ItemGrid } from '@/components/learning/item-grid'
import { Markdown } from '@/components/markdown'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import exam from '@/config/exam.json'
import { getQuestion } from '@/content'
import { isBehindPace, mockAttempts } from '@/progress/mock'
import { getLearner, submitMock, updateMock, useLearner, type MockRecord } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

const LETTERS = 'ABCDE'

// The exam screen: no hints, no feedback, no decoration. Rendered outside the app shell.
export function MockExamPage() {
  const { mockId = '' } = useParams()
  const learner = useLearner()
  const mock = learner.mocks.find((m) => m.id === mockId)
  if (!mock) return <NotFoundPage />
  if (mock.submittedAt) return <Navigate to={`/mock/${mock.id}/results`} replace />
  return <MockExam key={mock.id} mock={mock} />
}

function MockExam({ mock }: { mock: MockRecord }) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(() => Math.max(0, mock.itemIds.findIndex((id) => !(id in mock.answers))))
  const [now, setNow] = useState(() => Date.now())
  const [showGrid, setShowGrid] = useState(false)
  const [confirming, setConfirming] = useState(false)
  // When the learner arrived at the current item, for time spent per item.
  const enteredAt = useRef(0)

  const itemId = mock.itemIds[index]
  const question = getQuestion(itemId)
  const total = mock.itemIds.length
  const answeredCount = Object.keys(mock.answers).length
  const flagged = mock.flags.includes(itemId)
  const behind = isBehindPace(mock, now)

  useEffect(() => {
    enteredAt.current = Date.now()
  }, [index])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Time is up: submit as it stands, as on exam day.
  useEffect(() => {
    if (now < mock.deadline) return
    const latest = getLearner().mocks.find((m) => m.id === mock.id)
    if (latest && !latest.submittedAt) {
      submitMock(latest.id, mockAttempts(latest, latest.deadline), latest.deadline)
      navigate(`/mock/${mock.id}/results`, { replace: true })
    }
  }, [now, mock.deadline, mock.id, navigate])

  function recordTime() {
    const spent = (Date.now() - enteredAt.current) / 1000
    enteredAt.current = Date.now()
    updateMock(mock.id, { itemSeconds: { ...mock.itemSeconds, [itemId]: (mock.itemSeconds[itemId] ?? 0) + spent } })
  }

  function goTo(i: number) {
    recordTime()
    setIndex(Math.min(Math.max(i, 0), total - 1))
    setShowGrid(false)
    setConfirming(false)
    window.scrollTo(0, 0)
  }

  function choose(choice: string) {
    updateMock(mock.id, { answers: { ...mock.answers, [itemId]: choice } })
  }

  function toggleFlag() {
    updateMock(mock.id, { flags: flagged ? mock.flags.filter((f) => f !== itemId) : [...mock.flags, itemId] })
  }

  function submit() {
    recordTime()
    const latest = getLearner().mocks.find((m) => m.id === mock.id)!
    const at = Date.now()
    submitMock(latest.id, mockAttempts(latest, at), at)
    navigate(`/mock/${mock.id}/results`, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-4 py-2">
          <ExamTimer secondsLeft={(mock.deadline - now) / 1000} behindPace={behind} />
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {total}
          </span>
          <Button variant="outline" className="h-11 px-3 text-base" onClick={() => setShowGrid((v) => !v)} aria-expanded={showGrid}>
            <LayoutGrid data-icon="inline-start" />
            Items
          </Button>
        </div>
        {behind && (
          <p className="mx-auto w-full max-w-2xl px-4 pb-2 text-sm text-destructive">
            You are more than {exam.mock.paceWarningMinutes} minutes behind pace. Skip hard items, flag them, and come back.
          </p>
        )}
      </header>

      {showGrid && (
        <div className="border-b bg-muted/30">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4">
            <ItemGrid
              cells={mock.itemIds.map((id) => ({ answered: id in mock.answers, flagged: mock.flags.includes(id) }))}
              current={index}
              onSelect={goTo}
            />
            <Link to="/" className="flex min-h-11 w-fit items-center text-sm text-muted-foreground underline underline-offset-4">
              Leave for now (the timer keeps running)
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
        {question ? (
          <>
            {question.passage && <Markdown source={question.passage} className="rounded-lg border bg-muted/30 p-4" />}
            <h1 className="font-heading text-xl leading-snug font-semibold whitespace-pre-line">{question.stem}</h1>
            <AnswerChoiceGroup legend={`Item ${index + 1} choices`}>
              {question.choices.map((choice, i) => (
                <AnswerChoice
                  key={choice}
                  name={itemId}
                  value={choice}
                  letter={LETTERS[i]}
                  state={mock.answers[itemId] === choice ? 'selected' : 'default'}
                  checked={mock.answers[itemId] === choice}
                  onChange={() => choose(choice)}
                >
                  {choice}
                </AnswerChoice>
              ))}
            </AnswerChoiceGroup>
          </>
        ) : (
          <p className="text-base text-muted-foreground">This item was removed from the question bank. Skip it.</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="h-11 text-base" disabled={index === 0} onClick={() => goTo(index - 1)}>
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <Button variant={flagged ? 'secondary' : 'outline'} className="h-11 text-base" onClick={toggleFlag} aria-pressed={flagged}>
            <Flag data-icon="inline-start" className={flagged ? 'fill-current' : undefined} />
            {flagged ? 'Flagged' : 'Flag'}
          </Button>
          {index < total - 1 ? (
            <Button className="h-11 text-base" onClick={() => goTo(index + 1)}>
              Next
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button className="h-11 text-base" onClick={() => setConfirming(true)}>
              Finish
            </Button>
          )}
        </div>

        {confirming ? (
          <Alert>
            <TriangleAlert />
            <AlertTitle className="text-base">Submit the exam?</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-base">
              <span>
                {answeredCount} of {total} answered, {total - answeredCount} blank, {mock.flags.length} flagged. You
                can't change answers after submitting.
              </span>
              <span className="flex flex-col gap-2 sm:flex-row">
                <Button className="h-11 text-base" onClick={submit}>
                  Submit now
                </Button>
                <Button variant="outline" className="h-11 text-base" onClick={() => setConfirming(false)}>
                  Keep working
                </Button>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <Button variant="ghost" className="h-11 text-base" onClick={() => setConfirming(true)}>
            Submit exam
          </Button>
        )}
      </main>
    </div>
  )
}
