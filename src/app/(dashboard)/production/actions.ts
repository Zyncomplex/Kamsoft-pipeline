'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createProductionOrder,
  updateProductionOrder,
  updateProductionStatus,
} from '@/services/production.service'
import { productionSchema } from '@/lib/validations/production.schema'

export type ActionResponse = {
  success: boolean
  message?: string
  error?: Record<string, string[]>
}

function cleanFormData(data: Record<string, any>) {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    cleaned[key] = (value === '' || value === undefined) ? null : value
  }
  return cleaned
}

export async function createProductionAction(_prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = productionSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createProductionOrder(
      cleanFormData(parsed.data) as any
    )
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/production')
  revalidatePath('/deals')
  redirect('/production')
}

export async function updateProductionAction(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = productionSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateProductionOrder(
      id,
      cleanFormData(parsed.data) as any
    )
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath(`/production/${id}`)
  revalidatePath('/production')
  revalidatePath('/deals')
  redirect(`/production/${id}`)
}

export async function updateProductionStatusAction(
  id: string,
  newStatus: string
): Promise<ActionResponse> {
  try {
    await updateProductionStatus(id, newStatus as any)
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/production')
  revalidatePath('/deals')
  return { success: true }
}
