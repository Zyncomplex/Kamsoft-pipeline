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
import { ProductionWithContext } from '@/services/production.service'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { PRODUCTION_STATUSES } from '@/lib/constants'
import { Calendar, Factory, AlertTriangle, Eye } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface ProductionTableProps {
  orders: ProductionWithContext[]
}

export function ProductionTable({ orders }: ProductionTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur rounded-2xl border-2 border-dashed border-slate-200">
        <Factory className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No manufacturing orders found.</p>
        <Link href="/production/new" className={cn(buttonVariants({ variant: "link" }), "text-blue-600")}>
          Initiate your first order →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold">Deal / Vendor</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Quantity</TableHead>
            <TableHead className="font-bold">Est. Completion</TableHead>
            <TableHead className="font-bold text-right">Unit Cost</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isDelayed = order.status === 'delayed'
            const isPastDue = order.expected_completion_date && 
                             new Date(order.expected_completion_date) < new Date() && 
                             order.status !== 'completed'

            return (
              <TableRow key={order.id} className="group hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 leading-tight">{order.deal_name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Factory className="h-3 w-3" />
                      {order.vendor_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusUpdate 
                    id={order.id} 
                    currentStatus={order.status} 
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">
                    {order.quantity.toLocaleString()} pcs
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "flex flex-col gap-0.5",
                    isPastDue ? "text-red-600" : "text-slate-600"
                  )}>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Calendar className="h-3 w-3" />
                      {order.expected_completion_date ? formatDate(order.expected_completion_date) : 'TBD'}
                    </div>
                    {(isDelayed || isPastDue) && (
                      <span className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="h-2 w-2" />
                        {isDelayed ? 'Delayed' : 'Overdue'}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-slate-600">
                  {order.unit_cost ? formatCurrency(order.unit_cost) : '—'}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/production/${order.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
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
