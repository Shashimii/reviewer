// Mock exams: building one from the blend in src/config/exam.json, pacing, and scoring.
import exam from '@/config/exam.json'
import { getPracticeQuestions, getQuestion, getSubject, getTopic, getTopics, type Question } from '@/content'
import { shuffle } from '@/progress/mastery'
import { submitMock, type Attempt, type LearnerData, type MockKind, type MockRecord } from '@/progress/store'

export const PASS_MARK = exam.passingRating / 100
export const MOCK_SUBJECT_IDS = Object.keys(exam.mock.blend)

export function mockSettings(kind: MockKind) {
  return exam.mock[kind]
}

// Items per subject. The half mock scales the blend down, giving leftover items to the
// subjects with the largest remainders so the total is exact.
export function blendFor(kind: MockKind): [subjectId: string, items: number][] {
  const entries = Object.entries(exam.mock.blend)
  const fullTotal = entries.reduce((sum, [, n]) => sum + n, 0)
  const target = exam.mock[kind].items
  const exact = entries.map(([id, n]) => ({ id, value: (n * target) / fullTotal }))
  const counts = exact.map((e) => ({ ...e, count: Math.floor(e.value) }))
  let left = target - counts.reduce((sum, c) => sum + c.count, 0)
  for (const c of [...counts].sort((a, b) => b.value - Math.floor(b.value) - (a.value - Math.floor(a.value)))) {
    if (left-- <= 0) break
    c.count++
  }
  return counts.map((c) => [c.id, c.count])
}

// Picks items subject by subject, preferring questions not used in earlier mocks.
export function createMock(kind: MockKind, learner: LearnerData, now = Date.now()): MockRecord {
  const used = new Set(learner.mocks.flatMap((m) => m.itemIds))
  const itemIds: string[] = []
  for (const [subjectId, count] of blendFor(kind)) {
    const pool = getTopics(subjectId).flatMap((t) => getPracticeQuestions(t.id))
    const fresh = shuffle(pool.filter((q) => !used.has(q.id)))
    const repeats = shuffle(pool.filter((q) => used.has(q.id)))
    itemIds.push(...[...fresh, ...repeats].slice(0, count).map((q) => q.id))
  }
  return {
    id: `mock-${now}`,
    kind,
    itemIds,
    answers: {},
    flags: [],
    itemSeconds: {},
    startedAt: now,
    deadline: now + exam.mock[kind].minutes * 60_000,
  }
}

// Seconds behind the target pace (about 76 s per item). Positive means behind.
export function secondsBehindPace(mock: MockRecord, now: number) {
  const { items, minutes } = exam.mock[mock.kind]
  const target = (minutes * 60) / items
  const used = (Math.min(now, mock.deadline) - mock.startedAt) / 1000
  return used - Object.keys(mock.answers).length * target
}

export function isBehindPace(mock: MockRecord, now: number) {
  return secondsBehindPace(mock, now) > exam.mock.paceWarningMinutes * 60
}

export function isMockActive(mock: MockRecord, now: number) {
  return !mock.submittedAt && now < mock.deadline
}

function subjectOf(question: Question) {
  return getTopic(question.topicId)?.subjectId ?? ''
}

export function scoreMock(mock: MockRecord) {
  const items = mock.itemIds.map(getQuestion).filter((q): q is Question => Boolean(q))
  const isRight = (q: Question) => mock.answers[q.id] === q.answer
  const correct = items.filter(isRight).length
  const score = items.length > 0 ? correct / items.length : 0
  const bySubject = MOCK_SUBJECT_IDS.map((subjectId) => {
    const own = items.filter((q) => subjectOf(q) === subjectId)
    return {
      subjectId,
      name: getSubject(subjectId)?.name ?? subjectId,
      correct: own.filter(isRight).length,
      total: own.length,
      seconds: own.reduce((sum, q) => sum + (mock.itemSeconds[q.id] ?? 0), 0),
    }
  }).filter((s) => s.total > 0)
  const slowest = [...items]
    .sort((a, b) => (mock.itemSeconds[b.id] ?? 0) - (mock.itemSeconds[a.id] ?? 0))
    .slice(0, 5)
    .map((q) => ({ question: q, index: mock.itemIds.indexOf(q.id), seconds: mock.itemSeconds[q.id] ?? 0 }))
  return { items, correct, total: items.length, score, passed: score >= PASS_MARK, bySubject, slowest }
}

// Answered items become attempts when the mock is submitted. Blank items count as wrong in the
// score but are not attempts, since no choice was made.
export function mockAttempts(mock: MockRecord, at: number): Attempt[] {
  return mock.itemIds.flatMap((id) => {
    const question = getQuestion(id)
    const choice = mock.answers[id]
    if (!question || choice === undefined) return []
    return [
      {
        questionId: id,
        topicId: question.topicId,
        choice,
        correct: choice === question.answer,
        seconds: Math.round(mock.itemSeconds[id] ?? 0),
        hintsUsed: 0,
        mode: 'mock' as const,
        at,
      },
    ]
  })
}

// The mock unlocks after one mastered topic in each subject; the learner can override it.
export function mockUnlockStatus(learner: LearnerData) {
  const missing = MOCK_SUBJECT_IDS.filter(
    (subjectId) => !getTopics(subjectId).some((t) => learner.topics[t.id]?.mastered),
  ).map((id) => getSubject(id)?.name ?? id)
  return { unlocked: missing.length === 0, missing }
}

// A mock whose time ran out while the learner was away is submitted as it stood.
export function finalizeExpiredMocks(learner: LearnerData, now: number) {
  for (const mock of learner.mocks) {
    if (!mock.submittedAt && now >= mock.deadline) submitMock(mock.id, mockAttempts(mock, mock.deadline), mock.deadline)
  }
}
