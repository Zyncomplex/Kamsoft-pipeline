'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusUpdate } from './StatusUpdate'
import { ShipmentWithContext } from '@/services/shipments.service'
import { formatDate, cn } from '@/lib/utils'
import { SHIPMENT_STATUSES } from '@/lib/constants'
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Copy, 
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface ShipmentTableProps {
  shipments: ShipmentWithContext[]
}

export function ShipmentTable({ shipments }: ShipmentTableProps) {
  const copyTracking = (nr: string) => {
    navigator.clipboard.writeText(nr)
    toast.success('Tracking number copied')
  }

  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur rounded-2xl border-2 border-dashed border-slate-200">
        <Truck className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No active shipments found.</p>
        <Link href="/shipments/new" className={cn(buttonVariants({ variant: "link" }), "text-emerald-600")}>
          Create your first shipment →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold">Deal / Client</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Tracking</TableHead>
            <TableHead className="font-bold">Dates</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => {
            const isDelayed = shipment.status === 'delayed'
            
            return (
              <TableRow key={shipment.id} className="group hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 leading-tight">{shipment.deal_name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium italic">
                      {shipment.client_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusUpdate 
                    id={shipment.id} 
                    currentStatus={shipment.status} 
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {shipment.courier_name}
                    </span>
                    <div className="flex items-center gap-2 group/track">
                      <code className="text-sm font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {shipment.tracking_number}
                      </code>
                      <button 
                        onClick={() => copyTracking(shipment.tracking_number!)}
                        className="opacity-0 group-hover/track:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Truck className="h-3 w-3" />
                      <span>Ship: {shipment.dispatch_date ? formatDate(shipment.dispatch_date) : 'Pending'}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-bold",
                      isDelayed ? "text-red-600" : "text-slate-700"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>Arrive: {shipment.expected_delivery_date ? formatDate(shipment.expected_delivery_date) : 'TBD'}</span>
                      {isDelayed && <AlertCircle className="h-3 w-3 animate-pulse" />}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/shipments/${shipment.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-emerald-600"
                    )}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
