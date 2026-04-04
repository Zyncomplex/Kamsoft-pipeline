'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { TaskWithContextHook } from '@/hooks/useTasks'
import { completeTaskAction } from '@/app/(dashboard)/tasks/actions'
import { TASK_PRIORITIES } from '@/lib/constants'
import { toast } from 'sonner'
import Link from 'next/link'
import { Clock, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: any // Using any to avoid hook dependency loop for now
  onComplete?: (id: string) => void
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    const result = await completeTaskAction(task.id)
    
    if ('message' in result) {
      toast.error(result.message)
      setIsCompleting(false)
    } else {
      toast.success('Task completed')
      onComplete?.(task.id)
    }
  }

  return (
    <Card className={cn(
      "hover:border-primary/50 transition-all shadow-none border-border/50",
      isCompleting && "opacity-50 pointer-events-none grayscale"
    )}>
      <CardContent className="p-4 flex items-start gap-4">
        <Checkbox 
          id={`task-${task.id}`}
          checked={task.status === 'done'}
          onCheckedChange={handleComplete}
          disabled={task.status === 'done' || isCompleting}
          className="mt-1 h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
        
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <h4 className={cn(
              "font-medium transition-all line-clamp-2",
              task.status === 'done' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
            <StatusBadge 
              status={task.priority} 
              items={TASK_PRIORITIES} 
              className="text-[10px] h-5"
            />
          </div>

          {(task.deal_name || task.due_date) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {task.deal_name && (
                <Link 
                  href={`/deals/${task.deal_id}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                >
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="truncate">{task.deal_name}</span>
                </Link>
              )}

              {task.due_date && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <DateDisplay date={task.due_date} />
                </div>
              )}
            </div>
          )}

          {task.assigned_to_name && (
            <p className="text-[10px] text-muted-foreground italic">
              assigned to {task.assigned_to_name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
