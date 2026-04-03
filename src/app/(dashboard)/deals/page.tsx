import { EmptyState } from '@/components/shared/EmptyState'
import { Briefcase } from 'lucide-react'

export default function DealsPage() {
  return (
    <EmptyState
      title="Sales Pipeline"
      description="The Deals Kanban board will be displayed here. Create and track your sales opportunities through various stages."
      actionLabel="Create Deal"
      actionHref="/deals/new"
      icon={Briefcase}
    />
  )
}
