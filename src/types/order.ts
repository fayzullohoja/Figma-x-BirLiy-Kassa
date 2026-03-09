import { Dish } from './menu';
import { EntityId } from './user';

export interface OrderItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: EntityId;
  tableNumber: number;
  waiter: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  openedAt: Date;
  closedAt?: Date;
  status: 'active' | 'closed';
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
