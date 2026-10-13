// Readiness, streaks, weak areas and the next best step, kept in one module so they can be tuned.
import exam from '@/config/exam.json'
import { getLesson, getSubjects, getTopic, getTopics } from '@/content'
import { dueReviews, nextStep, STEPS, topicStats } from '@/progress/mastery'
import { isMockActive, MOCK_SUBJECT_IDS, mockUnlockStatus, scoreMock } from '@/progress/mock'
import type { LearnerData } from '@/progress/store'

const DAY_MS = 24 * 60 * 60 * 1000
const MOCK_WEIGHT = 0.7
const WEAK_MIN_ATTEMPTS = 5
const WEAK_ACCURACY = 0.6

// Chance of guessing right with 4 choices: the estimate for a topic not studied yet.
const GUESS_RATE = 0.25

// Estimated score (0–1): mostly the last 3 mocks, plus accuracy across the exam topics,
// weighted by the mock blend. Topics not studied yet count as guessing. Without a mock it is
// accuracy alone. A target to aim for, not a promise.
export function readiness(learner: LearnerData) {
  const blend = Object.entries(exam.mock.blend)
  const totalItems = blend.reduce((sum, [, n]) => sum + n, 0)
  let studied = false
  const topicScore = blend.reduce((sum, [subjectId, items]) => {
    const topics = getTopics(subjectId)
    if (topics.length === 0) return sum + (items / totalItems) * GUESS_RATE
    const subjectScore =
      topics.reduce((acc, t) => {
        const stats = topicStats(learner.attempts, t.id)
        if (stats) studied = true
        return acc + (stats?.accuracy ?? GUESS_RATE)
      }, 0) / topics.length
    return sum + (items / totalItems) * subjectScore
  }, 0)
  const mockScores = learner.mocks
    .filter((m) => m.submittedAt)
    .slice(-3)
    .map((m) => scoreMock(m).score)
  if (mockScores.length > 0) {
    const mockAvg = mockScores.reduce((a, b) => a + b, 0) / mockScores.length
    return { value: MOCK_WEIGHT * mockAvg + (1 - MOCK_WEIGHT) * topicScore, basis: 'mocks' as const }
  }
  if (studied) return { value: topicScore, basis: 'topics' as const }
  return { value: 0, basis: 'none' as const }
}

