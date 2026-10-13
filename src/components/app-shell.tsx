import { GraduationCap } from 'lucide-react'
import { Link, Outlet, ScrollRestoration } from 'react-router'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
          <Link to="/" className="flex min-h-11 items-center gap-2 rounded-md">
            <GraduationCap className="size-6" aria-hidden />
            <span className="font-heading text-base font-semibold">CSE Reviewer</span>
          </Link>
        </div>
      </header>
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}
