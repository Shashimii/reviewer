import { GraduationCap } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'

import { finalizeExpiredMocks } from '@/progress/mock'
import { getLearner } from '@/progress/store'

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/mock', label: 'Mock' },
  { to: '/progress', label: 'Progress' },
]

export function AppShell() {
  // Submit any mock whose time ran out while the app was closed.
  useEffect(() => {
    finalizeExpiredMocks(getLearner(), Date.now())
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 px-4">
          <Link to="/" className="flex min-h-11 items-center gap-2 rounded-md" aria-label="CSE Reviewer home">
            <GraduationCap className="size-6" aria-hidden />
            <span className="hidden font-heading text-base font-semibold sm:inline">CSE Reviewer</span>
          </Link>
          <nav aria-label="Main" className="flex items-center">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="flex min-h-11 items-center rounded-md px-3 text-base font-medium text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}
