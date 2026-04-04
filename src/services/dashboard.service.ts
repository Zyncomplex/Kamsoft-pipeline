import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('dashboard_summary')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getDashboardWidgets() {
  const supabase = await createClient()

  // Parallel fetch for dashboard widgets
  const [tasks, deals, production, shipments] = await Promise.all([
    // Active tasks
    supabase
      .from('tasks')
      .select('*, deals(deal_name)')
      .eq('status', 'doing')
      .order('due_date', { ascending: true })
      .limit(5),
    
    // High-value deals in production
    supabase
      .from('deals_with_client')
      .select('*')
      .eq('stage', 'production')
      .order('total_value', { ascending: false })
      .limit(5),
      
    // Delayed production orders
    supabase
      .from('production_orders')
      .select('*, vendors(name), deals(deal_name)')
      .or('status.eq.delayed, status.eq.quality_check')
      .order('expected_completion_date', { ascending: true })
      .limit(5),

    // Active shipments
    supabase
      .from('shipments')
      .select('*, deals(deal_name)')
      .neq('status', 'delivered')
      .order('expected_delivery_date', { ascending: true })
      .limit(5)
  ])

  return {
    activeTasks: tasks.data || [],
    dealsInProduction: deals.data || [],
    flaggedProduction: production.data || [],
    activeShipments: shipments.data || [],
  }
}
