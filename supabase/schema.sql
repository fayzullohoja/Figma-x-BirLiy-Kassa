-- BirLiy Kassa schema (v2, aligned with technical spec)
-- PostgreSQL/Supabase

create extension if not exists pgcrypto;

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  owner_telegram_id bigint unique,
  owner_name varchar(255) not null,
  phone varchar(20),
  address text,
  tables_count integer not null default 12,
  status varchar(20) not null default 'active' check (status in ('active', 'inactive')),
  subscription_end_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique,
  name varchar(255) not null,
  role varchar(20) not null check (role in ('waiter', 'owner', 'admin')),
  restaurant_id uuid references restaurants(id) on delete cascade,
  status varchar(20) not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_telegram on users(telegram_id);
create index if not exists idx_users_restaurant on users(restaurant_id);
create index if not exists idx_users_role on users(role);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_number integer not null,
  customer_name varchar(255) not null,
  customer_phone varchar(20),
  reservation_time time not null,
  reservation_date date not null,
  comment text,
  status varchar(20) not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reservations_restaurant on reservations(restaurant_id);
create index if not exists idx_reservations_date on reservations(reservation_date);
create index if not exists idx_reservations_status on reservations(status);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  number integer not null,
  status varchar(20) not null default 'free' check (status in ('free', 'occupied', 'reserved')),
  current_waiter_id uuid references users(id) on delete set null,
  reservation_id uuid references reservations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(restaurant_id, number)
);
create index if not exists idx_tables_restaurant on tables(restaurant_id);
create index if not exists idx_tables_status on tables(status);

create table if not exists dishes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name varchar(255) not null,
  price integer not null check (price >= 0), -- tiyin
  category varchar(100) not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dishes_restaurant on dishes(restaurant_id);
create index if not exists idx_dishes_category on dishes(category);
create index if not exists idx_dishes_available on dishes(is_available);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_number integer not null,
  waiter_id uuid not null references users(id),
  total integer not null default 0, -- tiyin
  payment_method varchar(50),
  status varchar(20) not null default 'active' check (status in ('active', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_restaurant on orders(restaurant_id);
create index if not exists idx_orders_waiter on orders(waiter_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_opened_at on orders(opened_at);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  dish_id uuid not null references dishes(id),
  dish_name varchar(255) not null,
  dish_price integer not null,
  quantity integer not null check (quantity > 0),
  subtotal integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, dish_id)
);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_dish on order_items(dish_id);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  amount integer not null, -- tiyin
  payment_method varchar(50) not null,
  transaction_id varchar(255),
  status varchar(20) not null default 'pending' check (status in ('pending', 'success', 'failed')),
  months integer not null default 1,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_restaurant on subscriptions(restaurant_id);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subscriptions_dates on subscriptions(start_date, end_date);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_restaurants_updated_at on restaurants;
create trigger trg_restaurants_updated_at before update on restaurants
for each row execute function set_updated_at();

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users
for each row execute function set_updated_at();

drop trigger if exists trg_tables_updated_at on tables;
create trigger trg_tables_updated_at before update on tables
for each row execute function set_updated_at();

drop trigger if exists trg_dishes_updated_at on dishes;
create trigger trg_dishes_updated_at before update on dishes
for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
for each row execute function set_updated_at();

drop trigger if exists trg_order_items_updated_at on order_items;
create trigger trg_order_items_updated_at before update on order_items
for each row execute function set_updated_at();

drop trigger if exists trg_reservations_updated_at on reservations;
create trigger trg_reservations_updated_at before update on reservations
for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions
for each row execute function set_updated_at();

-- ---------- RLS ----------

create or replace function current_telegram_id()
returns bigint
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'telegram_id', '')::bigint;
$$;

create or replace function is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from users u
    where u.telegram_id = current_telegram_id()
      and u.role = 'admin'
      and u.status = 'active'
  );
$$;

create or replace function current_user_restaurant_id()
returns uuid
language sql
stable
as $$
  select u.restaurant_id
  from users u
  where u.telegram_id = current_telegram_id()
    and u.status = 'active'
  limit 1;
$$;

create or replace function allow_prototype_access()
returns boolean
language sql
stable
as $$
  select current_telegram_id() is null;
$$;

alter table restaurants enable row level security;
alter table users enable row level security;
alter table tables enable row level security;
alter table dishes enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reservations enable row level security;
alter table subscriptions enable row level security;

-- restaurants
drop policy if exists restaurants_select_policy on restaurants;
create policy restaurants_select_policy on restaurants
for select to authenticated
using (
  allow_prototype_access() or is_admin_user() or owner_telegram_id = current_telegram_id()
);

drop policy if exists restaurants_update_policy on restaurants;
create policy restaurants_update_policy on restaurants
for update to authenticated
using (
  allow_prototype_access() or is_admin_user() or owner_telegram_id = current_telegram_id()
)
with check (
  allow_prototype_access() or is_admin_user() or owner_telegram_id = current_telegram_id()
);

-- users
drop policy if exists users_select_policy on users;
create policy users_select_policy on users
for select to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

drop policy if exists users_insert_policy on users;
create policy users_insert_policy on users
for insert to authenticated
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

