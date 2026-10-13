import { HomePage } from '@/pages/HomePage'
import { IndexPage } from '@/pages/IndexPage'
import { useLearner } from '@/progress/store'

// New visitors see the landing page; anyone who has started sees their home screen.
export function HomeOrLanding() {
  const learner = useLearner()
  const started = Boolean(learner.profile.onboardedAt) || learner.attempts.length > 0
  return started ? <HomePage /> : <IndexPage />
}
