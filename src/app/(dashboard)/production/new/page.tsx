import React from 'react'
import { ProductionForm } from '@/components/production/ProductionForm'
import { getDeals } from '@/services/deals.service'
import { getVendors } from '@/services/vendors.service'

export const metadata = {
  title: 'New Production Order - Sales Ops CRM',
}

export default async function NewProductionPage() {
  // Fetch active deals and vendors for the selectors
  const [deals, vendors] = await Promise.all([
    getDeals({ stage: 'confirmed' }), // Correct filter key is 'stage'
    getVendors(),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Production Order</h1>
        <p className="text-muted-foreground">
          Initiate a manufacturing cycle for a confirmed deal.
        </p>
      </div>

      <ProductionForm 
        deals={deals.map(d => ({ id: d.id, deal_name: d.deal_name }))} 
        vendors={vendors.map(v => ({ id: v.id, name: v.name }))} 
      />
    </div>
  )
}
