import { addMonths, formatISO, isSameDay } from 'date-fns';
import { Dish, Order, OrderItem, Table, UserRole } from '../../types';
import { getCurrentUserId, getCurrentUserName, getRestaurantId, setCurrentUserId, setCurrentUserName } from '../appSession';
import { mockDashboardStats, mockDishes, mockOrders, mockPaymentHistory, mockRestaurants, mockTables } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../supabase/client';

export const SUBSCRIPTION_PRICE = 50000;

const TIYIN_RATE = 100;

type UserRow = {
  id: string;
  name: string;
  role: UserRole;
  restaurant_id: string;
};

type TableRow = {
  id: string;
  number: number;
  status: 'free' | 'occupied' | 'reserved';
  current_waiter_id: string | null;
};

type DishRow = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type OrderRow = {
  id: string;
  table_number: number;
  waiter_id: string;
  total: number;
  payment_method: string | null;
  status: 'active' | 'closed';
  opened_at: string;
  closed_at: string | null;
};

type OrderItemRow = {
  dish_id: string;
  dish_name: string;
  dish_price: number;
  quantity: number;
  subtotal: number;
};

type RestaurantRow = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  subscription_end_date: string;
};

type SubscriptionRow = {
  id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'success' | 'failed';
  months: number;
  end_date: string;
  created_at: string;
  transaction_id: string | null;
};

export type DashboardData = {
  ordersToday: number;
  revenueToday: number;
  averageCheck: number;
  activeTables: number;
  waiterPerformance: Array<{
    waiter: string;
    ordersCount: number;
    totalAmount: number;
  }>;
};

export type AdminRestaurant = {
  id: string | number;
  name: string;
  owner: string;
  tablesCount: number;
  status: 'active' | 'inactive';
  subscriptionEndDate: Date;
  activeUsers: number;
};

export type AdminUser = {
  id: string | number;
  name: string;
  role: UserRole;
  status: 'active' | 'blocked';
  restaurantName: string;
};

function toTiyin(sumValue: number) {
  return Math.round(sumValue * TIYIN_RATE);
}

function fromTiyin(tiyinValue: number) {
  return Math.round(tiyinValue / TIYIN_RATE);
}

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  return supabase;
}

