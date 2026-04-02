# Sales Operations CRM — Build Plan

## Overview

Lightweight internal Sales Operations CRM replacing scattered spreadsheets with one unified tool. Covers client management, sales pipeline (Kanban board), follow-up task system, production order tracking (vendor management), shipment tracking, and a daily operations dashboard.

**Design Philosophy:** Operational tool — not enterprise CRM. Faster than spreadsheets, zero training needed, one-click status changes, every deal shows a clear next action.

**Architecture Sources:**
- Sales pipeline → inspired by Twenty CRM
- Task/activity system → inspired by EspoCRM
- Shipment lifecycle → logistics CRM patterns

---

## Project Type

**WEB** — Next.js 14 (App Router) + Supabase

---

## Success Criteria

| # | Metric | How to Verify |
|---|--------|---------------|
| 1 | All deal updates happen in the system | Deals table has daily stage changes |
| 2 | "What am I doing today?" answered by dashboard | Dashboard shows tasks, follow-ups, delays |
| 3 | Production delays identified proactively | Dashboard widget surfaces delayed orders |
| 4 | Shipment status answerable in <10 seconds | Search → find deal → see shipment status |
| 5 | No training needed | New user can create a deal + task without help |

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR, file-based routing, React Server Components |
| **Language** | TypeScript (strict) | Type safety across full stack |
| **Styling** | Tailwind CSS + shadcn/ui | Agent-friendly copy-paste components, consistent design |
| **Database** | Supabase (PostgreSQL) | Managed DB, built-in Auth, RLS, Realtime |
| **Auth** | Supabase Auth (email/password) | Zero-config, auto profile creation trigger |
| **Drag & Drop** | @dnd-kit | Kanban pipeline board |
| **Forms** | React Hook Form + Zod | Validation, minimal re-renders |
| **Icons** | Lucide React | Tree-shakeable, consistent |
| **Dates** | date-fns | Lightweight date formatting |
| **Toasts** | sonner | Simple, beautiful notifications |
| **Hosting** | Vercel or Netlify + Supabase | Frontend hosting + managed backend |

---

## File Structure

```
crm/
├── .env.local / .env.example
├── next.config.ts / tailwind.config.ts / components.json
├── supabase/
│   ├── migrations/ (001–011)
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/ [layout + all protected routes]
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── clients/, deals/, tasks/, production/
│   │   │   ├── shipments/, vendors/, settings/
│   │   └── api/auth/callback/
│   ├── components/
│   │   ├── ui/ (shadcn auto-generated)
│   │   ├── layout/ (AppShell, Sidebar, Header, MobileNav)
│   │   ├── dashboard/ (StatCard, widgets)
│   │   ├── clients/, deals/, tasks/, production/, shipments/, vendors/
│   │   └── shared/ (StatusBadge, EmptyState, ActivityTimeline, etc.)
│   ├── lib/
│   │   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   │   ├── utils.ts, constants.ts
│   │   └── validations/ (Zod schemas per entity)
│   ├── hooks/ (useClients, useDeals, useTasks, etc.)
│   ├── services/ (CRUD + activity logging per entity)
│   ├── types/ (database.types.ts — Supabase generated)
│   └── middleware.ts
```

---

## Dependency Graph

```
M1: Foundation ─────► M2: Core Data ─────► M3: Sales Engine ─────► M4: Operations ─────► M5: Ship It
    │                     │                     │                       │
    ├── Next.js init      ├── Clients CRUD      ├── Activities service  ├── Production module
    ├── Supabase setup    └── Vendors CRUD      ├── Deals + Kanban     ├── Shipments module
    ├── Auth flow                               └── Tasks system       ├── Dashboard
    ├── App Shell                                                      └── ActivityTimeline
    └── Shared components
```

---

# Milestone 1: Foundation

**Goal:** Running app with authentication, navigation shell, and all shared components ready.

**Combines:** PRD Phase 0 (Setup) + Phase 1 (App Shell)

**Exit Criteria:** User can log in → see sidebar with 8 nav links → navigate between stub pages → log out.

---

### Task M1.1 — Initialize Next.js Project

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `clean-code`, `react-best-practices` |
| **Priority** | P0 — Blocker for everything |
| **Dependencies** | None |

**INPUT:** Empty project directory
**OUTPUT:** Next.js 14 project with TypeScript, Tailwind, App Router, strict mode
**VERIFY:** `npm run dev` starts without errors, localhost shows Next.js default page

