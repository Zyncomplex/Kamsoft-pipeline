import { EmptyState } from '@/components/shared/EmptyState'
import { Factory } from 'lucide-react'

export default function ProductionPage() {
  return (
    <EmptyState
      title="Production Orders"
      description="Track your manufacturing and assembly orders with various vendors. Surface delays and manage order lifecycles."
      actionLabel="Create Production Order"
      actionHref="/production/new"
      icon={Factory}
    />
  )
}
