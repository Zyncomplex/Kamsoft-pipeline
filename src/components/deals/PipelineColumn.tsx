'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { DealCard } from './DealCard'
import type { DealWithClientHook } from '@/hooks/useDeals'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PipelineColumnProps {
  stage: { value: string; label: string; color: string }
  deals: DealWithClientHook[]
}

export function PipelineColumn({ stage, deals }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value })

  return (
    <div className="flex flex-col w-[300px] shrink-0 h-full bg-slate-50/50 rounded-xl border border-border/50">
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-white/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", stage.color)} />
          <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
        </div>
        <Badge variant="secondary" className="bg-white/80 border-border/50 text-[10px] font-bold px-1.5 h-5 min-w-5 justify-center">
          {deals.length}
        </Badge>
      </div>

      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
        )}
      >
        <SortableContext
          id={stage.value}
          items={deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length > 0 ? (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 grayscale opacity-50">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Empty Stage</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
