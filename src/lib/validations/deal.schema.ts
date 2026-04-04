import { z } from 'zod'

export const dealSchema = z.object({
  deal_name: z.string().min(1, 'Deal name is required').max(255),
  client_id: z.string().min(1, 'Client is required'),
  product_description: z.string().max(2000).optional().or(z.literal('')),
  quantity: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().int().positive().optional()),
  unit_price: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive().optional()),
  total_value: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive().optional()),
  currency: z.string().max(10).optional().or(z.literal('')),
  stage: z.enum([
    'lead','quoted','negotiation','confirmed','production',
    'ready_to_ship','shipped','completed','lost'
  ]).optional(),
  expected_close_date: z.string().optional().or(z.literal('')),
  assigned_to: z.string().optional().or(z.literal('')),
  next_action: z.string().max(500).optional().or(z.literal('')),
  next_action_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type DealFormValues = z.infer<typeof dealSchema>
