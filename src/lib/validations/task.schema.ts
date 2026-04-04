import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(2000).optional().or(z.literal('')),
  deal_id: z.string().optional().or(z.literal('')),
  client_id: z.string().optional().or(z.literal('')),
  assigned_to: z.string().min(1, 'Assigned to is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'doing', 'done', 'overdue']).optional(),
  due_date: z.string().optional().or(z.literal('')),
  reminder_date: z.string().optional().or(z.literal('')),
})

export type TaskFormValues = z.infer<typeof taskSchema>
