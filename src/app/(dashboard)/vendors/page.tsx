import { getVendors } from '@/services/vendors.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/shared/SearchInput'
import { VendorsTable } from '@/components/vendors/VendorsTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface VendorsPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const { search } = await searchParams
  const vendors = await getVendors(search)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your supply chain and service providers."
        action={
          <Link href="/vendors/new" className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4 py-2">
        <SearchInput placeholder="Search vendors..." />
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {vendors.length > 0 ? (
          <VendorsTable vendors={vendors} />
        ) : (
          <EmptyState
            title="No vendors found"
            description={
              search
                ? `No results for "${search}". Try a different search term.`
                : "Get started by adding your first vendor."
            }
            action={
              !search ? (
                <Link 
                  href="/vendors/new" 
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Add Vendor
                </Link>
              ) : undefined
            }
          />
        )}
      </Suspense>
    </div>
  )
}
