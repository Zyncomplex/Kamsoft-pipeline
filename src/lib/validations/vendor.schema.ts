import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(255),
  contact_person: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  speciality: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type VendorFormValues = z.infer<typeof vendorSchema>
