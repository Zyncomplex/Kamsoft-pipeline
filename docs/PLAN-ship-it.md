# PLAN-ship-it.md — Phase 5: Ship It

> **Objective:** Polish UX, complete testing, and prepare for production deployment — completing the Sales Operations CRM. This is Milestone 5 from `sales-ops-crm.md`.

---

## ⚠️ CRITICAL: Read Before You Start

1. **Next.js 16.2.2** — Uses `proxy.ts` NOT `middleware.ts`. Do NOT create middleware.
2. **Do NOT run `npm install`** — All deps are installed. Check `package.json` for proof.
3. **Zod v4.3.6** — Use `import { z } from 'zod'`. Do NOT use `zod/v4`.
4. **React Hook Form v7.72.0 + @hookform/resolvers v5.2.2** — Already installed.
5. **shadcn/ui components** — Already in `src/components/ui/`: button, button-variants, card, dialog, dropdown-menu, input, label, select, separator, sheet, table, tabs, tooltip, avatar, badge, sonner, checkbox, textarea. Do NOT re-install.
6. **`buttonVariants`** — Import from `@/components/ui/button-variants` (NOT from `button.tsx`). This was separated in Phase 2 to avoid Server Component crashes.
7. **`Button` with links** — Do NOT use `<Button asChild>`. Use `<Link className={cn(buttonVariants({ variant: "..." }))}>` or `<Button render={<Link href="..." />}>`. The `asChild` prop crashes with `@base-ui/react`.
8. **Supabase clients** — `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server) already exist.
9. **Existing types** — `src/types/database.types.ts` has ALL table types with Row/Insert/Update variants and all Enums.
10. **Existing constants** — `src/lib/constants.ts` has `NAV_ITEMS`, `DEAL_STAGES`, `TASK_STATUSES`, `TASK_PRIORITIES`, `PRODUCTION_STATUSES`, `SHIPMENT_STATUSES`, `USER_ROLES`.
11. **Existing utils** — `src/lib/utils.ts` has `cn()`, `formatCurrency()`, `formatDate()`, `formatDateTime()`, `timeAgo()`, `getDaysUntil()`.
12. **Existing shared components** — `StatusBadge`, `EmptyState`, `ConfirmDialog`, `PageHeader`, `SearchInput`, `LoadingSpinner`, `DateDisplay`, `ActivityTimeline`, `FormError` in `src/components/shared/`.
13. **Existing hooks** — `useAuth.ts`, `useClients.ts`, `useDeals.ts`, `useTasks.ts`, `useVendors.ts`, `useProduction.ts`, `useShipments.ts` in `src/hooks/`.
14. **Existing services** — `activities.service.ts`, `clients.service.ts`, `dashboard.service.ts`, `deals.service.ts`, `production.service.ts`, `shipments.service.ts`, `tasks.service.ts`, `vendors.service.ts` in `src/services/`.
15. **Server Actions pattern** — Uses `useActionState` with `(_prevState: unknown, formData: FormData)` signature, `cleanFormData` helper to convert `''` → `null`, try/catch with `revalidatePath` + `redirect`.
16. **Sonner toast** — Already installed and wired into `src/app/layout.tsx` via `<Toaster />`. Import: `import { toast } from 'sonner'`.
17. **ConfirmDialog** — Already exists in `src/components/shared/ConfirmDialog.tsx`. Currently used on `/clients/[id]` and `/vendors/[id]` detail pages.
18. **Layout components** — `AppShell.tsx` (flex box with Sidebar + Header + main), `Sidebar.tsx` (hidden on mobile: `hidden md:block`), `Header.tsx` (mobile menu via Sheet, user dropdown).
19. **Sidebar mobile** — Already collapses. Header has a `<Sheet>` hamburger menu for `md:hidden` screens  — this already works.
20. **`use-debounce` v10.1.1** — Already installed for `SearchInput`. Import: `import { useDebounce } from 'use-debounce'`.
21. **`date-fns` v4.1.0** — Already installed. Used in `src/lib/utils.ts`.
22. **`next-themes` v0.4.6** — Already installed but NOT wired up. Not required for Phase 5.

### Supabase Project

| Key | Value |
|-----|-------|
| **Project ID** | `kwubpqzdburgjxqruejc` |
| **Project URL** | `https://kwubpqzdburgjxqruejc.supabase.co` |

---

## Task Checklist

### PHASE 5A — Toast Notifications + Confirmation Dialogs (M5.1)

- [ ] **1.1** Audit all mutation flows — identify missing toast notifications
- [ ] **1.2** Add toast.success to Client create/update actions
- [ ] **1.3** Add toast.success to Deal create/update actions
- [ ] **1.4** Add ConfirmDialog for destructive actions: "Mark deal as lost" on deal detail
- [ ] **1.5** Verify: every create/update/delete shows toast, destructive actions require confirmation