function randomTransactionId() {
  return `TRX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function bootstrapUserByRole(role: UserRole, restaurantId: string) {
  if (!isSupabaseConfigured) {
    return;
  }

  const client = ensureClient();
  const { data, error } = await client
    .from('users')
    .select('id, name, role, restaurant_id')
    .eq('role', role)
    .eq('restaurant_id', restaurantId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle<UserRow>();

  if (error || !data) {
    return;
  }

  setCurrentUserId(data.id);
  setCurrentUserName(data.name);
}

async function getUsersMapByIds(userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, string>();
  }

  const client = ensureClient();
  const { data, error } = await client
    .from('users')
    .select('id, name')
    .in('id', userIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((item: { id: string; name: string }) => [item.id, item.name]));
}

function buildTable(row: TableRow, waiterMap: Map<string, string>, currentWaiterName: string): Table {
  if (row.status === 'free') {
    return {
      id: row.id,
      number: row.number,
      status: 'free',
    };
  }

  if (row.status === 'reserved') {
    return {
      id: row.id,
      number: row.number,
      status: 'reserved',
    };
  }

  const waiterName = row.current_waiter_id ? waiterMap.get(row.current_waiter_id) ?? 'Официант' : 'Официант';

  return {
    id: row.id,
    number: row.number,
    status: waiterName === currentWaiterName ? 'occupied-self' : 'occupied-other',
    waiter: waiterName,
  };
}

function toOrder(order: OrderRow, waiterName: string, items: OrderItem[]): Order {
  return {
    id: order.id,
    tableNumber: order.table_number,
    waiter: waiterName,
    items,
    total: fromTiyin(order.total),
    paymentMethod: order.payment_method ?? undefined,
    openedAt: new Date(order.opened_at),
    closedAt: order.closed_at ? new Date(order.closed_at) : undefined,
    status: order.status,
  };
}

function toOrderItems(rows: OrderItemRow[]): OrderItem[] {
  return rows.map((item) => ({
    dish: {
      id: item.dish_id,
      name: item.dish_name,
      price: fromTiyin(item.dish_price),
      category: '',
    },
    quantity: item.quantity,
  }));
}

export async function ensureSessionByRole(role: UserRole) {
  await bootstrapUserByRole(role, getRestaurantId());
}

export async function getTables() {
  if (!isSupabaseConfigured) {
    return mockTables;
  }

  const client = ensureClient();
  const restaurantId = getRestaurantId();
  const currentWaiterName = getCurrentUserName();

  const { data, error } = await client
    .from('tables')
    .select('id, number, status, current_waiter_id')
    .eq('restaurant_id', restaurantId)
    .order('number', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as TableRow[];
  const waiterIds = rows
    .map((item) => item.current_waiter_id)
    .filter((item): item is string => Boolean(item));

  const waiterMap = await getUsersMapByIds([...new Set(waiterIds)]);
  return rows.map((item) => buildTable(item, waiterMap, currentWaiterName));
}

export async function getDishes() {
  if (!isSupabaseConfigured) {
    return mockDishes;
  }

  const client = ensureClient();

  const { data, error } = await client
    .from('dishes')
    .select('id, name, price, category')
    .eq('restaurant_id', getRestaurantId())
    .eq('is_available', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as DishRow[]).map((item) => ({
    id: item.id,
    name: item.name,
    price: fromTiyin(item.price),
    category: item.category,
  }));
}

async function getOrderItems(orderId: string) {
  const client = ensureClient();
  const { data, error } = await client
    .from('order_items')
    .select('dish_id, dish_name, dish_price, quantity, subtotal')
    .eq('order_id', orderId);

  if (error) {
    throw error;
  }

  return toOrderItems((data ?? []) as OrderItemRow[]);
}

async function getWaiterName(waiterId: string | null) {
  if (!waiterId) {
    return getCurrentUserName();
  }

  const map = await getUsersMapByIds([waiterId]);
  return map.get(waiterId) ?? getCurrentUserName();
}

async function resolveCurrentWaiterId() {
  const fromSession = getCurrentUserId();
  if (fromSession) {
    return fromSession;
  }

  const client = ensureClient();
  const { data, error } = await client
    .from('users')
    .select('id, name')
    .eq('restaurant_id', getRestaurantId())
    .eq('role', 'waiter')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle<{ id: string; name: string }>();

  if (error || !data) {
    throw error ?? new Error('No active waiter found');
  }

  setCurrentUserId(data.id);
  setCurrentUserName(data.name);
  return data.id;
}

export async function getOrCreateActiveOrder(tableNumber: number): Promise<Order> {
  if (!isSupabaseConfigured) {
    const existing = mockOrders.find((item) => item.status === 'active' && item.tableNumber === tableNumber);
    if (existing) {
      return existing;
    }

    return {
      id: String(Date.now()),
      tableNumber,
      waiter: getCurrentUserName(),
      items: [],
      total: 0,
      openedAt: new Date(),
      status: 'active',
    };
  }

  const client = ensureClient();
  const restaurantId = getRestaurantId();
  const currentUserId = await resolveCurrentWaiterId();

  const { data: existing, error: existingError } = await client
    .from('orders')
    .select('id, table_number, waiter_id, total, payment_method, status, opened_at, closed_at')
    .eq('restaurant_id', restaurantId)
    .eq('table_number', tableNumber)
    .eq('status', 'active')
    .maybeSingle<OrderRow>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    const [items, waiterName] = await Promise.all([
      getOrderItems(existing.id),
      getWaiterName(existing.waiter_id),
    ]);

    return toOrder(existing, waiterName, items);
  }

  const { data: created, error: createError } = await client
    .from('orders')
    .insert({
      restaurant_id: restaurantId,
      table_number: tableNumber,
      waiter_id: currentUserId,
      total: 0,
      status: 'active',
      opened_at: new Date().toISOString(),
    })
    .select('id, table_number, waiter_id, total, payment_method, status, opened_at, closed_at')
    .single<OrderRow>();

  if (createError || !created) {
    throw createError;
  }

  const { error: tableError } = await client
    .from('tables')
    .update({
      status: 'occupied',
      current_waiter_id: currentUserId,
    })
    .eq('restaurant_id', restaurantId)
    .eq('number', tableNumber);

  if (tableError) {
    throw tableError;
  }

  const waiterName = await getWaiterName(created.waiter_id);
  return toOrder(created, waiterName, []);
}

async function recalculateOrderTotal(orderId: string) {
  const client = ensureClient();

  const { data, error } = await client
    .from('order_items')
    .select('subtotal')
    .eq('order_id', orderId);

  if (error) {
    throw error;
  }

  const total = (data ?? []).reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);

  const { error: updateError } = await client
    .from('orders')
    .update({ total })
    .eq('id', orderId);

  if (updateError) {
    throw updateError;
  }
}

export async function addDishToOrder(orderId: string | number, dish: Dish) {
  if (!isSupabaseConfigured) {
    return;
  }

  const client = ensureClient();
  const targetOrderId = String(orderId);
  const targetDishId = String(dish.id);

  const { data: existing, error: existingError } = await client
    .from('order_items')
    .select('id, quantity')
    .eq('order_id', targetOrderId)
    .eq('dish_id', targetDishId)
    .maybeSingle<{ id: string; quantity: number }>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    const nextQuantity = existing.quantity + 1;
    const { error: updateError } = await client
      .from('order_items')
      .update({
        quantity: nextQuantity,
        dish_price: toTiyin(dish.price),
        subtotal: toTiyin(dish.price) * nextQuantity,
      })
      .eq('id', existing.id);

    if (updateError) {
      throw updateError;
    }
  } else {
    const { error: insertError } = await client
      .from('order_items')
      .insert({
        order_id: targetOrderId,
        dish_id: targetDishId,
        dish_name: dish.name,
        dish_price: toTiyin(dish.price),
        quantity: 1,
        subtotal: toTiyin(dish.price),
      });

    if (insertError) {
      throw insertError;
    }
  }

  await recalculateOrderTotal(targetOrderId);
}

export async function updateOrderItemQuantity(orderId: string | number, dishId: string | number, nextQuantity: number) {
  if (!isSupabaseConfigured) {
    return;
  }

  const client = ensureClient();
  const targetOrderId = String(orderId);
  const targetDishId = String(dishId);

  if (nextQuantity <= 0) {
    const { error } = await client
      .from('order_items')
      .delete()
      .eq('order_id', targetOrderId)
      .eq('dish_id', targetDishId);

    if (error) {
      throw error;
    }

    await recalculateOrderTotal(targetOrderId);
    return;
  }

  const { data: current, error: selectError } = await client
    .from('order_items')
    .select('dish_price')
    .eq('order_id', targetOrderId)
    .eq('dish_id', targetDishId)
    .single<{ dish_price: number }>();

  if (selectError) {
    throw selectError;
  }

  const { error } = await client
    .from('order_items')
    .update({
      quantity: nextQuantity,
      subtotal: current.dish_price * nextQuantity,
    })
    .eq('order_id', targetOrderId)
    .eq('dish_id', targetDishId);

  if (error) {
    throw error;
  }

  await recalculateOrderTotal(targetOrderId);
}

export async function closeOrder(orderId: string | number, paymentMethod: string, tableNumber: number) {
  if (!isSupabaseConfigured) {
    return;
  }

  const client = ensureClient();

  const { error: closeError } = await client
    .from('orders')
    .update({
      status: 'closed',
      payment_method: paymentMethod,
      closed_at: new Date().toISOString(),
    })
    .eq('id', String(orderId));

  if (closeError) {
    throw closeError;
  }

  const { error: tableError } = await client
    .from('tables')
    .update({
      status: 'free',
      current_waiter_id: null,
      reservation_id: null,
    })
    .eq('restaurant_id', getRestaurantId())
    .eq('number', tableNumber);

  if (tableError) {
    throw tableError;
  }
}

export async function getClosedOrders() {
  if (!isSupabaseConfigured) {
    return mockOrders
      .filter((item) => item.status === 'closed')
      .sort((a, b) => (b.closedAt?.getTime() ?? 0) - (a.closedAt?.getTime() ?? 0));
  }

  const client = ensureClient();

  const { data, error } = await client
    .from('orders')
    .select('id, table_number, waiter_id, total, payment_method, status, opened_at, closed_at')
    .eq('restaurant_id', getRestaurantId())
    .eq('status', 'closed')
    .order('closed_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as OrderRow[];
  const waiterIds = [...new Set(rows.map((item) => item.waiter_id).filter(Boolean))] as string[];
  const waiterMap = await getUsersMapByIds(waiterIds);

  return Promise.all(
    rows.map(async (row) => {
      const items = await getOrderItems(row.id);
      return toOrder(row, waiterMap.get(row.waiter_id) ?? getCurrentUserName(), items);
    })
  );
}

export async function getOrderById(orderId: number | string) {
  if (!isSupabaseConfigured) {
    return mockOrders.find((item) => String(item.id) === String(orderId)) ?? null;
  }

  const client = ensureClient();

  const { data, error } = await client
    .from('orders')
    .select('id, table_number, waiter_id, total, payment_method, status, opened_at, closed_at')
    .eq('id', String(orderId))
    .maybeSingle<OrderRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const [items, waiterName] = await Promise.all([
    getOrderItems(data.id),
    getWaiterName(data.waiter_id),
  ]);

  return toOrder(data, waiterName, items);
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured) {
    return {
      ...mockDashboardStats,
      waiterPerformance: [
        { waiter: 'Али', ordersCount: 18, totalAmount: 792000 },
        { waiter: 'Дилшод', ordersCount: 15, totalAmount: 660000 },
        { waiter: 'Камила', ordersCount: 9, totalAmount: 398000 },
      ],
    };
  }

  const [orders, tables] = await Promise.all([
    getClosedOrders(),
    getTables(),
  ]);

  const todayOrders = orders.filter((item) => item.closedAt && isSameDay(item.closedAt, new Date()));
  const ordersToday = todayOrders.length;
  const revenueToday = todayOrders.reduce((sum, item) => sum + item.total, 0);
  const averageCheck = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0;
  const activeTables = tables.filter((table) => table.status !== 'free').length;

  const performanceMap = orders.reduce<Record<string, { ordersCount: number; totalAmount: number }>>((acc, order) => {
    if (!acc[order.waiter]) {
      acc[order.waiter] = { ordersCount: 0, totalAmount: 0 };
    }

    acc[order.waiter].ordersCount += 1;
    acc[order.waiter].totalAmount += order.total;
    return acc;
  }, {});

  const waiterPerformance = Object.entries(performanceMap)
    .map(([waiter, value]) => ({ waiter, ...value }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    ordersToday,
    revenueToday,
    averageCheck,
    activeTables,
    waiterPerformance,
  };
}

export async function getSubscription() {
  if (!isSupabaseConfigured) {
    const restaurant = mockRestaurants[0];
    return {
      restaurantId: restaurant.id,
      endDate: restaurant.subscriptionEndDate,
      monthlyPrice: SUBSCRIPTION_PRICE,
      restaurantName: restaurant.name,
      restaurantStatus: restaurant.status,
    };
  }

  const client = ensureClient();
  const restaurantId = getRestaurantId();

  const [{ data: restaurant, error: restaurantError }, { data: lastSubscription, error: subscriptionError }] = await Promise.all([
    client
      .from('restaurants')
      .select('id, name, status, subscription_end_date')
      .eq('id', restaurantId)
      .single<RestaurantRow>(),
    client
      .from('subscriptions')
      .select('id, amount, payment_method, status, months, end_date, created_at, transaction_id')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>(),
  ]);

  if (restaurantError) {
    throw restaurantError;
  }

  if (subscriptionError) {
    throw subscriptionError;
  }

  const monthlyPrice = lastSubscription
    ? Math.round(fromTiyin(lastSubscription.amount) / Math.max(lastSubscription.months, 1))
    : SUBSCRIPTION_PRICE;

  return {
    restaurantId: restaurant.id,
    endDate: new Date(restaurant.subscription_end_date),
    monthlyPrice,
    restaurantName: restaurant.name,
    restaurantStatus: restaurant.status,
  };
}

export async function getPaymentHistory() {
  if (!isSupabaseConfigured) {
    return mockPaymentHistory;
  }

  const client = ensureClient();
  const { data, error } = await client
    .from('subscriptions')
    .select('id, amount, payment_method, status, months, end_date, created_at, transaction_id')
    .eq('restaurant_id', getRestaurantId())
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SubscriptionRow[]).map((item) => ({
    id: item.id,
    date: new Date(item.created_at),
    amount: fromTiyin(item.amount),
    method: item.payment_method,
    status: item.status,
  }));
}

export function getClickCheckoutUrl(amount: number) {
  const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID;
  const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID;

  if (!serviceId || !merchantId) {
    return null;
  }

  const transactionId = `SUB-${getRestaurantId()}-${Date.now()}`;
  const returnUrl = import.meta.env.VITE_CLICK_RETURN_URL ?? `${window.location.origin}/owner/subscription/success`;

  const params = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount: amount.toString(),
    transaction_param: getRestaurantId(),
    merchant_trans_id: transactionId,
    return_url: returnUrl,
  });

  return `https://my.click.uz/services/pay?${params.toString()}`;
}

