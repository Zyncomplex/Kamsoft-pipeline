import React, { Suspense } from 'react'
import { getDashboardStats, getDashboardWidgets } from '@/services/dashboard.service'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets'
import { DashboardSkeleton } from '@/components/shared/CardSkeleton'
import { 
  Briefcase, 
  CheckSquare, 
  Truck, 
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Dashboard - Sales Ops CRM',
}

async function DashboardOverview() {
  const stats = await getDashboardStats()
  const widgets = await getDashboardWidgets()

  return (
    <div className="space-y-8">
      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Deals"
          value={stats?.active_deals_count || 0}
          description="Deals in progress"
          icon={Briefcase}
        />
        <StatCard
          title="Open Tasks"
          value={stats?.pending_tasks_count || 0}
          description="Requiring attention"
          icon={CheckSquare}
          className="border-l-blue-500 border-l-2"
        />
        <StatCard
          title="In Production"
          value={stats?.total_production_orders || 0}
          description="Manufacturing stage"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Shipments"
          value={stats?.active_shipments_count || 0}
          description="Logistics pipeline"
          icon={Truck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <DashboardWidgets 
          tasks={widgets.activeTasks}
          deals={widgets.dealsInProduction}
          production={widgets.flaggedProduction}
          shipments={widgets.activeShipments}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
        <p className="text-muted-foreground italic">
          At-a-glance operational health and pipeline tracking.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}