**Steps:**
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --src-dir --use-npm`
- [ ] Verify `tsconfig.json` has `"strict": true`
- [ ] Verify `src/app/` directory structure exists

---

### Task M1.2 — Install All Dependencies

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P0 |
| **Dependencies** | M1.1 |

**INPUT:** Package list from PRD Section 10
**OUTPUT:** All packages installed in `package.json`
**VERIFY:** `npm ls --depth=0` shows all packages, no peer dependency errors

**Steps:**
- [ ] Install Supabase: `@supabase/supabase-js`, `@supabase/ssr`
- [ ] Install shadcn deps: `class-variance-authority`, `clsx`, `tailwind-merge`
- [ ] Install Radix primitives (dialog, dropdown-menu, select, tabs, toast, tooltip, avatar, separator)
- [ ] Install UI: `lucide-react`, `sonner`
- [ ] Install DnD: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] Install Forms: `react-hook-form`, `@hookform/resolvers`, `zod`
- [ ] Install Utils: `date-fns`
- [ ] Install Tailwind plugin: `@tailwindcss/forms`

---

### Task M1.3 — Initialize shadcn/ui + Install Components

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P0 |
| **Dependencies** | M1.2 |

**INPUT:** shadcn/ui CLI
**OUTPUT:** `components.json` configured, all UI primitives in `src/components/ui/`
**VERIFY:** Import any shadcn component → no TypeScript errors

**Steps:**
- [ ] `npx shadcn@latest init` — New York style, zinc base color
- [ ] Install components: `npx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet tabs toast tooltip avatar badge table`
- [ ] Verify `src/components/ui/` contains all generated files

---

### Task M1.4 — Supabase Project + Database Migrations

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `database-design` |
| **Priority** | P0 |
| **Dependencies** | Supabase project created by user |

**INPUT:** Migration SQL from PRD Section 3 (migrations 001–011)
**OUTPUT:** All tables, enums, views, triggers, and RLS policies created
**VERIFY:** Supabase dashboard shows all 7 tables + 3 views + RLS enabled on all tables

**Steps:**
- [ ] Run Migration 001 — Extensions + Enums (uuid-ossp, all enum types)
- [ ] Run Migration 002 — Profiles table + RLS + updated_at trigger
- [ ] Run Migration 003 — Clients table + RLS + indexes
- [ ] Run Migration 004 — Vendors table + RLS + indexes
- [ ] Run Migration 005 — Deals table + RLS + indexes
- [ ] Run Migration 006 — Tasks table + RLS + overdue function
- [ ] Run Migration 007 — Production Orders table + RLS + indexes
- [ ] Run Migration 008 — Shipments table + FK constraint on tasks + RLS
- [ ] Run Migration 009 — Activities table + RLS + indexes
- [ ] Run Migration 010 — Helper views (dashboard_summary, deals_with_client, tasks_with_context)
- [ ] Run Migration 011 — Auto profile creation trigger (handle_new_user)
- [ ] Run seed.sql for sample clients and vendors
- [ ] Generate TypeScript types → `src/types/database.types.ts`

---

### Task M1.5 — Supabase Client Setup + Environment

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Priority** | P0 |
| **Dependencies** | M1.4 |

**INPUT:** Supabase project URL + keys
**OUTPUT:** Browser client, Server client, middleware helper, env files
**VERIFY:** Importing `createClient()` in a component returns a valid Supabase client

**Steps:**
- [ ] Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Create `.env.example` (empty values)
- [ ] Create `src/lib/supabase/client.ts` — browser client using `@supabase/ssr`
- [ ] Create `src/lib/supabase/server.ts` — server client for Server Components
- [ ] Create `src/lib/supabase/middleware.ts` — auth session refresh helper

---

### Task M1.6 — Auth Middleware + Login Page

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `clean-code` |
| **Priority** | P0 |
| **Dependencies** | M1.5 |

**INPUT:** Supabase Auth API
**OUTPUT:** Working login/logout flow with auth-protected routes
**VERIFY:** Unauthenticated → redirected to `/login`. Login → redirected to `/`. Logout → back to `/login`.

**Steps:**
- [ ] Create `src/middleware.ts` — redirects unauthenticated users to `/login`, skips auth routes
- [ ] Create `src/app/(auth)/layout.tsx` — minimal layout for auth pages
- [ ] Create `src/app/(auth)/login/page.tsx` — email/password form using Supabase `signInWithPassword`
- [ ] Create `src/app/api/auth/callback/route.ts` — handles Supabase auth callback
- [ ] Test: sign up user → verify profile auto-created in `profiles` table
- [ ] Test: login → redirect to dashboard → logout → redirect to login

---

### Task M1.7 — App Shell (Sidebar + Header + Layout)

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design`, `clean-code` |
| **Priority** | P1 |
| **Dependencies** | M1.6 |

