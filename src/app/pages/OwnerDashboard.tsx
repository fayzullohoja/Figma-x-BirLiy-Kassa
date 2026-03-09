import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { formatCurrency } from '../../lib/utils/format';
import { ShoppingBag, DollarSign, TrendingUp, Users, FileText, CreditCard, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { differenceInDays } from 'date-fns';
import { getDashboardData, getSubscription } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function OwnerDashboard() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    averageCheck: 0,
    activeTables: 0,
  });
  const [waiterPerformance, setWaiterPerformance] = useState<Array<{ waiter: string; ordersCount: number; totalAmount: number }>>([]);
  const [subscriptionState, setSubscriptionState] = useState<{
    restaurantName: string;
    restaurantStatus: 'active' | 'inactive';
    endDate: Date;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [dashboard, subscription] = await Promise.all([
          getDashboardData(),
          getSubscription(),
        ]);

        if (!mounted) {
          return;
        }

        setStats({
          ordersToday: dashboard.ordersToday,
          revenueToday: dashboard.revenueToday,
          averageCheck: dashboard.averageCheck,
          activeTables: dashboard.activeTables,
        });
        setWaiterPerformance(dashboard.waiterPerformance);
        setSubscriptionState({
          restaurantName: subscription.restaurantName,
          restaurantStatus: subscription.restaurantStatus,
          endDate: subscription.endDate,
        });
      } catch (_error) {
        toast.error('Не удалось загрузить дашборд');
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const daysLeft = subscriptionState ? differenceInDays(subscriptionState.endDate, new Date()) : 0;
  const isExpired = daysLeft < 0;
  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
  const showSubscriptionAlert = Boolean(subscriptionState) && (isExpired || isExpiringSoon);

  const statCards = [
    {
      icon: <ShoppingBag size={24} />,
      label: 'Заказов сегодня',
      value: stats.ordersToday.toString(),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <DollarSign size={24} />,
      label: 'Выручка сегодня',
      value: formatCurrency(stats.revenueToday),
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Средний чек',
      value: formatCurrency(stats.averageCheck),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Users size={24} />,
      label: 'Активные столы',
      value: stats.activeTables.toString(),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-[#f0fdf4] pb-24">
        <Header title="Дашборд" />

        <div className="p-6 max-w-md mx-auto">
          {showSubscriptionAlert && (
            <Link to="/owner/subscription">
              <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 transition-all shadow-lg ${
                isExpired
                  ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'
                  : 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isExpired ? 'bg-red-500' : 'bg-orange-500'
                }`}>
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                    {isExpired ? 'Подписка истекла!' : 'Подписка заканчивается!'}
                  </p>
                  <p className={`text-sm ${isExpired ? 'text-red-700' : 'text-orange-700'}`}>
                    {isExpired
                      ? 'Свяжитесь с администратором'
                      : `Осталось ${daysLeft} ${daysLeft === 1 ? 'день' : 'дня'}`
                    }
                  </p>
                </div>
                <ChevronRight size={20} className={isExpired ? 'text-red-700 shrink-0' : 'text-orange-700 shrink-0'} />
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {card.icon}
                </div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-bold mb-4 text-lg">Быстрые действия</h2>
            <div className="space-y-3">
              <Link to="/owner/reports">
                <Button className="w-full bg-gradient-to-r from-[#1a5f3f] to-[#2d8659] hover:from-[#164d33] hover:to-[#1a5f3f] text-white justify-start shadow-lg hover:shadow-xl transition-all h-12 rounded-xl">
                  <FileText size={20} className="mr-3" />
                  Отчеты и аналитика
                </Button>
              </Link>
              <Link to="/owner/subscription">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-[#1a5f3f]/20 text-[#1a5f3f] hover:bg-[#1a5f3f]/5 hover:border-[#1a5f3f]/40 transition-all h-12 rounded-xl"
                >
                  <CreditCard size={20} className="mr-3" />
                  Моя подписка
                  {showSubscriptionAlert && (
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                      isExpired ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {isExpired ? '!' : daysLeft}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold mb-5 text-lg">Производительность официантов</h2>
            <div className="space-y-4">
              {waiterPerformance.map((waiter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d8659] flex items-center justify-center text-white font-bold">
                      {waiter.waiter.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{waiter.waiter}</p>
                      <p className="text-sm text-muted-foreground">
                        {waiter.ordersCount} {waiter.ordersCount === 1 ? 'заказ' : 'заказов'}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-[#1a5f3f] text-lg">
                    {formatCurrency(waiter.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Navigation role="owner" />
      </div>
    </SubscriptionGuard>
  );
}