export function dayKey(time: number) {
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function secondsByDay(learner: LearnerData) {
  const days = new Map<string, number>()
  for (const a of learner.attempts) days.set(dayKey(a.at), (days.get(dayKey(a.at)) ?? 0) + a.seconds)
  return days
}

// Days in a row with at least one answer, counting back from today (or yesterday, if today
// has no answers yet).
export function studyStreak(learner: LearnerData, now: number) {
  const days = secondsByDay(learner)
  let day = days.has(dayKey(now)) ? now : now - DAY_MS
  let streak = 0
  while (days.has(dayKey(day))) {
    streak++
    day -= DAY_MS
  }
  return streak
}

export function minutesByDay(learner: LearnerData, now: number, count = 7) {
  const days = secondsByDay(learner)
  return Array.from({ length: count }, (_, i) => {
    const time = now - (count - 1 - i) * DAY_MS
    return {
      key: dayKey(time),
      label: new Date(time).toLocaleDateString('en-PH', { weekday: 'short' }),
      minutes: Math.round((days.get(dayKey(time)) ?? 0) / 60),
    }
  })
}

// The topics with the lowest recent accuracy, among those with enough answers to judge.
export function weakAreas(learner: LearnerData, count = 3) {
  return getSubjects()
    .flatMap((s) => getTopics(s.id))
    .map((topic) => ({ topic, stats: topicStats(learner.attempts, topic.id) }))
    .filter((t): t is { topic: typeof t.topic; stats: NonNullable<typeof t.stats> } =>
      Boolean(t.stats && t.stats.count >= WEAK_MIN_ATTEMPTS),
    )
    .sort((a, b) => a.stats.accuracy - b.stats.accuracy)
    .slice(0, count)
}

export interface NextBestStep {
  title: string
  description: string
  to: string
  action: string
}

export function nextBestStep(learner: LearnerData, now: number): NextBestStep {
  const activeMock = learner.mocks.find((m) => isMockActive(m, now))
  if (activeMock) {
    return {
      title: 'Finish your mock exam',
      description: 'The timer keeps running while you are away, just like on exam day.',
      to: `/mock/${activeMock.id}`,
      action: 'Go back to the exam',
    }
  }

  const due = dueReviews(learner.reviews, now).length
  if (due > 0) {
    return {
      title: `Review ${due} ${due === 1 ? 'mistake' : 'mistakes'}`,
      description: 'Questions you got wrong are due again. Reviewing them now helps them stick.',
      to: '/mistakes',
      action: 'Start review',
    }
  }

  // The unfinished topic you touched most recently.
  const lastTouched = new Map<string, number>()
  for (const a of learner.attempts) lastTouched.set(a.topicId, a.at)
  const inProgress = Object.entries(learner.topics)
    .filter(([id, record]) => !record.mastered && record.completed.length > 0 && getTopic(id))
    .sort(([a], [b]) => (lastTouched.get(b) ?? 0) - (lastTouched.get(a) ?? 0))[0]
  if (inProgress) {
    const [topicId, record] = inProgress
    const step = STEPS.find((s) => s.id === nextStep(record))!
    return {
      title: `Continue ${getTopic(topicId)!.name}`,
      description: `Next: ${step.title.toLowerCase()}. ${step.description}`,
      to: `/topics/${topicId}/${step.id}`,
      action: 'Continue',
    }
  }

  if (learner.attempts.length === 0 && !learner.diagnostic) {
    return {
      title: 'Check your basics',
      description: '15 quick questions show whether a short refresher on the basics would help first.',
      to: '/diagnostic',
      action: 'Start the basics check',
    }
  }

  const weak = weakAreas(learner, 1)[0]
  if (weak && weak.stats.accuracy < WEAK_ACCURACY && getLesson(weak.topic.id)) {
    return {
      title: `Fix ${weak.topic.name}`,
      description: `You get ${Math.round(weak.stats.accuracy * 100)}% right here. Read the lesson again, then practise.`,
      to: `/topics/${weak.topic.id}/lesson`,
      action: 'Fix this',
    }
  }

  // Refreshers the basics check flagged come first, then the curriculum in order.
  const flagged = Object.entries(learner.diagnostic?.scores ?? {})
    .filter(([, s]) => s.correct / s.total < 2 / 3)
    .map(([id]) => id)
  const candidates = [
    ...flagged.map(getTopic).filter((t) => t !== undefined),
    ...MOCK_SUBJECT_IDS.flatMap(getTopics),
  ]
  const next = candidates.find((t) => !learner.topics[t.id]?.completed.length && getLesson(t.id))
  const lastMock = learner.mocks.filter((m) => m.submittedAt).at(-1)
  const mockDue = !lastMock || now - lastMock.submittedAt! > 7 * DAY_MS
  if (mockUnlockStatus(learner).unlocked && mockDue) {
    return {
      title: 'Take a mock exam',
      description: 'You have mastered a topic in every subject. A timed mock shows where you stand.',
      to: '/mock',
      action: 'Go to mock exams',
    }
  }
  if (next) {
    return {
      title: `Start ${next.name}`,
      description: flagged.includes(next.id)
        ? 'Your basics check suggests a short refresher here first.'
        : 'The next topic in the curriculum.',
      to: `/topics/${next.id}`,
      action: 'Start',
    }
  }
  return {
    title: 'Quick practice',
    description: '10 questions from the topics you have mastered.',
    to: '/quick',
    action: 'Start',
  }
}
