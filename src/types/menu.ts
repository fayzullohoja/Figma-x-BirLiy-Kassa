import { EntityId } from './user';

export interface Dish {
  id: EntityId;
  name: string;
  price: number;
  category: string;
}
