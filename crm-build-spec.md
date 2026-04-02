# Sales Operations CRM — Complete Build Specification
## Production-Ready Blueprint for Claude Code

---

## 1. Project Overview

### What We Are Building

A lightweight internal Sales Operations CRM that replaces scattered spreadsheets with one unified tool covering:

- Client management
- Sales pipeline (Kanban board)
- Follow-up task system
- Production order tracking (vendor management)
- Shipment tracking
- Daily operations dashboard

### Design Philosophy

This is NOT an enterprise CRM. It is an **operational tool** that sales and production staff can use without training.

**Core rules that must never be broken:**
- Every deal must always show a clear next action
- Every status change must be one click or one dropdown — never a form
- Every screen must have one primary purpose
- Typing must be minimized; dropdowns and selects are always preferred
- The app must be faster than the spreadsheets it replaces

### Architecture Sources (Hybrid Approach)

- **Sales pipeline design** → inspired by Twenty CRM (twentyhq/twenty)
- **Task and activity system** → inspired by EspoCRM (espocrm/espocrm)
- **Shipment lifecycle model** → inspired by logistics CRM patterns

---

## 2. Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (component library — copy-paste, agent-friendly)
- **dnd-kit** (drag and drop for Kanban pipeline)
- **React Hook Form + Zod** (forms and validation)
- **Lucide React** (icons)
- **date-fns** (date utilities)

### Backend
- **Supabase**
  - PostgreSQL database
  - Built-in Auth (email/password)
  - Row Level Security
  - Realtime subscriptions
  - Storage (for file attachments later)
  - Edge Functions (optional, for future automation)

### Hosting
- **Vercel** (frontend)
- **Supabase** (backend — managed)

### Dev Tooling
- **Git + GitHub**
- **Claude Code** (agent-based development)
- **MCP servers** for Supabase and GitHub integration

---

## 3. Complete Database Schema

Run this SQL in Supabase SQL editor in order. Each section is a separate migration.

### Migration 001 — Extensions and Enums

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Deal stages (pipeline columns)
create type deal_stage as enum (
  'lead',
  'quoted',
  'negotiation',
  'confirmed',
  'production',
  'ready_to_ship',
  'shipped',
  'completed',
  'lost'
);

-- Task status
create type task_status as enum (
  'pending',
  'doing',
  'done',
  'overdue'
);

-- Task priority
create type task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Production order status
create type production_status as enum (
  'not_started',
  'in_progress',
  'quality_check',
  'completed',
  'delayed'
);

-- Shipment status
create type shipment_status as enum (
  'preparing',
  'dispatched',
  'in_transit',
  'delivered',
  'delayed'
);

-- User roles
create type user_role as enum (
  'admin',
  'manager',
  'sales',
  'production',
  'logistics'
);

-- Activity event types
create type activity_event as enum (
  'deal_created',
  'deal_stage_changed',
  'deal_updated',
  'task_created',
  'task_completed',
  'production_started',
  'production_completed',
  'shipment_created',
  'shipment_dispatched',
  'shipment_delivered',
  'note_added'
);
```

### Migration 002 — Profiles Table

```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role user_role not null default 'sales',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### Migration 003 — Clients Table

```sql
create table clients (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  country text,
  notes text,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_company_name_idx on clients(company_name);
create index clients_created_by_idx on clients(created_by);

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

alter table clients enable row level security;

create policy "Authenticated users can view clients"
  on clients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on clients for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on clients for update
  using (auth.role() = 'authenticated');
```

### Migration 004 — Vendors Table

```sql
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  speciality text,
  notes text,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_name_idx on vendors(name);

create trigger vendors_updated_at
  before update on vendors
  for each row execute function update_updated_at();

alter table vendors enable row level security;

create policy "Authenticated users can view vendors"
  on vendors for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert vendors"
  on vendors for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update vendors"
  on vendors for update
  using (auth.role() = 'authenticated');
```

### Migration 005 — Deals Table

```sql
create table deals (
  id uuid primary key default uuid_generate_v4(),
  deal_name text not null,
  client_id uuid not null references clients(id) on delete restrict,
  product_description text,
  quantity integer,
  unit_price numeric(12, 2),
  total_value numeric(12, 2),
  currency text not null default 'USD',
  stage deal_stage not null default 'lead',
  expected_close_date date,
  actual_close_date date,
  assigned_to uuid references profiles(id),
  next_action text,
  next_action_date date,
  notes text,
  is_archived boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_client_id_idx on deals(client_id);
create index deals_stage_idx on deals(stage);
create index deals_assigned_to_idx on deals(assigned_to);
create index deals_expected_close_date_idx on deals(expected_close_date);
create index deals_next_action_date_idx on deals(next_action_date);

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

alter table deals enable row level security;

create policy "Authenticated users can view deals"
  on deals for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert deals"
  on deals for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update deals"
  on deals for update
  using (auth.role() = 'authenticated');
```

