'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createTaskRecord, completeTask, updateTaskRecord } from '@/services/tasks.service'
import { taskSchema } from '@/lib/validations/task.schema'

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

export async function createTaskAction(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = taskSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const cleaned = cleanFormData(parsed.data)
    await createTaskRecord(cleaned as Parameters<typeof createTaskRecord>[0])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/tasks')
  revalidatePath('/deals')
  redirect('/tasks')
}

export async function completeTaskAction(id: string) {
  try {
    await completeTask(id)
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/tasks')
  revalidatePath('/deals')
  return { success: true }
}

export async function updateTaskAction(id: string, _prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = taskSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const cleaned = cleanFormData(parsed.data)
    await updateTaskRecord(id, cleaned as Parameters<typeof updateTaskRecord>[1])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/tasks')
  revalidatePath('/deals')
  redirect('/tasks')
}
