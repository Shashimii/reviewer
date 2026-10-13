import { ArrowLeft, ArrowRight } from 'lucide-react'
import { marked } from 'marked'
import { Link, useNavigate, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLesson, getTopic } from '@/content'
import { completeStep } from '@/progress/store'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function LessonPage() {
  const { topicId = '' } = useParams()
  const navigate = useNavigate()
  const topic = getTopic(topicId)
  const lesson = getLesson(topicId)
  if (!topic || !lesson) return <NotFoundPage />

  function finish() {
    completeStep(topicId, 'lesson')
    navigate(`/topics/${topicId}/example`)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-6 md:py-10">
      <div className="flex flex-col gap-2">
        <Link
          to={`/topics/${topicId}`}
          className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {topic.name}
        </Link>
        <p className="text-sm font-medium text-muted-foreground">Lesson</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{topic.name}</h1>
      </div>

      {lesson.glossaryTerms.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Words to know</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3">
              {lesson.glossaryTerms.map((g) => (
                <div key={g.term}>
                  <dt className="text-base font-semibold">{g.term}</dt>
                  <dd className="text-base">{g.definition}</dd>
                  {g.taglish && <dd className="text-sm text-muted-foreground italic">{g.taglish}</dd>}
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {lesson.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-semibold">{section.heading}</h2>
          <div
            className="prose prose-neutral max-w-none text-base dark:prose-invert prose-p:leading-relaxed prose-table:text-base"
            // Lesson Markdown is our own content, checked at build time.
            dangerouslySetInnerHTML={{ __html: marked.parse(section.body, { async: false }) }}
          />
        </section>
      ))}

      <Button className="h-11 text-base" onClick={finish}>
        Next: worked example
        <ArrowRight data-icon="inline-end" />
      </Button>
    </main>
  )
}
