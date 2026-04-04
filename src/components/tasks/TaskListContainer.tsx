'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTasks } from '@/hooks/useTasks'
import { TaskList } from './TaskList'
import { QuickAddTask } from './QuickAddTask'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TaskListContainerProps {
  userId: string
}

export function TaskListContainer({ userId }: TaskListContainerProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'today' | 'overdue' | 'all'>('my')
  const [search, setSearch] = useState('')
  const { tasks, loading, refetch } = useTasks(activeTab, userId)

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    task.deal_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as any)} 
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="my">My Tasks</TabsTrigger>
            <TabsTrigger value="today">Due Today</TabsTrigger>
            <TabsTrigger value="overdue" className="text-destructive data-[state=active]:text-destructive">Overdue</TabsTrigger>
            <TabsTrigger value="all">All Pending</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full max-w-xs transition-all focus-within:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 focus-visible:ring-primary shadow-sm"
          />
        </div>
      </div>

      <QuickAddTask defaultAssignedTo={userId} onSuccess={refetch} />

      <div className="bg-white rounded-xl border border-border shadow-sm p-4 min-h-[400px]">
        <TaskList 
          tasks={filteredTasks} 
          loading={loading} 
          onComplete={refetch}
          emptyMessage={
            search 
              ? `No tasks matching "${search}" in this category.` 
              : activeTab === 'overdue' 
                ? "Excellent! You have no overdue tasks." 
                : undefined
          }
        />
      </div>
    </div>
  )
}
