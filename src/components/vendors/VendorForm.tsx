'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, type VendorFormValues } from '@/lib/validations/vendor.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { createVendorAction, updateVendorAction } from '@/app/(dashboard)/vendors/actions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VendorFormProps {
  initialData?: VendorFormValues & { id: string }
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

export function VendorForm({ initialData }: VendorFormProps) {
  const isEdit = !!initialData
  const action = isEdit 
    ? updateVendorAction.bind(null, initialData.id) 
    : createVendorAction

  const [state, formAction] = useActionState(action, null)

  const {
    register,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      speciality: '',
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
            <Label htmlFor="name">Vendor Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Global Supplies Ltd"
              className={errors.name || serverErrors.name ? 'border-destructive' : ''}
            />
            {(errors.name || serverErrors.name) && (
              <p className="text-sm text-destructive">
                {errors.name?.message || serverErrors.name?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              {...register('contact_person')}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="e.g. info@globalsupplies.com"
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
              placeholder="e.g. +1 987 654 321"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="speciality">Speciality / Service Provided</Label>
            <Input
              id="speciality"
              {...register('speciality')}
              placeholder="e.g. Packaging Materials, Electronics, Logistics"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="e.g. 456 Industrial Way"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Contract terms, performance notes, etc."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4">
          <Link 
            href={isEdit ? `/vendors/${initialData.id}` : '/vendors'}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton label={isEdit ? 'Update Vendor' : 'Create Vendor'} />
        </CardFooter>
      </Card>
    </form>
  )
}
