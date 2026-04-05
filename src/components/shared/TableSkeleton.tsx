import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header Overlay Style */}
      <div className="border-b bg-muted/20 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Body rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`r-${rowIdx}`} className="p-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton
                  key={`c-${rowIdx}-${colIdx}`}
                  className={cn(
                    "h-4 flex-1",
                    colIdx === 0 && "max-w-[200px]", // Typically the name/title column
                    colIdx === columns - 1 && "max-w-[100px]" // Typically the action column
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
