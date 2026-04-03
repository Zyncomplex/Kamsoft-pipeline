'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClientRecord, updateClientRecord, deleteClientRecord } from '@/services/clients.service'
import { clientSchema } from '@/lib/validations/client.schema'

export async function createClientAction(_prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createClientRecord(parsed.data)
  } catch (err: any) {
    return { message: err.message }
  }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function updateClientAction(id: string, _prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateClientRecord(id, parsed.data)
  } catch (err: any) {
    return { message: err.message }
  }

  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
  redirect(`/clients/${id}`)
}

export async function deleteClientAction(id: string) {
  await deleteClientRecord(id)
  revalidatePath('/clients')
  redirect('/clients')
}
