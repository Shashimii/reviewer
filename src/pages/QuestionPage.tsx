import { useParams } from 'react-router'

import { QuestionCard } from '@/components/question-card'
import { getQuestion, getSubject, getTopic } from '@/content'
import { recordAttempt } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

// A single question in guided mode, e.g. linked from the home page or a mastery check review.
export function QuestionPage() {
  const { questionId = '' } = useParams()
  const question = getQuestion(questionId)
  if (!question) return <NotFoundPage />

  const topic = getTopic(question.topicId)
  const subject = topic && getSubject(topic.subjectId)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:py-10">
      <div>
        <h1 className="font-heading text-base font-semibold">Guided practice</h1>
        <p className="text-sm text-muted-foreground">
          {[subject?.name, topic?.name].filter(Boolean).join(' · ')}
        </p>
      </div>
      <QuestionCard
        // Keyed so moving to another question starts with fresh state.
        key={question.id}
        question={question}
        mode="guided"
        onAnswered={(result) =>
          recordAttempt({
            questionId: question.id,
            topicId: question.topicId,
            ...result,
            mode: 'guided',
            at: Date.now(),
          })
        }
      />
    </main>
  )
}
