'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRODUCTION_STATUSES } from '@/lib/constants'
import { updateProductionStatusAction } from '@/app/(dashboard)/production/actions'
import { toast } from 'sonner'

interface StatusUpdateProps {
  id: string
  currentStatus: string
}

export function StatusUpdate({ id, currentStatus }: StatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  async function handleStatusChange(newStatus: string) {
    if (!newStatus) return
    const prev = status
    setStatus(newStatus) // optimistic update
    
    // @ts-ignore - Some dynamic status values might not match the enum exactly during transition
    const result = await updateProductionStatusAction(id, newStatus, prev)
    
    if (result?.message) {
      setStatus(prev) // rollback on error
      toast.error(result.message)
    } else {
      toast.success(`Status updated to ${PRODUCTION_STATUSES.find(s => s.value === newStatus)?.label || newStatus}`)
      router.refresh()
    }
  }

  return (
    <Select value={status} onValueChange={(val) => val && handleStatusChange(val)}>
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRODUCTION_STATUSES.map(s => (
          <SelectItem key={s.value} value={s.value}>
            <span className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              {s.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
