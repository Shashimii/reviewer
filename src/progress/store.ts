// Learner progress, saved on this device. v1 keeps it in localStorage; moving to IndexedDB
// (the spec's choice) or cloud sync later only changes this module.
import { useSyncExternalStore } from 'react'

export type Mode = 'guided' | 'practice' | 'mastery' | 'review' | 'quick' | 'diagnostic' | 'mock'
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

export interface Profile {
  examDate?: string // yyyy-mm-dd
  dailyMinutes?: number
  onboardedAt?: number
}

// Foundations basics check: correct answers per Foundations topic.
export interface DiagnosticResult {
  takenAt: number
  scores: Record<string, { correct: number; total: number }>
}

export type MockKind = 'full' | 'half'

// A mock exam. The item order is frozen when it starts; the timer runs on the wall clock,
// so closing the app does not pause it (as on exam day).
export interface MockRecord {
  id: string
  kind: MockKind
  itemIds: string[]
  answers: Record<string, string>
  flags: string[]
  itemSeconds: Record<string, number>
  startedAt: number
  deadline: number
  submittedAt?: number
}

export interface LearnerData {
  version: 1
  attempts: Attempt[]
  topics: Record<string, TopicRecord>
  reviews: Record<string, ReviewItem>
  profile: Profile
  diagnostic?: DiagnosticResult
  mocks: MockRecord[]
}

const STORAGE_KEY = 'cse-reviewer:learner'
const DAY_MS = 24 * 60 * 60 * 1000
// A wrong answer comes back after 1 day, then 3, then 7. Missing it again starts over.
const REVIEW_INTERVALS = [1, 3, 7]

const EMPTY: LearnerData = { version: 1, attempts: [], topics: {}, reviews: {}, profile: {}, mocks: [] }

function load(): LearnerData {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    // Fields added after Phase 1 start empty for older saves.
    if (saved?.version === 1) return { ...EMPTY, ...saved }
  } catch {
    // Storage blocked or unreadable: start fresh.
  }
  return EMPTY
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

function withAttempts(base: LearnerData, attempts: Attempt[]): LearnerData {
  const reviews = { ...base.reviews }
  for (const attempt of attempts) {
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
  }
  return { ...base, attempts: [...base.attempts, ...attempts], reviews }
}

export function recordAttempt(attempt: Attempt) {
  save(withAttempts(data, [attempt]))
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

export function updateProfile(patch: Partial<Profile>) {
  save({ ...data, profile: { ...data.profile, ...patch } })
}

export function recordDiagnostic(result: DiagnosticResult) {
  save({ ...data, diagnostic: result })
}

export function startMock(mock: MockRecord) {
  save({ ...data, mocks: [...data.mocks, mock] })
}

export function updateMock(id: string, patch: Partial<MockRecord>) {
  save({ ...data, mocks: data.mocks.map((m) => (m.id === id && !m.submittedAt ? { ...m, ...patch } : m)) })
}

// Ends the mock and records each answered item as an attempt, so wrong answers reach the Mistakes deck.
export function submitMock(id: string, attempts: Attempt[], at: number) {
  const mocks = data.mocks.map((m) => (m.id === id && !m.submittedAt ? { ...m, submittedAt: at } : m))
  save(withAttempts({ ...data, mocks }, attempts))
}
