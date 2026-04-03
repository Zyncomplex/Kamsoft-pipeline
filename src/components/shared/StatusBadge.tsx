import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  items: { value: string; label: string; color: string }[]
  className?: string
}

export function StatusBadge({ status, items, className }: StatusBadgeProps) {
  const config = items.find((item) => item.value === status) || {
    label: status,
    color: 'bg-slate-500',
  }

  return (
    <Badge className={cn("capitalize border-none text-white", config.color, className)}>
      {config.label}
    </Badge>
  )
}