### PHASE 5B — Loading Skeletons (M5.2)

- [ ] **2.1** Create `src/components/ui/skeleton.tsx` — shadcn skeleton primitive
- [ ] **2.2** Create `src/components/shared/TableSkeleton.tsx` — reusable table loading skeleton
- [ ] **2.3** Create `src/components/shared/CardSkeleton.tsx` — reusable card loading skeleton
- [ ] **2.4** Add Suspense boundaries with TableSkeleton to all list pages (clients, vendors, deals, tasks, production, shipments)
- [ ] **2.5** Add Suspense boundary with CardSkeleton to dashboard stat cards
- [ ] **2.6** Verify: no blank screens during data fetch on any page

### PHASE 5C — Global Search (M5.3)

- [ ] **3.1** Create `src/services/search.service.ts` — searches clients + deals by name
- [ ] **3.2** Create `src/components/shared/GlobalSearch.tsx` — command palette in header
- [ ] **3.3** Modify `src/components/layout/Header.tsx` — wire GlobalSearch into header bar
- [ ] **3.4** Verify: typing in search finds clients + deals, clicking result navigates

### PHASE 5D — Mobile Responsiveness (M5.4)

- [ ] **4.1** Audit table horizontal scroll on all list pages
- [ ] **4.2** Ensure deal detail page stacks to single column on mobile
- [ ] **4.3** Ensure Kanban board horizontally scrollable on mobile
- [ ] **4.4** Audit touch targets (min 44px) and font sizes (min 14px)
- [ ] **4.5** Verify: complete a deal flow on 375px viewport

### PHASE 5E — Empty States + Overdue Highlighting (M5.5)

- [ ] **5.1** Audit all list pages for EmptyState components with CTAs
- [ ] **5.2** Ensure red background/text for overdue items in tasks, production, shipments tables
- [ ] **5.3** Verify: fresh account sees helpful empty states, not blank screens

### PHASE 5F — UX Non-Negotiables Audit (M5.6)

- [ ] **6.1** Audit all 10 UX rules from PRD Section 14
- [ ] **6.2** Fix any violations found

### PHASE 5G — Settings Page (Bonus Polish)

- [ ] **7.1** Replace Settings stub with user profile display + sign-out

### PHASE 5H — Verification

- [ ] **8.1** Run `npm run build` — fix ALL errors
- [ ] **8.2** Execute 15-point manual test checklist (M5.7)
- [ ] **8.3** Run verification scripts

---

## Detailed Instructions Per Task

---

### 1.1 — Audit All Mutation Flows for Missing Toasts

**Action:** Read through all form components and action handlers. Identify which create/update flows are MISSING `toast.success()` after successful mutation.

**Current toast coverage (already implemented):**

| Module | File | Has toast.success? | Has toast.error? |
|--------|------|-------------------|------------------|
| Clients | `ClientForm.tsx` | ❌ **MISSING** | ✅ Yes |
| Vendors | `VendorForm.tsx` | ❌ **MISSING** | ✅ Yes |
| Deals | `DealForm.tsx` | ❌ **MISSING** | ✅ Yes |
| Deals | `PipelineBoard.tsx` | ✅ Yes (stage change) | ✅ Yes |
| Tasks | `TaskForm.tsx` | ❌ **MISSING** | ✅ Yes |
| Tasks | `TaskCard.tsx` | ✅ Yes (complete) | ✅ Yes |
| Tasks | `QuickAddTask.tsx` | ✅ Yes | ✅ Yes |
| Production | `ProductionForm.tsx` | ✅ Yes | ❌ Missing |
| Production | `StatusUpdate.tsx` | ✅ Yes | ✅ Yes |
| Shipments | `ShipmentForm.tsx` | ✅ Yes | ❌ Missing |
| Shipments | `StatusUpdate.tsx` | ✅ Yes | ✅ Yes |
| Shipments | `ShipmentTable.tsx` | ✅ Yes (copy) | - |

**Gap:** The forms for Client, Vendor, Deal, and Task create/update do NOT show `toast.success` after a successful mutation. They only show `toast.error` when there's a `state.message` error. This is because the Server Actions `redirect()` after success, so the useEffect that checks `state` never sees a success — the user is redirected to a new page.

**Solution:** These forms use the Server Action pattern where `redirect()` is called on success. Because `redirect()` throws a `NEXT_REDIRECT` error internally, the component unmounts before any success toast fires. The correct pattern is to show the toast on the **destination page** using **URL search params**.

**Pattern for success toast via redirect:**

1. In the Server Action, change `redirect('/clients')` → `redirect('/clients?created=true')`
2. On the list page, read `searchParams.created` and render a client-side `<ToastTrigger message="Client created" />` component

