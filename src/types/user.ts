export type UserRole = 'waiter' | 'owner' | 'admin';
export type EntityId = string | number;

export interface Waiter {
  id: EntityId;
  name: string;
  status: 'active' | 'blocked';
}

export interface Restaurant {
  id: EntityId;
  name: string;
  owner: string;
  tablesCount: number;
  status: 'active' | 'inactive';
  subscriptionEndDate: Date;
}