export async function recordManualPaymentSuccess(method: string = 'Click') {
  if (!isSupabaseConfigured) {
    return {
      transactionId: randomTransactionId(),
      newEndDate: addMonths(new Date(), 1),
    };
  }

  const client = ensureClient();
  const restaurantId = getRestaurantId();

  const { data: restaurant, error: restaurantError } = await client
    .from('restaurants')
    .select('id, subscription_end_date')
    .eq('id', restaurantId)
    .single<{ id: string; subscription_end_date: string }>();

  if (restaurantError) {
    throw restaurantError;
  }

  const currentEndDate = new Date(restaurant.subscription_end_date);
  const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
  const nextEndDate = addMonths(baseDate, 1);
  const transactionId = randomTransactionId();

  const [{ error: insertError }, { error: updateError }] = await Promise.all([
    client.from('subscriptions').insert({
      restaurant_id: restaurantId,
      amount: toTiyin(SUBSCRIPTION_PRICE),
      payment_method: method,
      transaction_id: transactionId,
      status: 'success',
      months: 1,
      start_date: formatISO(new Date(), { representation: 'date' }),
      end_date: formatISO(nextEndDate, { representation: 'date' }),
    }),
    client
      .from('restaurants')
      .update({ subscription_end_date: nextEndDate.toISOString() })
      .eq('id', restaurantId),
  ]);

  if (insertError) {
    throw insertError;
  }

  if (updateError) {
    throw updateError;
  }

  return {
    transactionId,
    newEndDate: nextEndDate,
  };
}