**However**, this adds complexity. A simpler approach that works with the existing architecture:

**Simpler pattern — use `useEffect` on `state` shape:**

Currently, the actions return `{ error: ... }` on validation failure and `{ message: ... }` on server error. On success, they `redirect()` which throws. So `state` is never updated on success.

**The most pragmatic fix:** Add `toast.success` to the `useEffect` in each form that fires **before** redirect happens (during the `startTransition`). But since `redirect` throws, this won't work.

**FINAL APPROACH — Use `toast.success` in a Route-level Toast Component:**

Create a lightweight `<SuccessToast />` component that reads from URL params on mount. This is the most reliable pattern:

```typescript
// src/components/shared/SuccessToast.tsx
'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function SuccessToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const successMessage = searchParams.get('success')

  useEffect(() => {
    if (successMessage) {
      toast.success(decodeURIComponent(successMessage))
      // Clean the URL without navigation
      const params = new URLSearchParams(searchParams)
      params.delete('success')
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [successMessage, pathname, router, searchParams])

  return null
}
```

Then add `<SuccessToast />` to the `AppShell.tsx` **once**, and modify each Server Action to pass `?success=Client+created` on redirect.

---

### 1.2 — Add Toast to Client Create/Update Actions

**File: `src/app/(dashboard)/clients/actions.ts`** (MODIFY)

**Change 1:** In `createClientAction`, change:
```typescript
redirect('/clients')
```
to:
```typescript
redirect('/clients?success=' + encodeURIComponent('Client created successfully'))
```

**Change 2:** In `updateClientAction`, change:
```typescript
redirect(`/clients/${id}`)
```
to:
```typescript
redirect(`/clients/${id}?success=` + encodeURIComponent('Client updated successfully'))
```

---

### 1.3 — Add Toast to Deal Create/Update Actions

**File: `src/app/(dashboard)/deals/actions.ts`** (MODIFY)

**Change 1:** In `createDealAction`, change redirect to:
```typescript
redirect('/deals?success=' + encodeURIComponent('Deal created successfully'))
```

**Change 2:** In `updateDealAction`, change redirect to:
```typescript
redirect(`/deals/${id}?success=` + encodeURIComponent('Deal updated successfully'))
```

**Repeat the same pattern for:**
- `src/app/(dashboard)/vendors/actions.ts` — `createVendorAction` + `updateVendorAction`
- `src/app/(dashboard)/tasks/actions.ts` — `createTaskAction` + `updateTaskAction`
- `src/app/(dashboard)/production/actions.ts` — `createProductionAction` + `updateProductionAction`
- `src/app/(dashboard)/shipments/actions.ts` — `createShipmentAction` + `updateShipmentAction`

---

### 1.4 — Add ConfirmDialog for "Mark Deal as Lost"

**File: `src/app/(dashboard)/deals/[id]/page.tsx`** (MODIFY)

**Context:** The deal detail page should have a "Mark as Lost" action for active deals. This is a destructive action requiring a ConfirmDialog.

**Step 1:** Create a new Server Action in `src/app/(dashboard)/deals/actions.ts`:

```typescript
export async function markDealAsLostAction(id: string) {
  try {
    await updateDeal(id, { stage: 'lost' })
    await logActivity({
      event_type: 'deal_stage_changed',
      deal_id: id,
      metadata: { from: 'current', to: 'lost' },
    })
  } catch (err: unknown) {
    return { message: err instanceof Error ? err.message : String(err) }
  }

  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  redirect(`/deals/${id}?success=` + encodeURIComponent('Deal marked as lost'))
}
```

> **NOTE:** `updateDeal` must already exist in `deals.service.ts`. Check the actual function name — it's likely `updateDeal(id, data)`. If the function name is different (e.g., `updateDealRecord`), use the correct name.

**Step 2:** Add a "Mark as Lost" button wrapped in `ConfirmDialog` on the deal detail page. Only show it when `deal.stage !== 'lost'` and `deal.stage !== 'completed'`.

```tsx
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

// Inside the JSX, after the Edit button:
{deal.stage !== 'lost' && deal.stage !== 'completed' && (
  <ConfirmDialog
    title="Mark Deal as Lost"
    description="This will move the deal to the Lost stage. This action can be undone by changing the stage later."
    onConfirm={async () => {
      const formData = new FormData()
      // Call the server action directly
      await markDealAsLostAction(deal.id)
    }}
    confirmLabel="Mark as Lost"
    variant="destructive"
    triggerLabel="Mark as Lost"
  />
)}
```

> **IMPORTANT:** The `ConfirmDialog` is already a `'use client'` component. The deal detail page is a Server Component. You will need to extract the action buttons into a small client component wrapper OR use the ConfirmDialog as a child of a client component.

