// Validates every file under /content against the schema plus the rules that span files.
// Runs before `npm run build`, so a bad record fails the build.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import type { z } from 'zod'
import {
  LessonSchema,
  QuestionSchema,
  SubjectSchema,
  TopicSchema,
  type Lesson,
  type Question,
  type Subject,
  type Topic,
} from '../src/content/schema.ts'

const contentDir = join(import.meta.dirname, '..', 'content')
const errors: string[] = []

function report(file: string, message: string) {
  errors.push(`${relative(process.cwd(), file)}: ${message}`)
}

function jsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort()
}

function load<T>(schema: z.ZodType<T>, file: string): T | undefined {
  let json: unknown
  try {
    // trimStart also drops a byte-order mark, which some Windows editors add
    json = JSON.parse(readFileSync(file, 'utf8').trimStart())
  } catch (error) {
    report(file, `invalid JSON: ${(error as Error).message}`)
    return undefined
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    for (const issue of result.error.issues) {
      report(file, `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    }
    return undefined
  }
  return result.data
}

// Collects records by id, reporting duplicates. Remembers which file each came from.
function index<T extends { id: string }>(entries: [file: string, record: T][], kind: string) {
  const byId = new Map<string, { file: string; record: T }>()
  for (const [file, record] of entries) {
    const existing = byId.get(record.id)
    if (existing) {
      report(file, `duplicate ${kind} id "${record.id}" (also in ${relative(process.cwd(), existing.file)})`)
    } else {
      byId.set(record.id, { file, record })
    }
  }
  return byId
}

const subjectsFile = join(contentDir, 'subjects.json')
const subjects = index<Subject>(
  (load(SubjectSchema.array(), subjectsFile) ?? []).map((s) => [subjectsFile, s]),
  'subject',
)

const topics = index<Topic>(
  jsonFiles(join(contentDir, 'topics')).flatMap((file) =>
    (load(TopicSchema.array(), file) ?? []).map((t): [string, Topic] => [file, t]),
  ),
  'topic',
)

const lessons = index<Lesson>(
  jsonFiles(join(contentDir, 'lessons')).flatMap((file) => {
    const lesson = load(LessonSchema, file)
    return lesson ? [[file, lesson] as [string, Lesson]] : []
  }),
  'lesson',
)

const questions = index<Question>(
  jsonFiles(join(contentDir, 'questions')).flatMap((file) => {
    const question = load(QuestionSchema, file)
    return question ? [[file, question] as [string, Question]] : []
  }),
  'question',
)

// Topics: subject exists, prerequisites exist, order is unique within a subject, no cycles.
const ordersBySubject = new Map<string, Set<number>>()
for (const { file, record: topic } of topics.values()) {
  if (!subjects.has(topic.subjectId)) {
    report(file, `topic "${topic.id}": unknown subjectId "${topic.subjectId}"`)
  }
  for (const prerequisite of topic.prerequisites) {
    if (prerequisite === topic.id) report(file, `topic "${topic.id}" lists itself as a prerequisite`)
    else if (!topics.has(prerequisite)) {
      report(file, `topic "${topic.id}": unknown prerequisite "${prerequisite}"`)
    }
  }
  const orders = ordersBySubject.get(topic.subjectId) ?? new Set()
  if (orders.has(topic.order)) {
    report(file, `topic "${topic.id}": order ${topic.order} is already used in subject "${topic.subjectId}"`)
  }
  ordersBySubject.set(topic.subjectId, orders.add(topic.order))
}

const visiting = new Set<string>()
const visited = new Set<string>()
function findCycle(topicId: string, path: string[]): string[] | undefined {
  if (visiting.has(topicId)) return [...path, topicId]
  if (visited.has(topicId)) return undefined
  visiting.add(topicId)
  for (const prerequisite of topics.get(topicId)?.record.prerequisites ?? []) {
    const cycle = findCycle(prerequisite, [...path, topicId])
    if (cycle) return cycle
  }
  visiting.delete(topicId)
  visited.add(topicId)
  return undefined
}
for (const { file, record: topic } of topics.values()) {
  const cycle = findCycle(topic.id, [])
  if (cycle) {
    report(file, `prerequisite cycle: ${cycle.join(' → ')}`)
    break
  }
}

// Lessons: topic exists, one lesson per topic.
const lessonTopics = new Set<string>()
for (const { file, record: lesson } of lessons.values()) {
  if (!topics.has(lesson.topicId)) report(file, `unknown topicId "${lesson.topicId}"`)
  if (lessonTopics.has(lesson.topicId)) report(file, `topic "${lesson.topicId}" already has a lesson`)
  lessonTopics.add(lesson.topicId)
}

// Questions: file named after the id, topic exists, sourced where the subject requires it.
for (const { file, record: question } of questions.values()) {
  if (basename(file, '.json') !== question.id) {
    report(file, `file name must match the id: rename to ${question.id}.json`)
  }
  const topic = topics.get(question.topicId)?.record
  if (!topic) {
    report(file, `unknown topicId "${question.topicId}"`)
    continue
  }
  if (subjects.get(topic.subjectId)?.record.requiresSource && !question.sourceRef) {
    report(file, `sourceRef: required for subject "${topic.subjectId}"`)
  }
}

if (errors.length > 0) {
  console.error(`Content check failed with ${errors.length} problem(s):\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log(
  `Content OK: ${subjects.size} subjects, ${topics.size} topics, ${lessons.size} lessons, ${questions.size} questions`,
)
