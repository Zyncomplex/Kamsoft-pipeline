'use client'

import { TaskCard } from './TaskCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { CheckSquare } from 'lucide-react'
import type { TaskWithContextHook } from '@/hooks/useTasks'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface TaskListProps {
  tasks: TaskWithContextHook[]
  loading?: boolean
  onComplete?: (id: string) => void
  emptyMessage?: string
}

export function TaskList({ tasks, loading, onComplete, emptyMessage }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No Tasks Found"
        description={emptyMessage || "You're all caught up! No pending tasks in this category."}
        icon={CheckSquare}
      />
    )
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onComplete={onComplete} />
      ))}
    </div>
  )
}
