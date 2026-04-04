import { PageHeader } from '@/components/shared/PageHeader'
import { TaskForm } from '@/components/tasks/TaskForm'
import { getAllDeals, getProfiles } from '@/services/deals.service'

interface NewTaskPageProps {
  searchParams: { deal_id?: string; client_id?: string }
}

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const [deals, profiles] = await Promise.all([
    getAllDeals(),
    getProfiles()
  ])

  const defaultDealId = searchParams.deal_id
  const defaultClientId = searchParams.client_id

  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader 
        title="Create New Action Item" 
        description="Detail-oriented task assignment. Linking to a deal is recommended."
      />
      
      <div className="mt-8">
        <TaskForm
          deals={deals.map((d: any) => ({ id: d.id, deal_name: d.deal_name, client_id: d.client_id }))}
          profiles={profiles}
          defaultDealId={defaultDealId}
          defaultClientId={defaultClientId}
        />
      </div>
    </div>
  )
}
