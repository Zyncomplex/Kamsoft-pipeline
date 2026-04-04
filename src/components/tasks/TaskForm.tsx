'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/task.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTaskAction, updateTaskAction } from '@/app/(dashboard)/tasks/actions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  initialData?: TaskFormValues & { id: string }
  deals: { id: string; deal_name: string; client_id: string }[]
  profiles: { id: string; full_name: string }[]
  defaultDealId?: string
  defaultClientId?: string
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="min-w-[120px]">
      {pending ? (
        <>
          <LoadingSpinner className="mr-2 h-4 w-4" />
          Saving...
        </>
      ) : label}
    </Button>
  )
}

export function TaskForm({ 
  initialData, 
  deals, 
  profiles, 
  defaultDealId, 
  defaultClientId 
}: TaskFormProps) {
  const isEdit = !!initialData
  const action = isEdit 
    ? updateTaskAction.bind(null, initialData.id) 
    : createTaskAction

  const [state, formAction] = useActionState(action, null)

  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      deal_id: defaultDealId || '',
      client_id: defaultClientId || '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      due_date: '',
      reminder_date: '',
    },
  })

  const selectedDealId = watch('deal_id')

  // Auto-fill client_id when deal is selected
  useEffect(() => {
    if (selectedDealId) {
      const deal = deals.find(d => d.id === selectedDealId)
      if (deal) {
        setValue('client_id', deal.client_id)
      }
    }
  }, [selectedDealId, deals, setValue])

  useEffect(() => {
    if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  const serverErrors = state?.error || {}

  return (
    <form action={formAction}>
      {/* Hidden inputs for Selects */}
      <Controller
        name="deal_id"
        control={control}
        render={({ field }) => <input type="hidden" name="deal_id" value={field.value} />}
      />
      <Controller
        name="client_id"
        control={control}
        render={({ field }) => <input type="hidden" name="client_id" value={field.value} />}
      />
      <Controller
        name="assigned_to"
        control={control}
        render={({ field }) => <input type="hidden" name="assigned_to" value={field.value} />}
      />
      <Controller
        name="priority"
        control={control}
        render={({ field }) => <input type="hidden" name="priority" value={field.value} />}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => <input type="hidden" name="status" value={field.value} />}
      />

      <Card>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g. Schedule follow-up call"
              className={errors.title || serverErrors.title ? 'border-destructive' : ''}
            />
            {(errors.title || serverErrors.title) && (
              <p className="text-sm text-destructive">
                {errors.title?.message || serverErrors.title?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional details about the task..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal_id">Linked Deal</Label>
            <Controller
              name="deal_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Relate to a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.deal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned To *</Label>
            <Controller
              name="assigned_to"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.assigned_to || serverErrors.assigned_to ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Assign as task owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {(errors.assigned_to || serverErrors.assigned_to) && (
              <p className="text-sm text-destructive">
                {errors.assigned_to?.message || serverErrors.assigned_to?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
            />
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Set task status" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reminder_date">Reminder Date</Label>
            <Input
              id="reminder_date"
              type="date"
              {...register('reminder_date')}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4">
          <Link 
            href={isEdit ? '/tasks' : '/tasks'}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton label={isEdit ? 'Update Task' : 'Create Task'} />
        </CardFooter>
      </Card>
    </form>
  )
}
