import { createClient } from '@/lib/supabase/server'
import { Tables, Enums } from '@/types/database.types'

export type ProductionStatus = Enums<'production_status'>
export type ProductionRow = Tables<'production_orders'>

export interface ProductionWithContext extends ProductionRow {
  deal_name: string;
  vendor_name: string;
}

export async function getProductionOrders({ dealId, vendorId }: { dealId?: string, vendorId?: string } = {}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('production_orders')
    .select(`
      *,
      deals (
        deal_name
      ),
      vendors (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (dealId) {
    query = query.eq('deal_id', dealId)
  }
  if (vendorId) {
    query = query.eq('vendor_id', vendorId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching production orders:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    deal_name: (item.deals as any).deal_name,
    vendor_name: item.vendors ? (item.vendors as any).name : 'No Vendor'
  })) as ProductionWithContext[]
}

export async function getProductionByDeal(dealId: string) {
  return getProductionOrders({ dealId })
}

export async function getProductionByVendor(vendorId: string) {
  return getProductionOrders({ vendorId })
}

export async function getProductionById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('production_orders')
    .select(`
      *,
      deals (
        id,
        deal_name
      ),
      vendors (
        id,
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching production detail:', error)
    return null
  }

  return {
    ...data,
    deal_name: (data.deals as any).deal_name,
    vendor_name: data.vendors ? (data.vendors as any).name : 'No Vendor'
  }
}

export async function createProductionOrder(order: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('production_orders')
    .insert(order)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await supabase.from('activities').insert({
    deal_id: data.deal_id,
    event_type: 'production_started',
    description: `Production started (Qty: ${data.quantity})`,
  })

  return data
}

export async function updateProductionOrder(id: string, order: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('production_orders')
    .update(order)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductionStatus(id: string, status: ProductionStatus) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('production_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log activity
  let eventType: Enums<'activity_event'> = 'production_started'
  if (status === 'completed') eventType = 'production_completed'
  
  await supabase.from('activities').insert({
    deal_id: data.deal_id,
    event_type: eventType,
    description: `Production status changed to ${status.replace('_', ' ')}`,
  })

  return data
}