export async function getAdminRestaurants(): Promise<AdminRestaurant[]> {
  if (!isSupabaseConfigured) {
    return mockRestaurants.map((item) => ({
      id: item.id,
      name: item.name,
      owner: item.owner,
      tablesCount: item.tablesCount,
      status: item.status,
      subscriptionEndDate: item.subscriptionEndDate,
      activeUsers: 0,
    }));
  }

  const client = ensureClient();
  const [{ data: restaurants, error: restaurantsError }, { data: users, error: usersError }] = await Promise.all([
    client
      .from('restaurants')
      .select('id, name, owner_name, tables_count, status, subscription_end_date')
      .order('created_at', { ascending: false }),
    client
      .from('users')
      .select('restaurant_id, status'),
  ]);

  if (restaurantsError) {
    throw restaurantsError;
  }

  if (usersError) {
    throw usersError;
  }

  const usersCountByRestaurant = (users ?? []).reduce<Record<string, number>>((acc, user: { restaurant_id: string | null; status: string }) => {
    if (user.status !== 'active' || !user.restaurant_id) {
      return acc;
    }

    acc[user.restaurant_id] = (acc[user.restaurant_id] ?? 0) + 1;
    return acc;
  }, {});

  return (restaurants ?? []).map((item: {
    id: string;
    name: string;
    owner_name: string;
    tables_count: number;
    status: 'active' | 'inactive';
    subscription_end_date: string;
  }) => ({
    id: item.id,
    name: item.name,
    owner: item.owner_name,
    tablesCount: item.tables_count,
    status: item.status,
    subscriptionEndDate: new Date(item.subscription_end_date),
    activeUsers: usersCountByRestaurant[item.id] ?? 0,
  }));
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const client = ensureClient();
  const { data, error } = await client
    .from('users')
    .select('id, name, role, status, restaurant:restaurants(name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item: {
    id: string;
    name: string;
    role: UserRole;
    status: 'active' | 'blocked';
    restaurant: { name: string } | { name: string }[] | null;
  }) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    status: item.status,
    restaurantName: Array.isArray(item.restaurant)
      ? (item.restaurant[0]?.name ?? 'Без заведения')
      : (item.restaurant?.name ?? 'Без заведения'),
  }));
}

