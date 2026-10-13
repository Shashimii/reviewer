import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'

import { QuestionCard } from '@/components/question-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { getQuestion } from '@/content'
import { formatSeconds } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useLearner } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Every mock item with the learner's answer, the correct answer and the full solution.
export function MockReviewPage() {
  const { mockId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const learner = useLearner()
  const mock = learner.mocks.find((m) => m.id === mockId)
  if (!mock) return <NotFoundPage />
  if (!mock.submittedAt) return <Navigate to={`/mock/${mock.id}`} replace />

  const total = mock.itemIds.length
  const wrongOnly = params.get('wrong') === '1'
  const isWrong = (id: string) => mock.answers[id] !== getQuestion(id)?.answer
  const order = mock.itemIds.map((_, i) => i).filter((i) => !wrongOnly || isWrong(mock.itemIds[i]))
  const requested = Number(params.get('item') ?? '1') - 1
  const index = order.includes(requested) ? requested : (order[0] ?? 0)
  const position = order.indexOf(index)
  const itemId = mock.itemIds[index]
  const question = getQuestion(itemId)

  function show(i: number | undefined, wrong = wrongOnly) {
    if (i === undefined) return
    setParams({ item: String(i + 1), ...(wrong ? { wrong: '1' } : {}) })
    window.scrollTo(0, 0)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <div className="flex flex-col gap-3">
        <Link
          to={`/mock/${mock.id}/results`}
          className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Results
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-heading text-base font-semibold">
            Item {index + 1} of {total}
            {mock.itemSeconds[itemId] !== undefined && (
              <span className="font-normal text-muted-foreground"> · {formatSeconds(mock.itemSeconds[itemId])}</span>
            )}
          </h1>
          <Button
            variant="outline"
            className="h-11 px-3 text-base"
            aria-pressed={wrongOnly}
            onClick={() => {
              const next = !wrongOnly
              show(next ? mock.itemIds.findIndex(isWrong) : index, next)
            }}
          >
            {wrongOnly ? 'Show all items' : 'Wrong or blank only'}
          </Button>
        </div>
      </div>

      {order.length === 0 ? (
        <p className="text-base text-muted-foreground">No wrong or blank items. Well done.</p>
      ) : question ? (
        <QuestionCard key={itemId} question={question} mode="practice" review={{ choice: mock.answers[itemId] ?? null }} />
      ) : (
        <p className="text-base text-muted-foreground">This item was removed from the question bank.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11 text-base" disabled={position <= 0} onClick={() => show(order[position - 1])}>
          <ArrowLeft data-icon="inline-start" />
          Previous
        </Button>
        {position < order.length - 1 ? (
          <Button className="h-11 text-base" onClick={() => show(order[position + 1])}>
            Next
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : (
          <Link to={`/mock/${mock.id}/results`} className={cn(buttonVariants(), 'h-11 text-base')}>
            Done
          </Link>
        )}
      </div>
    </main>
  )
}
