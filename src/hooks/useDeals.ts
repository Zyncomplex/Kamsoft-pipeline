'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DealWithClientHook = {
  id: string
  deal_name: string
  client_id: string
  stage: string
  total_value: number | null
  next_action: string | null
  next_action_date: string | null
  assigned_to: string | null
  company_name: string | null
  assigned_to_name: string | null
  updated_at: string
  is_archived: boolean
  currency: string
  expected_close_date: string | null
  product_description: string | null
  quantity: number | null
  unit_price: number | null
  notes: string | null
  created_at: string
  created_by: string | null
  actual_close_date: string | null
  contact_person: string | null
  client_phone: string | null
  client_email: string | null
}

export function useDeals(filters?: { search?: string; stage?: string; assignedTo?: string }) {
  const [deals, setDeals] = useState<DealWithClientHook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

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

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDeals((data as DealWithClientHook[]) || [])
    }

    setLoading(false)
  }, [filters?.search, filters?.stage, filters?.assignedTo])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeals()
  }, [fetchDeals])

  return { deals, loading, error, refetch: fetchDeals }
}
