import { EmptyState } from '@/components/shared/EmptyState'
import { Truck } from 'lucide-react'

export default function ShipmentsPage() {
  return (
    <EmptyState
      title="Shipment Tracking"
      description="List of all outgoing shipments will be here. Find tracking info and delivery status in seconds."
      actionLabel="Create Shipment"
      actionHref="/shipments/new"
      icon={Truck}
    />
  )
}
