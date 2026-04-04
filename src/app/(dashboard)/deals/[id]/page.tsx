import { notFound } from 'next/navigation'
import { getDeal } from '@/services/deals.service'
import { getTasksByDeal } from '@/services/tasks.service'
import { getActivitiesByDeal } from '@/services/activities.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DealCard } from '@/components/deals/DealCard'
import { TaskCard } from '@/components/tasks/TaskCard'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { DEAL_STAGES } from '@/lib/constants'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { 
  Edit, 
  Plus, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealPageProps {
  params: { id: string }
}

export default async function DealDetailPage({ params }: DealPageProps) {
  const { id } = params
  
  const [deal, tasks, activities] = await Promise.all([
    getDeal(id),
    getTasksByDeal(id),
    getActivitiesByDeal(id)
  ])

  if (!deal) notFound()

  const daysUntilNextAction = deal.next_action_date ? getDaysUntil(deal.next_action_date) : null
  const isOverdue = daysUntilNextAction !== null && daysUntilNextAction < 0
  const isDueToday = daysUntilNextAction === 0

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{deal.deal_name}</h1>
            <StatusBadge status={deal.stage} items={DEAL_STAGES} />
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Briefcase className="h-4 w-4" />
            <span className="font-medium">{deal.company_name}</span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <span className="text-sm">Created {formatDate(deal.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/deals/${id}/edit`} 
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 shadow-sm transition-all")}
          >
            <Edit className="h-4 w-4" />
            Edit Deal
          </Link>
          <Link 
            href={`/tasks/new?deal_id=${id}`} 
            className={cn(buttonVariants(), "gap-2 shadow-lg shadow-primary/20 transition-all")}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Action Highlight */}
          <Card className={cn(
            "border-l-4 transition-all shadow-md overflow-hidden",
            isOverdue ? "border-l-destructive bg-destructive/5" : 
            isDueToday ? "border-l-orange-500 bg-orange-50" : 
            "border-l-primary bg-primary/5"
          )}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-full ring-4 ring-white shadow-sm",
                  isOverdue ? "bg-destructive text-white" : "bg-primary text-white"
                )}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Next Action Goal</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">
                    {deal.next_action || "No next action planned."}
                  </p>
                  {deal.next_action_date && (
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Target: {formatDate(deal.next_action_date)}
                      {isOverdue && <span className="text-destructive font-bold ml-1 uppercase text-[10px] bg-white px-1.5 rounded border border-destructive/20">OVERDUE</span>}
                    </div>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="hidden sm:flex text-primary hover:bg-primary/10">
                Update →
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Card */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-sm">Total Deal Value</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {deal.total_value ? formatCurrency(deal.total_value, deal.currency) : '—'}
                  </span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unit Price</p>
                    <p className="text-sm font-medium text-slate-700">{deal.unit_price ? formatCurrency(deal.unit_price, deal.currency) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quantity</p>
                    <p className="text-sm font-medium text-slate-700">{deal.quantity || '—'} units</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Context Card */}
            <Card className="shadow-sm border-border/50 bg-slate-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-base font-bold text-slate-900">{deal.contact_person || 'No primary contact'}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{deal.client_email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{deal.client_phone || '—'}</span>
                  </div>
                </div>
                <Link 
                  href={`/clients/${deal.client_id}`} 
                  className="text-xs text-primary font-bold inline-flex items-center gap-1 mt-2 underline"
                >
                  View full client profile <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="production" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled>
                Production
              </TabsTrigger>
              <TabsTrigger value="shipments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled>
                Shipments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">Action Items</h3>
                <Link 
                  href={`/tasks/new?deal_id=${id}`} 
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Plus className="h-3 w-3" /> New Task
                </Link>
              </div>
              {tasks.length > 0 ? (
                <div className="grid gap-3">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 italic">No tasks assigned to this deal.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Timeline / Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-none border-border/50 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Live Feed
              </CardTitle>
              <CardDescription>Recent event logs for this deal</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
