import { PageHeader } from '@/components/shared/PageHeader'
import { ClientForm } from '@/components/clients/ClientForm'

export default function NewClientPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add New Client"
        description="Fill in the details below to create a new client record."
      />
      <ClientForm />
    </div>
  )
}
