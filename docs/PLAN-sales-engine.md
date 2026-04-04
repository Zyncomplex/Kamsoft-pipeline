# PLAN-sales-engine.md — Phase 3: Sales Engine

> **Objective:** Build the core CRM engine — Activities logging, Deals pipeline (Kanban board), and Tasks system. This is Milestone 3 from `sales-ops-crm.md`.

---

## ⚠️ CRITICAL: Read Before You Start

1. **Next.js 16.2.2** — Uses `proxy.ts` NOT `middleware.ts`. Do NOT create middleware.
2. **Do NOT run `npm install`** — All deps are installed. Check `package.json` for proof.
3. **Zod v4.3.6** — Use `import { z } from 'zod'`. Do NOT use `zod/v4`.
4. **React Hook Form v7.72.0 + @hookform/resolvers v5.2.2** — Already installed.
5. **@dnd-kit** — `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2` already installed.
6. **shadcn/ui components** — Already in `src/components/ui/`: button, button-variants, card, dialog, dropdown-menu, input, label, select, separator, sheet, table, tabs, tooltip, avatar, badge, sonner. Do NOT re-install.
7. **`buttonVariants`** — Import from `@/components/ui/button-variants` (NOT from `button.tsx`). This was separated in Phase 2 to avoid Server Component crashes.
8. **`Button` with links** — Do NOT use `<Button asChild>`. Use `<Link className={cn(buttonVariants({ variant: "..." }))}>` or `<Button render={<Link href="..." />}>`. The `asChild` prop crashes with `@base-ui/react`.
9. **Supabase clients** — `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server) already exist.
10. **Existing types** — `src/types/database.types.ts` has ALL table types including `deals`, `tasks`, `activities`, `production_orders`, `shipments` with Row/Insert/Update variants and all Enums.
11. **Existing constants** — `src/lib/constants.ts` has `DEAL_STAGES` (9 stages), `TASK_STATUSES`, `TASK_PRIORITIES`, `PRODUCTION_STATUSES`, `SHIPMENT_STATUSES`, `USER_ROLES`, `NAV_ITEMS`.
12. **Existing utils** — `src/lib/utils.ts` has `cn()`, `formatCurrency()`, `formatDate()`, `formatDateTime()`, `timeAgo()`, `getDaysUntil()`.
13. **Existing shared components** — `StatusBadge`, `EmptyState`, `PageHeader`, `SearchInput`, `ConfirmDialog`, `LoadingSpinner`, `DateDisplay` in `src/components/shared/`.
14. **Existing hooks** — `useAuth.ts`, `useClients.ts`, `useVendors.ts` in `src/hooks/`.
15. **Existing services** — `clients.service.ts`, `vendors.service.ts` in `src/services/`.
16. **Server Actions pattern** — See `src/app/(dashboard)/clients/actions.ts` for the established pattern: uses `useActionState` with `(_prevState: unknown, formData: FormData)` signature, `clientSchema.safeParse()`, try/catch with `revalidatePath` + `redirect`.
17. **Form component pattern** — See `src/components/clients/ClientForm.tsx`: uses `useActionState`, `useFormStatus` for pending state, `useForm` from react-hook-form with `zodResolver`, separate `SubmitButton` component.
18. **Hook pattern** — See `src/hooks/useClients.ts`: `'use client'`, uses browser Supabase client, `useCallback` + `useEffect` with `// eslint-disable-next-line react-hooks/set-state-in-effect` comment.
19. **Database views exist** — `deals_with_client` (joins deals+clients+profiles), `tasks_with_context` (joins tasks+profiles+deals+clients), `dashboard_summary`.

### Supabase Project

| Key | Value |
|-----|-------|
| **Project ID** | `kwubpqzdburgjxqruejc` |
| **Project URL** | `https://kwubpqzdburgjxqruejc.supabase.co` |

### Database Schema (already exists — DO NOT run migrations)

**deals** — `id` (uuid PK), `deal_name` (text NOT NULL), `client_id` (uuid NOT NULL → clients), `product_description` (text?), `quantity` (int?), `unit_price` (numeric?), `total_value` (numeric?), `currency` (text default 'USD'), `stage` (deal_stage enum default 'lead'), `expected_close_date` (date?), `actual_close_date` (date?), `assigned_to` (uuid? → profiles), `next_action` (text?), `next_action_date` (date?), `notes` (text?), `is_archived` (bool default false), `created_by` (uuid? → profiles), `created_at`, `updated_at`

**tasks** — `id` (uuid PK), `title` (text NOT NULL), `description` (text?), `deal_id` (uuid? → deals), `client_id` (uuid? → clients), `shipment_id` (uuid? → shipments), `assigned_to` (uuid NOT NULL → profiles), `priority` (task_priority default 'medium'), `status` (task_status default 'pending'), `due_date` (date?), `reminder_date` (date?), `completed_at` (timestamptz?), `created_by` (uuid? → profiles), `created_at`, `updated_at`

