import React, { Suspense } from 'react'
import { getProductionOrders } from '@/services/production.service'
import { ProductionTable } from '@/components/production/ProductionTable'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus, Factory, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

export const metadata = {
  title: 'Production - Sales Ops CRM',
  description: 'Manage manufacturing and production orders.',
}

async function ProductionList() {
  const orders = await getProductionOrders()

  return <ProductionTable orders={orders} />
}

export default function ProductionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production</h1>
          <p className="text-muted-foreground">
            Track manufacturing orders and production status across vendors.
          </p>
        </div>
        <Link
          href="/production/new"
          className={cn(buttonVariants(), "shrink-0")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search orders..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          />
        </div>
        <Button variant="outline" size="icon" disabled>
          <Factory className="h-4 w-4" />
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <ProductionList />
      </Suspense>
    </div>
  )
}
