import React from 'react'
import { ShipmentForm } from '@/components/shipments/ShipmentForm'
import { getDeals } from '@/services/deals.service'

export const metadata = {
  title: 'New Shipment - Sales Ops CRM',
}

export default async function NewShipmentPage() {
  // Fetch active deals for the selector (deals that are at production or ready_to_ship stage)
  const deals = await getDeals() // Fetching all for now to allow correction if needed

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Shipment</h1>
        <p className="text-muted-foreground">
          Create a logistics tracking record for a deal.
        </p>
      </div>

      <ShipmentForm 
        deals={deals.map(d => ({ id: d.id, deal_name: d.deal_name }))} 
      />
    </div>
  )
}
