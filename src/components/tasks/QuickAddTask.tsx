'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createTaskAction } from '@/app/(dashboard)/tasks/actions'
import { Plus, Send } from 'lucide-react'
import { toast } from 'sonner'

interface QuickAddTaskProps {
  onSuccess?: () => void
  defaultAssignedTo: string
}

export function QuickAddTask({ onSuccess, defaultAssignedTo }: QuickAddTaskProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('assigned_to', defaultAssignedTo)
    formData.append('priority', 'medium')
    formData.append('status', 'pending')

    const result = await createTaskAction(null, formData)

    if (result && 'message' in result) {
      toast.error(result.message)
    } else if (result && 'error' in result) {
      toast.error('Validation error. Please use the full form.')
    } else {
      toast.success('Task created')
      setTitle('')
      onSuccess?.()
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner group">
      <div className="relative flex-1">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Quickly add a task title..."
          className="pl-9 bg-white border-transparent focus-visible:ring-primary shadow-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={!title.trim() || isLoading} size="icon" className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
