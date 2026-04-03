# PLAN-core-data.md — Phase 2: Core Data Modules

> **Objective:** Build full CRUD for Clients and Vendors, establishing the reusable service → schema → hook → component → page pattern that all future modules will follow.

---

## ⚠️ CRITICAL: Read Before You Start

1. **Next.js 16.2.2** — Uses `proxy.ts` NOT `middleware.ts`. Do NOT create middleware.
2. **Zod v4.3.6** — Installed. Uses `import { z } from 'zod'`. Do NOT use `zod/v4` or legacy imports.
3. **React Hook Form v7.72.0 + @hookform/resolvers v5.2.2** — Already installed. Use `zodResolver` from `@hookform/resolvers/zod`.
4. **shadcn/ui components** — Already installed in `src/components/ui/`: button, card, dialog, dropdown-menu, input, label, select, separator, sheet, table, tabs, tooltip, avatar, badge, sonner. Do NOT re-install.
5. **Do NOT run `npm install`** — All deps are installed.
6. **Supabase clients** — `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server) already exist. Import and use them.
7. **Existing shared components** — `StatusBadge.tsx` and `EmptyState.tsx` exist in `src/components/shared/`. Do NOT recreate them.
8. **Existing constants** — `src/lib/constants.ts` has `NAV_ITEMS`, `DEAL_STAGES`, `TASK_STATUSES`, `TASK_PRIORITIES`, `PRODUCTION_STATUSES`, `SHIPMENT_STATUSES`, `USER_ROLES`. Do NOT recreate.
9. **Existing utils** — `src/lib/utils.ts` has `cn()` only. You WILL add helpers here.
10. **Existing stub pages** — `/clients/page.tsx` and `/vendors/page.tsx` exist as EmptyState placeholders. You WILL replace them.
11. **Auth** — `src/app/(dashboard)/layout.tsx` protects all routes. User is always authenticated inside `(dashboard)`.

### Supabase Project

| Key | Value |
|-----|-------|
| **Project ID** | `kwubpqzdburgjxqruejc` |
| **Project URL** | `https://kwubpqzdburgjxqruejc.supabase.co` |

### Database Schema Already Exists

All tables are created with RLS enabled. Relevant tables for Phase 2:

**clients** — `id` (uuid, PK), `company_name` (text, NOT NULL), `contact_person` (text?), `phone` (text?), `email` (text?), `address` (text?), `city` (text?), `country` (text?), `notes` (text?), `is_active` (bool, default true), `created_by` (uuid? → profiles), `created_at` (timestamptz), `updated_at` (timestamptz)

**vendors** — `id` (uuid, PK), `name` (text, NOT NULL), `contact_person` (text?), `phone` (text?), `email` (text?), `address` (text?), `speciality` (text?), `notes` (text?), `is_active` (bool, default true), `created_by` (uuid? → profiles), `created_at` (timestamptz), `updated_at` (timestamptz)

**profiles** — `id` (uuid, PK), `full_name` (text), `email` (text), `role` (user_role enum), `phone` (text?), `avatar_url` (text?), `is_active` (bool)

---

## Task Checklist

### PHASE 2A — Utility Helpers + TypeScript Types

- [ ] **1.1** Add utility functions to `src/lib/utils.ts`
- [ ] **1.2** Generate TypeScript types file `src/types/database.types.ts`

### PHASE 2B — Clients Module

- [ ] **2.1** Create `src/services/clients.service.ts` — all CRUD operations
- [ ] **2.2** Create `src/lib/validations/client.schema.ts` — Zod validation schema
- [ ] **2.3** Create `src/hooks/useClients.ts` — React hook wrapping service
- [ ] **2.4** Create `src/components/clients/ClientsTable.tsx` — searchable data table
- [ ] **2.5** Create `src/components/clients/ClientForm.tsx` — create/edit form
- [ ] **2.6** Replace `src/app/(dashboard)/clients/page.tsx` — list page with table
- [ ] **2.7** Create `src/app/(dashboard)/clients/new/page.tsx` — create page
- [ ] **2.8** Create `src/app/(dashboard)/clients/[id]/page.tsx` — detail page
- [ ] **2.9** Create `src/app/(dashboard)/clients/[id]/edit/page.tsx` — edit page

