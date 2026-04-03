# PLAN-foundation.md — Phase 1: Foundation

> **Objective:** Set up Supabase backend, authentication flow, and the application shell so that a user can sign up, log in, see a sidebar layout, and land on an empty dashboard page. No data pages yet — just the skeleton.

---

## ⚠️ CRITICAL: Read Before You Start

1. **Next.js 16.2.2** — This project uses Next.js 16 (NOT 14).
2. **`proxy.ts` NOT `middleware.ts`** — Next.js 16 renamed middleware to proxy. The export is `export function proxy(request)`, NOT `export function middleware(request)`. File location: project root `proxy.ts` (or `src/proxy.ts` if using src). **Do NOT create a `middleware.ts`.**
3. **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** — Supabase now uses publishable keys instead of anon keys. The env var is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, NOT `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **`supabase.auth.getClaims()`** — In proxy/server code, use `getClaims()` to validate the JWT. Do NOT use `getSession()` in proxy. `getClaims()` validates the JWT signature against published public keys every time. `getUser()` is also acceptable in server components.
5. **`@supabase/ssr` v0.10.0** — Already installed. Do NOT reinstall.
6. **`shadcn/ui` components** — Already in `src/components/ui/`. Do NOT re-install.
7. **Do NOT run `npm install`** — All deps are installed.

### Supabase Project (ALREADY EXISTS)

| Key | Value |
|-----|-------|
| **Project ID** | `kwubpqzdburgjxqruejc` |
| **Project URL** | `https://kwubpqzdburgjxqruejc.supabase.co` |
| **Publishable Key** | `sb_publishable__HqF040pm47uti1GU0E3lQ_pogLrPPf` |
| **Anon Key (legacy)** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3dWJwcXpkYnVyZ2p4cXJ1ZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTk3MDksImV4cCI6MjA5MDY5NTcwOX0.BBuaLXZJWo1XWrTXox3Gn5sDhooriLZzrWoL25zSh74` |
| **Database** | Empty (no tables yet) |

---

## Task Checklist

### PHASE 1A — Environment & Database (use Supabase MCP)

- [ ] **1.1** Create `.env.local` and `.env.example` files
- [ ] **1.2** Run Migration 001 — Extensions and Enums
- [ ] **1.3** Run Migration 002 — Profiles table
- [ ] **1.4** Run Migration 003 — Clients table
- [ ] **1.5** Run Migration 004 — Vendors table
- [ ] **1.6** Run Migration 005 — Deals table
- [ ] **1.7** Run Migration 006 — Tasks table
- [ ] **1.8** Run Migration 007 — Production Orders table
- [ ] **1.9** Run Migration 008 — Shipments table
- [ ] **1.10** Run Migration 009 — Activities table
- [ ] **1.11** Run Migration 010 — Helper Views
- [ ] **1.12** Run Migration 011 — Auto Profile Creation Trigger

### PHASE 1B — Supabase Client Setup

- [ ] **2.1** Create `src/lib/supabase/client.ts` — browser client
- [ ] **2.2** Create `src/lib/supabase/server.ts` — server client
- [ ] **2.3** Create `src/lib/supabase/proxy.ts` — session update logic
- [ ] **2.4** Create `proxy.ts` at project root — Next.js 16 proxy entry point

### PHASE 1C — Authentication Pages

- [ ] **3.1** Create `src/app/(auth)/layout.tsx` — centered auth layout
- [ ] **3.2** Create `src/app/(auth)/login/page.tsx` — login page
- [ ] **3.3** Create `src/app/(auth)/login/actions.ts` — login & signup server actions
- [ ] **3.4** Create `src/app/auth/confirm/route.ts` — email confirmation endpoint
- [ ] **3.5** Create `src/app/auth/signout/route.ts` — sign-out route handler

### PHASE 1D — App Shell (Protected Layout)

- [ ] **4.1** Create `src/lib/constants.ts` — navigation items, stage labels, status colors
- [ ] **4.2** Create `src/components/layout/Sidebar.tsx` — sidebar navigation
- [ ] **4.3** Create `src/components/layout/Header.tsx` — top bar with user info & sign-out
- [ ] **4.4** Create `src/components/layout/AppShell.tsx` — sidebar + main content wrapper
- [ ] **4.5** Create `src/app/(dashboard)/layout.tsx` — protected layout (auth check + AppShell)
- [ ] **4.6** Create `src/app/(dashboard)/page.tsx` — dashboard placeholder
- [ ] **4.7** Delete `src/app/page.tsx` — conflicts with (dashboard) route group

### PHASE 1E — Verification

- [ ] **5.1** Run `npm run build` and fix all errors
- [ ] **5.2** Run `npm run dev` and verify login flow
- [ ] **5.3** Verify sign-up creates a profile in the `profiles` table

---

## Detailed Instructions Per Task

---

### 1.1 — Create Environment Files

**File: `.env.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**File: `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://kwubpqzdburgjxqruejc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__HqF040pm47uti1GU0E3lQ_pogLrPPf
```

---

### 1.2–1.12 — Database Migrations

