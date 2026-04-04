import { timeAgo } from '@/lib/utils'
import { 
  PlusCircle, 
  ArrowRightCircle, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  activities: any[]
}

const EVENT_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
  deal_created: { icon: PlusCircle, color: 'text-blue-500', label: 'created the deal' },
  deal_stage_changed: { icon: ArrowRightCircle, color: 'text-purple-500', label: 'changed stage' },
  deal_updated: { icon: FileText, color: 'text-slate-500', label: 'updated deal details' },
  task_created: { icon: PlusCircle, color: 'text-cyan-500', label: 'created a task' },
  task_completed: { icon: CheckCircle2, color: 'text-emerald-500', label: 'completed a task' },
  note_added: { icon: MessageSquare, color: 'text-orange-500', label: 'added a note' },
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg border-slate-100 italic text-slate-400 text-sm">
        No activity history yet.
      </div>
    )
  }

  return (
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-px before:bg-slate-200">
      {activities.map((activity, index) => {
        const config = EVENT_CONFIG[activity.event_type] || { 
          icon: AlertCircle, 
          color: 'text-slate-400', 
          label: activity.event_type.replace(/_/g, ' ') 
        }
        const Icon = config.icon

        return (
          <div key={activity.id} className="relative flex items-start gap-4 pl-8 group">
            {/* Timeline Dot/Icon */}
            <div className={cn(
              "absolute left-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-4 ring-white shadow-sm border border-border/50 transition-colors",
              config.color
            )}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-bold text-slate-900">{activity.profiles?.full_name || 'System'}</span>
                {' '}
                <span className="text-slate-500">{config.label}</span>
                {activity.metadata?.to && (
                  <span className="ml-1 inline-flex items-center gap-1">
                    to <span className="font-medium text-slate-700 capitalize">{activity.metadata.to}</span>
                  </span>
                )}
                {activity.metadata?.title && (
                  <span className="ml-1 inline-flex items-center italic">
                    "{activity.metadata.title}"
                  </span>
                )}
              </p>
              
              {activity.note && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  {activity.note}
                </div>
              )}

              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                {timeAgo(activity.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
