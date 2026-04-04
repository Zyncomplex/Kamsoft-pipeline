'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getDaysUntil, formatDate } from '@/lib/utils'
import type { DealWithClientHook } from '@/hooks/useDeals'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealCardProps {
  deal: DealWithClientHook
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const daysUntil = deal.next_action_date ? getDaysUntil(deal.next_action_date) : null
  
  const dateColor = daysUntil !== null 
    ? daysUntil < 0 
      ? 'text-destructive' 
      : daysUntil === 0 
        ? 'text-orange-500' 
        : 'text-muted-foreground'
    : 'text-muted-foreground'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab active:cursor-grabbing">
      <Card className={cn(
        "hover:border-primary/50 transition-colors shadow-sm",
        isDragging && "border-primary ring-2 ring-primary/20"
      )}>
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate max-w-[120px]">
              {deal.company_name || 'No Client'}
            </span>
            {deal.total_value && (
              <span className="text-[10px] font-bold text-primary">
                {formatCurrency(deal.total_value, deal.currency)}
              </span>
            )}
          </div>
          
          <Link 
            href={`/deals/${deal.id}`}
            className="block text-sm font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
          >
            {deal.deal_name}
          </Link>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50">
            {deal.next_action_date && (
              <div className={cn("flex items-center gap-1 text-[10px]", dateColor)}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(deal.next_action_date)}</span>
              </div>
            )}
            
            {deal.assigned_to_name && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[60px]">{deal.assigned_to_name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
