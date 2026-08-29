create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.categories (
  id text primary key,
  name text not null,
  label text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null default '',
  category_id text not null references public.categories(id) on update cascade,
  price numeric(12,2) not null default 0 check (price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price >= 0),
  image_path text,
  image_paths jsonb not null default '[]'::jsonb,
  image_url text,
  description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'disponible'
    check (status in ('disponible','rupture','sur-commande','configuration','nous-contacter')),
  condition text not null default 'neuf' check (condition in ('neuf','occasion','comme-neuf')),
  badge text,
  sku text not null default '',
  tags jsonb not null default '[]'::jsonb,
  rating numeric(2,1),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_idx on public.products (active);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "products public read active" on public.products
  for select to anon using (active = true);
create policy "products authenticated read active" on public.products
  for select to authenticated using (active = true);
create policy "products admin read all" on public.products
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "products admin insert" on public.products
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "products admin update" on public.products
  for update to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "products admin delete" on public.products
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create policy "product images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));