import { getVendors } from '@/services/vendors.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/shared/SearchInput'
import { VendorsTable } from '@/components/vendors/VendorsTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

interface VendorsPageProps {
  searchParams: Promise<{ search?: string }>
}

interface VendorsListProps {
  search?: string
}

async function VendorsList({ search }: VendorsListProps) {
  const vendors = await getVendors(search)

  if (vendors.length === 0) {
    return (
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
    )
  }

  return <VendorsTable vendors={vendors} />
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const { search } = await searchParams

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

      <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
        <VendorsList search={search} />
      </Suspense>
    </div>
  )
}
