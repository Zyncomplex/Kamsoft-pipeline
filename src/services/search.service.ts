import { createClient } from '@/lib/supabase/server'

export type SearchResult = {
  id: string
  title: string
  subtitle?: string
  type: 'client' | 'vendor' | 'deal'
  href: string
}

export async function searchEverything(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const results: SearchResult[] = []

  // 1. Search Clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company_name')
    .ilike('name', `%${query}%`)
    .limit(5)

  if (clients) {
    clients.forEach(c => {
      results.push({
        id: c.id,
        title: c.name,
        subtitle: c.company_name || 'Client',
        type: 'client',
        href: `/clients/${c.id}`
      })
    })
  }

  // 2. Search Vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name, service_type')
    .ilike('name', `%${query}%`)
    .limit(5)

  if (vendors) {
    vendors.forEach(v => {
      results.push({
        id: v.id,
        title: v.name,
        subtitle: v.service_type || 'Vendor',
        type: 'vendor',
        href: `/vendors/${v.id}`
      })
    })
  }

  // 3. Search Deals
  const { data: deals } = await supabase
    .from('deals')
    .select('id, deal_name, clients!inner(name)')
    .or(`deal_name.ilike.%${query}%`)
    .limit(5)

  if (deals) {
    deals.forEach((d: any) => {
      results.push({
        id: d.id,
        title: d.deal_name,
        subtitle: d.clients?.name || 'Deal',
        type: 'deal',
        href: `/deals/${d.id}`
      })
    })
  }

  return results
}
