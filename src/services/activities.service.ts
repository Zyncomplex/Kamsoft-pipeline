import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type ActivityInsert = Database['public']['Tables']['activities']['Insert']
type ActivityRow = Database['public']['Tables']['activities']['Row']

export async function logActivity(
  activity: Omit<ActivityInsert, 'actor_id' | 'id' | 'created_at'>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('activities')
    .insert({ ...activity, actor_id: user?.id })

  if (error) throw error
}

export async function getActivitiesByDeal(dealId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*, profiles:actor_id(full_name, email)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []) as (ActivityRow & { profiles: { full_name: string; email: string } | null })[]
}

export async function getActivitiesByClient(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*, profiles:actor_id(full_name, email)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []) as (ActivityRow & { profiles: { full_name: string; email: string } | null })[]
}
