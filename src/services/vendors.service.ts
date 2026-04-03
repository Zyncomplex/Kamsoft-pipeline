import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export type VendorRow = Database['public']['Tables']['vendors']['Row']
export type CreateVendorData = Database['public']['Tables']['vendors']['Insert']
export type UpdateVendorData = Database['public']['Tables']['vendors']['Update']

export async function getVendors(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,contact_person.ilike.%${search}%,speciality.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getVendor(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createVendorRecord(vendorData: Omit<CreateVendorData, 'created_by'>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('vendors')
    .insert({ ...vendorData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVendorRecord(id: string, vendorData: UpdateVendorData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendors')
    .update(vendorData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteVendorRecord(id: string) {
  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('vendors')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}
