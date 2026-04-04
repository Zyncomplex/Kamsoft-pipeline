import { notFound } from 'next/navigation'
import { getDeal, getProfiles } from '@/services/deals.service'
import { getClients } from '@/services/clients.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { DealForm } from '@/components/deals/DealForm'

interface EditDealPageProps {
  params: { id: string }
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = params
  
  const [deal, clients, profiles] = await Promise.all([
    getDeal(id),
    getClients(),
    getProfiles()
  ])

  if (!deal) notFound()

  // Map database row to form values, ensuring dates are in YYYY-MM-DD format for input[type="date"]
  const initialData = {
    ...deal,
    expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
    next_action_date: deal.next_action_date ? deal.next_action_date.split('T')[0] : '',
    quantity: deal.quantity || '',
    unit_price: deal.unit_price || '',
    total_value: deal.total_value || '',
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader 
        title={`Edit Deal: ${deal.deal_name}`} 
        description="Update the deal details, financials, or current stage."
      />
      
      <div className="mt-8">
        <DealForm
          initialData={initialData as any}
          clients={clients.map(c => ({ id: c.id, company_name: c.company_name }))}
          profiles={profiles}
        />
      </div>
    </div>
  )
}
