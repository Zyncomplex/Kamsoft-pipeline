import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export type ClientRow = Database['public']['Tables']['clients']['Row']
export type CreateClientData = Database['public']['Tables']['clients']['Insert']
export type UpdateClientData = Database['public']['Tables']['clients']['Update']

export async function getClients(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('company_name', { ascending: true })

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getClient(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClientRecord(clientData: Omit<CreateClientData, 'created_by'>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...clientData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClientRecord(id: string, clientData: UpdateClientData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('clients')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}
