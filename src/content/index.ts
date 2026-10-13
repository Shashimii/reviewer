// Loads the JSON content bundled with the app. Records are validated at build time by
// `npm run content:check`, so they are trusted here and the zod schema stays out of the bundle.
// Drafts are included until reviewers start marking questions live.
import subjectsJson from '../../content/subjects.json'
import type { Lesson, Question, Subject, Topic } from './schema'

export type { Lesson, Question, Solution, Subject, Topic } from './schema'

const topicFiles = import.meta.glob<Topic[]>('/content/topics/*.json', {
  eager: true,
  import: 'default',
})
const lessonFiles = import.meta.glob<Lesson>('/content/lessons/*.json', {
  eager: true,
  import: 'default',
})
const questionFiles = import.meta.glob<Question>('/content/questions/**/*.json', {
  eager: true,
  import: 'default',
})

const subjects = subjectsJson as Subject[]
const topics = Object.values(topicFiles)
  .flat()
  .sort((a, b) => a.order - b.order)
const lessons = Object.values(lessonFiles)
const questions = Object.values(questionFiles).sort((a, b) => a.id.localeCompare(b.id))

const subjectsById = new Map(subjects.map((s) => [s.id, s]))
const topicsById = new Map(topics.map((t) => [t.id, t]))
const lessonsByTopic = new Map(lessons.map((l) => [l.topicId, l]))
const questionsById = new Map(questions.map((q) => [q.id, q]))

export function getSubjects() {
  return subjects
}

export function getSubject(id: string) {
  return subjectsById.get(id)
}

export function getTopics(subjectId: string) {
  return topics.filter((t) => t.subjectId === subjectId)
}

export function getTopic(id: string) {
  return topicsById.get(id)
}

export function getLesson(topicId: string) {
  return lessonsByTopic.get(topicId)
}

export function getQuestion(id: string) {
  return questionsById.get(id)
}

// Questions a learner practises on: every question in the topic except the worked example,
// which they have already seen solved.
export function getPracticeQuestions(topicId: string) {
  const exampleId = lessonsByTopic.get(topicId)?.workedExampleId
  return questions.filter((q) => q.topicId === topicId && q.id !== exampleId)
}
