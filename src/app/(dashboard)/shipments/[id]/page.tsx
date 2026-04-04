import React from 'react'
import { notFound } from 'next/navigation'
import { getShipmentById } from '@/services/shipments.service'
import { getDeals } from '@/services/deals.service'
import { ShipmentForm } from '@/components/shipments/ShipmentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { SHIPMENT_STATUSES } from '@/lib/constants'
import { ArrowLeft, Truck, Package, Calendar, MapPin, User } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Shipment ${params.id.slice(0, 8)} - Sales Ops CRM` }
}

export default async function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const shipment = await getShipmentById(params.id)
  
  if (!shipment) {
    notFound()
  }

  const deals = await getDeals()
  const statusInfo = SHIPMENT_STATUSES.find(s => s.value === shipment.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/shipments" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {shipment.courier_name} Shipment
            </h1>
            <Badge className={statusInfo?.color}>
              {statusInfo?.label || shipment.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            ID: {shipment.id}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Logistics Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentForm 
                initialData={shipment as any}
                deals={deals.map(d => ({ id: d.id, deal_name: d.deal_name }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Shipment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-tight">Tracking Number</div>
                  <div className="text-sm font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1">
                    {shipment.tracking_number || 'Pending Assignment'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-2 border-t border-emerald-100">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-tight">Destination Deal</div>
                  <div className="text-sm font-semibold text-slate-900">{shipment.deal_name}</div>
                  <div className="text-xs text-slate-500">{shipment.client_name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-emerald-100">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-tight">Recipient</div>
                  <div className="text-sm font-semibold text-slate-900">{shipment.recipient_name || 'N/A'}</div>
                  <div className="text-xs text-slate-500 max-w-[200px] leading-relaxed mt-1 italic">
                    {shipment.delivery_address || 'Address not specified'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-emerald-100">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-tight">Logistics Timeline</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    Ship Date: {shipment.dispatch_date ? formatDate(shipment.dispatch_date) : 'Pending'}
                  </div>
                  <div className="text-xs font-black text-emerald-600">
                    Est. Delivery: {shipment.expected_delivery_date ? formatDate(shipment.expected_delivery_date) : 'TBD'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Internal Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 whitespace-pre-wrap italic">
                {shipment.notes || 'No shipping notes provided.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
