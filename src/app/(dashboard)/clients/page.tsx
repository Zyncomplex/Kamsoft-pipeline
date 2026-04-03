import { EmptyState } from '@/components/shared/EmptyState'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <EmptyState
      title="Clients"
      description="List of all clients will be displayed here. You'll be able to create, search, and edit your customer relationships."
      actionLabel="Add Client"
      actionHref="/clients/new"
      icon={Users}
    />
  )
}
