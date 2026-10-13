import { Link } from 'react-router'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-base text-muted-foreground">
        This page doesn't exist, or the question was removed.
      </p>
      <Link to="/" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
        Back to home
      </Link>
    </main>
  )
}
