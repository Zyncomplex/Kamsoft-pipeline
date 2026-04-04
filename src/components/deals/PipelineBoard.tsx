'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useDeals, type DealWithClientHook } from '@/hooks/useDeals'
import { PipelineColumn } from './PipelineColumn'
import { DealCard } from './DealCard'
import { DEAL_STAGES } from '@/lib/constants'
import { updateDealStageAction } from '@/app/(dashboard)/deals/actions'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function PipelineBoard() {
  const [search, setSearch] = useState('')
  const { deals, loading, error, refetch } = useDeals({ search })
  
  const [localDeals, setLocalDeals] = useState<DealWithClientHook[]>([])
  const [activeDeal, setActiveDeal] = useState<DealWithClientHook | null>(null)

  useEffect(() => {
    setLocalDeals(deals)
  }, [deals])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, DealWithClientHook[]> = {}
    DEAL_STAGES.forEach(s => { grouped[s.value] = [] })
    
    localDeals.forEach(deal => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal)
      }
    })
    return grouped
  }, [localDeals])

  const findContainer = (id: string) => {
    if (DEAL_STAGES.some(s => s.value === id)) return id
    return localDeals.find(d => d.id === id)?.stage
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = localDeals.find(d => d.id === active.id)
    if (deal) setActiveDeal(deal)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setLocalDeals((prev) => {
      const activeIndex = prev.findIndex((d) => d.id === activeId)
      const newDeals = [...prev]
      newDeals[activeIndex] = { ...newDeals[activeIndex], stage: overContainer }
      return newDeals
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDeal(null)
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const newStage = findContainer(overId)
    const originalDeal = deals.find(d => d.id === activeId)

    if (!originalDeal || !newStage || originalDeal.stage === newStage) return

    // Perform the permanent update
    const result = await updateDealStageAction(activeId, newStage, originalDeal.stage)
    
    if ('message' in result) {
      toast.error(result.message)
      setLocalDeals(deals) // Rollback on error
    } else {
      toast.success(`Deal moved to ${DEAL_STAGES.find(s => s.value === newStage)?.label}`)
      refetch()
    }
  }

  if (error) return <div className="p-4 text-destructive">Error: {error}</div>

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-4 px-1">
        <div className="relative w-full max-w-xs transition-all focus-within:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search deals or clients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 focus-visible:ring-primary shadow-sm"
          />
        </div>
        {loading && <LoadingSpinner className="h-4 w-4" />}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-slate-200">
          {DEAL_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.value}
              stage={stage}
              deals={dealsByStage[stage.value] || []}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.5' } }
          })
        }}>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
