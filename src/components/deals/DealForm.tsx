'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dealSchema, type DealFormValues } from '@/lib/validations/deal.schema'
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
import { createDealAction, updateDealAction } from '@/app/(dashboard)/deals/actions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DEAL_STAGES } from '@/lib/constants'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DealFormProps {
  initialData?: DealFormValues & { id: string }
  clients: { id: string; company_name: string }[]
  profiles: { id: string; full_name: string }[]
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

export function DealForm({ initialData, clients, profiles }: DealFormProps) {
  const isEdit = !!initialData
  const action = isEdit 
    ? updateDealAction.bind(null, initialData.id) 
    : createDealAction

  const [state, formAction] = useActionState(action, null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(dealSchema),
    defaultValues: initialData || {
      deal_name: '',
      client_id: '',
      product_description: '',
      quantity: undefined,
      unit_price: undefined,
      total_value: undefined,
      currency: 'USD',
      stage: 'lead',
      expected_close_date: '',
      assigned_to: '',
      next_action: '',
      next_action_date: '',
      notes: '',
    },
  })

  // Watch client_id to potentially auto-fill (Phase 3 logic)
  const selectedClientId = watch('client_id')

  useEffect(() => {
    if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  const serverErrors = state?.error || {}

  return (
    <form action={formAction}>
      {/* Hidden inputs for Select components to work with native FormData */}
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
        name="stage"
        control={control}
        render={({ field }) => <input type="hidden" name="stage" value={field.value} />}
      />

      <Card>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deal_name">Deal Name *</Label>
            <Input
              id="deal_name"
              {...register('deal_name')}
              placeholder="e.g. 500 Units Order"
              className={errors.deal_name || serverErrors.deal_name ? 'border-destructive' : ''}
            />
            {(errors.deal_name || serverErrors.deal_name) && (
              <p className="text-sm text-destructive">
                {String(errors.deal_name?.message || serverErrors.deal_name?.[0])}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.client_id || serverErrors.client_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {(errors.client_id || serverErrors.client_id) && (
              <p className="text-sm text-destructive">
                {String(errors.client_id?.message || serverErrors.client_id?.[0])}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Controller
              name="assigned_to"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to user" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Controller
              name="stage"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product_description">Product Description</Label>
            <textarea
              id="product_description"
              {...register('product_description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the products/services..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity')}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_price">Unit Price</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              {...register('unit_price')}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_value">Total Value</Label>
            <Input
              id="total_value"
              type="number"
              step="0.01"
              {...register('total_value')}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...register('currency')}
              placeholder="USD"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              type="date"
              {...register('expected_close_date')}
            />
          </div>

          <div className="space-y-2 border-t pt-4 sm:col-span-2">
            <h4 className="font-medium mb-4">Next Action</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_action">Action Description</Label>
            <Input
              id="next_action"
              {...register('next_action')}
              placeholder="e.g. Call client for feedback"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_action_date">Target Date</Label>
            <Input
              id="next_action_date"
              type="date"
              {...register('next_action_date')}
            />
          </div>

          <div className="space-y-2 sm:col-span-2 border-t pt-4">
            <Label htmlFor="notes">Internal Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Confidential notes about the deal..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4">
          <Link 
            href={isEdit ? `/deals/${initialData.id}` : '/deals'}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton label={isEdit ? 'Update Deal' : 'Create Deal'} />
        </CardFooter>
      </Card>
    </form>
  )
}
