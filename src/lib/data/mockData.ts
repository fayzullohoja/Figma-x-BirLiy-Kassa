import { Table, Dish, Order, Waiter, DashboardStats, WaiterPerformance, Reservation } from '../../types';

export const mockTables: Table[] = [
  { id: 1, number: 1, status: 'free' },
  { id: 2, number: 2, status: 'occupied-self', waiter: 'Али' },
  { id: 3, number: 3, status: 'occupied-other', waiter: 'Дилшод' },
  { id: 4, number: 4, status: 'free' },
  { id: 5, number: 5, status: 'reserved', reservationTime: '18:00' },
  { id: 6, number: 6, status: 'free' },
  { id: 7, number: 7, status: 'occupied-self', waiter: 'Али' },
  { id: 8, number: 8, status: 'free' },
  { id: 9, number: 9, status: 'occupied-other', waiter: 'Камила' },
  { id: 10, number: 10, status: 'free' },
  { id: 11, number: 11, status: 'free' },
  { id: 12, number: 12, status: 'reserved', reservationTime: '19:30' },
];

export const mockDishes: Dish[] = [
  { id: 1, name: 'Плов', price: 12000, category: 'Основные блюда' },
  { id: 2, name: 'Шашлык', price: 15000, category: 'Основные блюда' },
  { id: 3, name: 'Лагман', price: 10000, category: 'Основные блюда' },
  { id: 4, name: 'Манты', price: 8000, category: 'Основные блюда' },
  { id: 5, name: 'Самса', price: 5000, category: 'Выпечка' },
  { id: 6, name: 'Шурпа', price: 9000, category: 'Супы' },
  { id: 7, name: 'Мастава', price: 8000, category: 'Супы' },
  { id: 8, name: 'Зелёный чай', price: 2000, category: 'Напитки' },
  { id: 9, name: 'Чёрный чай', price: 2000, category: 'Напитки' },
  { id: 10, name: 'Кока-кола', price: 3000, category: 'Напитки' },
  { id: 11, name: 'Ачичук', price: 4000, category: 'Салаты' },
  { id: 12, name: 'Оливье', price: 6000, category: 'Салаты' },
  { id: 13, name: 'Нон', price: 1000, category: 'Выпечка' },
  { id: 14, name: 'Хворост', price: 3000, category: 'Десерты' },
  { id: 15, name: 'Пахлава', price: 4000, category: 'Десерты' },
];