**Recommended approach:** Create a small wrapper:

```typescript
// src/components/deals/DealActions.tsx (NEW)
'use client'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { markDealAsLostAction } from '@/app/(dashboard)/deals/actions'

export function DealLostButton({ dealId }: { dealId: string }) {
  return (
    <ConfirmDialog
      title="Mark Deal as Lost"
      description="This will move the deal to the Lost stage. You can undo this by changing the stage later."
      onConfirm={() => markDealAsLostAction(dealId)}
      confirmLabel="Mark as Lost"
      variant="destructive"
      triggerLabel="Mark as Lost"
    />
  )
}
```

Then in the deal detail page (Server Component), import and render:
```tsx
{deal.stage !== 'lost' && deal.stage !== 'completed' && (
  <DealLostButton dealId={deal.id} />
)}
```

---

### 1.5 — Wire SuccessToast into AppShell + Verify

**File: `src/components/shared/SuccessToast.tsx`** (NEW) — As specified in 1.1.

**File: `src/components/layout/AppShell.tsx`** (MODIFY)

Add `<SuccessToast />` ONCE in the layout:

```tsx
'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SuccessToast } from '@/components/shared/SuccessToast'
import { Suspense } from 'react'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
    </div>
  )
}
```

> **WHY Suspense?** `useSearchParams()` requires a Suspense boundary in Next.js 16 when used in a client component that isn't inside a page.

**Verify:** Create a client → should see toast "Client created successfully" on redirect to `/clients`. Update a deal → should see toast on redirect to deal detail.

---

### 2.1 — Skeleton UI Primitive

**File: `src/components/ui/skeleton.tsx`** (NEW)

```tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

---

### 2.2 — TableSkeleton Component

**File: `src/components/shared/TableSkeleton.tsx`** (NEW)

Reusable skeleton that mimics a data table with a configurable number of rows and columns.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`r-${rowIdx}`} className="border-b last:border-0 p-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={`c-${rowIdx}-${colIdx}`}
                className={cn(
                  "h-4 flex-1",
                  colIdx === 0 && "max-w-[200px]",
                  colIdx === columns - 1 && "max-w-[80px]"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

> **NOTE:** Import `cn` from `@/lib/utils`.

---

### 2.3 — CardSkeleton Component

**File: `src/components/shared/CardSkeleton.tsx`** (NEW)

Reusable skeleton for stat cards and detail cards.

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DetailCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat cards row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Widget grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <DetailCardSkeleton />
        <DetailCardSkeleton />
      </div>
    </div>
  )
}
```

---

### 2.4 — Add Suspense Boundaries to All List Pages

For each list page, the pattern is:

1. Extract the async data-fetching logic into a separate async Server Component
2. Wrap it with `<Suspense fallback={<TableSkeleton />}>`

**Pages to modify:**

| # | File | Async Component Name |
|---|------|---------------------|
| 1 | `src/app/(dashboard)/clients/page.tsx` | `ClientsList` |
| 2 | `src/app/(dashboard)/vendors/page.tsx` | `VendorsList` |
| 3 | `src/app/(dashboard)/deals/page.tsx` | Already client-rendered via hook — **SKIP** |
| 4 | `src/app/(dashboard)/tasks/page.tsx` | Already client-rendered via hook — **SKIP** |
| 5 | `src/app/(dashboard)/production/page.tsx` | `ProductionList` |
| 6 | `src/app/(dashboard)/shipments/page.tsx` | `ShipmentsList` |

> **WHY SKIP deals and tasks?** These pages are `'use client'` components that use hooks (`useDeals`, `useTasks`). They already have `loading` state managed by the hook. If `loading` is true, they should render the skeleton instead of nothing. We'll add that check to those components.

**Pattern for Server Component list pages (clients, vendors, production, shipments):**

```tsx
// Example: src/app/(dashboard)/clients/page.tsx
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

// Extract data fetch into async component
async function ClientsList({ searchParams }: { search?: string }) {
  const clients = await getClients({ search: searchParams.search })
  // ... existing rendering logic
  return <ClientsTable clients={clients} />
}

export default function ClientsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  return (
    <div>
      <PageHeader ... />
      <SearchInput />
      <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
        <ClientsList searchParams={await searchParams} />
      </Suspense>
    </div>
  )
}
```

**For client-rendered pages (deals, tasks):**

Modify the pages to show `<TableSkeleton />` when `loading` is true:

```tsx
// Inside the component where useTasks/useDeals is called:
if (loading) return <TableSkeleton rows={6} columns={4} />
```

---

### 2.5 — Add Suspense to Dashboard

**File: `src/app/(dashboard)/page.tsx`** (MODIFY)

