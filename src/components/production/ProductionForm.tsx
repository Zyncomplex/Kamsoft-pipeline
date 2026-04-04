'use client'

import React, { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ProductionFormValues } from '@/lib/validations/production.schema'
import { createProductionAction, updateProductionAction } from '@/app/(dashboard)/production/actions'
import { FormError } from '@/components/shared/FormError'
import { Loader2, Factory, Save, Trash2 } from 'lucide-react'

interface ProductionFormProps {
  initialData?: any
  deals: any[]
  vendors: any[]
}

export function ProductionForm({ initialData, deals, vendors }: ProductionFormProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(
    initialData ? updateProductionAction.bind(null, initialData.id) : createProductionAction,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(initialData ? 'Production order updated' : 'Production order initiated')
      router.push('/production')
    }
  }, [state, initialData, router])

  return (
    <form action={action} className="space-y-8">
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Production Details</CardTitle>
              <CardDescription>Manufacturing and vendor tracking</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deal_id">Deal Context</Label>
              <Select name="deal_id" defaultValue={initialData?.deal_id}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.deal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={state?.error?.deal_id?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_id">Assigned Vendor (Optional)</Label>
              <Select name="vendor_id" defaultValue={initialData?.vendor_id || ""}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Vendor</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={state?.error?.vendor_id?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Required Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                defaultValue={initialData?.quantity || 1}
                className="bg-white"
                placeholder="0"
              />
              <FormError message={state?.error?.quantity?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost (per item)</Label>
              <Input
                id="unit_cost"
                name="unit_cost"
                type="number"
                step="0.01"
                defaultValue={initialData?.unit_cost || ""}
                className="bg-white"
                placeholder="0.00"
              />
              <FormError message={state?.error?.unit_cost?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Current Status</Label>
              <Select name="status" defaultValue={initialData?.status || 'not_started'}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="quality_check">Quality Check</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={state?.error?.status?.[0]} />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={initialData?.start_date?.split('T')[0] || ''}
                className="bg-white"
              />
              <FormError message={state?.error?.start_date?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_completion_date">Expected Completion</Label>
              <Input
                id="expected_completion_date"
                name="expected_completion_date"
                type="date"
                defaultValue={initialData?.expected_completion_date?.split('T')[0] || ''}
                className="bg-white"
              />
              <FormError message={state?.error?.expected_completion_date?.[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_completion_date">Actual Completion</Label>
              <Input
                id="actual_completion_date"
                name="actual_completion_date"
                type="date"
                defaultValue={initialData?.actual_completion_date?.split('T')[0] || ''}
                className="bg-white"
              />
              <FormError message={state?.error?.actual_completion_date?.[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Production Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes || ''}
              className="min-h-[120px] bg-white"
              placeholder="Internal manufacturing instructions or specifications..."
            />
            <FormError message={state?.error?.notes?.[0]} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="gap-2 px-8 shadow-lg shadow-blue-500/20"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initialData ? 'Update Order' : 'Initiate Manufacturing'}
        </Button>
      </div>
    </form>
  )
}
