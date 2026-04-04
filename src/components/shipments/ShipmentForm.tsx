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
import { createShipmentAction, updateShipmentAction } from '@/app/(dashboard)/shipments/actions'
import { FormError } from '@/components/shared/FormError'
import { Loader2, Truck, Save, MapPin } from 'lucide-react'

interface ShipmentFormProps {
  initialData?: any
  deals: any[]
}

export function ShipmentForm({ initialData, deals }: ShipmentFormProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(
    initialData ? updateShipmentAction.bind(null, initialData.id) : createShipmentAction,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(initialData ? 'Shipment updated' : 'Shipment scheduled')
      router.push('/shipments')
    }
  }, [state, initialData, router])

  return (
    <form action={action} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Logistics Details</CardTitle>
                <CardDescription>Shipping and tracking information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="deal_id">Linked Deal</Label>
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
                <Label htmlFor="status">Current Status</Label>
                <Select name="status" defaultValue={initialData?.status || 'preparing'}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
                <FormError message={state?.error?.status?.[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courier_name">Courier Name</Label>
                <Input
                  id="courier_name"
                  name="courier_name"
                  defaultValue={initialData?.courier_name || ''}
                  className="bg-white text-lg font-bold"
                  placeholder="e.g. DHL, FedEx, UPS"
                />
                <FormError message={state?.error?.courier_name?.[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking ID</Label>
                <Input
                  id="tracking_number"
                  name="tracking_number"
                  defaultValue={initialData?.tracking_number || ''}
                  className="bg-white font-mono tracking-widest text-emerald-700"
                  placeholder="TRK-X78921..."
                />
                <FormError message={state?.error?.tracking_number?.[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatch_date">Dispatch Date</Label>
                <Input
                  id="dispatch_date"
                  name="dispatch_date"
                  type="date"
                  defaultValue={initialData?.dispatch_date?.split('T')[0] || ''}
                  className="bg-white"
                />
                <FormError message={state?.error?.dispatch_date?.[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Est. Delivery</Label>
                <Input
                  id="expected_delivery_date"
                  name="expected_delivery_date"
                  type="date"
                  defaultValue={initialData?.expected_delivery_date?.split('T')[0] || ''}
                  className="bg-white border-dashed border-2"
                />
                <FormError message={state?.error?.expected_delivery_date?.[0]} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Logistics Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={initialData?.notes || ''}
                className="min-h-[100px] bg-white italic"
                placeholder="Special carrier instructions or customs details..."
              />
              <FormError message={state?.error?.notes?.[0]} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 text-white">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin className="h-4 w-4" />
              <CardTitle className="text-sm uppercase tracking-widest font-black">Destination</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name" className="text-white/60">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  name="recipient_name"
                  defaultValue={initialData?.recipient_name || ''}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Contact person or business"
                />
                <FormError message={state?.error?.recipient_name?.[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address" className="text-white/60">Delivery Address</Label>
                <Textarea
                  id="delivery_address"
                  name="delivery_address"
                  defaultValue={initialData?.delivery_address || ''}
                  className="min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Full destination address..."
                />
                <FormError message={state?.error?.delivery_address?.[0]} />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {initialData ? 'Update Record' : 'Create Shipment'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isPending}
                className="w-full text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