drop policy if exists users_update_policy on users;
create policy users_update_policy on users
for update to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- tables
drop policy if exists tables_all_policy on tables;
create policy tables_all_policy on tables
for all to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- dishes
drop policy if exists dishes_select_policy on dishes;
create policy dishes_select_policy on dishes
for select to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

drop policy if exists dishes_modify_policy on dishes;
create policy dishes_modify_policy on dishes
for all to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- orders
drop policy if exists orders_all_policy on orders;
create policy orders_all_policy on orders
for all to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- order_items via order ownership
drop policy if exists order_items_all_policy on order_items;
create policy order_items_all_policy on order_items
for all to authenticated
using (
  exists (
    select 1
    from orders o
    where o.id = order_items.order_id
      and (allow_prototype_access() or is_admin_user() or o.restaurant_id = current_user_restaurant_id())
  )
)
with check (
  exists (
    select 1
    from orders o
    where o.id = order_items.order_id
      and (allow_prototype_access() or is_admin_user() or o.restaurant_id = current_user_restaurant_id())
  )
);

-- reservations
drop policy if exists reservations_all_policy on reservations;
create policy reservations_all_policy on reservations
for all to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- subscriptions
drop policy if exists subscriptions_all_policy on subscriptions;
create policy subscriptions_all_policy on subscriptions
for all to authenticated
using (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
)
with check (
  allow_prototype_access() or is_admin_user() or restaurant_id = current_user_restaurant_id()
);

-- ---------- Seed (demo) ----------

do $$
declare
  rest_id uuid := '11111111-1111-1111-1111-111111111111';
  waiter_ali uuid := '22222222-2222-2222-2222-222222222221';
  waiter_dilshod uuid := '22222222-2222-2222-2222-222222222222';
  waiter_kamila uuid := '22222222-2222-2222-2222-222222222223';
  owner_id uuid := '22222222-2222-2222-2222-222222222224';
begin
  insert into restaurants(id, name, owner_telegram_id, owner_name, phone, address, tables_count, status, subscription_end_date)
  values (rest_id, 'Чайхана Навруз', 998901111111, 'Рустам', '+998901111111', 'Ташкент', 12, 'active', now() + interval '30 days')
  on conflict (id) do update
  set name = excluded.name,
      owner_telegram_id = excluded.owner_telegram_id,
      owner_name = excluded.owner_name,
      phone = excluded.phone,
      address = excluded.address,
      tables_count = excluded.tables_count,
      status = excluded.status,
      subscription_end_date = excluded.subscription_end_date;

  insert into users(id, telegram_id, name, role, restaurant_id, status)
  values
    (waiter_ali, 998901000001, 'Али', 'waiter', rest_id, 'active'),
    (waiter_dilshod, 998901000002, 'Дилшод', 'waiter', rest_id, 'active'),
    (waiter_kamila, 998901000003, 'Камила', 'waiter', rest_id, 'active'),
    (owner_id, 998901111111, 'Рустам', 'owner', rest_id, 'active')
  on conflict (id) do update
  set telegram_id = excluded.telegram_id,
      name = excluded.name,
      role = excluded.role,
      restaurant_id = excluded.restaurant_id,
      status = excluded.status;

  insert into tables(restaurant_id, number, status, current_waiter_id)
  select rest_id, i, 'free', null::uuid
  from generate_series(1, 12) i
  on conflict (restaurant_id, number) do nothing;

  update tables set status='occupied', current_waiter_id=waiter_ali where restaurant_id=rest_id and number in (2, 7);
  update tables set status='reserved' where restaurant_id=rest_id and number = 12;

  insert into dishes(restaurant_id, name, price, category, is_available)
  values
    (rest_id, 'Плов', 1200000, 'Основные блюда', true),
    (rest_id, 'Шашлык', 1500000, 'Основные блюда', true),
    (rest_id, 'Лагман', 1000000, 'Основные блюда', true),
    (rest_id, 'Манты', 800000, 'Основные блюда', true),
    (rest_id, 'Самса', 500000, 'Выпечка', true),
    (rest_id, 'Шурпа', 900000, 'Супы', true),
    (rest_id, 'Мастава', 800000, 'Супы', true),
    (rest_id, 'Зеленый чай', 200000, 'Напитки', true),
    (rest_id, 'Черный чай', 200000, 'Напитки', true),
    (rest_id, 'Кока-кола', 300000, 'Напитки', true),
    (rest_id, 'Ачичук', 400000, 'Салаты', true),
    (rest_id, 'Оливье', 600000, 'Салаты', true),
    (rest_id, 'Нон', 100000, 'Выпечка', true),
    (rest_id, 'Хворост', 300000, 'Десерты', true),
    (rest_id, 'Пахлава', 400000, 'Десерты', true)
  on conflict do nothing;

  insert into subscriptions(restaurant_id, amount, payment_method, transaction_id, status, months, start_date, end_date)
  values (rest_id, 5000000, 'Click', 'SEED-SUB-1', 'success', 1, current_date - interval '1 month', current_date + interval '30 days')
  on conflict do nothing;
end;
$$;
