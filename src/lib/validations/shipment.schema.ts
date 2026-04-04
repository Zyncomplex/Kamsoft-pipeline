import { z } from 'zod'

export const shipmentSchema = z.object({
  deal_id: z.string().uuid(),
  status: z.enum(['preparing', 'dispatched', 'in_transit', 'delivered', 'delayed']),
  courier_name: z.string().min(1, 'Courier name is required'),
  tracking_number: z.string().min(1, 'Tracking number is required'),
  recipient_name: z.string().nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  dispatch_date: z.string().nullable().optional(),
  expected_delivery_date: z.string().nullable().optional(),
  actual_delivery_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ShipmentFormValues = z.infer<typeof shipmentSchema>
