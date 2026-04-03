'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createVendorRecord, updateVendorRecord, deleteVendorRecord } from '@/services/vendors.service'
import { vendorSchema } from '@/lib/validations/vendor.schema'

export async function createVendorAction(_prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = vendorSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await createVendorRecord(parsed.data)
  } catch (err: any) {
    return { message: err.message }
  }

  revalidatePath('/vendors')
  redirect('/vendors')
}

export async function updateVendorAction(id: string, _prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = vendorSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateVendorRecord(id, parsed.data)
  } catch (err: any) {
    return { message: err.message }
  }

  revalidatePath(`/vendors/${id}`)
  revalidatePath('/vendors')
  redirect(`/vendors/${id}`)
}

export async function deleteVendorAction(id: string) {
  await deleteVendorRecord(id)
  revalidatePath('/vendors')
  redirect('/vendors')
}
