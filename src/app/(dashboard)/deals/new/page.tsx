import { PageHeader } from '@/components/shared/PageHeader'
import { DealForm } from '@/components/deals/DealForm'
import { getClients } from '@/services/clients.service'
import { getProfiles } from '@/services/deals.service'

export default async function NewDealPage() {
  const [clients, profiles] = await Promise.all([getClients(), getProfiles()])

  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader 
        title="Create New Deal" 
        description="Enter the details of the sales opportunity. A client is required."
      />
      
      <div className="mt-8">
        <DealForm
          clients={clients.map(c => ({ id: c.id, company_name: c.company_name }))}
          profiles={profiles}
        />
      </div>
    </div>
  )
}
