import { PageHeader } from '@/components/shared/PageHeader'
import { PipelineBoard } from '@/components/deals/PipelineBoard'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'

export default function DealsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Sales Pipeline"
        description="Drag deals between stages to update their status. Real-time logging of all activity."
        action={
          <Link href="/deals/new" className={cn(buttonVariants(), 'gap-2 shadow-lg shadow-primary/20')}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Link>
        }
      />
      <div className="flex-1 overflow-hidden p-1">
        <PipelineBoard />
      </div>
    </div>
  )
}
