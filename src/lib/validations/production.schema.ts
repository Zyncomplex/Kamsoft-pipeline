import { z } from 'zod'

export const productionSchema = z.object({
  deal_id: z.string().uuid(),
  vendor_id: z.string().uuid().nullable(),
  status: z.enum(['not_started', 'in_progress', 'quality_check', 'completed', 'delayed']),
  quantity: z.number().min(1),
  unit_cost: z.number().min(0).nullable().optional(),
  start_date: z.string().nullable().optional(),
  expected_completion_date: z.string().nullable().optional(),
  actual_completion_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ProductionFormValues = z.infer<typeof productionSchema>