export async function createAdminRestaurant(input: {
  name: string;
  owner: string;
  tablesCount: number;
}) {
  if (!isSupabaseConfigured) {
    return {
      id: String(Date.now()),
      name: input.name,
      owner: input.owner,
      tablesCount: input.tablesCount,
      status: 'active' as const,
      subscriptionEndDate: addMonths(new Date(), 1),
      activeUsers: 1,
    };
  }

  const client = ensureClient();
  const subscriptionEndDate = addMonths(new Date(), 1);

  const { data: restaurant, error: restaurantError } = await client
    .from('restaurants')
    .insert({
      name: input.name.trim(),
      owner_name: input.owner.trim(),
      tables_count: input.tablesCount,
      status: 'active',
      subscription_end_date: subscriptionEndDate.toISOString(),
    })
    .select('id, name, owner_name, tables_count, status, subscription_end_date')
    .single<{
      id: string;
      name: string;
      owner_name: string;
      tables_count: number;
      status: 'active' | 'inactive';
      subscription_end_date: string;
    }>();

  if (restaurantError || !restaurant) {
    throw restaurantError;
  }

  const [{ error: ownerError }, { error: tablesError }, { error: subscriptionError }] = await Promise.all([
    client.from('users').insert({
      name: input.owner.trim(),
      role: 'owner',
      status: 'active',
      restaurant_id: restaurant.id,
    }),
    client.from('tables').insert(
      Array.from({ length: input.tablesCount }, (_, index) => ({
        restaurant_id: restaurant.id,
        number: index + 1,
        status: 'free',
      }))
    ),
    client.from('subscriptions').insert({
      restaurant_id: restaurant.id,
      amount: toTiyin(SUBSCRIPTION_PRICE),
      payment_method: 'Admin',
      transaction_id: `ADMIN-CREATE-${restaurant.id}-${Date.now()}`,
      status: 'success',
      months: 1,
      start_date: formatISO(new Date(), { representation: 'date' }),
      end_date: formatISO(subscriptionEndDate, { representation: 'date' }),
    }),
  ]);

  if (ownerError) {
    throw ownerError;
  }

  if (tablesError) {
    throw tablesError;
  }

  if (subscriptionError) {
    throw subscriptionError;
  }

  return {
    id: restaurant.id,
    name: restaurant.name,
    owner: restaurant.owner_name,
    tablesCount: restaurant.tables_count,
    status: restaurant.status,
    subscriptionEndDate: new Date(restaurant.subscription_end_date),
    activeUsers: 1,
  };
}

