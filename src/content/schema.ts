// Content schema: the shape of every JSON file under /content.
// `npm run content:check` validates the files against it and fails the build on a bad record.
import { z } from 'zod'

const id = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase-kebab-case, e.g. "num-number-series"')

const text = z.string().trim().min(1)

export const SubjectSchema = z.object({
  id,
  name: text,
  language: z.enum(['en', 'fil']),
  // Every question in this subject must cite a primary source (General Information).
  requiresSource: z.boolean().optional(),
})

export const TopicSchema = z.object({
  id,
  subjectId: id,
  name: text,
  order: z.number().int().positive(),
  prerequisites: z.array(id),
  methodName: text.optional(),
})

export const LessonSchema = z.object({
  id,
  topicId: id,
  sections: z
    .array(
      z.object({
        heading: text,
        body: text, // markdown
        diagram: text.optional(),
      }),
    )
    .min(1),
  glossaryTerms: z.array(
    z.object({
      term: text,
      definition: text,
      taglish: text.optional(),
    }),
  ),
})

export const SolutionSchema = z.object({
  methodName: text,
  steps: z
    .array(
      z.object({
        action: text,
        why: text.optional(),
      }),
    )
    .min(1),
})

export const QuestionSchema = z
  .object({
    id,
    topicId: id,
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    stem: text,
    choices: z.array(text).min(2).max(5),
    answer: text,
    hints: z.tuple([text, text, text]),
    solution: SolutionSchema,
    trapNotes: z.record(z.string(), text).optional(),
    sourceRef: z
      .object({
        citation: text,
        url: z.url().optional(),
      })
      .optional(),
    status: z.enum(['draft', 'in-review', 'live']),
    authorId: text,
    reviewerId: text.optional(),
    version: z.number().int().positive(),
  })
  .superRefine((q, ctx) => {
    if (new Set(q.choices).size !== q.choices.length) {
      ctx.addIssue({ code: 'custom', path: ['choices'], message: 'Choices must be unique' })
    }
    if (!q.choices.includes(q.answer)) {
      ctx.addIssue({ code: 'custom', path: ['answer'], message: 'Answer must be one of the choices' })
    }
    for (const choice of Object.keys(q.trapNotes ?? {})) {
      if (!q.choices.includes(choice)) {
        ctx.addIssue({ code: 'custom', path: ['trapNotes', choice], message: 'Not one of the choices' })
      } else if (choice === q.answer) {
        ctx.addIssue({ code: 'custom', path: ['trapNotes', choice], message: 'The answer cannot have a trap note' })
      }
    }
    // Two-person review: nothing goes live without a reviewer who isn't the author.
    if (q.status === 'live' && !q.reviewerId) {
      ctx.addIssue({ code: 'custom', path: ['reviewerId'], message: 'A live question needs a reviewer' })
    }
    if (q.reviewerId && q.reviewerId === q.authorId) {
      ctx.addIssue({ code: 'custom', path: ['reviewerId'], message: 'The reviewer must not be the author' })
    }
  })

export type Subject = z.infer<typeof SubjectSchema>
export type Topic = z.infer<typeof TopicSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Solution = z.infer<typeof SolutionSchema>
export type Question = z.infer<typeof QuestionSchema>
