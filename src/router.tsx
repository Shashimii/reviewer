import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { ExamplePage } from '@/pages/ExamplePage'
import { IndexPage } from '@/pages/IndexPage'
import { LearnPage } from '@/pages/LearnPage'
import { LessonPage } from '@/pages/LessonPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { QuestionPage } from '@/pages/QuestionPage'
import { MistakesPage, QuickPracticePage, TopicSessionPage } from '@/pages/SessionPage'
import { TopicPage } from '@/pages/TopicPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'topics/:topicId', element: <TopicPage /> },
      { path: 'topics/:topicId/lesson', element: <LessonPage /> },
      { path: 'topics/:topicId/example', element: <ExamplePage /> },
      { path: 'topics/:topicId/guided', element: <TopicSessionPage kind="guided" /> },
      { path: 'topics/:topicId/practice', element: <TopicSessionPage kind="practice" /> },
      { path: 'topics/:topicId/mastery', element: <TopicSessionPage kind="mastery" /> },
      { path: 'mistakes', element: <MistakesPage /> },
      { path: 'quick', element: <QuickPracticePage /> },
      { path: 'questions/:questionId', element: <QuestionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