### PHASE 2C — Vendors Module

- [ ] **3.1** Create `src/services/vendors.service.ts` — all CRUD operations
- [ ] **3.2** Create `src/lib/validations/vendor.schema.ts` — Zod validation schema
- [ ] **3.3** Create `src/hooks/useVendors.ts` — React hook wrapping service
- [ ] **3.4** Create `src/components/vendors/VendorsTable.tsx` — searchable data table
- [ ] **3.5** Create `src/components/vendors/VendorForm.tsx` — create/edit form
- [ ] **3.6** Replace `src/app/(dashboard)/vendors/page.tsx` — list page with table
- [ ] **3.7** Create `src/app/(dashboard)/vendors/new/page.tsx` — create page
- [ ] **3.8** Create `src/app/(dashboard)/vendors/[id]/page.tsx` — detail page

### PHASE 2D — Additional Shared Components

- [ ] **4.1** Create `src/components/shared/LoadingSpinner.tsx`
- [ ] **4.2** Create `src/components/shared/ConfirmDialog.tsx`
- [ ] **4.3** Create `src/components/shared/SearchInput.tsx`
- [ ] **4.4** Create `src/components/shared/DateDisplay.tsx`
- [ ] **4.5** Create `src/components/shared/PageHeader.tsx`

### PHASE 2E — Auth Hook

- [ ] **5.1** Create `src/hooks/useAuth.ts` — current user session hook

### PHASE 2F — Verification

- [ ] **6.1** Run `npm run build` and fix all errors
- [ ] **6.2** Run `npm run dev` and verify clients CRUD flow
- [ ] **6.3** Run `npm run dev` and verify vendors CRUD flow

---

## Detailed Instructions Per Task

---

### 1.1 — Add Utility Functions

