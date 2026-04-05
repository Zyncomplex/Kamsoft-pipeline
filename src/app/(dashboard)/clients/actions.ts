'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClientRecord, updateClientRecord, deleteClientRecord } from '@/services/clients.service'
import { clientSchema } from '@/lib/validations/client.schema'

export async function createClientAction(_prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createClientRecord(parsed.data)
  } catch (err) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/clients')
  redirect('/clients?success=' + encodeURIComponent('Client created successfully'))
}

export async function updateClientAction(id: string, _prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateClientRecord(id, parsed.data)
  } catch (err) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
  redirect(`/clients/${id}?success=` + encodeURIComponent('Client updated successfully'))
}

export async function deleteClientAction(id: string) {
  await deleteClientRecord(id)
  revalidatePath('/clients')
  redirect('/clients?success=' + encodeURIComponent('Client deleted'))
}
