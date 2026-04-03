import { getClients } from '@/services/clients.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/shared/SearchInput'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface ClientsPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { search } = await searchParams
  const clients = await getClients(search)

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

      <Suspense fallback={<LoadingSpinner />}>
        {clients.length > 0 ? (
          <ClientsTable clients={clients} />
        ) : (
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
        )}
      </Suspense>
    </div>
  )
}
