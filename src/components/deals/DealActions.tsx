'use client'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { markDealAsLostAction } from '@/app/(dashboard)/deals/actions'

export function DealLostButton({ dealId }: { dealId: string }) {
  return (
    <ConfirmDialog
      title="Mark Deal as Lost"
      description="This will move the deal to the Lost stage. You can undo this by changing the stage later in the pipeline board or through editing the deal."
      onConfirm={async () => {
        await markDealAsLostAction(dealId)
      }}
      confirmLabel="Mark as Lost"
      variant="destructive"
      triggerLabel="Mark as Lost"
    />
  )
}
