'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ProductionOrderHook = {
  id: string
  deal_id: string
  vendor_id: string | null
  quantity: number
  status: string
  start_date: string | null
  expected_completion_date: string | null
  actual_completion_date: string | null
  unit_cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
  vendor_name: string | null
  deal_name: string | null
  company_name: string | null
}

export function useProduction(filters?: { status?: string; vendorId?: string }) {
  const [orders, setOrders] = useState<ProductionOrderHook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('production_orders')
      .select(`
        *,
        vendors:vendor_id(name),
        deals:deal_id(deal_name, clients:client_id(company_name))
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.vendorId) query = query.eq('vendor_id', filters.vendorId)

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      // Flatten nested joins
      const flattened = (data || []).map((row: any) => ({
        ...row,
        vendor_name: row.vendors?.name ?? null,
        deal_name: row.deals?.deal_name ?? null,
        company_name: row.deals?.clients?.company_name ?? null,
        vendors: undefined,
        deals: undefined,
      }))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrders(flattened as ProductionOrderHook[])
    }

    setLoading(false)
  }, [filters?.status, filters?.vendorId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
