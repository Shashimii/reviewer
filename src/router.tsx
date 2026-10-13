import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { IndexPage } from '@/pages/IndexPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { QuestionPage } from '@/pages/QuestionPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'questions/:questionId', element: <QuestionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
