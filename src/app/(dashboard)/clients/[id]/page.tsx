import { getClient } from '@/services/clients.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteClientAction } from '../actions'
import { cn } from '@/lib/utils'

interface ClientDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const { id } = await params
  const client = await getClient(id)

  if (!client || !client.is_active) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <Link href="/clients" className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Clients
        </Link>
      </div>

      <PageHeader
        title={client.company_name}
        description={`Client ID: ${client.id.slice(0, 8)}...`}
        action={
          <div className="flex items-center gap-2">
            <Link 
              href={`/clients/${id}/edit`} 
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <ConfirmDialog
              title="Delete Client"
              description={`Are you sure you want to delete ${client.company_name}? This will deactivate the record but keep historical data.`}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={async () => {
                'use server'
                await deleteClientAction(id)
              }}
              triggerIcon={<Trash2 className="h-4 w-4" />}
              triggerLabel="Delete"
            />
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
              <p>{client.contact_person || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{client.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{client.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p>{client.address || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">City</p>
              <p>{client.city || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Country</p>
              <p>{client.country || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Added On</p>
              <DateDisplay date={client.created_at} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <DateDisplay date={client.updated_at} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {client.notes || "No notes available for this client."}
            </p>
          </CardContent>
        </Card>

        {/* Placeholder for future Deals module integration */}
        <Card className="md:col-span-3 opacity-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Related Deals</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground italic">
            Deal history will be available after Phase 3 implementation.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
