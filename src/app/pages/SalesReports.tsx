import { useState, useMemo } from 'react';
import { Header } from '../../components/Header';
import { Navigation } from '../../components/Navigation';
import { SubscriptionGuard } from '../../components/SubscriptionGuard';
import * as Tabs from '@radix-ui/react-tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Users as UsersIcon, Filter, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/utils/format';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// Sales Reports Component - with modern design
// Mock данные для графиков
const mockOrders = [
  {
    id: '1',
    closedAt: new Date('2026-03-01T12:00:00'),
    openedAt: new Date('2026-03-01T11:00:00'),
    tableNumber: '1',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Маргарита', category: 'Пицца', price: 1500 }, quantity: 2 },
      { dish: { name: 'Карпаччо', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 4000,
    status: 'closed',
  },
  {
    id: '2',
    closedAt: new Date('2026-03-01T14:00:00'),
    openedAt: new Date('2026-03-01T13:00:00'),
    tableNumber: '2',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Карбонара', category: 'Паста', price: 1200 }, quantity: 1 },
      { dish: { name: 'Салат Цезарь', category: 'Салаты', price: 1100 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
  {
    id: '3',
    closedAt: new Date('2026-03-01T16:00:00'),
    openedAt: new Date('2026-03-01T15:00:00'),
    tableNumber: '3',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Пепперони', category: 'Пицца', price: 1600 }, quantity: 1 },
      { dish: { name: 'Суп Крем-Солянка', category: 'Супы', price: 800 }, quantity: 1 },
    ],
    total: 2400,
    status: 'closed',
  },
  {
    id: '4',
    closedAt: new Date('2026-03-01T18:00:00'),
    openedAt: new Date('2026-03-01T17:00:00'),
    tableNumber: '4',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Болоньезе', category: 'Паста', price: 1300 }, quantity: 1 },
      { dish: { name: 'Салат Оливье', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
  {
    id: '5',
    closedAt: new Date('2026-03-01T20:00:00'),
    openedAt: new Date('2026-03-01T19:00:00'),
    tableNumber: '5',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Маргарита', category: 'Пицца', price: 1500 }, quantity: 1 },
      { dish: { name: 'Карпаччо', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 2500,
    status: 'closed',
  },
  {
    id: '6',
    closedAt: new Date('2026-03-01T22:00:00'),
    openedAt: new Date('2026-03-01T21:00:00'),
    tableNumber: '6',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Карбонара', category: 'Паста', price: 1200 }, quantity: 1 },
      { dish: { name: 'Салат Цезарь', category: 'Салаты', price: 1100 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
  {
    id: '7',
    closedAt: new Date('2026-03-02T12:00:00'),
    openedAt: new Date('2026-03-02T11:00:00'),
    tableNumber: '1',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Пепперони', category: 'Пицца', price: 1600 }, quantity: 1 },
      { dish: { name: 'Суп Крем-Солянка', category: 'Супы', price: 800 }, quantity: 1 },
    ],
    total: 2400,
    status: 'closed',
  },
  {
    id: '8',
    closedAt: new Date('2026-03-02T14:00:00'),
    openedAt: new Date('2026-03-02T13:00:00'),
    tableNumber: '2',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Болоньезе', category: 'Паста', price: 1300 }, quantity: 1 },
      { dish: { name: 'Салат Оливье', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
  {
    id: '9',
    closedAt: new Date('2026-03-02T16:00:00'),
    openedAt: new Date('2026-03-02T15:00:00'),
    tableNumber: '3',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Маргарита', category: 'Пицца', price: 1500 }, quantity: 1 },
      { dish: { name: 'Карпаччо', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 2500,
    status: 'closed',
  },
  {
    id: '10',
    closedAt: new Date('2026-03-02T18:00:00'),
    openedAt: new Date('2026-03-02T17:00:00'),
    tableNumber: '4',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Карбонара', category: 'Паста', price: 1200 }, quantity: 1 },
      { dish: { name: 'Салат Цезарь', category: 'Салаты', price: 1100 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
  {
    id: '11',
    closedAt: new Date('2026-03-02T20:00:00'),
    openedAt: new Date('2026-03-02T19:00:00'),
    tableNumber: '5',
    waiter: 'Иван',
    paymentMethod: 'Наличные',
    items: [
      { dish: { name: 'Пицца Пепперони', category: 'Пицца', price: 1600 }, quantity: 1 },
      { dish: { name: 'Суп Крем-Солянка', category: 'Супы', price: 800 }, quantity: 1 },
    ],
    total: 2400,
    status: 'closed',
  },
  {
    id: '12',
    closedAt: new Date('2026-03-02T22:00:00'),
    openedAt: new Date('2026-03-02T21:00:00'),
    tableNumber: '6',
    waiter: 'Мария',
    paymentMethod: 'Карта',
    items: [
      { dish: { name: 'Паста Болоньезе', category: 'Паста', price: 1300 }, quantity: 1 },
      { dish: { name: 'Салат Оливье', category: 'Салаты', price: 1000 }, quantity: 1 },
    ],
    total: 2300,
    status: 'closed',
  },
];

export function SalesReports() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo] = useState('2026-03-31');
  const [selectedWaiter, setSelectedWaiter] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  // Получаем список всех официантов и способов оплаты
  const waiters = useMemo(() => {
    const waiterSet = new Set(mockOrders.map(order => order.waiter));
    return Array.from(waiterSet);
  }, []);

  const paymentMethods = useMemo(() => {
    const methodSet = new Set(
      mockOrders
        .filter(order => order.paymentMethod)
        .map(order => order.paymentMethod!)
    );
    return Array.from(methodSet);
  }, []);

  // Фильтрация заказов
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const orderDate = order.closedAt || order.openedAt;
      const isInDateRange = 
        orderDate >= new Date(dateFrom) && 
        orderDate <= new Date(dateTo + 'T23:59:59');
      
      const isWaiterMatch = selectedWaiter === 'all' || order.waiter === selectedWaiter;
      const isPaymentMatch = selectedPaymentMethod === 'all' || order.paymentMethod === selectedPaymentMethod;

      return isInDateRange && isWaiterMatch && isPaymentMatch;
    });
  }, [dateFrom, dateTo, selectedWaiter, selectedPaymentMethod]);

  // Расчет статистики
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const count = filteredOrders.length;
    const average = count > 0 ? total / count : 0;

    // Статистика по официантам
    const byWaiter = filteredOrders.reduce((acc, order) => {
      if (!acc[order.waiter]) {
        acc[order.waiter] = { count: 0, total: 0 };
      }
      acc[order.waiter].count++;
      acc[order.waiter].total += order.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Статистика по способам оплаты
    const byPaymentMethod = filteredOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'Не указан';
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += order.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return { total, count, average, byWaiter, byPaymentMethod };
  }, [filteredOrders]);

  // Экспорт в Excel
  const exportToExcel = () => {
    try {
      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();

      // Лист 1: Детализированный отчет
      const detailedData = filteredOrders.map(order => ({
        'Номер заказа': order.id,
        'Дата': format(order.closedAt || order.openedAt, 'dd.MM.yyyy HH:mm'),
        'Стол': order.tableNumber,
        'Официант': order.waiter,
        'Способ оплаты': order.paymentMethod || 'Не указан',
        'Позиций': order.items.reduce((sum, item) => sum + item.quantity, 0),
        'Сумма (сум)': order.total,
        'Статус': order.status === 'closed' ? 'Закрыт' : 'Активен',
      }));

      const ws1 = XLSX.utils.json_to_sheet(detailedData);
      
      // Устанавливаем ширину колонок
      ws1['!cols'] = [
        { wch: 12 }, // Номер заказа
        { wch: 18 }, // Дата
        { wch: 8 },  // Стол
        { wch: 15 }, // Официант
        { wch: 15 }, // Способ оплаты
        { wch: 10 }, // Позиций
        { wch: 15 }, // Сумма
        { wch: 10 }, // Статус
      ];

      XLSX.utils.book_append_sheet(wb, ws1, 'Заказы');

      // Лист 2: Сводка по официантам
      const waiterData = Object.entries(stats.byWaiter).map(([waiter, data]) => ({
        'Официант': waiter,
        'Количество заказов': data.count,
        'Общая сумма (сум)': data.total,
        'Средний чек (сум)': Math.round(data.total / data.count),
      }));

      const ws2 = XLSX.utils.json_to_sheet(waiterData);
      ws2['!cols'] = [
        { wch: 15 }, // Официант
        { wch: 20 }, // Количество заказов
        { wch: 18 }, // Общая сумма
        { wch: 18 }, // Средний чек
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'По официантам');

      // Лист 3: Сводка по способам оплаты
      const paymentData = Object.entries(stats.byPaymentMethod).map(([method, data]) => ({
        'Способ оплаты': method,
        'Количество заказов': data.count,
        'Общая сумма (сум)': data.total,
        'Доля (%)': ((data.total / stats.total) * 100).toFixed(1),
      }));

      const ws3 = XLSX.utils.json_to_sheet(paymentData);
      ws3['!cols'] = [
        { wch: 15 }, // Способ оплаты
        { wch: 20 }, // Количество заказов
        { wch: 18 }, // Общая сумма
        { wch: 12 }, // Доля
      ];
      XLSX.utils.book_append_sheet(wb, ws3, 'По оплате');

      // Лист 4: Статистика по блюдам
      const dishStats = filteredOrders.reduce((acc, order) => {
        order.items.forEach(item => {
          const dishName = item.dish.name;
          if (!acc[dishName]) {
            acc[dishName] = {
              category: item.dish.category,
              quantity: 0,
              revenue: 0,
              price: item.dish.price,
            };
          }
          acc[dishName].quantity += item.quantity;
          acc[dishName].revenue += item.quantity * item.dish.price;
        });
        return acc;
      }, {} as Record<string, { category: string; quantity: number; revenue: number; price: number }>);

      const dishData = Object.entries(dishStats)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([dish, data]) => ({
          'Блюдо': dish,
          'Категория': data.category,
          'Цена (сум)': data.price,
          'Количество': data.quantity,
          'Выручка (сум)': data.revenue,
        }));

      const ws4 = XLSX.utils.json_to_sheet(dishData);
      ws4['!cols'] = [
        { wch: 20 }, // Блюдо
        { wch: 18 }, // Категория
        { wch: 12 }, // Цена
        { wch: 12 }, // Количество
        { wch: 15 }, // Выручка
      ];
      XLSX.utils.book_append_sheet(wb, ws4, 'По блюдам');

      // Лист 5: Общая статистика
      const summaryData = [
        { 'Показатель': 'Период', 'Значение': `${format(new Date(dateFrom), 'dd.MM.yyyy')} - ${format(new Date(dateTo), 'dd.MM.yyyy')}` },
        { 'Показатель': 'Количество заказов', 'Значение': stats.count },
        { 'Показатель': 'Общая выручка (сум)', 'Значение': stats.total },
        { 'Показатель': 'Средний чек (сум)', 'Значение': Math.round(stats.average) },
        { 'Показатель': 'Фильтр по официанту', 'Значение': selectedWaiter === 'all' ? 'Все' : selectedWaiter },
        { 'Показатель': 'Фильтр по оплате', 'Значение': selectedPaymentMethod === 'all' ? 'Все' : selectedPaymentMethod },
      ];

      const ws5 = XLSX.utils.json_to_sheet(summaryData);
      ws5['!cols'] = [
        { wch: 25 }, // Показатель
        { wch: 25 }, // Значение
      ];
      XLSX.utils.book_append_sheet(wb, ws5, 'Сводка');

      // Генерируем имя файла
      const fileName = `Отчет_продажи_${format(new Date(dateFrom), 'dd.MM.yyyy')}-${format(new Date(dateTo), 'dd.MM.yyyy')}.xlsx`;

      // Сохраняем файл
      XLSX.writeFile(wb, fileName);

      toast.success('Отчет успешно экспортирован');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      toast.error('Ошибка при экспорте отчета');
    }
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-[#f0fdf4] pb-24">
        <Header title="Отчетность по продажам" backButton onBack={() => navigate('/owner/dashboard')} />

        <div className="p-6 max-w-md mx-auto space-y-6">
          {/* Фильтры */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={20} className="text-[#1a5f3f]" />
              <h2 className="font-bold text-lg">Фильтры</h2>
            </div>

            <div className="space-y-4">
              {/* Период */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm">Дата с</Label>
                  <div className="relative mt-1">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-sm">Дата по</Label>
                  <div className="relative mt-1">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Официант */}
              <div>
                <Label htmlFor="waiter" className="text-sm">Официант</Label>
                <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                  <SelectTrigger id="waiter" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все официанты</SelectItem>
                    {waiters.map((waiter) => (
                      <SelectItem key={waiter} value={waiter}>
                        {waiter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Способ оплаты */}
              <div>
                <Label htmlFor="payment" className="text-sm">Способ оплаты</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger id="payment" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все способы</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Сводная статистика */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold mb-4 text-lg">Сводка</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-blue-600 mb-1 font-medium">Заказов</p>
                <p className="text-2xl font-bold text-blue-700">{stats.count}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-emerald-600 mb-1 font-medium">Выручка</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.total)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 col-span-2 shadow-sm">
                <p className="text-sm text-purple-600 mb-1 font-medium">Средний чек</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(Math.round(stats.average))}</p>
              </div>
            </div>
          </div>

          {/* По официантам */}
          {Object.keys(stats.byWaiter).length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold mb-4 text-lg">По официантам</h2>
              <div className="space-y-3">
                {Object.entries(stats.byWaiter)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([waiter, data]) => (
                    <div key={waiter} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d8659] flex items-center justify-center text-white font-bold">
                          {waiter.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{waiter}</p>
                          <p className="text-sm text-muted-foreground">{data.count} заказов</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1a5f3f] text-lg">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(Math.round(data.total / data.count))}/чек</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* По способам оплаты */}
          {Object.keys(stats.byPaymentMethod).length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold mb-4 text-lg">По способам оплаты</h2>
              <div className="space-y-3">
                {Object.entries(stats.byPaymentMethod)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([method, data]) => (
                    <div key={method} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-xl">
                      <div>
                        <p className="font-semibold">{method}</p>
                        <p className="text-sm text-muted-foreground">{data.count} заказов</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1a5f3f] text-lg">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((data.total / stats.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Кнопка экспорта */}
          <Button
            onClick={exportToExcel}
            disabled={filteredOrders.length === 0}
            className="w-full bg-gradient-to-r from-[#1a5f3f] to-[#2d8659] hover:from-[#164d33] hover:to-[#1a5f3f] text-white h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Download size={20} className="mr-2" />
            Экспортировать в Excel
          </Button>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Download size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Нет данных для выбранных фильтров</p>
            </div>
          )}
        </div>

        <Navigation role="owner" />
      </div>
    </SubscriptionGuard>
  );
}
