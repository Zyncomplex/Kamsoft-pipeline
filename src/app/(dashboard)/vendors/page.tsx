import { EmptyState } from '@/components/shared/EmptyState'
import { Building2 } from 'lucide-react'

export default function VendorsPage() {
  return (
    <EmptyState
      title="Vendors"
      description="Manage your supplier and manufacturing partner information. View active orders and performance metrics."
      actionLabel="Add Vendor"
      actionHref="/vendors/new"
      icon={Building2}
    />
  )
}
