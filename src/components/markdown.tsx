import { marked } from 'marked'

import { cn } from '@/lib/utils'

// Renders our own Markdown content (lessons, passages, tables), which is checked at build time.
export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-neutral max-w-none text-base dark:prose-invert prose-p:leading-relaxed prose-table:text-base',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: marked.parse(source, { async: false }) }}
    />
  )
}