**activities** — `id` (uuid PK), `event_type` (activity_event NOT NULL), `deal_id` (uuid? → deals CASCADE), `client_id` (uuid? → clients CASCADE), `task_id` (uuid? → tasks CASCADE), `production_id` (uuid? → production_orders CASCADE), `shipment_id` (uuid? → shipments CASCADE), `actor_id` (uuid? → profiles), `metadata` (jsonb?), `note` (text?), `created_at`

**activity_event enum values:** `deal_created`, `deal_stage_changed`, `deal_updated`, `task_created`, `task_completed`, `production_started`, `production_completed`, `shipment_created`, `shipment_dispatched`, `shipment_delivered`, `note_added`

---

## Task Checklist

### PHASE 3A — Activities Service (Foundation for All Logging)

- [ ] **1.1** Create `src/services/activities.service.ts`

### PHASE 3B — Deals Module (Service → Schema → Hook → Actions → Components → Pages)

- [ ] **2.1** Create `src/services/deals.service.ts`
- [ ] **2.2** Create `src/lib/validations/deal.schema.ts`
- [ ] **2.3** Create `src/hooks/useDeals.ts`
- [ ] **2.4** Create `src/app/(dashboard)/deals/actions.ts`
- [ ] **2.5** Create `src/components/deals/DealForm.tsx`
- [ ] **2.6** Create `src/components/deals/DealCard.tsx`
- [ ] **2.7** Create `src/components/deals/PipelineColumn.tsx`
- [ ] **2.8** Create `src/components/deals/PipelineBoard.tsx`
- [ ] **2.9** Replace `src/app/(dashboard)/deals/page.tsx` — Kanban pipeline
- [ ] **2.10** Create `src/app/(dashboard)/deals/new/page.tsx`
- [ ] **2.11** Create `src/app/(dashboard)/deals/[id]/page.tsx` — Deal detail (control center)
- [ ] **2.12** Create `src/app/(dashboard)/deals/[id]/edit/page.tsx`

### PHASE 3C — Tasks Module (Service → Schema → Hook → Actions → Components → Pages)

- [ ] **3.1** Create `src/services/tasks.service.ts`
- [ ] **3.2** Create `src/lib/validations/task.schema.ts`
- [ ] **3.3** Create `src/hooks/useTasks.ts`
- [ ] **3.4** Create `src/app/(dashboard)/tasks/actions.ts`
- [ ] **3.5** Create `src/components/tasks/TaskCard.tsx`
- [ ] **3.6** Create `src/components/tasks/TaskList.tsx`
- [ ] **3.7** Create `src/components/tasks/TaskForm.tsx`
- [ ] **3.8** Create `src/components/tasks/QuickAddTask.tsx`
- [ ] **3.9** Replace `src/app/(dashboard)/tasks/page.tsx` — Tabbed task list
- [ ] **3.10** Create `src/app/(dashboard)/tasks/new/page.tsx`

### PHASE 3D — Integration (Connect deals ↔ tasks, update client detail page)

- [ ] **4.1** Update `src/app/(dashboard)/clients/[id]/page.tsx` — Add real deals listing
- [ ] **4.2** Create `src/components/shared/ActivityTimeline.tsx` — Placeholder (populated in Phase 4)

### PHASE 3E — Verification

- [ ] **5.1** Run `npm run build` — fix ALL errors
- [ ] **5.2** Run `npm run dev` — verify deals Kanban flow
- [ ] **5.3** Run `npm run dev` — verify tasks CRUD flow

---

## Detailed Instructions Per Task

---

### 1.1 — Activities Service

**File: `src/services/activities.service.ts`** (NEW)

This service uses the **server** Supabase client. It provides activity logging used by ALL future mutations.

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type ActivityInsert = Database['public']['Tables']['activities']['Insert']
type ActivityRow = Database['public']['Tables']['activities']['Row']

export async function logActivity(
  activity: Omit<ActivityInsert, 'actor_id' | 'id' | 'created_at'>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('activities')
    .insert({ ...activity, actor_id: user?.id })

  if (error) throw error
}

export async function getActivitiesByDeal(dealId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*, profiles:actor_id(full_name, email)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []) as (ActivityRow & { profiles: { full_name: string; email: string } | null })[]
}

export async function getActivitiesByClient(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*, profiles:actor_id(full_name, email)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []) as (ActivityRow & { profiles: { full_name: string; email: string } | null })[]
}
```

> **WHY `Omit<..., 'actor_id'>`:** The `actor_id` is always auto-filled from the current user session. Callers never pass it.

---

### 2.1 — Deals Service Layer

**File: `src/services/deals.service.ts`** (NEW)

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { logActivity } from './activities.service'

type DealRow = Database['public']['Tables']['deals']['Row']
type DealInsert = Database['public']['Tables']['deals']['Insert']
type DealUpdate = Database['public']['Tables']['deals']['Update']

// Type for deals_with_client view rows
export type DealWithClient = DealRow & {
  company_name: string | null
  contact_person: string | null
  client_phone: string | null
  client_email: string | null
  assigned_to_name: string | null
}

export async function getDeals(filters?: { search?: string; stage?: string; assignedTo?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('deals_with_client')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (filters?.search) {
    query = query.or(
      `deal_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
    )
  }
  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as DealWithClient[]
}

