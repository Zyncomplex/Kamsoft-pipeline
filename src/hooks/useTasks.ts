'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type TaskWithContextHook = {
  id: string
  title: string
  description: string | null
  deal_id: string | null
  client_id: string | null
  assigned_to: string
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  assigned_to_name: string | null
  deal_name: string | null
  company_name: string | null
}

export function useTasks(tab: 'my' | 'today' | 'overdue' | 'all', userId?: string) {
  const [tasks, setTasks] = useState<TaskWithContextHook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('tasks_with_context')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    switch (tab) {
      case 'my':
        if (userId) query = query.eq('assigned_to', userId)
        query = query.neq('status', 'done')
        break
      case 'today':
        query = query.eq('due_date', today).neq('status', 'done')
        if (userId) query = query.eq('assigned_to', userId)
        break
      case 'overdue':
        query = query.lt('due_date', today).neq('status', 'done')
        if (userId) query = query.eq('assigned_to', userId)
        break
      case 'all':
        // No additional filters
        break
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTasks((data as TaskWithContextHook[]) || [])
    }

    setLoading(false)
  }, [tab, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks }
}
