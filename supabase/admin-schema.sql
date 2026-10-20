-- Zameel founders console: tables and founder-only access.
-- Run once in the Supabase SQL editor (or as a migration). Every table is readable and
-- writable only by signed-in accounts whose email is in public.founders.

create extension if not exists pgcrypto;

create table if not exists public.founders (
  email text primary key,
  name text not null
);

create or replace function public.is_founder() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.founders f where lower(f.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_founder() to authenticated;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null, country text, sector text, plan text, seats int, price_per_seat numeric,
  status text default 'Signed', go_live date, account_manager text, channels text, hours text,
  contact_name text, contact_email text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  order_form text, signed date, nda text, msa text, dpa text, min_term_end date, term text,
  setup_fee text, case_study text, file_link text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text, client_id uuid references public.clients(id) on delete restrict,
  kind text, service_month text, amount_usd numeric, status text default 'Sent',
  issued date, due date, paid_on date, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null, status text, client_id uuid references public.clients(id) on delete set null,
  skill text, shift text, start_date date, qa_score numeric, attendance numeric, phone text, email text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.sla_months (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade, month text not null,
  chat_2min_pct numeric, email_4h_pct numeric, quality_pct numeric, attendance_pct numeric,
  escalation_15min_pct numeric, csat_pct numeric, ramp_up boolean default false, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  ref text, company text not null, tier text, country text, city text, sector text, website text,
  list text, stage text default 'Not contacted', owner text, contact_name text, contact_role text,
  next_step text, next_date date, seats_estimate int, pain_signal text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date, item text not null, vendor text, category text, billing text, amount_usd numeric, paid_by text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.recurring (
  id uuid primary key default gen_random_uuid(),
  service text not null, vendor text, billing text, price_usd numeric, next_charge date, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);
create table if not exists public.setup_tasks (
  id uuid primary key default gen_random_uuid(),
  item text not null, area text, status text default 'To do', owner text, due date, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by text
);

do $$
declare t text;
begin
  foreach t in array array['founders','clients','contracts','invoices','agents','sla_months','leads','expenses','recurring','setup_tasks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists founders_all on public.%I', t);
    if t = 'founders' then
      execute format('create policy founders_all on public.%I for select to authenticated using (public.is_founder())', t);
    else
      execute format('create policy founders_all on public.%I for all to authenticated using (public.is_founder()) with check (public.is_founder())', t);
    end if;
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;