The dashboard already has a `<Suspense>` boundary wrapping `<DashboardOverview />` with `<LoadingSpinner />` as fallback. **Replace** the fallback with `<DashboardSkeleton />`:

```tsx
import { DashboardSkeleton } from '@/components/shared/CardSkeleton'

// Change:
<Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
// To:
<Suspense fallback={<DashboardSkeleton />}>
```

---

### 3.1 — Global Search Service

**File: `src/services/search.service.ts`** (NEW)

Uses the **server** Supabase client. Searches across clients and deals tables.

```typescript
import { createClient } from '@/lib/supabase/server'

export type SearchResult = {
  id: string
  type: 'client' | 'deal'
  title: string
  subtitle: string | null
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const searchTerm = `%${query}%`

  const [clientsResult, dealsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id, company_name, contact_person')
      .eq('is_active', true)
      .or(`company_name.ilike.${searchTerm},contact_person.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5),

    supabase
      .from('deals')
      .select('id, deal_name, clients:client_id(company_name)')
      .eq('is_archived', false)
      .ilike('deal_name', searchTerm)
      .limit(5),
  ])

  const results: SearchResult[] = []

  if (clientsResult.data) {
    for (const c of clientsResult.data) {
      results.push({
        id: c.id,
        type: 'client',
        title: c.company_name,
        subtitle: c.contact_person,
        href: `/clients/${c.id}`,
      })
    }
  }

  if (dealsResult.data) {
    for (const d of dealsResult.data) {
      const companyName = (d.clients as Record<string, unknown> | null)?.company_name as string | null
      results.push({
        id: d.id,
        type: 'deal',
        title: d.deal_name,
        subtitle: companyName ?? null,
        href: `/deals/${d.id}`,
      })
    }
  }

  return results
}
```

> **WHY server service?** The global search runs a `.ilike()` query that requires the server Supabase client for proper RLS enforcement. We'll call it from a Server Action to bridge the client/server gap.

**File: `src/app/(dashboard)/search-action.ts`** (NEW)

```typescript
'use server'

import { globalSearch, type SearchResult } from '@/services/search.service'

export async function searchAction(query: string): Promise<SearchResult[]> {
  return globalSearch(query)
}
```

---

### 3.2 — GlobalSearch Component

**File: `src/components/shared/GlobalSearch.tsx`** (NEW)

`'use client'` component. A search input in the header with a dropdown results panel.

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { Search, Users, Briefcase, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchAction } from '@/app/(dashboard)/search-action'
import type { SearchResult } from '@/services/search.service'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 300)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch results on debounced query change
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    searchAction(debouncedQuery).then((data) => {
      setResults(data)
      setOpen(data.length > 0)
      setLoading(false)
    })
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut: "/" to focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        const input = containerRef.current?.querySelector('input')
        input?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search clients & deals... ( / )"
        className="pl-10 pr-8 h-9 text-sm"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm"
            >
              {result.type === 'client' ? (
                <Users className="h-4 w-4 text-blue-500 shrink-0" />
              ) : (
                <Briefcase className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{result.title}</p>
                {result.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 3.3 — Wire GlobalSearch into Header

**File: `src/components/layout/Header.tsx`** (MODIFY)

Replace the current static `<h1>{currentTitle}</h1>` section with the GlobalSearch component, while keeping the title.

```tsx
// Add import:
import { GlobalSearch } from '@/components/shared/GlobalSearch'

// Change the <div className="w-full flex-1"> section from:
<div className="w-full flex-1">
  <h1 className="text-lg font-semibold md:text-xl">{currentTitle}</h1>
</div>

// To:
<div className="w-full flex-1 flex items-center gap-4">
  <h1 className="text-lg font-semibold md:text-xl hidden lg:block">{currentTitle}</h1>
  <div className="flex-1 lg:max-w-sm lg:ml-auto">
    <GlobalSearch />
  </div>
</div>
```

> **WHY hide title on mobile?** On small screens, the search bar takes priority. The page title is still visible as each page renders its own `<PageHeader>`.

---

### 4.1 — Table Horizontal Scroll Audit

**All table components** must be wrapped in a horizontally scrollable container on mobile. Check each:

| File | Component | Has overflow-x? |
|------|-----------|----------------|
| `clients/ClientsTable.tsx` | ClientsTable | CHECK |
| `vendors/VendorsTable.tsx` | VendorsTable | CHECK |
| `production/ProductionTable.tsx` | ProductionTable | CHECK |
| `shipments/ShipmentTable.tsx` | ShipmentTable | CHECK |

**Pattern:** Each table should be wrapped in:
```tsx
<div className="w-full overflow-x-auto">
  <Table>
    <TableHeader>
      {/* ensure min-width on the table or its wrapper */}
    </TableHeader>
    <TableBody>...</TableBody>
  </Table>
