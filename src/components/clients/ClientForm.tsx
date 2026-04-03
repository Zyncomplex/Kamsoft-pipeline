'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { createClientAction, updateClientAction } from '@/app/(dashboard)/clients/actions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ClientFormProps {
  initialData?: ClientFormValues & { id: string }
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

export function ClientForm({ initialData }: ClientFormProps) {
  const isEdit = !!initialData
  const action = isEdit 
    ? updateClientAction.bind(null, initialData.id) 
    : createClientAction

  const [state, formAction] = useActionState(action, null)

  const {
    register,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  const serverErrors = state?.error || {}

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="e.g. Acme Corp"
              className={errors.company_name || serverErrors.company_name ? 'border-destructive' : ''}
            />
            {(errors.company_name || serverErrors.company_name) && (
              <p className="text-sm text-destructive">
                {errors.company_name?.message || serverErrors.company_name?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              {...register('contact_person')}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="e.g. john@acme.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="e.g. +1 234 567 890"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="e.g. 123 Business St"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="e.g. New York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="e.g. USA"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional information..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4">
          <Link 
            href={isEdit ? `/clients/${initialData.id}` : '/clients'}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton label={isEdit ? 'Update Client' : 'Create Client'} />
        </CardFooter>
      </Card>
    </form>
  )
}