**INPUT:** NAV_ITEMS from constants, Lucide icons
**OUTPUT:** Full app shell with sidebar navigation, header, mobile nav
**VERIFY:** All 8 nav links work, active state highlights correctly, responsive on mobile

**Steps:**
- [ ] Create `src/lib/constants.ts` — all constants from PRD Section 5 (stages, statuses, priorities, nav items)
- [ ] Create `src/lib/utils.ts` — `cn()`, `formatCurrency()`, `formatDate()`, `getDaysUntil()`
- [ ] Create `src/components/layout/Sidebar.tsx` — fixed left sidebar, logo "SalesOps", nav items with icons, active state, user info at bottom
- [ ] Create `src/components/layout/Header.tsx` — page title, user dropdown with logout
- [ ] Create `src/components/layout/MobileNav.tsx` — hamburger menu for small screens
- [ ] Create `src/components/layout/AppShell.tsx` — wrapper combining sidebar + header + content area
- [ ] Create `src/app/(dashboard)/layout.tsx` — uses AppShell, auth-protected

---

### Task M1.8 — Stub Pages + Shared Components

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M1.7 |

**INPUT:** Route structure from PRD Section 4
**OUTPUT:** 8 navigable stub pages + reusable shared components
**VERIFY:** Navigate to each route → see page heading. StatusBadge renders with correct colors.

**Steps:**
- [ ] Create stub pages (h1 + heading) for: `/`, `/clients`, `/deals`, `/tasks`, `/production`, `/shipments`, `/vendors`, `/settings`
- [ ] Create `src/components/shared/StatusBadge.tsx` — colored pill reading from constants
- [ ] Create `src/components/shared/PriorityBadge.tsx`
- [ ] Create `src/components/shared/EmptyState.tsx` — placeholder with CTA button
- [ ] Create `src/components/shared/LoadingSpinner.tsx`
- [ ] Create `src/components/shared/ConfirmDialog.tsx` — reusable confirm modal
- [ ] Create `src/components/shared/DateDisplay.tsx` — consistent date formatting
- [ ] Create `src/components/shared/UserAvatar.tsx`
- [ ] Create `src/components/shared/SearchInput.tsx`
- [ ] Create `src/hooks/useAuth.ts` — current user session hook

---

## ✅ Milestone 1 Checkpoint

- [ ] `npm run dev` starts clean
- [ ] Login → Dashboard → all nav links work
- [ ] Logout redirects to login
- [ ] Mobile responsive sidebar
- [ ] StatusBadge renders all 5 types with correct colors
- [ ] Supabase tables verified in dashboard

---

# Milestone 2: Core Data

**Goal:** Full CRUD operations for Clients and Vendors — establishing the reusable service/hook/form pattern.

**Combines:** PRD Phase 2 (Clients) + Phase 3 (Vendors)

**Exit Criteria:** Can create, search, view, edit, and soft-delete clients and vendors.

---

### Task M2.1 — Clients Service Layer

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code`, `api-patterns` |
| **Priority** | P0 |
| **Dependencies** | M1.5 |

**INPUT:** Supabase client, clients table schema
**OUTPUT:** `src/services/clients.service.ts` with all CRUD operations
**VERIFY:** Each function returns expected data shape when called from a test component

**Steps:**
- [ ] `getClients(search?)` — returns all active clients, searchable by company name/contact/email
- [ ] `getClient(id)` — returns single client with deal count
- [ ] `createClient(data)` — insert + return created client
- [ ] `updateClient(id, data)` — update + return
- [ ] `deleteClient(id)` — soft delete (`is_active = false`)

---

### Task M2.2 — Client Schema + Hook

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M2.1 |

**INPUT:** Client table columns
**OUTPUT:** Zod schema + React hook wrapping service
**VERIFY:** Form validation rejects empty `company_name`, hook returns loading/error/data states

**Steps:**
- [ ] Create `src/lib/validations/client.schema.ts` — Zod schema with `company_name` required
- [ ] Create `src/hooks/useClients.ts` — wraps service calls, manages loading/error state

---

### Task M2.3 — Client Components + Pages

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design`, `clean-code` |
| **Priority** | P1 |
| **Dependencies** | M2.2 |

**INPUT:** Service + hook + schema
**OUTPUT:** Full client module with table, form, detail, and edit pages
**VERIFY:** Create client → appears in search → view detail → edit → verify changes saved

