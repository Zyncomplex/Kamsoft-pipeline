import { getClient } from '@/services/clients.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { ClientForm } from '@/components/clients/ClientForm'
import { notFound } from 'next/navigation'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const client = await getClient(id)

  if (!client || !client.is_active) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${client.company_name}`}
        description="Update client information and contact details."
      />
      <ClientForm initialData={client} />
    </div>
  )
}