</div>
```

If any table is missing `overflow-x-auto` on its scroll container, add it. Also add `min-w-[600px]` or appropriate min-width to the `<Table>` element so it doesn't compress below readable widths.

---

### 4.2 — Deal Detail Single Column Stack

**File: `src/app/(dashboard)/deals/[id]/page.tsx`** (VERIFY/MODIFY)

The deal detail page likely uses a 2-column grid. Ensure the responsive classes follow:

```tsx
// Should be:
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar / Activity Timeline */}
  </div>
</div>
```

On screens below `lg` (1024px), both columns should stack vertically. Verify the `lg:` prefix is used (NOT `md:` which would stack at a narrower breakpoint).

---

### 4.3 — Kanban Board Mobile Scroll

**File: `src/components/deals/PipelineBoard.tsx`** (VERIFY/MODIFY)

The Kanban board with 9 stage columns must be horizontally scrollable on mobile. Ensure:

```tsx
<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
  {DEAL_STAGES.map(stage => (
    <div key={stage.value} className="min-w-[280px] w-[280px] shrink-0 snap-start">
      {/* Column content */}
    </div>
  ))}
</div>
```

Key properties:
- `overflow-x-auto` on the parent flex container
- `min-w-[280px]` and `shrink-0` on each column to prevent compression
- Optional: `snap-x snap-mandatory` + `snap-start` for nice scroll snapping

---

### 4.4 — Touch Target and Font Size Audit

**Minimum requirements (from PRD):**
- Touch targets: minimum **44px × 44px** (buttons, links, checkboxes)
- Font size: minimum **14px** (0.875rem) for body text

**Check these components:**
1. `Button` — Default size should be at least `h-10` (40px). ✅ Already correct in shadcn default.
2. `Input` — Default height `h-10`. ✅
3. `Checkbox` — `@radix-ui/react-checkbox` renders 16×16 by default → **Add `h-5 w-5` (20px) and ensure the click area is padded to 44px**
4. Table row action buttons — Ensure they have sufficient padding
5. StatusUpdate dropdowns — `h-8 text-xs` is only **32px** → Consider increasing to `h-9` or `h-10`
6. Tab navigation links — Ensure adequate padding

**CSS globals check:** The base font size in `globals.css` uses browser default (16px), which is fine. Just verify no component uses `text-xs` (12px) for primary content. `text-xs` is acceptable for labels and metadata only.

---

### 5.1 — Empty States with CTAs Audit

Check each list page has `<EmptyState>` when data is empty:

| Page | Has EmptyState? | Action |
|------|----------------|--------|
| `/clients` | CHECK — should use `EmptyState` with "Add Client" CTA | Verify or add |
| `/vendors` | CHECK | Verify or add |
| `/deals` | CHECK — Kanban board, should show when no deals | Verify or add |
| `/tasks` | CHECK — each tab | Verify or add |
| `/production` | CHECK | Verify or add |
| `/shipments` | CHECK | Verify or add |

**Pattern:** Each page should include:
```tsx
if (items.length === 0) {
  return (
    <EmptyState
      title="No clients yet"
      description="Get started by adding your first client."
      actionLabel="Add Client"
      actionHref="/clients/new"
      icon={Users}
    />
  )
}
```

---

### 5.2 — Overdue Highlighting Audit

**Tasks:** Overdue tasks (due_date < today AND status !== 'done') must show red text/background.

Check `TaskCard.tsx` and `TaskList.tsx`:
- Due date text should be `text-red-600 font-semibold` when overdue
- Row/card background should have `bg-red-50` when overdue

**Production:** Already implemented in `ProductionTable.tsx` — `bg-red-50 text-red-900` for delayed/overdue rows. ✅

**Shipments:** Already implemented in `ShipmentTable.tsx` — red background for delayed rows. ✅

---

### 6.1 — UX Non-Negotiables Audit

**The 10 rules from PRD Section 14:**

| # | Rule | What to Check | Expected |
|---|------|---------------|----------|
| 1 | Max 5 primary actions visible per screen | Count primary (not secondary) action buttons on each page | ≤ 5 |
| 2 | Status changes = one click or one dropdown | Production/Shipment status updates | ✅ Inline Select dropdown |
| 3 | All tables searchable | Clients, vendors, deals, tasks, production, shipments | Check `SearchInput` presence |
| 4 | Overdue items shown in red | Tasks, production, shipments | ✅ Verified in 5.2 |
| 5 | Empty states always have CTA | All list pages | ✅ Verified in 5.1 |
| 6 | Dropdowns for list-sourced fields | Client select in deals, vendor select in production, etc. | No free text for FK fields |
| 7 | Toast for every mutation | All create/update/delete/complete actions | ✅ After Phase 5A |
| 8 | Confirm dialogs ONLY for destructive | Mark lost, delete client, delete vendor | ConfirmDialog present |
| 9 | Font size min 14px | Body text (not metadata labels) | Check globals |
| 10 | Next Action fields always visible on deal detail | Deal detail page must show `next_action` and `next_action_date` prominently | Check deal detail |

**For rule 3 (all tables searchable):**

Check if `SearchInput` exists on these list pages:
- `/clients` → Already has SearchInput ✅
- `/vendors` → CHECK
- `/deals` → Pipeline board — may not have search ❌ (need to add)
- `/tasks` → Uses tabs, no search bar — consider adding filter
- `/production` → CHECK
- `/shipments` → CHECK

If `/deals` and `/tasks` don't have search/filter, add `SearchInput` or a filter mechanism.

**For rule 10 (next action):**

Check if the deal detail page prominently displays `next_action` and `next_action_date` fields. These fields exist in the `deals` table. If they're not visible, add them to the deal detail page header or info section.

---

### 7.1 — Settings Page Polish

**File: `src/app/(dashboard)/settings/page.tsx`** (OVERWRITE)

Replace the placeholder with a functional page showing user profile info and a sign-out button.

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Settings - Sales Ops CRM',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{profile?.full_name || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{profile?.role || 'No role'}</p>
            </div>
          </div>

          <div className="grid gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium capitalize">{profile?.role || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/auth/signout" method="POST">
            <Button variant="destructive" type="submit">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

> **WHY this design?** The PRD settings page was intentionally deferred. This lightweight profile view satisfies the "Settings" nav item without adding unnecessary complexity. It shows who's logged in and provides a clear sign-out action.

---

### PHASE 5H — Verification Steps

---

### 8.1 — Build Verification

```bash
npm run build
```

Must pass with 0 TypeScript errors. Common issues to watch for:
- `SearchResult` type import in GlobalSearch (ensure it's exported)
- `Skeleton` component import paths
- Missing `cn` import in `TableSkeleton`
- Server/client boundary violations in SuccessToast (needs Suspense wrapper)

---

### 8.2 — Manual Test Checklist (15 Points from PRD M5.7)

Execute each step in order on `npm run dev`:

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Create a client | `/clients/new` → fill form → submit | Redirect to `/clients` + toast "Client created" |
| 2 | Create a deal linked to that client | `/deals/new` → select client → fill → submit | Redirect to `/deals` + toast "Deal created" |
| 3 | Move deal through pipeline stages | Click deal in Kanban → drag to next stage | Toast shows stage name, card moves |
| 4 | Create a follow-up task from deal page | `/deals/[id]` → "Add Follow-up" → fill → submit | Toast "Task created" |
| 5 | Mark task as complete | `/tasks` → click checkbox on task | Toast "Task completed", task disappears from list |
| 6 | Create a vendor | `/vendors/new` → fill form → submit | Redirect + toast |
| 7 | Create production order | `/production/new` → select deal + vendor → submit | Redirect + toast |
| 8 | Update production status | `/production` → change status dropdown | Toast shows new status |
| 9 | Create a shipment | `/shipments/new` → select deal → submit | Redirect + toast |
| 10 | Update shipment to delivered | `/shipments` → change status to "Delivered" | Toast, actual_delivery_date auto-filled |
| 11 | Verify activities on deal timeline | `/deals/[id]` → Activity tab | Shows all events chronologically |
| 12 | Verify dashboard counts | `/` (dashboard) | Stat cards show correct numbers |
| 13 | Test login/logout | Sign out → Sign in | Auth flow works |
| 14 | Test with two accounts | Create second user → login → verify | Each sees their own data |
| 15 | Verify RLS | Sales user → check tasks list | Cannot see other users' tasks |

---

### 8.3 — Automated Verification

```bash
# P0: Lint + Type Check
npm run lint && npx tsc --noEmit

