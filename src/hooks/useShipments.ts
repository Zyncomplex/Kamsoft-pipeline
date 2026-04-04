'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ShipmentOrderDetail = {
  id: string
  deal_id: string
  carrier: string
  tracking_number: string | null
  status: string
  expected_ship_date: string | null
  actual_ship_date: string | null
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  shipping_cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
  deal_name: string | null
  company_name: string | null
}

export function useShipments(filters?: { status?: string; dealId?: string }) {
  const [shipments, setShipments] = useState<ShipmentOrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShipments = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('shipments')
      .select(`
        *,
        deals:deal_id(deal_name, clients:client_id(company_name))
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.dealId) query = query.eq('deal_id', filters.dealId)

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const flattened = (data || []).map((row: any) => ({
        ...row,
        deal_name: row.deals?.deal_name ?? null,
        company_name: row.deals?.clients?.company_name ?? null,
        deals: undefined,
      }))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShipments(flattened as ShipmentOrderDetail[])
    }

    setLoading(false)
  }, [filters?.status, filters?.dealId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchShipments()
  }, [fetchShipments])

  return { shipments, loading, error, refetch: fetchShipments }
}
