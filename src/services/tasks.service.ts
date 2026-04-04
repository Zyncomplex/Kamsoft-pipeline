import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { logActivity } from './activities.service'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Partial<TaskInsert>

// Type matching tasks_with_context view
export type TaskWithContext = TaskRow & {
  assigned_to_name: string | null
  deal_name: string | null
  company_name: string | null
}

export async function getMyTasks(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks_with_context')
    .select('*')
    .eq('assigned_to', userId)
    .neq('status', 'done')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getTodayTasks(userId?: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .eq('due_date', today)
    .neq('status', 'done')

  if (userId) query = query.eq('assigned_to', userId)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getOverdueTasks(userId?: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .lt('due_date', today)
    .neq('status', 'done')

  if (userId) query = query.eq('assigned_to', userId)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getAllTasks(filters?: { search?: string; status?: string; priority?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,deal_name.ilike.%${filters.search}%`)
  }
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getTasksByDeal(dealId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks_with_context')
    .select('*')
    .eq('deal_id', dealId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getTasksByClient(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks_with_context')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function createTaskRecord(taskData: Omit<TaskInsert, 'created_by'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'task_created',
    deal_id: taskData.deal_id || null,
    client_id: taskData.client_id || null,
    task_id: data.id,
    metadata: { title: taskData.title },
  })

  return data
}

export async function updateTaskRecord(id: string, taskData: TaskUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeTask(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'task_completed',
    deal_id: data.deal_id,
    client_id: data.client_id,
    task_id: data.id,
    metadata: { title: data.title },
  })

  return data
}
