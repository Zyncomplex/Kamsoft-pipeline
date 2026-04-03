import { EmptyState } from '@/components/shared/EmptyState'
import { CheckSquare } from 'lucide-react'

export default function TasksPage() {
  return (
    <EmptyState
      title="Tasks & Follow-ups"
      description="Your operational task list will appear here. Track your pending, today, and overdue activities."
      actionLabel="Add Task"
      actionHref="/tasks/new"
      icon={CheckSquare}
    />
  )
}