### Migration 006 — Tasks Table

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  deal_id uuid references deals(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  shipment_id uuid, -- forward reference, add constraint after shipments table
  assigned_to uuid not null references profiles(id),
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  due_date date,
  reminder_date date,
  completed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_assigned_to_idx on tasks(assigned_to);
create index tasks_deal_id_idx on tasks(deal_id);
create index tasks_status_idx on tasks(status);
create index tasks_due_date_idx on tasks(due_date);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- Auto-mark overdue tasks
create or replace function mark_overdue_tasks()
returns void as $$
  update tasks
  set status = 'overdue'
  where status in ('pending', 'doing')
    and due_date < current_date;
$$ language sql;

alter table tasks enable row level security;

create policy "Users can view tasks assigned to them or created by them"
  on tasks for select
  using (
    auth.uid() = assigned_to
    or auth.uid() = created_by
    or exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "Authenticated users can insert tasks"
  on tasks for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own tasks or if manager/admin"
  on tasks for update
  using (
    auth.uid() = assigned_to
    or auth.uid() = created_by
    or exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );
```

### Migration 007 — Production Orders Table

```sql
create table production_orders (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete restrict,
  vendor_id uuid references vendors(id) on delete set null,
  quantity integer not null,
  status production_status not null default 'not_started',
  start_date date,
  expected_completion_date date,
  actual_completion_date date,
  unit_cost numeric(12, 2),
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_orders_deal_id_idx on production_orders(deal_id);
create index production_orders_vendor_id_idx on production_orders(vendor_id);
create index production_orders_status_idx on production_orders(status);
create index production_orders_expected_completion_idx on production_orders(expected_completion_date);

create trigger production_orders_updated_at
  before update on production_orders
  for each row execute function update_updated_at();

alter table production_orders enable row level security;

create policy "Authenticated users can view production orders"
  on production_orders for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert production orders"
  on production_orders for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update production orders"
  on production_orders for update
  using (auth.role() = 'authenticated');
```

### Migration 008 — Shipments Table

```sql
create table shipments (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete restrict,
  courier_name text,
  tracking_number text,
  status shipment_status not null default 'preparing',
  dispatch_date date,
  expected_delivery_date date,
  actual_delivery_date date,
  recipient_name text,
  delivery_address text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipments_deal_id_idx on shipments(deal_id);
create index shipments_status_idx on shipments(status);
create index shipments_tracking_number_idx on shipments(tracking_number);

-- Now add the forward reference from tasks
alter table tasks
  add constraint tasks_shipment_id_fkey
  foreign key (shipment_id) references shipments(id) on delete set null;

create trigger shipments_updated_at
  before update on shipments
  for each row execute function update_updated_at();

alter table shipments enable row level security;

create policy "Authenticated users can view shipments"
  on shipments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert shipments"
  on shipments for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update shipments"
  on shipments for update
  using (auth.role() = 'authenticated');
```

### Migration 009 — Activities Table

```sql
create table activities (
  id uuid primary key default uuid_generate_v4(),
  event_type activity_event not null,
  deal_id uuid references deals(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  production_id uuid references production_orders(id) on delete cascade,
  shipment_id uuid references shipments(id) on delete cascade,
  actor_id uuid references profiles(id),
  metadata jsonb, -- store extra context like {from_stage: 'lead', to_stage: 'quoted'}
  note text,
  created_at timestamptz not null default now()
);

create index activities_deal_id_idx on activities(deal_id);
create index activities_client_id_idx on activities(client_id);
create index activities_created_at_idx on activities(created_at desc);

alter table activities enable row level security;

create policy "Authenticated users can view activities"
  on activities for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activities"
  on activities for insert
  with check (auth.role() = 'authenticated');
```

### Migration 010 — Helper Views

```sql
-- Dashboard summary view
create or replace view dashboard_summary as
select
  (select count(*) from deals where stage not in ('completed', 'lost') and is_archived = false) as active_deals,
  (select count(*) from tasks where status = 'overdue') as overdue_tasks,
  (select count(*) from tasks where status in ('pending', 'doing') and due_date = current_date) as due_today,
  (select count(*) from production_orders where status = 'delayed') as delayed_production,
  (select count(*) from shipments where status = 'in_transit') as shipments_in_transit;

-- Deals with client name (used everywhere)
create or replace view deals_with_client as
select
  d.*,
  c.company_name,
  c.contact_person,
  c.phone as client_phone,
  c.email as client_email,
  p.full_name as assigned_to_name
from deals d
left join clients c on d.client_id = c.id
left join profiles p on d.assigned_to = p.id;

-- Tasks with related info
create or replace view tasks_with_context as
select
  t.*,
  p.full_name as assigned_to_name,
  d.deal_name,
  c.company_name
from tasks t
left join profiles p on t.assigned_to = p.id
left join deals d on t.deal_id = d.id
left join clients c on t.client_id = c.id;
```

### Migration 011 — Auto Profile Creation Trigger

```sql
-- Auto-create profile when user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'sales'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

## 4. Project Folder Structure

```
crm/
├── .env.local                          # Supabase keys (never commit)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                     # shadcn/ui config
├── package.json
├── tsconfig.json
│
├── supabase/
│   ├── migrations/                     # All SQL migrations above
│   │   ├── 001_extensions_enums.sql
│   │   ├── 002_profiles.sql
│   │   ├── 003_clients.sql
│   │   ├── 004_vendors.sql
│   │   ├── 005_deals.sql
│   │   ├── 006_tasks.sql
│   │   ├── 007_production_orders.sql
│   │   ├── 008_shipments.sql
│   │   ├── 009_activities.sql
│   │   ├── 010_views.sql
│   │   └── 011_triggers.sql
│   └── seed.sql                        # Sample data for development
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                # Protected routes
│   │   │   ├── layout.tsx              # Sidebar + header shell
│   │   │   ├── page.tsx                # Dashboard (redirect from /)
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx            # Clients list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Create client
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Client detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx            # Pipeline Kanban board
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Deal control center
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx            # All tasks (my tasks, today, overdue)
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── production/
│   │   │   │   ├── page.tsx            # Production tracker table
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── shipments/
│   │   │   │   ├── page.tsx            # Shipment tracker table
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── vendors/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts        # Supabase auth callback
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx                  # Root layout
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (auto-generated)
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # Wrapper with sidebar + main
│   │   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   │   ├── Header.tsx              # Top bar with user menu
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx            # Metric card component
│   │   │   ├── TasksWidget.tsx         # Today's tasks widget
│   │   │   ├── DealsWidget.tsx         # Deals needing action widget
│   │   │   └── ProductionWidget.tsx    # Delayed production widget
│   │   │
│   │   ├── clients/
│   │   │   ├── ClientsTable.tsx        # Searchable clients list
│   │   │   ├── ClientForm.tsx          # Create/edit form
│   │   │   └── ClientCard.tsx          # Summary card used in deal detail
│   │   │
│   │   ├── deals/
│   │   │   ├── PipelineBoard.tsx       # Kanban board with dnd-kit
│   │   │   ├── PipelineColumn.tsx      # Single stage column
│   │   │   ├── DealCard.tsx            # Draggable deal card
│   │   │   ├── DealForm.tsx            # Create/edit form
│   │   │   ├── DealDetail.tsx          # Full deal control center
│   │   │   ├── StageSelect.tsx         # One-click stage change
│   │   │   └── NextActionInput.tsx     # Next action + date field
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx            # Filterable task list
│   │   │   ├── TaskCard.tsx            # Task row/card
│   │   │   ├── TaskForm.tsx            # Create/edit form
│   │   │   └── QuickAddTask.tsx        # Inline quick-add from deal page
│   │   │
│   │   ├── production/
│   │   │   ├── ProductionTable.tsx     # Production orders table
│   │   │   ├── ProductionForm.tsx      # Create/edit form
│   │   │   └── StatusUpdate.tsx        # One-click status update
│   │   │
│   │   ├── shipments/
│   │   │   ├── ShipmentTable.tsx       # Shipments table
│   │   │   ├── ShipmentForm.tsx        # Create/edit form
│   │   │   └── StatusUpdate.tsx        # One-click status update
│   │   │
│   │   ├── vendors/
│   │   │   ├── VendorsTable.tsx
│   │   │   └── VendorForm.tsx
│   │   │
│   │   └── shared/
│   │       ├── StatusBadge.tsx         # Colored status chip (reusable)
│   │       ├── PriorityBadge.tsx
│   │       ├── UserAvatar.tsx
│   │       ├── ActivityTimeline.tsx    # Activity log component
│   │       ├── SearchInput.tsx         # Global search input
│   │       ├── EmptyState.tsx          # Empty list placeholder
│   │       ├── LoadingSpinner.tsx
│   │       ├── ConfirmDialog.tsx       # Reusable confirm modal
│   │       └── DateDisplay.tsx         # Consistent date formatting
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   ├── server.ts               # Server Supabase client
│   │   │   └── middleware.ts           # Auth middleware helper
│   │   ├── utils.ts                    # cn(), formatCurrency(), etc.
│   │   ├── constants.ts                # Stage labels, status colors, etc.
│   │   └── validations/
│   │       ├── client.schema.ts        # Zod schemas
│   │       ├── deal.schema.ts
│   │       ├── task.schema.ts
│   │       ├── production.schema.ts
│   │       ├── shipment.schema.ts
│   │       └── vendor.schema.ts
│   │
│   ├── hooks/
│   │   ├── useClients.ts               # Data fetching + mutations
│   │   ├── useDeals.ts
│   │   ├── useTasks.ts
│   │   ├── useProduction.ts
│   │   ├── useShipments.ts
│   │   ├── useVendors.ts
│   │   ├── useActivities.ts
│   │   ├── useAuth.ts
│   │   └── useDashboard.ts
│   │
│   ├── services/
│   │   ├── clients.service.ts          # Supabase CRUD operations
│   │   ├── deals.service.ts
│   │   ├── tasks.service.ts
│   │   ├── production.service.ts
│   │   ├── shipments.service.ts
│   │   ├── vendors.service.ts
│   │   ├── activities.service.ts       # Auto-logs events
│   │   └── dashboard.service.ts
│   │
│   ├── types/
│   │   └── database.types.ts           # Generated Supabase types
│   │
│   └── middleware.ts                   # Next.js auth middleware
```

---

## 5. Key Constants (src/lib/constants.ts)

```typescript
export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { value: 'quoted', label: 'Quoted', color: 'bg-blue-100 text-blue-700' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'production', label: 'Production', color: 'bg-orange-100 text-orange-700' },
  { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  { value: 'doing', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
] as const;

export const PRODUCTION_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-700' },
] as const;

export const SHIPMENT_STATUSES = [
  { value: 'preparing', label: 'Preparing', color: 'bg-slate-100 text-slate-600' },
  { value: 'dispatched', label: 'Dispatched', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-700' },
] as const;

// Kanban pipeline columns (only active stages)
export const PIPELINE_STAGES = [
  'lead', 'quoted', 'negotiation', 'confirmed', 'production', 'ready_to_ship', 'shipped'
] as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/deals', label: 'Pipeline', icon: 'KanbanSquare' },
  { href: '/clients', label: 'Clients', icon: 'Users' },
  { href: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { href: '/production', label: 'Production', icon: 'Factory' },
  { href: '/shipments', label: 'Shipments', icon: 'Truck' },
  { href: '/vendors', label: 'Vendors', icon: 'Building2' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const;
```

---

## 6. Screen-by-Screen Specifications

### Screen 1 — Dashboard (/)

**Purpose:** Morning overview. Show what needs attention right now.

**Layout:** Grid of stat cards at the top, then three columns below.

**Stat cards (top row):**
- Active Deals (count, clickable → /deals)
- Tasks Due Today (count + red if > 0, clickable → /tasks?filter=today)
- Overdue Tasks (count, always red if > 0)
- Production Delayed (count)
- Shipments In Transit (count)

**Main columns:**
- Column 1: "My Tasks Today" — list of tasks assigned to current user due today
- Column 2: "Deals Needing Follow-up" — deals where next_action_date <= today
- Column 3: "Production Delays" — production orders where status = delayed OR expected_completion_date < today

**Behavior rules:**
- Empty state for each widget when no items
- Clicking any item navigates to the detail page
- Refresh data every 5 minutes using Supabase realtime or polling

---

### Screen 2 — Pipeline Board (/deals)

**Purpose:** Sales pipeline as a Kanban board.

**Layout:** Horizontal scrollable board with one column per deal stage (lead → quoted → negotiation → confirmed → production → ready_to_ship → shipped).

**Each column shows:**
- Stage name and deal count
- Scrollable list of DealCards

**DealCard shows:**
- Company name (large)
- Deal name
- Total value
- Assigned person avatar
- Next action date (red if overdue)
- Stage badge

**Behaviors:**
- Drag a card between columns → updates stage, logs activity
- Click a card → navigates to /deals/[id]
- "Add Deal" button at top right → /deals/new
- Filter bar: assigned to (dropdown), search by name

---

### Screen 3 — Deal Detail (/deals/[id])

**Purpose:** Single control center for everything related to one deal.

**This is the most important screen. Everything should be accessible from here.**

**Layout:** Two-column layout (wide left panel + narrow right sidebar)

**Left panel sections:**

1. **Deal Header** — deal name, client name, total value, stage badge, assigned person
2. **Quick Actions** (large buttons, always visible):
   - "Add Follow-up Task" → pre-filled task form
   - "Move to [Next Stage]" → one-click stage advance
   - "Update Production" → opens production status dropdown
   - "Mark Shipped" → one-click (if in production/ready_to_ship)
3. **Client Info** — company, contact, phone, email (collapsed by default, expandable)
4. **Deal Info** — product, quantity, value, dates, notes (editable inline)
5. **Next Action** — prominent input: what happens next + by when (always visible, required)
6. **Tasks** — list of tasks attached to this deal + "Add Task" button
7. **Production Orders** — list of production records + "Add Production Order" button
8. **Shipments** — list of shipments + "Add Shipment" button

**Right sidebar:**
- Activity Timeline (all events logged for this deal, newest first)

---

### Screen 4 — Clients (/clients)

**Purpose:** Searchable client directory.

**Layout:** Search bar at top + table below.

**Table columns:** Company Name, Contact Person, Phone, Email, Active Deals (count), Last Activity, Actions (Edit / View)

**Behaviors:**
- Search filters by company name, contact person, email in real-time
- Click company name → /clients/[id]
- "Add Client" button top right

**Client Detail (/clients/[id]):**
- Client info card
- List of all deals for this client
- List of tasks linked to this client
- "Add Deal" shortcut button

---

### Screen 5 — Tasks (/tasks)

**Purpose:** Task management. Daily work for each team member.

**Layout:** Tab bar + task list.

**Tabs:**
- "My Tasks" — tasks assigned to current user (default)
- "Today" — tasks due today (all users visible to managers)
- "Overdue" — tasks past due date
- "All Tasks" — admin/manager only

**Task list item shows:**
- Checkbox (click → mark done)
- Title
- Deal name (linked)
- Due date (red if overdue)
- Priority badge
- Assigned person
- Actions: Edit, Complete, Delete

**Behaviors:**
- Clicking checkbox marks task as done, logs activity
- "Add Task" button top right
- Filter by priority dropdown
- Tasks in "Overdue" tab highlighted in red background

---

### Screen 6 — Production (/production)

**Purpose:** Track all production orders across all vendors.

**Layout:** Filter bar + table.

**Table columns:** Deal Name, Client, Vendor, Quantity, Status, Start Date, Expected Completion, Actions

**Filter bar:** Status dropdown, Vendor dropdown, Date range

**Behaviors:**
- Status badge is clickable → opens inline dropdown to change status (one click)
- Rows with status = 'delayed' OR past expected date shown in red
- Click deal name → /deals/[id]
- "Add Production Order" button links to deal selector first

---

### Screen 7 — Shipments (/shipments)

**Purpose:** Track all shipments from dispatch to delivery.

**Layout:** Filter bar + table.

**Table columns:** Deal Name, Client, Courier, Tracking Number, Status, Dispatch Date, Expected Delivery, Actions

**Filter bar:** Status dropdown

**Behaviors:**
- Status badge clickable → one-click update
- Delayed shipments (status = delayed OR past expected date) shown in red
- Tracking number is clickable text (copy to clipboard)
- Click deal name → /deals/[id]

---

### Screen 8 — Vendors (/vendors)

**Purpose:** Vendor directory.

**Layout:** Simple table with search.

**Table columns:** Name, Contact Person, Phone, Email, Active Orders (count), Actions

---

## 7. Component Specifications

### StatusBadge (shared)

```typescript
// Usage: <StatusBadge type="deal" value="production" />
// Reads from DEAL_STAGES, TASK_STATUSES, etc.
// Returns a colored pill with the human-readable label
// Types: 'deal' | 'task' | 'production' | 'shipment' | 'priority'
```

### ActivityTimeline (shared)

```typescript
// Accepts: entityType ('deal' | 'client'), entityId
// Fetches activities from activities table
// Renders chronological list with:
//   - Event icon (different per event_type)
//   - Human-readable description ("Stage moved from Lead to Quoted")
//   - Actor name and timestamp
//   - Any metadata context
```

### QuickAddTask (deals)

```typescript
// Opens as a sheet/drawer on the right
// Pre-fills: deal_id, client_id, assigned_to (current user)
// Required fields: title, due_date, priority
// On submit: creates task + logs activity
```

### PipelineBoard (deals)

```typescript
// Uses @dnd-kit/core and @dnd-kit/sortable
// Each column = a DndContext droppable zone
// On drop: calls deals.service.updateStage(dealId, newStage)
// Optimistic update: update UI immediately, rollback on error
// On successful drop: log activity with from/to stage
```

---

## 8. Services Layer (src/services/)

### activities.service.ts — Auto-logging

Every service must call `logActivity()` after mutations. Example:

```typescript
// services/activities.service.ts
export async function logActivity(event: {
  event_type: ActivityEvent;
  deal_id?: string;
  client_id?: string;
  task_id?: string;
  production_id?: string;
  shipment_id?: string;
  metadata?: Record<string, unknown>;
  note?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('activities').insert({
    ...event,
    actor_id: user?.id,
  });
}
```

### deals.service.ts — Stage Change

```typescript
export async function updateDealStage(dealId: string, newStage: DealStage, previousStage: DealStage) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('deals')
    .update({ stage: newStage })
    .eq('id', dealId)
    .select()
    .single();
    
  if (error) throw error;
  
  await logActivity({
    event_type: 'deal_stage_changed',
    deal_id: dealId,
    metadata: { from_stage: previousStage, to_stage: newStage }
  });
  
  return data;
}
```

---

## 9. Environment Setup

### .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server only, never expose
```

### .env.example

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 10. Package.json Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "tailwindcss": "^3",
    "@tailwindcss/forms": "^0.5",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.400",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-dropdown-menu": "^2",
    "@radix-ui/react-select": "^2",
    "@radix-ui/react-tabs": "^1",
    "@radix-ui/react-toast": "^1",
    "@radix-ui/react-tooltip": "^1",
    "@radix-ui/react-avatar": "^1",
    "@radix-ui/react-badge": "^1",
    "@radix-ui/react-separator": "^1",
    "@radix-ui/react-sheet": "^1",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "@dnd-kit/core": "^6",
    "@dnd-kit/sortable": "^8",
    "@dnd-kit/utilities": "^3",
    "date-fns": "^3",
    "sonner": "^1"
  }
}
```

---

## 11. Phased Build Plan

### Phase 0 — Setup (Day 1)

**Goal:** Working repo, Supabase connected, auth working.

**Tasks in order:**
1. `npx create-next-app@latest crm --typescript --tailwind --app`
2. Install all dependencies listed above
3. `npx shadcn@latest init` — use New York style, zinc base color
4. Install shadcn components: `npx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet tabs toast tooltip avatar badge`
5. Create Supabase project at supabase.com
6. Run all migrations 001–011 in Supabase SQL editor in order
7. Create `.env.local` with Supabase keys
8. Create `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`
9. Create `src/middleware.ts` for auth protection
10. Build login page at `/login`
11. Test: sign up a user, verify profile auto-created in profiles table
12. Push to GitHub

**Exit criteria:** You can log in and see a blank dashboard route.

---

### Phase 1 — App Shell (Day 2)

**Goal:** Navigation and layout working for all routes.

**Tasks in order:**
1. Create `src/components/layout/AppShell.tsx` with sidebar + content area
2. Create `src/components/layout/Sidebar.tsx` with NAV_ITEMS links and active state
3. Create `src/components/layout/Header.tsx` with user avatar + logout button
4. Create `(dashboard)/layout.tsx` using AppShell, protected by auth check
5. Create stub pages for all 8 routes (just return a heading for now)
6. Create `src/lib/constants.ts` with all constants
7. Create `src/components/shared/StatusBadge.tsx`
8. Create `src/components/shared/EmptyState.tsx`
9. Create `src/components/shared/LoadingSpinner.tsx`
10. Create `src/lib/utils.ts` with `cn()`, `formatCurrency()`, `formatDate()`, `getDaysUntil()`

**Exit criteria:** You can navigate between all 8 sections. Auth redirect works.

---

### Phase 2 — Clients Module (Day 3)

**Goal:** Full CRUD for clients.

**Tasks in order:**
1. Create `src/services/clients.service.ts`
   - `getClients(search?: string)` — returns all active clients
   - `getClient(id)` — returns single client with deal count
   - `createClient(data)` — insert + return
   - `updateClient(id, data)` — update + return
   - `deleteClient(id)` — soft delete (set is_active = false)
2. Create `src/lib/validations/client.schema.ts` with Zod schema
3. Create `src/hooks/useClients.ts` wrapping service calls
4. Create `src/components/clients/ClientForm.tsx` (create + edit, same component)
5. Create `src/components/clients/ClientsTable.tsx` with search
6. Build `/clients` page using ClientsTable
7. Build `/clients/new` page using ClientForm
8. Build `/clients/[id]` page (show info + list deals for this client)
9. Build `/clients/[id]/edit` page using ClientForm with prefilled data

**Exit criteria:** You can create, search, view, and edit a client.

---

### Phase 3 — Vendors Module (Day 3–4)

**Goal:** Full CRUD for vendors (same pattern as clients).

**Tasks:** Mirror the clients module pattern exactly.

1. `services/vendors.service.ts`
2. `validations/vendor.schema.ts`
3. `hooks/useVendors.ts`
4. `components/vendors/VendorForm.tsx`
5. `components/vendors/VendorsTable.tsx`
6. Pages: `/vendors`, `/vendors/new`, `/vendors/[id]`

**Exit criteria:** You can manage vendors.

---

### Phase 4 — Deals Module (Days 4–6)

**Goal:** Deals pipeline — the core of the CRM.

**Tasks in order:**
1. Create `src/services/deals.service.ts`
   - `getDeals(filters?)` — returns deals with client name joined
   - `getDeal(id)` — returns deal with all related data
   - `createDeal(data)` — insert + log activity
   - `updateDeal(id, data)` — update + log activity
   - `updateDealStage(id, newStage, previousStage)` — update stage + log
   - `getDealsByStage()` — returns object grouped by stage for Kanban
2. Create `src/lib/validations/deal.schema.ts`
3. Create `src/hooks/useDeals.ts`
4. Create `src/services/activities.service.ts` with `logActivity()`
5. Create `src/components/deals/DealForm.tsx`
   - Client selector (searchable dropdown using clients from DB)
   - Assigned to selector (profiles dropdown)
   - Stage select
   - All other fields
6. Create `src/components/deals/DealCard.tsx` for Kanban
7. Create `src/components/deals/PipelineColumn.tsx`
8. Create `src/components/deals/PipelineBoard.tsx` using dnd-kit
9. Create `src/components/deals/StageSelect.tsx`
10. Create `src/components/deals/NextActionInput.tsx`
11. Build `/deals` page (Kanban board)
12. Build `/deals/new` page
13. Build `/deals/[id]` page — deal detail control center (build all sections)
14. Build `/deals/[id]/edit` page

**Exit criteria:** You can create a deal, see it on the Kanban board, drag it between stages, and view its detail page.

---

### Phase 5 — Tasks Module (Days 6–8)

**Goal:** Daily task system that drives team behavior.

**Tasks in order:**
1. Create `src/services/tasks.service.ts`
   - `getMyTasks(userId)` — tasks assigned to user, not done
   - `getTodayTasks(userId?)` — tasks due today
   - `getOverdueTasks(userId?)` — tasks past due, not done
   - `getAllTasks(filters?)` — for managers
   - `createTask(data)` — insert + log activity
   - `updateTask(id, data)`
   - `completeTask(id)` — set status = done, completed_at = now() + log
   - `createFollowupTask(dealId, data)` — shortcut for deal follow-up
2. Create `src/lib/validations/task.schema.ts`
3. Create `src/hooks/useTasks.ts`
4. Create `src/components/tasks/TaskCard.tsx`
5. Create `src/components/tasks/TaskList.tsx` with tab filtering
6. Create `src/components/tasks/TaskForm.tsx`
7. Create `src/components/tasks/QuickAddTask.tsx` (used from deal detail)
8. Build `/tasks` page with tabs: My Tasks / Today / Overdue / All
9. Build `/tasks/new` page
10. Add task section to `/deals/[id]` page

**Exit criteria:** Team member can see all their tasks for today, mark them done, and add follow-up tasks from deal pages.

---

### Phase 6 — Production Module (Days 8–10)

**Goal:** Track vendor production orders.

**Tasks in order:**
1. Create `src/services/production.service.ts`
   - `getProductionOrders(filters?)` — with vendor name + deal name joined
   - `getProductionByDeal(dealId)`
   - `createProductionOrder(data)` — insert + log activity
   - `updateProductionStatus(id, newStatus)` — one-click update
   - `getDelayedOrders()` — for dashboard widget
2. Create `src/lib/validations/production.schema.ts`
3. Create `src/hooks/useProduction.ts`
4. Create `src/components/production/ProductionForm.tsx`
   - Vendor selector dropdown
   - Deal selector dropdown
   - Status, dates, quantity
5. Create `src/components/production/ProductionTable.tsx` with filter bar
6. Create `src/components/production/StatusUpdate.tsx` (inline one-click update)
7. Build `/production` page
8. Add production section to `/deals/[id]` page

**Exit criteria:** You can create a production order, link it to a deal and vendor, and update its status in one click.

---

### Phase 7 — Shipments Module (Days 10–12)

**Goal:** Track shipment lifecycle from dispatch to delivery.

**Tasks in order:**
1. Create `src/services/shipments.service.ts`
   - `getShipments(filters?)`
   - `getShipmentsByDeal(dealId)`
   - `createShipment(data)` — insert + log activity
   - `updateShipmentStatus(id, newStatus)` + log
   - `getInTransitShipments()` — dashboard widget
2. Create `src/lib/validations/shipment.schema.ts`
3. Create `src/hooks/useShipments.ts`
4. Create `src/components/shipments/ShipmentForm.tsx`
5. Create `src/components/shipments/ShipmentTable.tsx`
6. Create `src/components/shipments/StatusUpdate.tsx`
7. Build `/shipments` page
8. Add shipments section to `/deals/[id]` page
9. Update tasks table constraint (shipment_id FK already in schema)

**Exit criteria:** You can create a shipment for a deal, track it through statuses, and answer "where is this order" in under 5 seconds.

---

### Phase 8 — Dashboard (Days 12–13)

**Goal:** One morning screen that tells the team exactly what needs attention.

**Tasks in order:**
1. Create `src/services/dashboard.service.ts`
   - `getDashboardSummary()` — queries dashboard_summary view
   - `getMyTasksToday(userId)`
   - `getDealsNeedingFollowup()` — deals where next_action_date <= today
   - `getDelayedProduction()`
   - `getShipmentsInTransit()`
2. Create `src/hooks/useDashboard.ts`
3. Create `src/components/dashboard/StatCard.tsx`
4. Create `src/components/dashboard/TasksWidget.tsx`
5. Create `src/components/dashboard/DealsWidget.tsx`
6. Create `src/components/dashboard/ProductionWidget.tsx`
7. Build the `/` dashboard page assembling all widgets
8. Add `src/components/shared/ActivityTimeline.tsx`
9. Add activity timeline to `/deals/[id]` page

**Exit criteria:** Opening the app in the morning gives a complete picture of what needs action today.

---

### Phase 9 — Polish and Simplification (Days 13–15)

**Goal:** Remove friction. Increase adoption.

**Tasks in order:**
1. Add toast notifications (using sonner) for all create/update/delete actions
2. Add confirmation dialogs for destructive actions (delete client, lose deal)
3. Add loading skeletons for all data tables and lists
4. Add global search component in header (searches clients, deals by name)
5. Add mobile responsiveness to sidebar (hamburger menu for small screens)
6. Add empty states with helpful CTAs for all list screens
7. Review all forms — remove any non-essential fields
8. Review all table columns — remove any non-essential columns
9. Add keyboard shortcut hints (optional but nice: N = new, / = search)
10. Add "Copy to clipboard" for tracking numbers
11. Add overdue highlighting (red background) for delayed rows in all tables
12. Final design review: consistent spacing, consistent button sizes, consistent status badge colors

---

### Phase 10 — Testing and Hardening (Days 15–16)

**Goal:** Safe to use in real operations.

**Test checklist (test each manually + fix before shipping):**
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
- [ ] Verify RLS: sales user cannot see tasks of other users

**Final checks:**
- All forms have required field validation with clear error messages
- All status changes are logged in activities table
- No broken navigation links
- Mobile view usable on phone

---

## 12. Seed Data (supabase/seed.sql)

```sql
-- Run after migrations in development only
-- Creates sample data for testing

-- Sample clients
insert into clients (company_name, contact_person, phone, email, city, country) values
  ('Acme Trading Co', 'John Smith', '+1-555-0101', 'john@acmetrading.com', 'New York', 'USA'),
  ('Global Exports Ltd', 'Sarah Johnson', '+44-20-7946-0101', 'sarah@globalexports.co.uk', 'London', 'UK'),
  ('Pacific Imports', 'Wei Chen', '+86-21-5555-0101', 'wei@pacificimports.cn', 'Shanghai', 'China');

-- Sample vendors
insert into vendors (name, contact_person, phone, speciality) values
  ('FastProd Factory', 'Ahmed Khan', '+92-321-5555101', 'Textiles'),
  ('Quality First Manufacturing', 'Ravi Patel', '+91-98765-43210', 'Electronics'),
  ('Sunrise Production', 'Li Mei', '+86-755-5555-0101', 'Packaging');

-- Note: Insert deals and tasks manually after creating user accounts
-- because they need real profile IDs
```

---

## 13. Claude Code Agent Prompts

Use these exact prompts when instructing Claude Code to build each piece.

### Prompt — Initial Project Setup

```
Set up a new Next.js 14 project with TypeScript, Tailwind, and Supabase for an internal sales operations CRM.

Requirements:
- App Router with TypeScript strict mode
- Supabase SSR client with @supabase/ssr
- shadcn/ui with zinc base color and New York style
- Middleware that redirects unauthenticated users to /login
- Auth callback route at /api/auth/callback
- Login page at /login with email/password form using Supabase auth
- After login redirect to / (dashboard)
- On logout redirect to /login

Project structure follows: src/app, src/components, src/lib, src/hooks, src/services, src/types

Environment variables from .env.local: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Prompt — App Shell

```
Build the main app shell layout for a CRM app.

Create:
1. src/components/layout/Sidebar.tsx
   - Fixed left sidebar, 64px wide on desktop
   - Logo at top: "SalesOps" in bold
   - Navigation items: Dashboard (LayoutDashboard icon), Pipeline (KanbanSquare), Clients (Users), Tasks (CheckSquare), Production (Factory), Shipments (Truck), Vendors (Building2), Settings (Settings)
   - Active item highlighted with blue background pill
   - User avatar + name at bottom of sidebar
   - Collapse to icon-only on mobile

2. src/components/layout/Header.tsx
   - Top bar showing current page title
   - Right side: notification bell placeholder + user dropdown (shows profile name, logout option)

3. src/(dashboard)/layout.tsx
   - Wraps all protected pages with sidebar + header
   - Checks auth, redirects to /login if not authenticated
   - Takes children as content area

4. Stub pages (just h1 with page name) for: /, /clients, /deals, /tasks, /production, /shipments, /vendors, /settings

Use shadcn/ui components, Tailwind, Lucide icons. Clean, professional look.
```

### Prompt — Deals Kanban Board

```
Build a Kanban pipeline board for deals using dnd-kit.

The board has 7 columns: Lead, Quoted, Negotiation, Confirmed, Production, Ready to Ship, Shipped.

Data comes from Supabase: select deals with client name joined (deals join clients on client_id).

Requirements:
- Each column shows stage name + deal count
- DealCard shows: company name, deal name, value (formatted as currency), assigned person initials in avatar, next action date (red text if date is today or past)
- Drag a card from one column to another: call updateDealStage(dealId, newStage), optimistic update (update UI first, rollback on error), show toast on success
- After successful drag: insert into activities table with event_type = 'deal_stage_changed', metadata = { from_stage, to_stage }
- Click a card: navigate to /deals/[id]
- "Add Deal" button top right: navigate to /deals/new
- Filter bar: dropdown to filter by assigned_to user

Use @dnd-kit/core and @dnd-kit/sortable. Make cards draggable only by the header area. Show a placeholder ghost where card will drop.
```

### Prompt — Deal Detail Page

```
Build the deal detail page at /deals/[id]. This is the most important screen in the app.

The page is a two-column layout:
- Left wide panel (70%): all deal info and related sections
- Right sidebar (30%): activity timeline

Left panel sections (in this order):

1. Header bar:
   - Deal name (large, editable inline on click)
   - Stage badge with dropdown to change stage (one click, no form)
   - Client name linked to /clients/[id]
   - Total value formatted as currency
   - Assigned to avatar + name

2. Quick Action buttons (large, prominent, always visible):
   - "Add Follow-up" → opens drawer/sheet with pre-filled task form (deal_id pre-set)
   - "Advance Stage" → button label shows next stage, clicking moves deal forward
   - "Edit Deal" → navigates to /deals/[id]/edit

3. Next Action box (always visible, styled with border):
   - Label: "What happens next?"
   - Inline editable text: next_action field
   - Date picker: next_action_date field
   - Auto-saves on blur

4. Tasks section:
   - Section heading "Tasks" with count badge
   - List of tasks for this deal using TaskCard component
   - "Add Task" button opens QuickAddTask sheet

5. Production section:
   - Section heading "Production" with count badge
   - List of production orders with status badges + one-click status update
   - "Add Production Order" button

6. Shipments section:
   - Section heading "Shipments" with count badge
   - List of shipments with status badges + tracking numbers
   - "Add Shipment" button

Right sidebar:
- "Activity" heading
- ActivityTimeline component showing all events for this deal
- Events formatted as: "[Actor name] [action description] - [time ago]"
  Examples: "Ahmed moved deal to Production · 2 hours ago"
  "Sarah created follow-up task · Yesterday"

Fetch all data in parallel: deal + client + tasks + production + shipments + activities
```

### Prompt — Tasks Module

```
Build the tasks module at /tasks.

The page has 4 tabs: "My Tasks", "Today", "Overdue", "All Tasks"

My Tasks tab: all tasks assigned to current user where status != done
Today tab: all tasks due today (for current user; managers see all)
Overdue tab: all tasks where due_date < today and status != done
All Tasks tab: visible to admin/manager roles only

TaskCard component shows:
- Checkbox on left (click → mark task as done, call completeTask())
- Title (bold)
- Description (if present, truncated)
- Deal name linked to /deals/[id] (if task has deal_id)
- Due date: green if future, orange if today, red if past
- Priority badge
- Assigned person name
- Actions: edit (pencil icon), delete (trash icon, with confirm dialog)

On checkbox click:
- Optimistic update: mark as done visually immediately
- Call updateTask(id, { status: 'done', completed_at: new Date() })
- Insert activity: task_completed
- Show toast: "Task completed"

"Add Task" button top right → /tasks/new or open sheet

TaskForm fields:
- Title (required text input)
- Description (optional textarea)
- Deal (optional searchable select from deals)
- Client (optional searchable select from clients, auto-fills from deal selection)
- Assigned to (select from profiles)
- Priority (dropdown: Low, Medium, High, Urgent)
- Due date (date picker, required)
- Reminder date (date picker, optional)
```

### Prompt — Dashboard

```
Build the main dashboard at / (the first screen users see after login).

Top row: 5 stat cards in a grid
- "Active Deals" — count of deals where stage not in (completed, lost)
- "Due Today" — count of tasks due today for current user
- "Overdue Tasks" — count of overdue tasks for current user (red color if > 0)
- "Production Delays" — count of production orders where status = delayed
- "In Transit" — count of shipments where status = in_transit

Each StatCard shows: icon, metric name, number (large), optional color indicator

Below stat cards: 3 column grid of widgets

Left widget: "My Tasks Today"
- List of tasks assigned to current user where due_date = today and status != done
- Each item: checkbox + title + deal name
- "View all tasks" link at bottom → /tasks?tab=today
- Empty state: "You're all caught up today! 🎉"

Center widget: "Deals Needing Action"
- List of deals where next_action_date <= today and stage not in (completed, lost)
- Each item: company name, deal name, next action text, days overdue
- "View pipeline" link → /deals
- Empty state: "No deals need immediate action"

Right widget: "Production Delays"
- List of production orders where status = delayed OR expected_completion_date < today
- Each item: deal name, vendor name, status badge, expected date
- "View production" link → /production
- Empty state: "All production orders on track"

Data refreshes every 5 minutes (use setInterval or Supabase realtime).
```

---

## 14. UI/UX Non-Negotiables

These rules must be followed throughout the entire build:

1. **No screen with more than 5 clickable primary actions visible at once** — consolidate into dropdowns if needed
2. **Status changes are always one click or one dropdown** — never a modal form
3. **All tables are searchable** — every list screen has a search input
4. **Overdue items always shown in red** — red text for dates, red background for rows
5. **Empty states always have a CTA** — never show a blank list without a "Create your first X" button
6. **All forms use dropdowns/selects for fields that come from a list** — never free text for statuses, users, clients, or vendors
7. **Toast notifications for every create, update, complete, and delete action** — using sonner
8. **Confirmation dialogs only for destructive actions** (delete, mark lost) — not for edits or status changes
9. **Font size for primary content** minimum 14px — this is used by non-technical staff on varying screen sizes
10. **The Next Action fields on every deal detail page** are always visible and prominently styled — this is the most important field in the whole app

---

## 15. What NOT to Build (Version 1)

Do not build any of the following until the core CRM is fully adopted by the team:

- Email sending or integration
- PDF generation (quotes, invoices)
- WhatsApp or SMS notifications
- Advanced reporting or analytics dashboards
- Workflow automation or trigger rules
- Customer-facing portals
- Integrations with accounting software
- AI or LLM features
- Complex permission rule builders
- Calendar or meeting scheduling

The fastest path to adoption is a tool that does exactly what the team needs and nothing more.

---

## 16. Deployment

### Vercel

1. Push project to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Supabase

- Already hosted. No additional deployment needed.
- Set up daily backups in Supabase dashboard (under Settings → Backups)
- Enable email confirmations in Supabase Auth settings (optional but recommended)

### Custom Domain (optional)

- Add custom domain in Vercel dashboard
- Example: `crm.yourcompany.com`

---

## 17. Go-Live Plan

### Step 1 — Soft Launch (Week 1 after build)
- Deploy to Vercel
- Create accounts for 1–2 trusted sales team members
- Watch them use the app for 3–5 days
- Note every point of confusion without explaining — let them struggle and observe

### Step 2 — Fix Before Expanding (End of Week 1)
- Fix the top 3 most confusing UX issues observed
- Add any missing fields the team mentioned
- Do NOT add features — only fix friction

### Step 3 — Full Team Launch (Week 2)
- Create accounts for all team members
- Migrate existing data from spreadsheets (create a one-time import script using Supabase service role key)
- Announce that spreadsheets are being retired

### Step 4 — Confirm Adoption (Week 3–4)
- The CRM is successful if:
  - Deal stages are being updated at least daily
  - Tasks are being created and completed
  - Production statuses are being updated by production team
  - No one is asking "where do I find X?" anymore

---

## 18. Success Metrics

The CRM has succeeded when:

- All deal updates happen in the system, not in WhatsApp or spreadsheets
- Every salesperson can answer "what am I doing today" by opening the dashboard
- Production delays are identified proactively, not by asking in a group chat
- Shipment status is answerable in under 10 seconds
- No one needs to be trained to use it — it is self-explanatory
