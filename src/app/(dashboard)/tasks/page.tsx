import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { TaskListContainer } from '@/components/tasks/TaskListContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized. Please log in.</div>
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      <PageHeader
        title="Action Items"
        description="Priority focused task management. Complete tasks to auto-log activities."
        action={
          <Link href="/tasks/new" className={cn(buttonVariants(), "gap-2 shadow-lg shadow-primary/20")}>
            <Plus className="h-4 w-4" />
            Full Task Form
          </Link>
        }
      />
      
      <div className="flex-1 overflow-y-auto pb-8 pr-1">
        <TaskListContainer userId={user.id} />
      </div>
    </div>
  )
}
