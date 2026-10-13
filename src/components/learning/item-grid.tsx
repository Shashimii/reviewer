import { Flag } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface ItemGridCell {
  answered: boolean
  flagged: boolean
}

// Numbered cells for jumping around a mock exam: blank, answered (filled) or flagged (flag icon).
function ItemGrid({
  cells,
  current,
  onSelect,
  className,
}: {
  cells: ItemGridCell[]
  current: number
  onSelect: (index: number) => void
  className?: string
}) {
  const answered = cells.filter((c) => c.answered).length
  const flagged = cells.filter((c) => c.flagged).length

  return (
    <div data-slot="item-grid" className={cn('flex flex-col gap-3', className)}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary" aria-hidden />
          Answered {answered}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border" aria-hidden />
          Blank {cells.length - answered}
        </li>
        <li className="flex items-center gap-1.5">
          <Flag className="size-3.5" aria-hidden />
          Flagged {flagged}
        </li>
      </ul>
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
        {cells.map((cell, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === current ? 'step' : undefined}
              aria-label={`Item ${i + 1}: ${cell.answered ? 'answered' : 'blank'}${cell.flagged ? ', flagged' : ''}`}
              className={cn(
                'relative flex h-11 w-full items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                cell.answered ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
                i === current && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
              )}
            >
              {i + 1}
              {cell.flagged && (
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-foreground">
                  <Flag className="size-3" aria-hidden />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

export { ItemGrid }