Use `mcp_supabase-mcp-server_apply_migration` for EACH migration. **Run them IN ORDER.** The `project_id` is always `kwubpqzdburgjxqruejc`.

#### Migration 001 — Extensions and Enums

**name:** `extensions_and_enums`

```sql
create extension if not exists "uuid-ossp";

create type deal_stage as enum (
  'lead', 'quoted', 'negotiation', 'confirmed', 'production',
  'ready_to_ship', 'shipped', 'completed', 'lost'
);

create type task_status as enum ('pending', 'doing', 'done', 'overdue');

create type task_priority as enum ('low', 'medium', 'high', 'urgent');

create type production_status as enum (
  'not_started', 'in_progress', 'quality_check', 'completed', 'delayed'
);

create type shipment_status as enum (
  'preparing', 'dispatched', 'in_transit', 'delivered', 'delayed'
);

create type user_role as enum ('admin', 'manager', 'sales', 'production', 'logistics');

create type activity_event as enum (
  'deal_created', 'deal_stage_changed', 'deal_updated',
  'task_created', 'task_completed',
  'production_started', 'production_completed',
  'shipment_created', 'shipment_dispatched', 'shipment_delivered',
  'note_added'
);
```

#### Migration 002 — Profiles

**name:** `profiles`

```sql
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

#### Migration 003 — Clients

**name:** `clients`

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
  on clients for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on clients for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on clients for update using (auth.role() = 'authenticated');
```

#### Migration 004 — Vendors

**name:** `vendors`

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
  on vendors for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert vendors"
  on vendors for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update vendors"
  on vendors for update using (auth.role() = 'authenticated');
```

#### Migration 005 — Deals

**name:** `deals`

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
  on deals for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert deals"
  on deals for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update deals"
  on deals for update using (auth.role() = 'authenticated');
```

#### Migration 006 — Tasks

**name:** `tasks`

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  deal_id uuid references deals(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  shipment_id uuid,
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
  on tasks for insert with check (auth.role() = 'authenticated');

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

#### Migration 007 — Production Orders

**name:** `production_orders`

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
  on production_orders for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert production orders"
  on production_orders for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update production orders"
  on production_orders for update using (auth.role() = 'authenticated');
```

#### Migration 008 — Shipments

**name:** `shipments`

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

alter table tasks
  add constraint tasks_shipment_id_fkey
  foreign key (shipment_id) references shipments(id) on delete set null;

create trigger shipments_updated_at
  before update on shipments
  for each row execute function update_updated_at();

alter table shipments enable row level security;

create policy "Authenticated users can view shipments"
  on shipments for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert shipments"
  on shipments for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update shipments"
  on shipments for update using (auth.role() = 'authenticated');
```

#### Migration 009 — Activities

**name:** `activities`

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
  metadata jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index activities_deal_id_idx on activities(deal_id);
create index activities_client_id_idx on activities(client_id);
create index activities_created_at_idx on activities(created_at desc);

alter table activities enable row level security;

create policy "Authenticated users can view activities"
  on activities for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activities"
  on activities for insert with check (auth.role() = 'authenticated');
```

#### Migration 010 — Helper Views

**name:** `helper_views`

```sql
create or replace view dashboard_summary as
select
  (select count(*) from deals where stage not in ('completed', 'lost') and is_archived = false) as active_deals,
  (select count(*) from tasks where status = 'overdue') as overdue_tasks,
  (select count(*) from tasks where status in ('pending', 'doing') and due_date = current_date) as due_today,
  (select count(*) from production_orders where status = 'delayed') as delayed_production,
  (select count(*) from shipments where status = 'in_transit') as shipments_in_transit;

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

#### Migration 011 — Auto Profile Creation Trigger

**name:** `auto_profile_trigger`

```sql
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

### 2.1 — Browser Supabase Client

**File: `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

---

### 2.2 — Server Supabase Client

**File: `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

---

### 2.3 — Proxy Session Update Logic

**File: `src/lib/supabase/proxy.ts`**

> ⚠️ This uses `getClaims()` NOT `getUser()` or `getSession()` — per Supabase official docs.

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it: const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
  // 4. Finally: return myNewResponse

  return supabaseResponse
}
```

---

### 2.4 — Next.js 16 Proxy Entry Point

**File: `proxy.ts`** (project root, same level as `next.config.ts`)

> ⚠️ The function MUST be named `proxy`, NOT `middleware`.

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

### 3.1 — Auth Layout

**File: `src/app/(auth)/layout.tsx`**

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
```

---

### 3.2 — Login Page

**File: `src/app/(auth)/login/page.tsx`**

Uses existing `shadcn/ui` components: Card, Input, Button, Label.

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">SalesOps CRM</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button formAction={login}>Log in</Button>
            <Button formAction={signup} variant="outline">
              Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

### 3.3 — Login Server Actions

**File: `src/app/(auth)/login/actions.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid+credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Could+not+create+account')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check+your+email+to+confirm+your+account')
}
```

---

### 3.4 — Email Confirmation Route

**File: `src/app/auth/confirm/route.ts`**

> Note: This path is `src/app/auth/confirm/` (NOT inside `(auth)` group).

```typescript
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  }

  redirectTo.pathname = '/login'
  redirectTo.searchParams.set('error', 'Could+not+verify+email')
  return NextResponse.redirect(redirectTo)
}
```

---

### 3.5 — Sign Out Route

**File: `src/app/auth/signout/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
```

---

### 4.1 — Constants

**File: `src/lib/constants.ts`**

```typescript
import {
  LayoutDashboard,
  Users,
  Handshake,
  ListTodo,
  Factory,
  Truck,
  Building2,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Production', href: '/production', icon: Factory },
  { label: 'Shipments', href: '/shipments', icon: Truck },
  { label: 'Vendors', href: '/vendors', icon: Building2 },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { value: 'quoted', label: 'Quoted', color: 'bg-blue-100 text-blue-700' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-100 text-amber-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'production', label: 'Production', color: 'bg-orange-100 text-orange-700' },
  { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
] as const

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  { value: 'doing', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
] as const

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
] as const