**Steps:**
- [ ] Create `src/components/clients/ClientsTable.tsx` — searchable table with columns from PRD
- [ ] Create `src/components/clients/ClientForm.tsx` — create/edit form (single component, mode-aware)
- [ ] Create `src/components/clients/ClientCard.tsx` — summary card for use in deal detail later
- [ ] Build `/clients` page — ClientsTable + "Add Client" button
- [ ] Build `/clients/new` page — ClientForm in create mode
- [ ] Build `/clients/[id]` page — client info + list of deals (empty for now) + "Add Deal" button
- [ ] Build `/clients/[id]/edit` page — ClientForm pre-filled in edit mode

---

### Task M2.4 — Vendors Module (Mirror Clients Pattern)

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `clean-code` |
| **Priority** | P2 |
| **Dependencies** | M2.3 (copy pattern) |

**INPUT:** Client module as pattern reference
**OUTPUT:** Full vendor module — service, schema, hook, components, pages
**VERIFY:** Create vendor → search → view → edit flow works end-to-end

**Steps:**
- [ ] Create `src/services/vendors.service.ts` — mirror clients service (add `speciality` field)
- [ ] Create `src/lib/validations/vendor.schema.ts`
- [ ] Create `src/hooks/useVendors.ts`
- [ ] Create `src/components/vendors/VendorsTable.tsx` — with "Active Orders" count column
- [ ] Create `src/components/vendors/VendorForm.tsx`
- [ ] Build `/vendors` page, `/vendors/new`, `/vendors/[id]`

---

## ✅ Milestone 2 Checkpoint

- [ ] Create → search → view → edit flow for clients
- [ ] Create → search → view → edit flow for vendors
- [ ] Soft delete works (client disappears from list)
- [ ] Search filters results in real-time
- [ ] Empty states show CTAs
- [ ] All forms validate required fields

---

# Milestone 3: Sales Engine

**Goal:** The core CRM — Deals pipeline (Kanban) + Tasks system with activity logging.

**Combines:** PRD Phase 4 (Deals) + Phase 5 (Tasks)

**Exit Criteria:** Create a deal → see it on Kanban → drag between stages → create follow-up task from deal page → mark task done → all activities logged in timeline.

---

### Task M3.1 — Activities Service (Foundation for Logging)

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code`, `api-patterns` |
| **Priority** | P0 — All mutations depend on this |
| **Dependencies** | M1.5 |

**INPUT:** Activities table schema, activity_event enum
**OUTPUT:** `src/services/activities.service.ts` with `logActivity()` function
**VERIFY:** Calling `logActivity()` inserts a row in activities table with correct actor_id

**Steps:**
- [ ] Create `logActivity(event)` — inserts activity with current user as actor
- [ ] Create `getActivitiesByDeal(dealId)` — returns activities for deal, newest first
- [ ] Create `getActivitiesByClient(clientId)` — returns activities for client
- [ ] Create `src/hooks/useActivities.ts`

---

### Task M3.2 — Deals Service Layer

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code`, `api-patterns` |
| **Priority** | P0 |
| **Dependencies** | M3.1 |

**INPUT:** Deals table schema, deals_with_client view
**OUTPUT:** `src/services/deals.service.ts` with all operations + activity logging
**VERIFY:** `createDeal()` inserts deal + logs `deal_created`. `updateDealStage()` updates + logs `deal_stage_changed`.

**Steps:**
- [ ] `getDeals(filters?)` — returns deals with client name via view
- [ ] `getDeal(id)` — returns deal with all related data (client, tasks, production, shipments)
- [ ] `createDeal(data)` — insert + logActivity(deal_created)
- [ ] `updateDeal(id, data)` — update + logActivity(deal_updated)
- [ ] `updateDealStage(id, newStage, previousStage)` — update stage + log with from/to metadata
- [ ] `getDealsByStage()` — returns deals grouped by stage (for Kanban)

---

### Task M3.3 — Deal Schema + Hook

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M3.2 |

**Steps:**
- [ ] Create `src/lib/validations/deal.schema.ts` — `deal_name` + `client_id` required, `total_value` computed
- [ ] Create `src/hooks/useDeals.ts` — wraps service, manages state

---