**File: `src/lib/utils.ts`** (MODIFY — append to existing file, keep existing `cn()`)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getDaysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date())
}
```

---

### 1.2 — Generate TypeScript Types

Run this SQL to generate types, then create the file manually based on actual schema. Create the file at `src/types/database.types.ts`.

Use `mcp_supabase-mcp-server_generate_typescript_types` with `project_id: kwubpqzdburgjxqruejc`.

Save the output to `src/types/database.types.ts`.

If the MCP tool fails, manually create a minimal types file:

```typescript
export type Client = {
  id: string
  company_name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Vendor = {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  speciality: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'manager' | 'sales' | 'production' | 'logistics'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
```

---

### 2.1 — Clients Service Layer

**File: `src/services/clients.service.ts`** (NEW)

This service uses the **server** Supabase client. Every function is `async` and returns data or throws.

```typescript
import { createClient } from '@/lib/supabase/server'

export type ClientRow = {
  id: string
  company_name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CreateClientData = {
  company_name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  notes?: string
}

export type UpdateClientData = Partial<CreateClientData>

export async function getClients(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('company_name', { ascending: true })

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data as ClientRow[]
}

export async function getClient(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function createClientRecord(clientData: CreateClientData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...clientData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function updateClientRecord(id: string, clientData: UpdateClientData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}
```

---

### 2.2 — Client Validation Schema

**File: `src/lib/validations/client.schema.ts`** (NEW)

```typescript
import { z } from 'zod'

export const clientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  contact_person: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type ClientFormValues = z.infer<typeof clientSchema>
```

---

### 2.3 — useClients Hook

**File: `src/hooks/useClients.ts`** (NEW)

> This is a **client component** hook that uses the **browser** Supabase client for real-time fetching from client components.

```typescript
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ClientRow } from '@/services/clients.service'

export function useClients(search?: string) {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('company_name', { ascending: true })

    if (search) {
      query = query.or(
        `company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setClients(data as ClientRow[])
    }

    setLoading(false)
  }, [search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return { clients, loading, error, refetch: fetchClients }
}
```

---

### 2.4 — ClientsTable Component

**File: `src/components/clients/ClientsTable.tsx`** (NEW)

```typescript
'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ClientRow } from '@/services/clients.service'

interface ClientsTableProps {
  clients: ClientRow[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {client.company_name}
                </Link>
              </TableCell>
              <TableCell>{client.contact_person || '—'}</TableCell>
              <TableCell>{client.email || '—'}</TableCell>
              <TableCell>{client.phone || '—'}</TableCell>
              <TableCell>{client.city || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

### 2.5 — ClientForm Component

**File: `src/components/clients/ClientForm.tsx`** (NEW)

A `'use client'` component. Accepts an optional `defaultValues` prop — when provided, the form is in **edit mode**; otherwise **create mode**.

Uses `react-hook-form` with `zodResolver(clientSchema)`. Fields: `company_name` (required), `contact_person`, `phone`, `email`, `address`, `city`, `country`, `notes`. Submit button text changes based on mode.

On submit in **create mode**: call a server action that runs `createClientRecord()` → redirect to `/clients`. On submit in **edit mode**: call a server action that runs `updateClientRecord()` → redirect to `/clients/[id]`.

**Implementation notes:**
- Create `src/app/(dashboard)/clients/actions.ts` with server actions `createClientAction(formData)` and `updateClientAction(id, formData)`. These server actions import from `clients.service.ts`, call the service, and use `redirect()`.
- The form component calls these server actions via `useFormState` or direct form action.
- Each input uses shadcn's `Input` and `Label` components.
- Show validation errors inline below each field.
- Include a "Cancel" button that navigates back via `Link`.

---

### 2.6 — Clients List Page (REPLACE existing stub)

**File: `src/app/(dashboard)/clients/page.tsx`** (OVERWRITE)

This is a **Server Component**. It:
1. Reads optional `?search=` from URL searchParams
2. Calls `getClients(search)` from the service (server-side)
3. Renders a `PageHeader` (title "Clients" + "Add Client" button linking to `/clients/new`)
4. Renders a `SearchInput` component (client component that updates URL param)
5. If clients array is empty AND no search query → render `EmptyState` with "Add Client" CTA
6. If clients array is empty AND search query exists → render "No results" message
7. If clients exist → render `ClientsTable`

---

### 2.7 — Create Client Page

**File: `src/app/(dashboard)/clients/new/page.tsx`** (NEW)

Server Component that renders a `Card` containing `ClientForm` in create mode. Page title: "New Client".

---

### 2.8 — Client Detail Page

**File: `src/app/(dashboard)/clients/[id]/page.tsx`** (NEW)

Server Component that:
1. Calls `getClient(id)` from the service
2. If not found → `notFound()`
3. Renders client details in a `Card`:
   - Header: company_name + Edit button (Link to `/clients/[id]/edit`) + Delete button (with ConfirmDialog)
   - Grid layout showing: contact_person, email, phone, address, city, country
   - Notes section
   - Created/Updated timestamps using `DateDisplay`
   - **"Deals" section** — placeholder text: "Deals will appear here in Phase 3" (do NOT build deals listing yet)

---

### 2.9 — Edit Client Page

**File: `src/app/(dashboard)/clients/[id]/edit/page.tsx`** (NEW)

Server Component that:
1. Calls `getClient(id)` from service
2. Renders `ClientForm` with `defaultValues` filled from the fetched client
3. On submit → `updateClientAction` → redirect to `/clients/[id]`

---

### 2.10 — Client Server Actions

**File: `src/app/(dashboard)/clients/actions.ts`** (NEW)

```typescript
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClientRecord, updateClientRecord, deleteClientRecord } from '@/services/clients.service'
import { clientSchema } from '@/lib/validations/client.schema'

export async function createClientAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createClientRecord(parsed.data)
  revalidatePath('/clients')
  redirect('/clients')
}

export async function updateClientAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = clientSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateClientRecord(id, parsed.data)
  revalidatePath(`/clients/${id}`)
  redirect(`/clients/${id}`)
}

export async function deleteClientAction(id: string) {
  await deleteClientRecord(id)
  revalidatePath('/clients')
  redirect('/clients')
}
```

---

### 3.1 — Vendors Service Layer

**File: `src/services/vendors.service.ts`** (NEW)

Mirrors `clients.service.ts` exactly. Key differences:
- Table name: `vendors` (not `clients`)
- Primary name field: `name` (not `company_name`)
- Extra field: `speciality`
- Search: `name.ilike.%${search}%,contact_person.ilike.%${search}%,speciality.ilike.%${search}%`
- Functions: `getVendors(search?)`, `getVendor(id)`, `createVendorRecord(data)`, `updateVendorRecord(id, data)`, `deleteVendorRecord(id)`

---

### 3.2 — Vendor Validation Schema

**File: `src/lib/validations/vendor.schema.ts`** (NEW)

Same as client schema but:
- `name` (required, min 1) instead of `company_name`
- Includes `speciality: z.string().max(255).optional().or(z.literal(''))`

---

### 3.3 — useVendors Hook

**File: `src/hooks/useVendors.ts`** (NEW)

Mirrors `useClients.ts`. Uses `vendors` table, searches by `name`, `contact_person`, `speciality`.

---

### 3.4 — VendorsTable Component

**File: `src/components/vendors/VendorsTable.tsx`** (NEW)

Mirrors `ClientsTable.tsx`. Columns: Name, Contact Person, Speciality, Email, Phone. Links to `/vendors/[id]`.

---

### 3.5 — VendorForm Component

**File: `src/components/vendors/VendorForm.tsx`** (NEW)

Mirrors `ClientForm.tsx`. Fields: `name` (required), `contact_person`, `phone`, `email`, `address`, `speciality`, `notes`. Uses `vendorSchema`.

---

### 3.6 — Vendors List Page (REPLACE existing stub)

**File: `src/app/(dashboard)/vendors/page.tsx`** (OVERWRITE)

Mirrors clients list page pattern. Uses `getVendors()`, `VendorsTable`, `EmptyState`.

---

### 3.7 — Create Vendor Page

**File: `src/app/(dashboard)/vendors/new/page.tsx`** (NEW)

Mirrors create client page.

---

### 3.8 — Vendor Detail Page

**File: `src/app/(dashboard)/vendors/[id]/page.tsx`** (NEW)

Shows vendor details. "Production Orders" section is a placeholder: "Production orders will appear here in Phase 4."

---

### 3.9 — Vendor Server Actions

**File: `src/app/(dashboard)/vendors/actions.ts`** (NEW)

Mirrors client actions. Functions: `createVendorAction`, `updateVendorAction`, `deleteVendorAction`.

---

### 4.1 — LoadingSpinner

**File: `src/components/shared/LoadingSpinner.tsx`** (NEW)

```tsx
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-muted-foreground', className)} />
}
```

---

### 4.2 — ConfirmDialog

**File: `src/components/shared/ConfirmDialog.tsx`** (NEW)

A `'use client'` component using shadcn's `Dialog`. Props: `title`, `description`, `onConfirm`, `variant` (default | destructive), `triggerLabel`, `triggerIcon`. Renders a dialog with Cancel and Confirm buttons.

---

### 4.3 — SearchInput

**File: `src/components/shared/SearchInput.tsx`** (NEW)

A `'use client'` component. Renders an `Input` with a search icon. On change, debounces 300ms, then updates the URL `?search=` query parameter using `useRouter().replace()` and `useSearchParams()`. This triggers a server component re-render with the search value.

---

### 4.4 — DateDisplay

**File: `src/components/shared/DateDisplay.tsx`** (NEW)

```tsx
import { formatDate } from '@/lib/utils'

export function DateDisplay({ date }: { date: string | Date | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>
  return <span>{formatDate(date)}</span>
}
```

---

### 4.5 — PageHeader

**File: `src/components/shared/PageHeader.tsx`** (NEW)

Props: `title`, `description?`, `action?` (ReactNode for button). Renders `h1` title + optional description + right-aligned action.

```tsx
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

---

### 5.1 — useAuth Hook

**File: `src/hooks/useAuth.ts`** (NEW)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

---

### 6.1–6.3 — Verification

```bash
# P0: Build check
npm run build

# P0: Start dev server
npm run dev
```

**Client verification flow:**
1. Navigate to `/clients` → should show EmptyState with "Add Client" button
2. Click "Add Client" → navigate to `/clients/new`
3. Submit empty form → validation error on `company_name`
4. Fill in "Acme Corp" + optional fields → submit
5. Redirected to `/clients` → "Acme Corp" appears in table
6. Click "Acme Corp" → see detail page with all info
7. Click "Edit" → form pre-filled → change contact → save → verify change
8. Search for "Acme" → row appears. Search for "zzz" → no results message
9. Delete client → redirected to list → client gone

**Vendor verification flow:**
Same as clients, using vendor fields (`name` instead of `company_name`, `speciality` field).

---

## File Summary

| # | File | Type | Action |
|---|------|------|--------|
| 1 | `src/lib/utils.ts` | Utilities | **MODIFY** (add formatCurrency, formatDate, etc.) |
| 2 | `src/types/database.types.ts` | Types | **CREATE** |
| 3 | `src/services/clients.service.ts` | Service | **CREATE** |
| 4 | `src/lib/validations/client.schema.ts` | Schema | **CREATE** |
| 5 | `src/hooks/useClients.ts` | Hook | **CREATE** |
| 6 | `src/components/clients/ClientsTable.tsx` | Component | **CREATE** |
| 7 | `src/components/clients/ClientForm.tsx` | Component | **CREATE** |
| 8 | `src/app/(dashboard)/clients/page.tsx` | Page | **OVERWRITE** |
| 9 | `src/app/(dashboard)/clients/actions.ts` | Server Actions | **CREATE** |
| 10 | `src/app/(dashboard)/clients/new/page.tsx` | Page | **CREATE** |
| 11 | `src/app/(dashboard)/clients/[id]/page.tsx` | Page | **CREATE** |
| 12 | `src/app/(dashboard)/clients/[id]/edit/page.tsx` | Page | **CREATE** |
| 13 | `src/services/vendors.service.ts` | Service | **CREATE** |
| 14 | `src/lib/validations/vendor.schema.ts` | Schema | **CREATE** |
| 15 | `src/hooks/useVendors.ts` | Hook | **CREATE** |
| 16 | `src/components/vendors/VendorsTable.tsx` | Component | **CREATE** |
| 17 | `src/components/vendors/VendorForm.tsx` | Component | **CREATE** |
| 18 | `src/app/(dashboard)/vendors/page.tsx` | Page | **OVERWRITE** |
| 19 | `src/app/(dashboard)/vendors/actions.ts` | Server Actions | **CREATE** |
| 20 | `src/app/(dashboard)/vendors/new/page.tsx` | Page | **CREATE** |
| 21 | `src/app/(dashboard)/vendors/[id]/page.tsx` | Page | **CREATE** |
| 22 | `src/components/shared/LoadingSpinner.tsx` | Component | **CREATE** |
| 23 | `src/components/shared/ConfirmDialog.tsx` | Component | **CREATE** |
| 24 | `src/components/shared/SearchInput.tsx` | Component | **CREATE** |
| 25 | `src/components/shared/DateDisplay.tsx` | Component | **CREATE** |
| 26 | `src/components/shared/PageHeader.tsx` | Component | **CREATE** |
| 27 | `src/hooks/useAuth.ts` | Hook | **CREATE** |

---

## Execution Order (Dependency Chain)

```
1.1 (utils) ──┐
1.2 (types) ──┤
              ├── 2.1 (clients service) ── 2.2 (schema) ── 2.3 (hook)
              │                                              │
4.1-4.5 ──────┤                                    2.4 (table) + 2.5 (form)
              │                                              │
5.1 (useAuth)─┤                                    2.6-2.9 (pages) + 2.10 (actions)
              │
              └── 3.1 (vendors service) ── 3.2 (schema) ── 3.3 (hook)
                                                             │
                                                   3.4 (table) + 3.5 (form)
                                                             │
                                                   3.6-3.8 (pages) + 3.9 (actions)
```

Tasks 1.x, 4.x, and 5.x can be done in parallel. Clients module (2.x) and Vendors module (3.x) are sequential within each group but independent of each other. All must complete before 6.x verification.

---

## What Phase 3 Will Cover

After Phase 2 is verified:
- **Activities service** — `logActivity()` foundation for all future mutations
- **Deals module** — service, schema, hook, Kanban pipeline board (dnd-kit), deal detail page
- **Tasks module** — service, schema, hook, task list with tabs, quick-add from deal
