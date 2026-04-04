import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { logActivity } from './activities.service'

type DealRow = Database['public']['Tables']['deals']['Row']
type DealInsert = Database['public']['Tables']['deals']['Insert']
type DealUpdate = Database['public']['Tables']['deals']['Update']

// Type for deals_with_client view rows
export type DealWithClient = DealRow & {
  company_name: string | null
  contact_person: string | null
  client_phone: string | null
  client_email: string | null
  assigned_to_name: string | null
}

export async function getDeals(filters?: { search?: string; stage?: string; assignedTo?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('deals_with_client')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (filters?.search) {
    query = query.or(
      `deal_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
    )
  }
  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as DealWithClient[]
}

export async function getDealsByStage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error

  // Group deals by stage
  const grouped: Record<string, DealWithClient[]> = {}
  const stages = ['lead','quoted','negotiation','confirmed','production','ready_to_ship','shipped','completed','lost']
  stages.forEach(s => { grouped[s] = [] })

  for (const deal of (data || []) as DealWithClient[]) {
    if (grouped[deal.stage]) {
      grouped[deal.stage].push(deal)
    }
  }

  return grouped
}

export async function getDeal(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as DealWithClient
}

export async function createDealRecord(dealData: Omit<DealInsert, 'created_by'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('deals')
    .insert({ ...dealData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_created',
    deal_id: data.id,
    client_id: dealData.client_id,
    metadata: { deal_name: dealData.deal_name },
  })

  return data
}

export async function updateDealRecord(id: string, dealData: DealUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .update(dealData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_updated',
    deal_id: id,
    client_id: data.client_id,
    metadata: { updated_fields: Object.keys(dealData) },
  })

  return data
}

export async function updateDealStage(id: string, newStage: string, previousStage: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .update({ stage: newStage as DealRow['stage'] })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_stage_changed',
    deal_id: id,
    client_id: data.client_id,
    metadata: { from: previousStage, to: newStage },
  })

  return data
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_active', true)
    .order('full_name')

  if (error) throw error
  return data || []
}

export async function getDealsByClient(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []) as DealWithClient[]
}

export async function getAllDeals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []) as DealWithClient[]
}
