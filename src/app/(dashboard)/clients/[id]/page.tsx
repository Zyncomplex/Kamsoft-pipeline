import { getClient } from '@/services/clients.service'
import { getDealsByClient } from '@/services/deals.service'
import { getTasksByClient } from '@/services/tasks.service'
import { getActivitiesByClient } from '@/services/activities.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { buttonVariants } from '@/components/ui/button-variants'
import { Edit, Trash2, ArrowLeft, Plus, Briefcase, Clock, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteClientAction } from '../actions'
import { cn } from '@/lib/utils'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { TaskCard } from '@/components/tasks/TaskCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DEAL_STAGES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ClientDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const { id } = await params
  const [client, deals, tasks, activities] = await Promise.all([
    getClient(id),
    getDealsByClient(id),
    getTasksByClient(id),
    getActivitiesByClient(id)
  ])

  if (!client || !client.is_active) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <Link href="/clients" className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Clients
        </Link>
      </div>

      <PageHeader
        title={client.company_name}
        description={`Relationship established ${new Date(client.created_at).toLocaleDateString()}`}
        action={
          <div className="flex items-center gap-2">
            <Link 
              href={`/deals/new?client_id=${id}`} 
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Plus className="h-4 w-4" />
              New Deal
            </Link>
            <Link 
              href={`/clients/${id}/edit`} 
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Edit className="h-4 w-4" />
              Edit Client
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Active Deals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deals.length > 0 ? (
                  <div className="space-y-3">
                    {deals.slice(0, 3).map(deal => (
                      <div key={deal.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-border/50">
                        <div className="min-w-0">
                          <Link href={`/deals/${deal.id}`} className="text-sm font-bold truncate block hover:text-primary transition-colors">
                            {deal.deal_name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={deal.stage} items={DEAL_STAGES} className="text-[9px] h-4" />
                            <span className="text-[10px] text-muted-foreground">{formatCurrency(deal.total_value || 0, deal.currency)}</span>
                          </div>
                        </div>
                        <Link href={`/deals/${deal.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Link>
                      </div>
                    ))}
                    {deals.length > 3 && (
                      <p className="text-xs text-center text-muted-foreground font-medium pt-2 border-t">
                        + {deals.length - 3} more deals
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground italic">No active deals.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                  Client Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.filter(t => t.status !== 'done').slice(0, 3).map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    <Link href={`/tasks/new?client_id=${id}`} className="text-xs font-bold text-primary flex items-center justify-center gap-1 hover:underline pt-2">
                       <Plus className="h-3 w-3" /> Add new task
                    </Link>
                  </div>
                ) : (
                  <div className="py-6 text-center bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground italic">No pending tasks.</p>
                    <Link href={`/tasks/new?client_id=${id}`} className="text-xs font-bold text-primary mt-2 flex items-center justify-center gap-1">
                      <Plus className="h-3 w-3" /> Create the first task
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="bg-slate-100 p-1 mb-6">
              <TabsTrigger value="contact">Profile Information</TabsTrigger>
              <TabsTrigger value="history">Full History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact">
              <Card>
                <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Person</p>
                    <p className="text-slate-900 font-medium">{client.contact_person || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Email</p>
                    <p className="text-slate-900 font-medium">{client.email || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-slate-900 font-medium">{client.phone || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Address</p>
                    <p className="text-slate-900 font-medium">{client.address}, {client.city}, {client.country}</p>
                  </div>
                  <Separator className="sm:col-span-2" />
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {client.notes || "No additional notes provided for this client."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
               <Card>
                 <CardContent className="pt-6">
                   <ActivityTimeline activities={activities} />
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-none border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Live Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities.slice(0, 10)} />
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-none shadow-none">
            <CardContent className="pt-6 text-center space-y-2">
               <p className="text-xs font-bold text-slate-400 uppercase">Engagement</p>
               <div className="flex flex-col items-center gap-1">
                 <p className="text-3xl font-black text-slate-900">{deals.length}</p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Total Life-time Deals</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
