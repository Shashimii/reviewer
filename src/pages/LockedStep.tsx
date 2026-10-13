import { Lock } from 'lucide-react'
import { Link } from 'react-router'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LockedStep({ topicId, message }: { topicId: string; message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-16">
      <Lock className="size-6 text-muted-foreground" aria-hidden />
      <h1 className="font-heading text-2xl font-semibold tracking-tight">This step is locked</h1>
      <p className="text-base text-muted-foreground">{message}</p>
      <Link to={`/topics/${topicId}`} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 text-base')}>
        Back to the topic
      </Link>
    </main>
  )
}
