'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createShipment,
  updateShipment,
  updateShipmentStatus,
} from '@/services/shipments.service'
import { shipmentSchema } from '@/lib/validations/shipment.schema'

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

export async function createShipmentAction(_prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = shipmentSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createShipment(
      cleanFormData(parsed.data) as any
    )
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/shipments')
  revalidatePath('/deals')
  redirect('/shipments')
}

export async function updateShipmentAction(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = shipmentSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateShipment(
      id,
      cleanFormData(parsed.data) as any
    )
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath(`/shipments/${id}`)
  revalidatePath('/shipments')
  revalidatePath('/deals')
  redirect(`/shipments/${id}`)
}

export async function updateShipmentStatusAction(
  id: string,
  newStatus: string
): Promise<ActionResponse> {
  try {
    await updateShipmentStatus(id, newStatus as any)
  } catch (err: any) {
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/shipments')
  revalidatePath('/deals')
  return { success: true }
}