export const mockOrders: Order[] = [
  {
    id: 245,
    tableNumber: 4,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 2 },
      { dish: mockDishes[7], quantity: 2 },
    ],
    total: 28000,
    paymentMethod: 'PayMe',
    openedAt: new Date('2026-03-08T12:30:00'),
    closedAt: new Date('2026-03-08T13:15:00'),
    status: 'closed',
  },
  {
    id: 246,
    tableNumber: 7,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[1], quantity: 3 },
      { dish: mockDishes[8], quantity: 3 },
      { dish: mockDishes[10], quantity: 1 },
    ],
    total: 55000,
    paymentMethod: 'Наличные',
    openedAt: new Date('2026-03-08T13:00:00'),
    closedAt: new Date('2026-03-08T14:00:00'),
    status: 'closed',
  },
  {
    id: 247,
    tableNumber: 2,
    waiter: 'Али',
    items: [
      { dish: mockDishes[2], quantity: 1 },
      { dish: mockDishes[7], quantity: 1 },
    ],
    total: 12000,
    openedAt: new Date('2026-03-08T14:30:00'),
    status: 'active',
  },
  {
    id: 230,
    tableNumber: 1,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 1 },
      { dish: mockDishes[9], quantity: 2 },
    ],
    total: 18000,
    paymentMethod: 'Click',
    openedAt: new Date('2026-03-05T12:00:00'),
    closedAt: new Date('2026-03-05T12:45:00'),
    status: 'closed',
  },
  {
    id: 231,
    tableNumber: 3,
    waiter: 'Камила',
    items: [
      { dish: mockDishes[1], quantity: 2 },
      { dish: mockDishes[11], quantity: 1 },
      { dish: mockDishes[8], quantity: 2 },
    ],
    total: 40000,
    paymentMethod: 'Терминал',
    openedAt: new Date('2026-03-05T13:30:00'),
    closedAt: new Date('2026-03-05T14:15:00'),
    status: 'closed',
  },
  {
    id: 232,
    tableNumber: 5,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[2], quantity: 3 },
      { dish: mockDishes[7], quantity: 3 },
    ],
    total: 36000,
    paymentMethod: 'PayMe',
    openedAt: new Date('2026-03-06T11:00:00'),
    closedAt: new Date('2026-03-06T11:50:00'),
    status: 'closed',
  },
  {
    id: 233,
    tableNumber: 8,
    waiter: 'Камила',
    items: [
      { dish: mockDishes[3], quantity: 4 },
      { dish: mockDishes[5], quantity: 2 },
    ],
    total: 50000,
    paymentMethod: 'Наличные',
    openedAt: new Date('2026-03-06T14:00:00'),
    closedAt: new Date('2026-03-06T15:00:00'),
    status: 'closed',
  },
  {
    id: 234,
    tableNumber: 2,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 2 },
      { dish: mockDishes[4], quantity: 3 },
      { dish: mockDishes[8], quantity: 2 },
    ],
    total: 43000,
    paymentMethod: 'Click',
    openedAt: new Date('2026-03-07T12:30:00'),
    closedAt: new Date('2026-03-07T13:20:00'),
    status: 'closed',
  },
  {
    id: 235,
    tableNumber: 6,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[1], quantity: 1 },
      { dish: mockDishes[7], quantity: 1 },
    ],
    total: 17000,
    paymentMethod: 'PayMe',
    openedAt: new Date('2026-03-07T15:00:00'),
    closedAt: new Date('2026-03-07T15:40:00'),
    status: 'closed',
  },
  {
    id: 236,
    tableNumber: 9,
    waiter: 'Камила',
    items: [
      { dish: mockDishes[2], quantity: 2 },
      { dish: mockDishes[11], quantity: 2 },
      { dish: mockDishes[9], quantity: 2 },
    ],
    total: 38000,
    paymentMethod: 'Терминал',
    openedAt: new Date('2026-03-07T18:00:00'),
    closedAt: new Date('2026-03-07T19:00:00'),
    status: 'closed',
  },
  {
    id: 237,
    tableNumber: 4,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 3 },
      { dish: mockDishes[14], quantity: 2 },
    ],
    total: 44000,
    paymentMethod: 'Наличные',
    openedAt: new Date('2026-03-08T10:00:00'),
    closedAt: new Date('2026-03-08T11:00:00'),
    status: 'closed',
  },
  {
    id: 238,
    tableNumber: 7,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[3], quantity: 2 },
      { dish: mockDishes[5], quantity: 1 },
      { dish: mockDishes[8], quantity: 2 },
    ],
    total: 29000,
    paymentMethod: 'Click',
    openedAt: new Date('2026-03-08T11:30:00'),
    closedAt: new Date('2026-03-08T12:15:00'),
    status: 'closed',
  },
  {
    id: 239,
    tableNumber: 10,
    waiter: 'Камила',
    items: [
      { dish: mockDishes[1], quantity: 4 },
      { dish: mockDishes[10], quantity: 2 },
    ],
    total: 68000,
    paymentMethod: 'PayMe',
    openedAt: new Date('2026-03-01T12:00:00'),
    closedAt: new Date('2026-03-01T13:00:00'),
    status: 'closed',
  },
  {
    id: 240,
    tableNumber: 3,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 1 },
      { dish: mockDishes[6], quantity: 1 },
      { dish: mockDishes[7], quantity: 1 },
    ],
    total: 22000,
    paymentMethod: 'Наличные',
    openedAt: new Date('2026-03-02T13:00:00'),
    closedAt: new Date('2026-03-02T13:45:00'),
    status: 'closed',
  },
  {
    id: 241,
    tableNumber: 5,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[2], quantity: 2 },
      { dish: mockDishes[8], quantity: 2 },
    ],
    total: 24000,
    paymentMethod: 'Терминал',
    openedAt: new Date('2026-03-03T14:00:00'),
    closedAt: new Date('2026-03-03T14:50:00'),
    status: 'closed',
  },
  {
    id: 242,
    tableNumber: 8,
    waiter: 'Камила',
    items: [
      { dish: mockDishes[1], quantity: 2 },
      { dish: mockDishes[11], quantity: 1 },
      { dish: mockDishes[9], quantity: 2 },
    ],
    total: 42000,
    paymentMethod: 'Click',
    openedAt: new Date('2026-03-04T15:00:00'),
    closedAt: new Date('2026-03-04T16:00:00'),
    status: 'closed',
  },
  {
    id: 243,
    tableNumber: 1,
    waiter: 'Али',
    items: [
      { dish: mockDishes[0], quantity: 2 },
      { dish: mockDishes[4], quantity: 4 },
      { dish: mockDishes[7], quantity: 2 },
    ],
    total: 48000,
    paymentMethod: 'PayMe',
    openedAt: new Date('2026-03-04T17:00:00'),
    closedAt: new Date('2026-03-04T18:00:00'),
    status: 'closed',
  },
  {
    id: 244,
    tableNumber: 6,
    waiter: 'Дилшод',
    items: [
      { dish: mockDishes[3], quantity: 3 },
      { dish: mockDishes[5], quantity: 2 },
    ],
    total: 42000,
    paymentMethod: 'Наличные',
    openedAt: new Date('2026-03-05T11:00:00'),
    closedAt: new Date('2026-03-05T11:50:00'),
    status: 'closed',
  },
];

export const mockWaiters: Waiter[] = [
  { id: 1, name: 'Али', status: 'active' },
  { id: 2, name: 'Дилшод', status: 'active' },
  { id: 3, name: 'Камила', status: 'active' },
  { id: 4, name: 'Нодира', status: 'blocked' },
];

export const mockDashboardStats: DashboardStats = {
  ordersToday: 42,
  revenueToday: 1850000,
  averageCheck: 44000,
  activeTables: 8,
};

export const mockWaiterPerformance: WaiterPerformance[] = [
  { waiter: 'Али', ordersCount: 18, totalAmount: 792000 },
  { waiter: 'Дилшод', ordersCount: 15, totalAmount: 660000 },
  { waiter: 'Камила', ordersCount: 9, totalAmount: 398000 },
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    tableNumber: 5,
    customerName: 'Иван Иванов',
    time: '19:00',
    comment: 'День рождения',
  },
  {
    id: 2,
    tableNumber: 10,
    customerName: 'Мария Петрова',
    time: '20:30',
    comment: '',
  },
];

export const categories = ['Все', 'Основные блюда', 'Супы', 'Салаты', 'Напитки', 'Выпечка', 'Десерты'];

export const paymentMethods = ['Наличные', 'PayMe', 'Click', 'Терминал'];

// Re-export subscription data
export { mockRestaurants, mockPaymentHistory } from '../../features/subscription/data/mockData';
