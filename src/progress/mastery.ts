// Mastery rules and question picking, kept in one module so they can be tuned.
import type { Question } from '@/content'
import type { Attempt, LearnerData, ReviewItem, StepId, TopicRecord } from '@/progress/store'

export const MASTERY_PASS = 0.8
export const ACCURACY_WINDOW = 20

export const SESSION_SIZE = {
  guided: 5,
  practice: 5,
  mastery: 10,
  review: 10,
  quick: 10,
} as const

export const STEPS: { id: StepId; title: string; description: string }[] = [
  { id: 'lesson', title: 'Lesson', description: 'A short explanation in plain words.' },
  { id: 'example', title: 'Worked example', description: 'One question solved step by step.' },
  { id: 'guided', title: 'Guided practice', description: 'Questions with up to three hints.' },
  { id: 'practice', title: 'Independent practice', description: 'No hints. Full solution after each answer.' },
  { id: 'mastery', title: 'Mastery check', description: 'Mixed questions. Score 80% to master the topic.' },
]

export type TopicState = 'not-started' | 'learning' | 'practising' | 'mastered'

export function topicState(record: TopicRecord | undefined): TopicState {
  if (!record || record.completed.length === 0) return 'not-started'
  if (record.mastered) return 'mastered'
  if (record.completed.includes('guided')) return 'practising'
  return 'learning'
}

// Steps unlock in order: each one needs the step before it.
export function isStepUnlocked(record: TopicRecord | undefined, step: StepId) {
  const index = STEPS.findIndex((s) => s.id === step)
  return index === 0 || Boolean(record?.completed.includes(STEPS[index - 1].id))
}

export function nextStep(record: TopicRecord | undefined): StepId {
  return STEPS.find((s) => !record?.completed.includes(s.id))?.id ?? 'mastery'
}

// Accuracy and pace over the topic's most recent attempts.
export function topicStats(attempts: Attempt[], topicId: string) {
  const recent = attempts.filter((a) => a.topicId === topicId).slice(-ACCURACY_WINDOW)
  if (recent.length === 0) return undefined
  return {
    accuracy: recent.filter((a) => a.correct).length / recent.length,
    avgSeconds: recent.reduce((sum, a) => sum + a.seconds, 0) / recent.length,
    count: recent.length,
  }
}

export function dueReviews(reviews: Record<string, ReviewItem>, now: number) {
  return Object.values(reviews)
    .filter((r) => r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
}

export function masteredTopicIds(learner: LearnerData) {
  return Object.entries(learner.topics)
    .filter(([, record]) => record.mastered)
    .map(([topicId]) => topicId)
}

export function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Picks `count` questions, mixing skills and preferring the ones answered least often.
export function pickQuestions(pool: Question[], count: number, attempts: Attempt[]) {
  const timesSeen = new Map<string, number>()
  for (const a of attempts) timesSeen.set(a.questionId, (timesSeen.get(a.questionId) ?? 0) + 1)

  const bySkill = new Map<string, Question[]>()
  for (const q of shuffle(pool)) bySkill.set(q.skill, [...(bySkill.get(q.skill) ?? []), q])
  const queues = shuffle([...bySkill.values()]).map((qs) =>
    qs.sort((a, b) => (timesSeen.get(a.id) ?? 0) - (timesSeen.get(b.id) ?? 0)),
  )

  const picked: Question[] = []
  while (picked.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift()
      if (next && picked.length < count) picked.push(next)
    }
  }
  return picked
}

export const STATE_LABELS: Record<TopicState, string> = {
  'not-started': 'Not started',
  learning: 'Learning',
  practising: 'Practising',
  mastered: 'Mastered',
}
