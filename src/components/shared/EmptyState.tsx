import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center min-h-[400px]">
      <div className="flex flex-col items-center gap-1 text-center">
        {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>
        {action}
        {!action && actionLabel && actionHref && (
          <Button render={<Link href={actionHref} />}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
