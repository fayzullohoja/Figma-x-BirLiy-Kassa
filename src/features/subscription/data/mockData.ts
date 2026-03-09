import { Restaurant } from '../../../types';

export const mockRestaurants: Restaurant[] = [
  { 
    id: 1, 
    name: 'Чайхана Навруз', 
    owner: 'Рустам', 
    tablesCount: 20,
    status: 'active',
    subscriptionEndDate: new Date('2026-04-15'),
  },
  { 
    id: 2, 
    name: 'Кафе Самарканд', 
    owner: 'Азиза', 
    tablesCount: 15,
    status: 'active',
    subscriptionEndDate: new Date('2026-03-25'),
  },
  { 
    id: 3, 
    name: 'Ресторан Бухара', 
    owner: 'Шухрат', 
    tablesCount: 30,
    status: 'inactive',
    subscriptionEndDate: new Date('2026-03-01'),
  },
];

export const mockPaymentHistory = [
  {
    id: 1,
    date: new Date('2026-03-01'),
    amount: 50000,
    method: 'Click',
    status: 'success' as const,
  },
  {
    id: 2,
    date: new Date('2026-02-01'),
    amount: 50000,
    method: 'Click',
    status: 'success' as const,
  },
  {
    id: 3,
    date: new Date('2026-01-01'),
    amount: 50000,
    method: 'Click',
    status: 'success' as const,
  },
];
