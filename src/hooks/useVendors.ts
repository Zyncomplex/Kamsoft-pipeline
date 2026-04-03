'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { VendorRow } from '@/services/vendors.service'

export function useVendors(search?: string) {
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

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

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setVendors((data as VendorRow[]) || [])
    }

    setLoading(false)
  }, [search])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  return { vendors, loading, error, refetch: fetchVendors }
}