### Task M3.4 — Deal Components (Form + Cards)

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design`, `clean-code` |
| **Priority** | P1 |
| **Dependencies** | M3.3 |

**INPUT:** Deal schema, client/profile lists for dropdowns
**OUTPUT:** DealForm, DealCard, StageSelect, NextActionInput components
**VERIFY:** DealForm submits valid data. DealCard shows company name, value, next action date.

**Steps:**
- [ ] Create `src/components/deals/DealForm.tsx` — client selector (searchable), assigned_to selector, stage, all fields
- [ ] Create `src/components/deals/DealCard.tsx` — card for Kanban board (company, deal name, value, avatar, next action date)
- [ ] Create `src/components/deals/StageSelect.tsx` — one-click stage change dropdown
- [ ] Create `src/components/deals/NextActionInput.tsx` — inline editable text + date picker, auto-saves on blur

---

### Task M3.5 — Pipeline Kanban Board (dnd-kit)

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design`, `react-best-practices` |
| **Priority** | P0 — Core feature |
| **Dependencies** | M3.4 |

**INPUT:** DealCard component, @dnd-kit libraries, deals grouped by stage
**OUTPUT:** Drag-and-drop Kanban board with 7 columns
**VERIFY:** Drag card from "Lead" to "Quoted" → stage updates in DB → activity logged → toast shown → UI updates optimistically

**Steps:**
- [ ] Create `src/components/deals/PipelineColumn.tsx` — droppable zone, stage name + deal count header
- [ ] Create `src/components/deals/PipelineBoard.tsx` — horizontal scrollable, @dnd-kit/core DndContext
- [ ] Implement drag: optimistic update (move card immediately), call `updateDealStage()`, rollback on error
- [ ] Implement filter bar: assigned_to dropdown, search by deal/company name
- [ ] Build `/deals` page — PipelineBoard + "Add Deal" button

---

### Task M3.6 — Deal Pages

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M3.5 |

**INPUT:** All deal components + services
**OUTPUT:** Deal creation, detail (control center), and edit pages
**VERIFY:** Create deal → appears on Kanban → click → see detail with all sections → edit → changes persist

**Steps:**
- [ ] Build `/deals/new` page — DealForm in create mode
- [ ] Build `/deals/[id]` page — **the most important screen** (two-column layout):
  - Left (70%): Deal header, Quick Action buttons, Next Action box, Client info (collapsible), Deal info, Tasks section, Production section, Shipments section
  - Right (30%): Activity Timeline (placeholder — populated in M4)
- [ ] Build `/deals/[id]/edit` page — DealForm pre-filled in edit mode
- [ ] Quick Actions: "Add Follow-up" (opens sheet), "Advance Stage" (one-click), "Edit Deal"

---

### Task M3.7 — Tasks Service Layer

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code`, `api-patterns` |
| **Priority** | P0 |
| **Dependencies** | M3.1 |

**INPUT:** Tasks table schema, tasks_with_context view
**OUTPUT:** `src/services/tasks.service.ts` with all operations
**VERIFY:** `createTask()` inserts + logs activity. `completeTask()` sets status=done + completed_at + logs.

**Steps:**
- [ ] `getMyTasks(userId)` — assigned to user, status != done
- [ ] `getTodayTasks(userId?)` — due today
- [ ] `getOverdueTasks(userId?)` — due_date < today, status != done
- [ ] `getAllTasks(filters?)` — for managers
- [ ] `createTask(data)` — insert + logActivity(task_created)
- [ ] `updateTask(id, data)` — update fields
- [ ] `completeTask(id)` — status=done, completed_at=now(), logActivity(task_completed)
- [ ] `createFollowupTask(dealId, data)` — shortcut pre-filling deal_id + client_id

---

### Task M3.8 — Task Schema + Hook

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M3.7 |

**Steps:**
- [ ] Create `src/lib/validations/task.schema.ts` — title + due_date + assigned_to required
- [ ] Create `src/hooks/useTasks.ts` — wraps service, manages tab-based filtering

---

### Task M3.9 — Task Components + Pages

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design`, `clean-code` |
| **Priority** | P1 |
| **Dependencies** | M3.8 |

**INPUT:** Task service + hook + schema
**OUTPUT:** TaskCard, TaskList, TaskForm, QuickAddTask, task pages with tabs
**VERIFY:** Create task → appears in "My Tasks" → checkbox marks done → toast + activity logged

**Steps:**
- [ ] Create `src/components/tasks/TaskCard.tsx` — checkbox, title, deal link, due date (color-coded), priority badge, assigned person
- [ ] Create `src/components/tasks/TaskList.tsx` — filterable list with priority dropdown
- [ ] Create `src/components/tasks/TaskForm.tsx` — title, description, deal select, client select (auto-fills), assigned_to, priority, due_date
- [ ] Create `src/components/tasks/QuickAddTask.tsx` — sheet/drawer opened from deal detail, deal_id pre-set
- [ ] Build `/tasks` page — 4 tabs: My Tasks, Today, Overdue, All Tasks (admin/manager only)
- [ ] Build `/tasks/new` page
- [ ] Integrate task section into `/deals/[id]` page — list of deal tasks + "Add Task" opens QuickAddTask

