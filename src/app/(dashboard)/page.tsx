import { EmptyState } from '@/components/shared/EmptyState'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder for StatCards - to be added in Phase 4 */}
        <div className="h-24 bg-muted animate-pulse rounded-lg bg-orange-200/20" />
        <div className="h-24 bg-muted animate-pulse rounded-lg bg-cyan-200/20" />
        <div className="h-24 bg-muted animate-pulse rounded-lg bg-emerald-200/20" />
        <div className="h-24 bg-muted animate-pulse rounded-lg bg-slate-200/20" />
      </div>
      <EmptyState
        title="Welcome to SalesOps CRM"
        description="Your operational dashboard is under construction. Once data is added, you'll see your daily tasks, deal alerts, and production delays here."
        icon={LayoutDashboard}
      />
    </div>
  )
}