export const PRODUCTION_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-100 text-slate-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'quality_check', label: 'QC', color: 'bg-amber-100 text-amber-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-700' },
] as const

export const SHIPMENT_STATUSES = [
  { value: 'preparing', label: 'Preparing', color: 'bg-slate-100 text-slate-700' },
  { value: 'dispatched', label: 'Dispatched', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-amber-100 text-amber-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-700' },
] as const

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales' },
  { value: 'production', label: 'Production' },
  { value: 'logistics', label: 'Logistics' },
] as const
```

---

### 4.2 — Sidebar

**File: `src/components/layout/Sidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SalesOps CRM
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

---

### 4.3 — Header

**File: `src/components/layout/Header.tsx`**

```tsx
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full text-left">
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

---

### 4.4 — AppShell

**File: `src/components/layout/AppShell.tsx`**

```tsx
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* @ts-expect-error Async Server Component */}
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

### 4.5 — Protected Dashboard Layout

**File: `src/app/(dashboard)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <AppShell>{children}</AppShell>
}
```

---

### 4.6 — Dashboard Page (Placeholder)

**File: `src/app/(dashboard)/page.tsx`**

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to SalesOps CRM. This dashboard will show your key metrics.
      </p>
    </div>
  )
}
```

---

### 4.7 — Delete Root Page

**Action: DELETE `src/app/page.tsx`**

The `(dashboard)` route group maps to `/`. Having `src/app/page.tsx` AND `src/app/(dashboard)/page.tsx` creates a conflict. The root `page.tsx` must be deleted.

```bash
rm src/app/page.tsx
```

---

### 5.1 — Build Verification

```bash
npm run build
```

Fix any TypeScript or import errors.

### 5.2 — Manual Verification

```bash
npm run dev
```

1. Open `http://localhost:3000` → should redirect to `/login`
2. Sign up with email + password
3. After confirming email (or if email confirmation disabled), log in
4. Should see dashboard with sidebar
5. Click sidebar items — pages won't exist yet but navigation should not crash

### 5.3 — Profile Auto-Creation Check

After signing up, verify profile was created by running:

```sql
SELECT * FROM profiles;
```

Use `mcp_supabase-mcp-server_execute_sql` with `project_id: kwubpqzdburgjxqruejc`.

---

## File Summary

| # | File | Type | Action |
|---|------|------|--------|
| 1 | `.env.example` | Config | CREATE |
| 2 | `.env.local` | Config (gitignored) | CREATE |
| 3 | `proxy.ts` | Next.js 16 proxy | CREATE |
| 4 | `src/lib/supabase/client.ts` | Browser client | CREATE |
| 5 | `src/lib/supabase/server.ts` | Server client | CREATE |
| 6 | `src/lib/supabase/proxy.ts` | Session update logic | CREATE |
| 7 | `src/lib/constants.ts` | App constants | CREATE |
| 8 | `src/components/layout/Sidebar.tsx` | Sidebar | CREATE |
| 9 | `src/components/layout/Header.tsx` | Header | CREATE |
| 10 | `src/components/layout/AppShell.tsx` | Layout wrapper | CREATE |
| 11 | `src/app/(auth)/layout.tsx` | Auth layout | CREATE |
| 12 | `src/app/(auth)/login/page.tsx` | Login page | CREATE |
| 13 | `src/app/(auth)/login/actions.ts` | Auth server actions | CREATE |
| 14 | `src/app/auth/confirm/route.ts` | Email confirm handler | CREATE |
| 15 | `src/app/auth/signout/route.ts` | Sign out handler | CREATE |
| 16 | `src/app/(dashboard)/layout.tsx` | Protected layout | CREATE |
| 17 | `src/app/(dashboard)/page.tsx` | Dashboard placeholder | CREATE |
| 18 | `src/app/page.tsx` | Default Next.js page | **DELETE** |

---

## What Phase 2 Will Cover

After Phase 1 is verified:
- **Clients module** — list, create, detail, edit
- **Vendors module** — list, create, detail, edit
- **Shared components** — StatusBadge, EmptyState, LoadingSpinner
- **Data hooks** — useClients, useVendors
- **Zod validation schemas** — client.schema.ts, vendor.schema.ts
