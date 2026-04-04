'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface DashboardWidgetsProps {
  tasks: any[]
  deals: any[]
  production: any[]
  shipments: any[]
}

export function DashboardWidgets({ tasks, deals, production, shipments }: DashboardWidgetsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Critical Tasks Widget */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-500" />
            Active Tasks
          </CardTitle>
          <Link href="/tasks" className="text-xs text-blue-600 hover:underline font-medium">
            View All
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active tasks</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.deals?.deal_name || 'No Deal'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due</p>
                  <p className="text-xs font-semibold">{formatDate(task.due_date)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Production & Flagged Orders Widget */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Operational Alerts
          </CardTitle>
          <Link href="/production" className="text-xs text-blue-600 hover:underline font-medium">
            Manage
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {production.length === 0 && shipments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All clear</p>
          ) : (
            <>
              {production.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                      {p.deals?.deal_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Production {p.status.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={p.status === 'delayed' ? 'destructive' : 'outline'} className="text-[10px] h-5 px-1.5">
                    {p.status}
                  </Badge>
                </div>
              ))}
              {shipments.map(s => (
                <div key={s.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                      {s.deals?.deal_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Shipment {s.status}</p>
                  </div>
                  <Badge variant={s.status === 'delayed' ? 'destructive' : 'outline'} className="text-[10px] h-5 px-1.5">
                    {s.status}
                  </Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* High Value Deals in Progress */}
      <Card className="shadow-sm md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            Manufacturing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-medium text-muted-foreground border-b pb-2">
                  <th className="pb-2">Deal Name</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deals.map(deal => (
                  <tr key={deal.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{deal.deal_name}</td>
                    <td className="py-2.5 text-muted-foreground">{deal.company_name}</td>
                    <td className="py-2.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none capitalize">
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD' }).format(deal.total_value || 0)}
                    </td>
                  </tr>
                ))}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground italic">No deals currently in manufacturing stage</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
