import React, { Suspense } from 'react'
import { getShipments } from '@/services/shipments.service'
import { ShipmentTable } from '@/components/shipments/ShipmentTable'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus, Truck, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

export const metadata = {
  title: 'Shipments - Sales Ops CRM',
  description: 'Manage logistics and shipment tracking.',
}

async function ShipmentsList() {
  const shipments = await getShipments()
  return <ShipmentTable shipments={shipments} />
}

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Monitor logistics and delivery status for all orders.
          </p>
        </div>
        <Link
          href="/shipments/new"
          className={cn(buttonVariants(), "shrink-0")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Shipment
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tracking numbers..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          />
        </div>
        <Button variant="outline" size="icon" disabled>
          <Truck className="h-4 w-4" />
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <ShipmentsList />
      </Suspense>
    </div>
  )
}