---

## ✅ Milestone 3 Checkpoint

- [ ] Create deal → see on Kanban board
- [ ] Drag deal between stages → DB updated + activity logged
- [ ] Deal detail page shows all sections (tasks, production placeholder, shipments placeholder)
- [ ] "Next Action" always visible and editable on deal detail
- [ ] Create task from deal page → appears in /tasks "My Tasks"
- [ ] Complete task via checkbox → status=done, activity logged
- [ ] All 4 task tabs filter correctly
- [ ] Stage changes logged in activities table

---

# Milestone 4: Operations

**Goal:** Production tracking, shipment tracking, dashboard, and activity timeline — completing the operational picture.

**Combines:** PRD Phase 6 (Production) + Phase 7 (Shipments) + Phase 8 (Dashboard)

**Exit Criteria:** Morning dashboard shows all operational metrics. Production and shipment statuses update with one click. Activity timeline visible on deal detail.

---

### Task M4.1 — Production Service + Schema + Hook

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code`, `api-patterns` |
| **Priority** | P0 |
| **Dependencies** | M3.1 (activities service) |

**INPUT:** Production orders table schema
**OUTPUT:** Service + schema + hook for production orders
**VERIFY:** `createProductionOrder()` inserts + logs activity. `updateProductionStatus()` one-click update works.

**Steps:**
- [ ] Create `src/services/production.service.ts`:
  - `getProductionOrders(filters?)` — with vendor + deal name joined
  - `getProductionByDeal(dealId)`
  - `createProductionOrder(data)` + logActivity(production_started)
  - `updateProductionStatus(id, newStatus)` + logActivity
  - `getDelayedOrders()` — for dashboard widget
- [ ] Create `src/lib/validations/production.schema.ts`
- [ ] Create `src/hooks/useProduction.ts`

---

### Task M4.2 — Production Components + Pages

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M4.1 |

**INPUT:** Production service + hook
**OUTPUT:** ProductionTable, ProductionForm, StatusUpdate, /production page
**VERIFY:** Create production order → appears in table → one-click status change → red row if delayed

**Steps:**
- [ ] Create `src/components/production/ProductionTable.tsx` — filter bar (status, vendor, date range), red rows for delayed
- [ ] Create `src/components/production/ProductionForm.tsx` — vendor selector, deal selector, status, dates, quantity
- [ ] Create `src/components/production/StatusUpdate.tsx` — inline one-click dropdown status change
- [ ] Build `/production` page
- [ ] Build `/production/[id]` page (detail view)
- [ ] Integrate production section into `/deals/[id]` page — list of orders + "Add Production Order" button

---

### Task M4.3 — Shipments Service + Schema + Hook

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `clean-code` |
| **Priority** | P0 |
| **Dependencies** | M3.1 |

**INPUT:** Shipments table schema
**OUTPUT:** Service + schema + hook for shipments
**VERIFY:** `createShipment()` inserts + logs activity. Status update logs shipment_dispatched/delivered.

**Steps:**
- [ ] Create `src/services/shipments.service.ts`:
  - `getShipments(filters?)`
  - `getShipmentsByDeal(dealId)`
  - `createShipment(data)` + logActivity(shipment_created)
  - `updateShipmentStatus(id, newStatus)` + logActivity
  - `getInTransitShipments()` — dashboard widget
- [ ] Create `src/lib/validations/shipment.schema.ts`
- [ ] Create `src/hooks/useShipments.ts`

---

### Task M4.4 — Shipment Components + Pages

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M4.3 |

**INPUT:** Shipment service + hook
**OUTPUT:** ShipmentTable, ShipmentForm, StatusUpdate, /shipments page
**VERIFY:** Create shipment → appears in table → status change → copy tracking number → red for delayed

**Steps:**
- [ ] Create `src/components/shipments/ShipmentTable.tsx` — status filter, red rows for delayed, tracking number copy-to-clipboard
- [ ] Create `src/components/shipments/ShipmentForm.tsx` — deal selector, courier, tracking number, dates
- [ ] Create `src/components/shipments/StatusUpdate.tsx` — inline one-click status change
- [ ] Build `/shipments` page
- [ ] Build `/shipments/[id]` page
- [ ] Integrate shipments section into `/deals/[id]` page — list + "Add Shipment" button

---

### Task M4.5 — Activity Timeline Component

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M3.1 |

**INPUT:** Activities service, activity_event enum
**OUTPUT:** `ActivityTimeline.tsx` rendering chronological event list
**VERIFY:** Deal detail page shows all logged events with actor name, action description, and relative time

**Steps:**
- [ ] Create `src/components/shared/ActivityTimeline.tsx`:
  - Accepts `entityType` ('deal' | 'client') + `entityId`
  - Fetches activities via service
  - Renders event icon (per event_type) + human-readable description + actor name + time ago
  - Example: "Ahmed moved deal to Production · 2 hours ago"
- [ ] Integrate into `/deals/[id]` right sidebar

---

### Task M4.6 — Dashboard Service + Hook

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Priority** | P0 |
| **Dependencies** | M3.7, M4.1, M4.3 |

**INPUT:** dashboard_summary view, all entity services
**OUTPUT:** `src/services/dashboard.service.ts` + `src/hooks/useDashboard.ts`
**VERIFY:** `getDashboardSummary()` returns correct counts matching DB data

**Steps:**
- [ ] `getDashboardSummary()` — queries dashboard_summary view (active deals, overdue tasks, etc.)
- [ ] `getMyTasksToday(userId)` — tasks due today for current user
- [ ] `getDealsNeedingFollowup()` — deals where next_action_date <= today
- [ ] `getDelayedProduction()` — production orders delayed or past expected date
- [ ] `getShipmentsInTransit()` — shipments where status = in_transit
- [ ] Create `src/hooks/useDashboard.ts` — wraps all dashboard queries, auto-refreshes every 5 minutes

---

### Task M4.7 — Dashboard Components + Page

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M4.6 |

**INPUT:** Dashboard service + hook
**OUTPUT:** Full dashboard with stat cards + 3-column widget grid
**VERIFY:** Opening `/` shows correct counts. Clicking stat card navigates to the right page. Empty states display correctly.

**Steps:**
- [ ] Create `src/components/dashboard/StatCard.tsx` — icon, metric name, number (large), color indicator, clickable
- [ ] Create `src/components/dashboard/TasksWidget.tsx` — "My Tasks Today" with checkboxes + "View all" link
- [ ] Create `src/components/dashboard/DealsWidget.tsx` — "Deals Needing Action" with company + deal + days overdue
- [ ] Create `src/components/dashboard/ProductionWidget.tsx` — "Production Delays" with deal + vendor + status
- [ ] Build `/` (dashboard) page:
  - Top row: 5 StatCards (Active Deals, Due Today, Overdue Tasks, Production Delayed, In Transit)
  - Below: 3-column widget grid (Tasks, Deals, Production)
  - Empty states with emojis ("You're all caught up today! 🎉")

---

## ✅ Milestone 4 Checkpoint

- [ ] Dashboard shows correct counts for all 5 stat cards
- [ ] Dashboard widgets show actionable items
- [ ] Production orders table with one-click status update
- [ ] Shipments table with tracking number copy
- [ ] Delayed items highlighted in red (production + shipments)
- [ ] Deal detail page now shows production, shipments, AND activity timeline
- [ ] All mutations log activities
- [ ] Activity timeline renders correctly on deal detail

---

# Milestone 5: Ship It

**Goal:** Polish UX, complete testing, deploy to production.

**Combines:** PRD Phase 9 (Polish) + Phase 10 (Testing) + Sections 16–17 (Deployment + Go-Live)

**Exit Criteria:** Deployed, accessible via URL, all manual test cases pass, mobile-usable.

---

### Task M5.1 — Toast Notifications + Confirmation Dialogs

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M4 complete |

**Steps:**
- [ ] Add sonner toast for every create/update/delete/complete action across all modules
- [ ] Add ConfirmDialog for destructive actions: delete client, delete vendor, mark deal as lost, delete task
- [ ] Verify: every mutation shows feedback, destructive actions require confirmation

---

### Task M5.2 — Loading States + Skeletons

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P2 |
| **Dependencies** | M4 complete |

**Steps:**
- [ ] Add loading skeletons for all data tables (clients, vendors, deals, tasks, production, shipments)
- [ ] Add loading skeleton for dashboard stat cards and widgets
- [ ] Add loading state to all forms during submission
- [ ] Verify: no blank screens during data fetch

---

### Task M5.3 — Global Search + Keyboard Shortcuts

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P2 |
| **Dependencies** | M4 complete |

**Steps:**
- [ ] Add global search in Header — searches clients + deals by name
- [ ] Results dropdown shows type (Client/Deal) + name + link
- [ ] Optional: keyboard shortcut hints (N = new, / = search)

---

### Task M5.4 — Mobile Responsiveness

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P1 |
| **Dependencies** | M4 complete |

**Steps:**
- [ ] Sidebar collapses to hamburger menu on mobile
- [ ] Tables horizontally scroll on small screens
- [ ] Deal detail page stacks to single column on mobile
- [ ] Kanban board horizontally scrollable on mobile
- [ ] Touch targets minimum 44px (font min 14px per PRD)
- [ ] Verify: complete a deal flow on mobile viewport

---

### Task M5.5 — Empty States + Overdue Highlighting

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P1 |
| **Dependencies** | M4 complete |

**Steps:**
- [ ] Add empty states with CTAs for all list screens (clients, deals, tasks, production, shipments, vendors)
- [ ] Add red background/text for overdue items in all tables and lists
- [ ] Verify: fresh account sees helpful empty states, not blank screens

---

### Task M5.6 — UI/UX Non-Negotiables Review

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skills** | `frontend-design` |
| **Priority** | P0 |
| **Dependencies** | M5.1 through M5.5 |

**Steps:**
- [ ] Audit all 10 UX rules from PRD Section 14:
  1. Max 5 primary actions visible per screen
  2. Status changes = one click or one dropdown
  3. All tables searchable
  4. Overdue items shown in red
  5. Empty states always have CTA
  6. Dropdowns for list-sourced fields (never free text)
  7. Toast for every mutation
  8. Confirm dialogs only for destructive actions
  9. Font size min 14px
  10. Next Action fields always visible on deal detail
- [ ] Fix any violations found

---

### Task M5.7 — Manual Test Checklist

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Priority** | P0 |
| **Dependencies** | M5.6 |

**Steps (from PRD Section 10):**
- [ ] Create a client
- [ ] Create a deal linked to that client
- [ ] Move deal through all pipeline stages
- [ ] Create a follow-up task from deal page
- [ ] Mark task as complete
- [ ] Create a vendor
- [ ] Create a production order linked to deal + vendor
- [ ] Update production status
- [ ] Create a shipment linked to deal
- [ ] Update shipment status to delivered
- [ ] Verify all activities appear in deal timeline
- [ ] Verify dashboard shows correct counts
- [ ] Test login/logout
- [ ] Test with two different user accounts
- [ ] Verify RLS: sales user cannot see other users' tasks

---

### Task M5.8 — Deploy to Production

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skills** | `deployment-procedures` |
| **Priority** | P0 |
| **Dependencies** | M5.7 |

**Steps:**
- [ ] Push to GitHub repository
- [ ] Connect repo to Vercel (or Netlify)
- [ ] Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy → verify production build succeeds
- [ ] Test login on production URL
- [ ] Supabase: enable daily backups (Settings → Backups)
- [ ] Supabase: review email confirmation settings in Auth
- [ ] Optional: configure custom domain (crm.yourcompany.com)

---

## ✅ Milestone 5 Checkpoint

- [ ] All 15 manual test cases pass
- [ ] Mobile responsive on phone
- [ ] Deployed and accessible via URL
- [ ] Two test user accounts verified
- [ ] RLS confirmed working

---

# Phase X: Final Verification

> 🔴 **DO NOT mark project complete until all checks pass.**

### Automated Checks

```bash
# P0: Lint + Type Check
npm run lint && npx tsc --noEmit

