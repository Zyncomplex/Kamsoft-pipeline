import { createClient } from '@/lib/supabase/server'
import { Tables, Enums } from '@/types/database.types'

export type ShipmentStatus = Enums<'shipment_status'>
export type ShipmentRow = Tables<'shipments'>

export interface ShipmentWithContext extends ShipmentRow {
  deal_name: string;
  client_name: string;
}

export async function getShipments({ dealId }: { dealId?: string } = {}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('shipments')
    .select(`
      *,
      deals!inner (
        deal_name,
        client_id,
        clients!inner (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (dealId) {
    query = query.eq('deal_id', dealId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching shipments:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    deal_name: (item.deals as any).deal_name,
    client_name: (item.deals as any).clients.name
  })) as ShipmentWithContext[]
}

export async function getShipmentById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      deals!inner (
        id,
        deal_name,
        client_id,
        clients!inner (
          name,
          email,
          phone
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching shipment:', error)
    return null
  }

  return {
    ...data,
    deal_name: (data.deals as any).deal_name,
    client_name: (data.deals as any).clients.name,
    client_email: (data.deals as any).clients.email,
    client_phone: (data.deals as any).clients.phone
  }
}

export async function createShipment(shipment: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipments')
    .insert(shipment)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await supabase.from('activities').insert({
    deal_id: data.deal_id,
    event_type: 'shipment_created',
    description: `Shipment created via ${data.courier_name} (TRK: ${data.tracking_number})`,
  })

  return data
}

export async function updateShipment(id: string, shipment: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipments')
    .update(shipment)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateShipmentStatus(id: string, status: ShipmentStatus) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log activity
  let eventType: Enums<'activity_event'> = 'shipment_dispatched'
  if (status === 'delivered') eventType = 'shipment_delivered'
  
  await supabase.from('activities').insert({
    deal_id: data.deal_id,
    event_type: eventType,
    description: `Shipment status updated to ${status.replace('_', ' ')}`,
  })

  return data
}
