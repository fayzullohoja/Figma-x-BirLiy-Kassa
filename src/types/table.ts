import { EntityId } from './user';

export type TableStatus = 'free' | 'occupied-self' | 'occupied-other' | 'reserved';

export interface Table {
  id: EntityId;
  number: number;
  status: TableStatus;
  waiter?: string;
  reservationTime?: string;
}

export interface Reservation {
  id: EntityId;
  tableNumber: number;
  customerName: string;
  time: string;
  comment: string;
}
