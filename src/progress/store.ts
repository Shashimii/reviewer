// Learner progress, saved on this device. v1 keeps it in localStorage; moving to IndexedDB
// (the spec's choice) or cloud sync later only changes this module.
import { useSyncExternalStore } from 'react'

export type Mode = 'guided' | 'practice' | 'mastery' | 'review' | 'quick'
export type StepId = 'lesson' | 'example' | 'guided' | 'practice' | 'mastery'

export interface Attempt {
  questionId: string
  topicId: string
  choice: string
  correct: boolean
  seconds: number
  hintsUsed: number
  mode: Mode
  at: number
}

export interface TopicRecord {
  completed: StepId[]
  mastered: boolean
  lastMasteryScore?: number
}

// A card in the Mistakes deck.
export interface ReviewItem {
  questionId: string
  dueAt: number
  intervalDays: number
}

export interface LearnerData {
  version: 1
  attempts: Attempt[]
  topics: Record<string, TopicRecord>
  reviews: Record<string, ReviewItem>
}

const STORAGE_KEY = 'cse-reviewer:learner'
const DAY_MS = 24 * 60 * 60 * 1000
// A wrong answer comes back after 1 day, then 3, then 7. Missing it again starts over.
const REVIEW_INTERVALS = [1, 3, 7]

function load(): LearnerData {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.version === 1) return saved
  } catch {
    // Storage blocked or unreadable: start fresh.
  }
  return { version: 1, attempts: [], topics: {}, reviews: {} }
}

let data = load()
const listeners = new Set<() => void>()

function save(next: LearnerData) {
  data = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked: keep progress for this session only.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Another tab saved progress: pick it up.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  data = load()
  for (const listener of listeners) listener()
})

export function useLearner() {
  return useSyncExternalStore(subscribe, () => data)
}

export function getLearner() {
  return data
}

export function recordAttempt(attempt: Attempt) {
  const reviews = { ...data.reviews }
  const card = reviews[attempt.questionId]
  if (!attempt.correct) {
    reviews[attempt.questionId] = {
      questionId: attempt.questionId,
      dueAt: attempt.at + REVIEW_INTERVALS[0] * DAY_MS,
      intervalDays: REVIEW_INTERVALS[0],
    }
  } else if (card && attempt.mode === 'review') {
    const next = REVIEW_INTERVALS[REVIEW_INTERVALS.indexOf(card.intervalDays) + 1]
    if (next) reviews[attempt.questionId] = { ...card, intervalDays: next, dueAt: attempt.at + next * DAY_MS }
    else delete reviews[attempt.questionId]
  }
  save({ ...data, attempts: [...data.attempts, attempt], reviews })
}

function topicRecord(topicId: string): TopicRecord {
  return data.topics[topicId] ?? { completed: [], mastered: false }
}

export function completeStep(topicId: string, step: StepId) {
  const record = topicRecord(topicId)
  if (record.completed.includes(step)) return
  save({
    ...data,
    topics: { ...data.topics, [topicId]: { ...record, completed: [...record.completed, step] } },
  })
}

export function recordMasteryCheck(topicId: string, score: number, passed: boolean) {
  const record = topicRecord(topicId)
  const completed: StepId[] =
    passed && !record.completed.includes('mastery') ? [...record.completed, 'mastery'] : record.completed
  save({
    ...data,
    topics: {
      ...data.topics,
      [topicId]: { completed, mastered: record.mastered || passed, lastMasteryScore: score },
    },
  })
}