export async function toggleAdminRestaurantStatus(restaurantId: string | number, currentStatus: 'active' | 'inactive') {
  if (!isSupabaseConfigured) {
    return currentStatus === 'active' ? 'inactive' : 'active';
  }

  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const client = ensureClient();

  const { error } = await client
    .from('restaurants')
    .update({ status: nextStatus })
    .eq('id', String(restaurantId));

  if (error) {
    throw error;
  }

  return nextStatus;
}

export async function extendAdminRestaurantSubscription(restaurantId: string | number, months: number = 1) {
  if (!isSupabaseConfigured) {
    return addMonths(new Date(), months);
  }

  const client = ensureClient();
  const { data: restaurant, error: restaurantError } = await client
    .from('restaurants')
    .select('id, subscription_end_date')
    .eq('id', String(restaurantId))
    .single<{ id: string; subscription_end_date: string }>();

  if (restaurantError) {
    throw restaurantError;
  }

  const currentEndDate = new Date(restaurant.subscription_end_date);
  const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
  const nextEndDate = addMonths(baseDate, months);

  const [{ error: updateError }, { error: insertError }] = await Promise.all([
    client
      .from('restaurants')
      .update({ subscription_end_date: nextEndDate.toISOString() })
      .eq('id', restaurant.id),
    client.from('subscriptions').insert({
      restaurant_id: restaurant.id,
      amount: toTiyin(SUBSCRIPTION_PRICE * months),
      payment_method: 'Admin',
      transaction_id: `ADMIN-EXTEND-${restaurant.id}-${Date.now()}`,
      status: 'success',
      months,
      start_date: formatISO(new Date(), { representation: 'date' }),
      end_date: formatISO(nextEndDate, { representation: 'date' }),
    }),
  ]);

  if (updateError) {
    throw updateError;
  }

  if (insertError) {
    throw insertError;
  }

  return nextEndDate;
}