# P0: Build verification
npm run build

# P0: Security scan
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# P1: UX audit
python .agent/skills/frontend-design/scripts/ux_audit.py .

# P3: Lighthouse (requires running server)
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000
```

### Manual Verification

- [ ] No broken navigation links
- [ ] All forms have required field validation with clear error messages
- [ ] All status changes logged in activities table
- [ ] Mobile view usable on phone viewport
- [ ] Env variables NOT committed to git (.env.local in .gitignore)

### Rule Compliance

- [ ] No violet/purple hex codes used
- [ ] No standard template layouts
- [ ] Socratic Gate was respected
- [ ] All 10 UX Non-Negotiables from PRD Section 14 verified

---

## Summary

| Milestone | Tasks | Est. Days | Key Deliverable |
|-----------|-------|-----------|-----------------|
| **M1: Foundation** | 8 tasks | 1–2 | Auth + App Shell + Shared Components |
| **M2: Core Data** | 4 tasks | 1 | Clients + Vendors CRUD |
| **M3: Sales Engine** | 9 tasks | 2–3 | Kanban Pipeline + Tasks System |
| **M4: Operations** | 7 tasks | 2–3 | Production + Shipments + Dashboard |
| **M5: Ship It** | 8 tasks | 2–3 | Polish + Testing + Deployment |
| **Total** | **36 tasks** | **~10–12 days** | **Production-ready CRM** |