export async function getDealsByStage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error

  // Group deals by stage
  const grouped: Record<string, DealWithClient[]> = {}
  const stages = ['lead','quoted','negotiation','confirmed','production','ready_to_ship','shipped','completed','lost']
  stages.forEach(s => { grouped[s] = [] })

  for (const deal of (data || []) as DealWithClient[]) {
    if (grouped[deal.stage]) {
      grouped[deal.stage].push(deal)
    }
  }

  return grouped
}

export async function getDeal(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals_with_client')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as DealWithClient
}

export async function createDealRecord(dealData: Omit<DealInsert, 'created_by'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('deals')
    .insert({ ...dealData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_created',
    deal_id: data.id,
    client_id: dealData.client_id,
    metadata: { deal_name: dealData.deal_name },
  })

  return data
}

export async function updateDealRecord(id: string, dealData: DealUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .update(dealData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_updated',
    deal_id: id,
    client_id: data.client_id,
    metadata: { updated_fields: Object.keys(dealData) },
  })

  return data
}

export async function updateDealStage(id: string, newStage: string, previousStage: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .update({ stage: newStage as DealRow['stage'] })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'deal_stage_changed',
    deal_id: id,
    client_id: data.client_id,
    metadata: { from: previousStage, to: newStage },
  })

  return data
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_active', true)
    .order('full_name')

  if (error) throw error
  return data || []
}
```

---

### 2.2 — Deal Validation Schema

**File: `src/lib/validations/deal.schema.ts`** (NEW)

```typescript
import { z } from 'zod'

