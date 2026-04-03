import { formatDate } from '@/lib/utils'

export function DateDisplay({ date }: { date: string | Date | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>
  return <span>{formatDate(date)}</span>
}
