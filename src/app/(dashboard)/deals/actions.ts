'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createDealRecord, updateDealRecord, updateDealStage } from '@/services/deals.service'
import { dealSchema } from '@/lib/validations/deal.schema'

// Helper: convert empty strings to null for DB compatibility
function cleanFormData(data: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null
    } else {
      cleaned[key] = value
    }
  }
  return cleaned
}

export async function createDealAction(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = dealSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const cleaned = cleanFormData(parsed.data)
    await createDealRecord(cleaned as Parameters<typeof createDealRecord>[0])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/deals')
  redirect('/deals?success=' + encodeURIComponent('Deal created successfully'))
}

export async function updateDealAction(id: string, _prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = dealSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const cleaned = cleanFormData(parsed.data)
    await updateDealRecord(id, cleaned as Parameters<typeof updateDealRecord>[1])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath(`/deals/${id}`)
  revalidatePath('/deals')
  redirect(`/deals/${id}?success=` + encodeURIComponent('Deal updated successfully'))
}

export async function updateDealStageAction(id: string, newStage: string, previousStage: string) {
  try {
    await updateDealStage(id, newStage, previousStage)
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/deals')
  return { success: true }
}

export async function markDealAsLostAction(id: string) {
  try {
    await updateDealRecord(id, { stage: 'lost' })
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  redirect(`/deals/${id}?success=` + encodeURIComponent('Deal marked as lost'))
}
