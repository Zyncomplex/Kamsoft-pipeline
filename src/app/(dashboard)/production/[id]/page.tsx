import React from 'react'
import { notFound } from 'next/navigation'
import { getProductionById } from '@/services/production.service'
import { getDeals } from '@/services/deals.service'
import { getVendors } from '@/services/vendors.service'
import { ProductionForm } from '@/components/production/ProductionForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PRODUCTION_STATUSES } from '@/lib/constants'
import { ArrowLeft, Building2, Briefcase, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Production Order ${params.id.slice(0, 8)} - Sales Ops CRM` }
}

export default async function ProductionDetailPage({ params }: { params: { id: string } }) {
  const order = await getProductionById(params.id)
  
  if (!order) {
    notFound()
  }

  const [deals, vendors] = await Promise.all([
    getDeals(),
    getVendors(),
  ])

  const statusInfo = PRODUCTION_STATUSES.find(s => s.value === order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/production" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
            <Badge className={statusInfo?.color}>
              {statusInfo?.label || order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Production details and scheduling.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionForm 
                initialData={order as any}
                deals={deals.map(d => ({ id: d.id, deal_name: d.deal_name }))}
                vendors={vendors.map(v => ({ id: v.id, name: v.name }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Deal Context</div>
                  <div className="text-sm text-muted-foreground">{order.deals?.deal_name}</div>
                  <div className="text-xs text-muted-foreground">{order.deals?.clients?.company_name}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Manufacturer</div>
                  <div className="text-sm text-muted-foreground">{order.vendors?.name || 'Unassigned'}</div>
                  <div className="text-xs text-muted-foreground">{order.vendors?.contact_person}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Timeline</div>
                  <div className="text-xs text-muted-foreground">Started: {formatDate(order.start_date)}</div>
                  <div className="text-xs text-muted-foreground">Expected: {formatDate(order.expected_completion_date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t pt-4">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Financials</div>
                  <div className="text-sm text-muted-foreground">Qty: {order.quantity}</div>
                  <div className="text-sm text-muted-foreground">Unit Cost: {formatCurrency(order.unit_cost, 'USD')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {order.notes || 'No notes provided for this production order.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
