import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { ExamplePage } from '@/pages/ExamplePage'
import { HomeOrLanding } from '@/pages/HomeOrLanding'
import { LearnPage } from '@/pages/LearnPage'
import { LessonPage } from '@/pages/LessonPage'
import { MockExamPage } from '@/pages/MockExamPage'
import { MockPage } from '@/pages/MockPage'
import { MockResultsPage } from '@/pages/MockResultsPage'
import { MockReviewPage } from '@/pages/MockReviewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { QuestionPage } from '@/pages/QuestionPage'
import { DiagnosticPage, MistakesPage, QuickPracticePage, TopicSessionPage } from '@/pages/SessionPage'
import { SubjectPage } from '@/pages/SubjectPage'
import { TopicPage } from '@/pages/TopicPage'
import { WelcomePage } from '@/pages/WelcomePage'

export const router = createBrowserRouter([
  // The exam screen strips the app's navigation, as the spec asks.
  { path: 'mock/:mockId', element: <MockExamPage /> },
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeOrLanding /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'diagnostic', element: <DiagnosticPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'subjects/:subjectId', element: <SubjectPage /> },
      { path: 'topics/:topicId', element: <TopicPage /> },
      { path: 'topics/:topicId/lesson', element: <LessonPage /> },
      { path: 'topics/:topicId/example', element: <ExamplePage /> },
      { path: 'topics/:topicId/guided', element: <TopicSessionPage kind="guided" /> },
      { path: 'topics/:topicId/practice', element: <TopicSessionPage kind="practice" /> },
      { path: 'topics/:topicId/mastery', element: <TopicSessionPage kind="mastery" /> },
      { path: 'mistakes', element: <MistakesPage /> },
      { path: 'quick', element: <QuickPracticePage /> },
      { path: 'mock', element: <MockPage /> },
      { path: 'mock/:mockId/results', element: <MockResultsPage /> },
      { path: 'mock/:mockId/review', element: <MockReviewPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'questions/:questionId', element: <QuestionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
