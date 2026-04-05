import { getClients } from '@/services/clients.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/shared/SearchInput'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

interface ClientsPageProps {
  searchParams: Promise<{ search?: string }>
}

interface ClientsListProps {
  search?: string
}

async function ClientsList({ search }: ClientsListProps) {
  const clients = await getClients(search)

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description={
          search
            ? `No results for "${search}". Try a different search term.`
            : "Get started by adding your first client."
        }
        action={
          !search ? (
            <Link 
              href="/clients/new" 
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Add Client
            </Link>
          ) : undefined
        }
      />
    )
  }

  return <ClientsTable clients={clients} />
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { search } = await searchParams

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your customer database and contact history."
        action={
          <Link href="/clients/new" className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4 py-2">
        <SearchInput placeholder="Search clients..." />
      </div>

      <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
        <ClientsList search={search} />
      </Suspense>
    </div>
  )
}