export const dealSchema = z.object({
  deal_name: z.string().min(1, 'Deal name is required').max(255),
  client_id: z.string().min(1, 'Client is required'),
  product_description: z.string().max(2000).optional().or(z.literal('')),
  quantity: z.coerce.number().int().positive().optional().or(z.literal('')),
  unit_price: z.coerce.number().positive().optional().or(z.literal('')),
  total_value: z.coerce.number().positive().optional().or(z.literal('')),
  currency: z.string().max(10).optional().or(z.literal('')),
  stage: z.enum([
    'lead','quoted','negotiation','confirmed','production',
    'ready_to_ship','shipped','completed','lost'
  ]).optional(),
  expected_close_date: z.string().optional().or(z.literal('')),
  assigned_to: z.string().optional().or(z.literal('')),
  next_action: z.string().max(500).optional().or(z.literal('')),
  next_action_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type DealFormValues = z.infer<typeof dealSchema>
```

> **IMPORTANT about `z.coerce.number()`:** FormData always sends strings. `z.coerce.number()` converts "123" → 123 automatically. The `.or(z.literal(''))` handles empty optional fields so blank inputs don't fail validation.

> **IMPORTANT about cleaning empty strings:** In the server action (task 2.4), you MUST convert empty strings `''` to `null` before inserting into the database, otherwise Supabase will reject them for numeric/date columns. See the `cleanFormData` helper in task 2.4.

---

### 2.3 — useDeals Hook

**File: `src/hooks/useDeals.ts`** (NEW)

Mirror the `useClients.ts` pattern exactly. Uses **browser** Supabase client.

```typescript
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DealWithClientHook = {
  id: string
  deal_name: string
  client_id: string
  stage: string
  total_value: number | null
  next_action: string | null
  next_action_date: string | null
  assigned_to: string | null
  company_name: string | null
  assigned_to_name: string | null
  updated_at: string
  is_archived: boolean
  currency: string
  expected_close_date: string | null
  product_description: string | null
  quantity: number | null
  unit_price: number | null
  notes: string | null
  created_at: string
  created_by: string | null
  actual_close_date: string | null
  contact_person: string | null
  client_phone: string | null
  client_email: string | null
}

export function useDeals(filters?: { search?: string; stage?: string; assignedTo?: string }) {
  const [deals, setDeals] = useState<DealWithClientHook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('deals_with_client')
      .select('*')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })

    if (filters?.search) {
      query = query.or(
        `deal_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
      )
    }
    if (filters?.stage) {
      query = query.eq('stage', filters.stage)
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDeals((data as DealWithClientHook[]) || [])
    }

    setLoading(false)
  }, [filters?.search, filters?.stage, filters?.assignedTo])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeals()
  }, [fetchDeals])

  return { deals, loading, error, refetch: fetchDeals }
}
```

---

### 2.4 — Deal Server Actions

**File: `src/app/(dashboard)/deals/actions.ts`** (NEW)

Follow the EXACT pattern from `src/app/(dashboard)/clients/actions.ts`.

```typescript
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
    await createDealRecord(cleanFormData(parsed.data) as Parameters<typeof createDealRecord>[0])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/deals')
  redirect('/deals')
}

export async function updateDealAction(id: string, _prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = dealSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateDealRecord(id, cleanFormData(parsed.data) as Parameters<typeof updateDealRecord>[1])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath(`/deals/${id}`)
  revalidatePath('/deals')
  redirect(`/deals/${id}`)
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
```

> **CRITICAL `cleanFormData`:** Without this helper, empty form fields send `''` to Supabase for `numeric` and `date` columns, which throws a Postgres type error. This converts `''` → `null`.

---

### 2.5 — DealForm Component

**File: `src/components/deals/DealForm.tsx`** (NEW)

`'use client'` component. Follow `ClientForm.tsx` pattern exactly but with deal-specific fields.

**Props:** `initialData?: DealFormValues & { id: string }`, `clients: { id: string; company_name: string }[]`, `profiles: { id: string; full_name: string }[]`

**Fields (in 2-column grid):**
- `deal_name` (required Input)
- `client_id` (required — render as `<select>` using shadcn Select with options from `clients` prop. `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` for each client)
- `assigned_to` (optional — `<select>` from `profiles` prop)
- `stage` (optional — `<select>` from `DEAL_STAGES` constant, default to 'lead' for new deals)
- `product_description` (textarea, span 2 cols)
- `quantity` (Input type="number")
- `unit_price` (Input type="number" step="0.01")
- `total_value` (Input type="number" step="0.01")
- `currency` (Input, default 'USD')
- `expected_close_date` (Input type="date")
- `next_action` (Input)
- `next_action_date` (Input type="date")
- `notes` (textarea, span 2 cols)

**Uses:** `useActionState` with `createDealAction` or `updateDealAction.bind(null, id)`, `useForm` with `zodResolver(dealSchema)`, `SubmitButton` pattern from ClientForm.

**Footer:** Cancel link (to `/deals` or `/deals/[id]`) + SubmitButton ("Create Deal" / "Update Deal").

> **CRITICAL for `<select>` fields:** You MUST use native HTML `<select>` element with `{...register('field_name')}` OR use shadcn `Select` with a hidden `<input type="hidden" name="field_name" value={selectedValue} />` because `formAction` only serializes native form elements. The shadcn `Select` component does NOT automatically serialize to FormData. Recommended approach: use a controlled shadcn Select + hidden input for each select field.

---

### 2.6 — DealCard Component

**File: `src/components/deals/DealCard.tsx`** (NEW)

`'use client'` component for Kanban board cards. This is the draggable card shown inside pipeline columns.

**Props:** `deal: DealWithClientHook` (from useDeals hook type)

**Renders:**
- Card with `cursor-grab` class, compact padding (`p-3`)
- Company name (muted, small text, top)
- Deal name (font-medium, linked to `/deals/[id]`)
- Total value formatted with `formatCurrency()` (if present)
- Next action date with color coding: red if overdue (`getDaysUntil() < 0`), orange if due today, muted otherwise
- Assigned-to name (small, bottom-right, muted)

**Size:** Keep it compact — this appears in a Kanban column. Max ~100px height.

---

### 2.7 — PipelineColumn Component

**File: `src/components/deals/PipelineColumn.tsx`** (NEW)

`'use client'` component. A single Kanban column representing one deal stage.

**Props:** `stage: { value: string; label: string; color: string }`, `deals: DealWithClientHook[]`, `isOver: boolean`

**Uses @dnd-kit:** Import `useDroppable` from `@dnd-kit/core`. Call `const { setNodeRef, isOver: dropOver } = useDroppable({ id: stage.value })`.

**Renders:**
- Column header: stage label + deal count badge, colored dot from `stage.color`
- Scrollable area (`overflow-y-auto max-h-[calc(100vh-220px)]`) with `ref={setNodeRef}`
- Each deal rendered as a `<DealCard>` wrapped in a draggable (see PipelineBoard for drag setup)
- Visual highlight when `isOver` is true (e.g., `bg-accent/50` border change)
- Min width: `280px`, fixed width so board scrolls horizontally

---

### 2.8 — PipelineBoard Component

**File: `src/components/deals/PipelineBoard.tsx`** (NEW)

`'use client'` component. The main Kanban board using `@dnd-kit/core`.

**Imports:**
```typescript
import { DndContext, DragOverlay, closestCorners, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
```

**State:**
- `activeId: string | null` — currently dragged deal ID
- Uses `useDeals()` hook to fetch deals
- Local `dealsByStage` state derived from `deals` grouped by stage

**Drag flow:**
1. `onDragStart` — set `activeId`
2. `onDragEnd` — if deal dropped on different stage column:
   a. **Optimistic update:** immediately move deal in local state
   b. Call `updateDealStageAction(dealId, newStage, previousStage)` server action
   c. On error: rollback local state + show `toast.error()`
   d. On success: show `toast.success('Deal moved to {stage}')`
   e. Call `refetch()` to sync
3. `DragOverlay` — renders a `DealCard` clone of the active deal

**Sensors:** `useSensor(PointerSensor, { activationConstraint: { distance: 8 } })` to prevent accidental drags.

**Layout:**
- Top: filter bar (optional SearchInput + assigned_to dropdown)
- Below: horizontal scrollable flex container with `DEAL_STAGES` (from constants) mapped to `PipelineColumn` components
- Each deal inside its column wrapped in a draggable using `useSortable` from `@dnd-kit/sortable` or simpler: use `useDraggable` from `@dnd-kit/core` with `<DealCard>` as children

> **IMPORTANT:** `closestCorners` collision detection works best for Kanban boards. Do NOT use `closestCenter`.

> **IMPORTANT about @dnd-kit/sortable v10:** The API changed. Use `import { useSortable } from '@dnd-kit/sortable'`. The `SortableContext` still accepts `items` array of string IDs.

---

### 2.9 — Deals Pipeline Page (REPLACE stub)

**File: `src/app/(dashboard)/deals/page.tsx`** (OVERWRITE)

Server Component wrapper. It:
1. Renders `<PageHeader title="Sales Pipeline" action={<Link to="/deals/new">Add Deal</Link>} />`
2. Below: renders `<PipelineBoard />` (client component handles its own data fetching via `useDeals` hook)

```tsx
import { PageHeader } from '@/components/shared/PageHeader'
import { PipelineBoard } from '@/components/deals/PipelineBoard'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus } from 'lucide-react'

export default function DealsPage() {
  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        description="Drag deals between stages to update their status."
        action={
          <Link href="/deals/new" className={cn(buttonVariants(), 'gap-2')}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Link>
        }
      />
      <PipelineBoard />
    </div>
  )
}
```

---

### 2.10 — Create Deal Page

**File: `src/app/(dashboard)/deals/new/page.tsx`** (NEW)

Server Component that:
1. Fetches `clients` list via `getClients()` from clients service (only `id`, `company_name` needed)
2. Fetches `profiles` list via `getProfiles()` from deals service
3. Renders `<PageHeader title="New Deal" />` + `<DealForm clients={clients} profiles={profiles} />`

```tsx
import { PageHeader } from '@/components/shared/PageHeader'
import { DealForm } from '@/components/deals/DealForm'
import { getClients } from '@/services/clients.service'
import { getProfiles } from '@/services/deals.service'

export default async function NewDealPage() {
  const [clients, profiles] = await Promise.all([getClients(), getProfiles()])

  return (
    <div>
      <PageHeader title="New Deal" />
      <DealForm
        clients={clients.map(c => ({ id: c.id, company_name: c.company_name }))}
        profiles={profiles}
      />
    </div>
  )
}
```

---

### 2.11 — Deal Detail Page (THE MOST IMPORTANT SCREEN)

**File: `src/app/(dashboard)/deals/[id]/page.tsx`** (NEW)

Server Component. This is the "deal control center" — the most important screen in the CRM.

**Data fetching:**
1. `getDeal(id)` — deal with client info
2. `getTasksByDeal(dealId)` — from tasks service (task 3.1)
3. `getActivitiesByDeal(dealId)` — from activities service

**If deal not found → `notFound()`**

**Two-column layout:**
- **Left column (70% / `lg:col-span-2`):**
  - Deal header: deal name (h1) + stage badge (StatusBadge with DEAL_STAGES) + Edit button + value
  - Quick Actions row: "Add Follow-up" (links to `/tasks/new?deal_id=ID`), "Advance Stage" button, "Edit Deal" link
  - **Next Action box:** Highlighted card showing `next_action` + `next_action_date` with color coding. If empty, show "No next action set" with CTA.
  - **Client info card:** company_name, contact_person, phone, email (collapsible with `<details>`)
  - **Deal details grid:** product_description, quantity, unit_price, total_value, currency, expected_close_date
  - **Tasks section:** heading "Tasks" + task count + "Add Task" button. List tasks using `TaskCard` (built in Phase 3C). If no tasks → EmptyState.
  - **Production section:** heading "Production Orders" + placeholder text "Production orders will appear here in Phase 4."
  - **Shipments section:** heading "Shipments" + placeholder text "Shipments will appear here in Phase 4."

- **Right column (30% / `lg:col-span-1`):**
  - **Activity Timeline:** heading "Activity" + chronological list of activities. Each activity shows: icon (per event_type), description text, actor name, `timeAgo()` timestamp. Map event types to descriptions:
    - `deal_created` → "created this deal"
    - `deal_stage_changed` → "moved deal from {from} to {to}" (read from metadata)
    - `deal_updated` → "updated deal details"
    - `task_created` → "created a task"
    - `task_completed` → "completed a task"
  - If no activities → "No activity yet"

> **IMPORTANT:** The tasks section requires `getTasksByDeal()` from task 3.1. If building in strict order, create a stub version first that returns `[]`, then implement fully in Phase 3C.

---

### 2.12 — Edit Deal Page

**File: `src/app/(dashboard)/deals/[id]/edit/page.tsx`** (NEW)

Server Component. Mirrors client edit page pattern:
1. `getDeal(id)` → if not found, `notFound()`
2. Fetch clients list + profiles list
3. Render `<DealForm initialData={...deal} clients={clients} profiles={profiles} />`

> **Map deal data to form values:** The deal from DB has more fields than the form. Map only the form-relevant fields to `initialData`, including `id`.

---

### 3.1 — Tasks Service Layer

**File: `src/services/tasks.service.ts`** (NEW)

Uses server Supabase client. Mirrors clients service pattern.

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { logActivity } from './activities.service'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Type matching tasks_with_context view
export type TaskWithContext = TaskRow & {
  assigned_to_name: string | null
  deal_name: string | null
  company_name: string | null
}

export async function getMyTasks(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks_with_context')
    .select('*')
    .eq('assigned_to', userId)
    .neq('status', 'done')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getTodayTasks(userId?: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .eq('due_date', today)
    .neq('status', 'done')

  if (userId) query = query.eq('assigned_to', userId)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getOverdueTasks(userId?: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .lt('due_date', today)
    .neq('status', 'done')

  if (userId) query = query.eq('assigned_to', userId)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getAllTasks(filters?: { search?: string; status?: string; priority?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('tasks_with_context')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,deal_name.ilike.%${filters.search}%`)
  }
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function getTasksByDeal(dealId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks_with_context')
    .select('*')
    .eq('deal_id', dealId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data || []) as TaskWithContext[]
}

export async function createTaskRecord(taskData: Omit<TaskInsert, 'created_by'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'task_created',
    deal_id: taskData.deal_id || null,
    client_id: taskData.client_id || null,
    task_id: data.id,
    metadata: { title: taskData.title },
  })

  return data
}

export async function updateTaskRecord(id: string, taskData: TaskUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeTask(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    event_type: 'task_completed',
    deal_id: data.deal_id,
    client_id: data.client_id,
    task_id: data.id,
    metadata: { title: data.title },
  })

  return data
}
```

---

### 3.2 — Task Validation Schema

**File: `src/lib/validations/task.schema.ts`** (NEW)

```typescript
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
```

---

### 3.3 — useTasks Hook

**File: `src/hooks/useTasks.ts`** (NEW)

Mirror `useClients.ts` pattern. Uses browser Supabase client, queries `tasks_with_context` view.

```typescript
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type TaskWithContextHook = {
  id: string
  title: string
  description: string | null
  deal_id: string | null
  client_id: string | null
  assigned_to: string
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  assigned_to_name: string | null
  deal_name: string | null
  company_name: string | null
}

export function useTasks(tab: 'my' | 'today' | 'overdue' | 'all', userId?: string) {
  const [tasks, setTasks] = useState<TaskWithContextHook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('tasks_with_context')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    switch (tab) {
      case 'my':
        if (userId) query = query.eq('assigned_to', userId)
        query = query.neq('status', 'done')
        break
      case 'today':
        query = query.eq('due_date', today).neq('status', 'done')
        break
      case 'overdue':
        query = query.lt('due_date', today).neq('status', 'done')
        break
      case 'all':
        // No additional filters
        break
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTasks((data as TaskWithContextHook[]) || [])
    }

    setLoading(false)
  }, [tab, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks }
}
```

---

### 3.4 — Task Server Actions

**File: `src/app/(dashboard)/tasks/actions.ts`** (NEW)

Follow `clients/actions.ts` pattern exactly.

```typescript
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createTaskRecord, completeTask, updateTaskRecord } from '@/services/tasks.service'
import { taskSchema } from '@/lib/validations/task.schema'

function cleanFormData(data: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    cleaned[key] = (value === '' || value === undefined) ? null : value
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
    await createTaskRecord(cleanFormData(parsed.data) as Parameters<typeof createTaskRecord>[0])
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
    await updateTaskRecord(id, cleanFormData(parsed.data) as Parameters<typeof updateTaskRecord>[1])
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/tasks')
  revalidatePath('/deals')
  redirect('/tasks')
}
```

---

### 3.5 — TaskCard Component

**File: `src/components/tasks/TaskCard.tsx`** (NEW)

`'use client'` component. Renders a single task row with checkbox.

**Props:** `task: TaskWithContextHook`, `onComplete: (id: string) => void`

**Renders:**
- Horizontal card/row with: checkbox (calls `onComplete`), title text, deal name as link (if deal_id exists), due date with color coding (red if overdue, orange if today), priority badge (StatusBadge with TASK_PRIORITIES), assigned person name (muted, small)
- When checkbox clicked: call `completeTaskAction(id)`, show `toast.success('Task completed')`, trigger `onComplete` callback

---

### 3.6 — TaskList Component

**File: `src/components/tasks/TaskList.tsx`** (NEW)

`'use client'` component. Renders a list of TaskCards.

**Props:** `tasks: TaskWithContextHook[]`, `onComplete: (id: string) => void`, `emptyMessage?: string`

If tasks empty → render EmptyState with the `emptyMessage` or default "No tasks found".

---

### 3.7 — TaskForm Component

**File: `src/components/tasks/TaskForm.tsx`** (NEW)

`'use client'` component. Follow `ClientForm.tsx` pattern exactly.

**Props:** `initialData?: TaskFormValues & { id: string }`, `deals: { id: string; deal_name: string }[]`, `profiles: { id: string; full_name: string }[]`, `defaultDealId?: string`, `defaultClientId?: string`

**Fields:**
- `title` (required Input)
- `description` (textarea)
- `deal_id` (optional select from `deals` prop — when deal selected, auto-fill client_id from deal's client)
- `client_id` (hidden input, auto-filled from deal selection or passed as prop)
- `assigned_to` (required select from `profiles` prop)
- `priority` (select from TASK_PRIORITIES constant, default 'medium')
- `due_date` (Input type="date")
- `reminder_date` (Input type="date")

**Uses:** `useActionState` with `createTaskAction` or `updateTaskAction.bind(null, id)`.

---

### 3.8 — QuickAddTask Component

**File: `src/components/tasks/QuickAddTask.tsx`** (NEW)

`'use client'` component. A Sheet (slide-over panel) for quickly adding a follow-up task from the deal detail page.

**Props:** `dealId: string`, `clientId: string`, `profiles: { id: string; full_name: string }[]`

**Uses shadcn Sheet:** `<Sheet>` + `<SheetTrigger>` (button "Add Follow-up") + `<SheetContent>` containing a simplified task form with:
- `title` (Input)
- `due_date` (Input type="date")
- `priority` (select)
- `assigned_to` (select from profiles)
- Hidden inputs for `deal_id` and `client_id`
- Submit via `createTaskAction`

After submit: close sheet, show toast, the parent page revalidates.

---

### 3.9 — Tasks Page (REPLACE stub)

**File: `src/app/(dashboard)/tasks/page.tsx`** (OVERWRITE)

`'use client'` component with tabbed interface.

**Uses** shadcn `Tabs` component with 4 tabs:
1. **My Tasks** — `useTasks('my', userId)` where `userId` from `useAuth()` hook
2. **Today** — `useTasks('today')`
3. **Overdue** — `useTasks('overdue')` — show count badge in red on tab
4. **All Tasks** — `useTasks('all')`

Each tab renders `<TaskList>` with its tasks.

**Top:** `<PageHeader title="Tasks" action={<Link to="/tasks/new">Add Task</Link>} />`

When task completed via checkbox → call `completeTaskAction` → `toast.success` → `refetch()`.

---

### 3.10 — Create Task Page

**File: `src/app/(dashboard)/tasks/new/page.tsx`** (NEW)

Server Component:
1. Read optional `?deal_id=` from searchParams (for "Add Task" from deal page)
2. If `deal_id` provided, fetch the deal to get `client_id`
3. Fetch deals list (id + deal_name) and profiles list
4. Render `<PageHeader title="New Task" />` + `<TaskForm deals={deals} profiles={profiles} defaultDealId={dealId} defaultClientId={clientId} />`

---

### 4.1 — Update Client Detail Page

**File: `src/app/(dashboard)/clients/[id]/page.tsx`** (MODIFY)

Find the existing "Deals will appear here in Phase 3" placeholder section. Replace it with:
1. Fetch deals for this client: `getDeals({ search: undefined })` then filter by `client_id` — OR better, add a `getDealsByClient(clientId)` function to deals service that queries `deals_with_client` view with `.eq('client_id', clientId)`.
2. Render a list of deal cards linking to `/deals/[id]`, showing deal_name + stage badge + total_value.
3. "Add Deal" button linking to `/deals/new?client_id=ID` (pre-fill client in deal form).

> **Add `getDealsByClient` to deals service:** Simple function that filters deals_with_client by client_id.

---

### 4.2 — ActivityTimeline Shared Component (Lightweight)

**File: `src/components/shared/ActivityTimeline.tsx`** (NEW)

Server Component (NOT 'use client') that takes pre-fetched activities data.

**Props:** `activities: Array<{ event_type: string; metadata: any; created_at: string; profiles: { full_name: string } | null }>`

**Renders:** Vertical timeline with:
- For each activity: dot → event description (mapped from event_type + metadata) → actor name → `timeAgo()` time
- Event type → description mapping (same as described in task 2.11)
- Compact styling, max 50 items

This component is used in the deal detail page right sidebar (task 2.11).

---

### 5.1–5.3 — Verification

```bash
# Build check (MUST pass with 0 errors)
npm run build

# Dev server
npm run dev
```

**Deals verification flow:**
1. Navigate to `/deals` → should show empty Kanban board with 9 stage columns
2. Click "Add Deal" → navigate to `/deals/new`
3. Submit empty form → validation error on `deal_name` and `client_id`
4. Select a client, fill deal name → submit → redirected to `/deals`
5. Deal card appears in "Lead" column
6. Drag deal card from "Lead" to "Quoted" → toast shows → card moves → check DB stage changed
7. Click deal card → deal detail page shows all sections
8. Verify activity timeline shows "created this deal" and "moved deal from Lead to Quoted"

**Tasks verification flow:**
1. Navigate to `/tasks` → should show "My Tasks" tab (empty)
2. Click "Add Task" → fill title + assign to self + due date (today) → submit
3. Task appears in "My Tasks" and "Today" tabs
4. Click checkbox → task marked done → toast → disappears from My Tasks
5. Go to a deal detail page → click "Add Follow-up" → creates task linked to deal
6. Verify task section on deal detail shows the new task

**Integration verification:**
1. Navigate to `/clients/[id]` → "Deals" section shows real deals (not placeholder)
2. Activity timeline on deal detail page shows events chronologically

---

## File Summary

| # | File | Type | Action |
|---|------|------|--------|
| 1 | `src/services/activities.service.ts` | Service | **CREATE** |
| 2 | `src/services/deals.service.ts` | Service | **CREATE** |
| 3 | `src/lib/validations/deal.schema.ts` | Schema | **CREATE** |
| 4 | `src/hooks/useDeals.ts` | Hook | **CREATE** |
| 5 | `src/app/(dashboard)/deals/actions.ts` | Server Actions | **CREATE** |
| 6 | `src/components/deals/DealForm.tsx` | Component | **CREATE** |
| 7 | `src/components/deals/DealCard.tsx` | Component | **CREATE** |
| 8 | `src/components/deals/PipelineColumn.tsx` | Component | **CREATE** |
| 9 | `src/components/deals/PipelineBoard.tsx` | Component | **CREATE** |
| 10 | `src/app/(dashboard)/deals/page.tsx` | Page | **OVERWRITE** |
| 11 | `src/app/(dashboard)/deals/new/page.tsx` | Page | **CREATE** |
| 12 | `src/app/(dashboard)/deals/[id]/page.tsx` | Page | **CREATE** |
| 13 | `src/app/(dashboard)/deals/[id]/edit/page.tsx` | Page | **CREATE** |
| 14 | `src/services/tasks.service.ts` | Service | **CREATE** |
| 15 | `src/lib/validations/task.schema.ts` | Schema | **CREATE** |
| 16 | `src/hooks/useTasks.ts` | Hook | **CREATE** |
| 17 | `src/app/(dashboard)/tasks/actions.ts` | Server Actions | **CREATE** |
| 18 | `src/components/tasks/TaskCard.tsx` | Component | **CREATE** |
| 19 | `src/components/tasks/TaskList.tsx` | Component | **CREATE** |
| 20 | `src/components/tasks/TaskForm.tsx` | Component | **CREATE** |
| 21 | `src/components/tasks/QuickAddTask.tsx` | Component | **CREATE** |
| 22 | `src/app/(dashboard)/tasks/page.tsx` | Page | **OVERWRITE** |
| 23 | `src/app/(dashboard)/tasks/new/page.tsx` | Page | **CREATE** |
| 24 | `src/app/(dashboard)/clients/[id]/page.tsx` | Page | **MODIFY** (replace deals placeholder) |
| 25 | `src/components/shared/ActivityTimeline.tsx` | Component | **CREATE** |

**Total: 25 files (23 new, 2 overwrite, 1 modify)**

---

## Execution Order (Dependencies)

```
1.1 Activities Service (no deps)
    ↓
2.1 Deals Service (depends on 1.1)
    ↓
2.2 Deal Schema (no deps)
2.3 useDeals Hook (no deps)
    ↓
2.4 Deal Actions (depends on 2.1, 2.2)
    ↓
2.5 DealForm (depends on 2.2, 2.4)
2.6 DealCard (depends on 2.3 type)
2.7 PipelineColumn (depends on 2.6)
    ↓
2.8 PipelineBoard (depends on 2.3, 2.6, 2.7, 2.4)
    ↓
2.9 Deals Page (depends on 2.8)
2.10 New Deal Page (depends on 2.5)
    ↓
3.1 Tasks Service (depends on 1.1)
3.2 Task Schema (no deps)
3.3 useTasks Hook (no deps)
    ↓
3.4 Task Actions (depends on 3.1, 3.2)
    ↓
3.5 TaskCard (depends on 3.3 type, 3.4)
3.6 TaskList (depends on 3.5)
3.7 TaskForm (depends on 3.2, 3.4)
3.8 QuickAddTask (depends on 3.7)
    ↓
3.9 Tasks Page (depends on 3.3, 3.6)
3.10 New Task Page (depends on 3.7)
    ↓
4.2 ActivityTimeline (depends on 1.1)
2.11 Deal Detail (depends on 2.1, 3.1, 1.1, 3.5, 4.2)
2.12 Edit Deal (depends on 2.5)
    ↓
4.1 Update Client Detail (depends on 2.1)
    ↓
5.1-5.3 Verification (depends on all above)
```

**Parallel groups:**
- Group A: 2.2 + 2.3 (in parallel)
- Group B: 2.5 + 2.6 (in parallel after 2.4)
- Group C: 3.1 + 3.2 + 3.3 (in parallel, can start after 1.1)
- Group D: 3.5 + 3.6 + 3.7 (in parallel after 3.4)
