// Loads the JSON content bundled with the app. Records are validated at build time by
// `npm run content:check`, so they are trusted here and the zod schema stays out of the bundle.
import subjectsJson from '../../content/subjects.json'
import type { Question, Subject, Topic } from './schema'

export type { Lesson, Question, Solution, Subject, Topic } from './schema'

const topicFiles = import.meta.glob<Topic[]>('/content/topics/*.json', {
  eager: true,
  import: 'default',
})
const questionFiles = import.meta.glob<Question>('/content/questions/**/*.json', {
  eager: true,
  import: 'default',
})

const subjects = subjectsJson as Subject[]
const topics = Object.values(topicFiles).flat()
const questions = Object.values(questionFiles)

const subjectsById = new Map(subjects.map((s) => [s.id, s]))
const topicsById = new Map(topics.map((t) => [t.id, t]))
const questionsById = new Map(questions.map((q) => [q.id, q]))

export function getSubject(id: string) {
  return subjectsById.get(id)
}

export function getTopic(id: string) {
  return topicsById.get(id)
}

export function getQuestion(id: string) {
  return questionsById.get(id)
}
