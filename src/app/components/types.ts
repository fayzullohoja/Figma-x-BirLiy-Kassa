export type TableStatus = 'free' | 'occupied-self' | 'occupied-other' | 'reserved';

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
  waiter?: string;
  reservationTime?: string;
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: number;
  tableNumber: number;
  waiter: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  openedAt: Date;
  closedAt?: Date;
  status: 'active' | 'closed';
}

export interface Waiter {
  id: number;
  name: string;
  status: 'active' | 'blocked';
}

export interface Restaurant {
  id: number;
  name: string;
  owner: string;
  tablesCount: number;
  status: 'active' | 'inactive';
  subscriptionEndDate: Date;
}

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  averageCheck: number;
  activeTables: number;
}

export interface WaiterPerformance {
  waiter: string;
  ordersCount: number;
  totalAmount: number;
}

export interface Reservation {
  id: number;
  tableNumber: number;
  customerName: string;
  time: string;
  comment: string;
}