# P0: Build verification
npm run build
```

---

## File Summary

| # | File | Type | Action |
|---|------|------|--------|
| 1 | `src/components/shared/SuccessToast.tsx` | Component | **CREATE** |
| 2 | `src/components/deals/DealActions.tsx` | Component | **CREATE** |
| 3 | `src/components/layout/AppShell.tsx` | Layout | **MODIFY** — add SuccessToast |
| 4 | `src/app/(dashboard)/clients/actions.ts` | Actions | **MODIFY** — add success params to redirects |
| 5 | `src/app/(dashboard)/vendors/actions.ts` | Actions | **MODIFY** — add success params to redirects |
| 6 | `src/app/(dashboard)/deals/actions.ts` | Actions | **MODIFY** — add success params + markDealAsLost |
| 7 | `src/app/(dashboard)/tasks/actions.ts` | Actions | **MODIFY** — add success params to redirects |
| 8 | `src/app/(dashboard)/production/actions.ts` | Actions | **MODIFY** — add success params to redirects |
| 9 | `src/app/(dashboard)/shipments/actions.ts` | Actions | **MODIFY** — add success params to redirects |
| 10 | `src/components/ui/skeleton.tsx` | UI Component | **CREATE** |
| 11 | `src/components/shared/TableSkeleton.tsx` | Component | **CREATE** |
| 12 | `src/components/shared/CardSkeleton.tsx` | Component | **CREATE** |
| 13 | `src/app/(dashboard)/clients/page.tsx` | Page | **MODIFY** — add Suspense boundary |
| 14 | `src/app/(dashboard)/vendors/page.tsx` | Page | **MODIFY** — add Suspense boundary |
| 15 | `src/app/(dashboard)/production/page.tsx` | Page | **MODIFY** — add Suspense boundary |
| 16 | `src/app/(dashboard)/shipments/page.tsx` | Page | **MODIFY** — add Suspense boundary |
| 17 | `src/app/(dashboard)/page.tsx` | Page | **MODIFY** — replace LoadingSpinner with DashboardSkeleton |
| 18 | `src/services/search.service.ts` | Service | **CREATE** |
| 19 | `src/app/(dashboard)/search-action.ts` | Action | **CREATE** |
| 20 | `src/components/shared/GlobalSearch.tsx` | Component | **CREATE** |
| 21 | `src/components/layout/Header.tsx` | Layout | **MODIFY** — wire GlobalSearch |
| 22 | `src/app/(dashboard)/deals/[id]/page.tsx` | Page | **MODIFY** — add DealLostButton |
| 23 | `src/app/(dashboard)/settings/page.tsx` | Page | **OVERWRITE** — user profile |

**Total: 23 files (8 new, 14 modify, 1 overwrite)**

---

## Execution Order (Dependencies)

```
Phase 5A (Toasts) — No deps, start immediately
  1. SuccessToast.tsx (no deps)
  2. AppShell.tsx modification (depends on 1)
  3. All action file modifications (no deps, parallel)
  4. DealActions.tsx + deal detail modification (depends on 3)
  5. Verify toasts (depends on 2, 3, 4)

