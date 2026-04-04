import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: any
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-slate-50 to-transparent">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-3xl font-black tracking-tighter text-slate-900">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-xs font-bold",
            trend.positive ? "text-emerald-600" : "text-rose-600"
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}% vs last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}