Phase 5B (Skeletons) — No deps, can run parallel with 5A
  1. skeleton.tsx (no deps)
  2. TableSkeleton.tsx + CardSkeleton.tsx (depends on 1, parallel)
  3. All page modifications (depends on 2, parallel)
  4. Dashboard modification (depends on 2)

Phase 5C (Global Search) — No deps, can run parallel
  1. search.service.ts (no deps)
  2. search-action.ts (depends on 1)
  3. GlobalSearch.tsx (depends on 2)
  4. Header.tsx modification (depends on 3)

Phase 5D (Mobile) — Depends on 5B (skeleton components exist)
  1-4. Audit steps (depends on pages being finalized)

Phase 5E (Empty States + Overdue) — Parallel with 5D
  1-3. Audit and fix steps

Phase 5F (UX Audit) — Depends on 5A through 5E
  1-2. Audit all 10 rules

Phase 5G (Settings) — No deps, can run anytime
  1. Settings page overwrite

Phase 5H (Verification) — MUST BE LAST
  1. npm run build
  2. Manual test checklist
  3. Automated scripts
```

**Parallel groups:**
- **Group A:** Phase 5A tasks 1-4 (all action modifications in parallel)
- **Group B:** Phase 5B tasks 1-3 (skeleton components in parallel after primitive)
- **Group C:** Phase 5C tasks 1-4 (sequential — service → action → component → header)
- **Group D:** Phase 5D + 5E (audit steps, parallel with each other, serial within)
- **Group E:** Phase 5G (independent, anytime)

---

## Done When

- [ ] Every create/update/delete action shows a toast notification
- [ ] Destructive actions (mark deal lost, delete client/vendor) require ConfirmDialog
- [ ] All list pages show skeleton loading states (no blank screens)
- [ ] Dashboard shows skeleton during load
- [ ] Global search in header finds clients + deals by name
- [ ] Keyboard shortcut "/" focuses search
- [ ] All tables horizontally scrollable on mobile
- [ ] Deal detail stacks to single column on mobile
- [ ] Kanban board scrollable on mobile
- [ ] Empty states with CTAs on all list pages
- [ ] Overdue items highlighted in red
- [ ] All 10 UX non-negotiables from PRD verified
- [ ] Settings page shows user profile
- [ ] `npm run build` passes with 0 errors
- [ ] All 15 manual test cases pass
