import { ReactNode, useEffect, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router';
import { AlertTriangle, CreditCard, Users } from 'lucide-react';
import { Button } from './ui/button';
import { getSubscription } from '../../lib/api/birliyApi';

interface SubscriptionGuardProps {
  children: ReactNode;
  role?: 'owner' | 'waiter';
}

export function SubscriptionGuard({ children, role = 'owner' }: SubscriptionGuardProps) {
  const [state, setState] = useState<{
    restaurantName: string;
    isExpired: boolean;
    isLoading: boolean;
  }>({
    restaurantName: 'Заведение',
    isExpired: false,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const subscription = await getSubscription();
        const daysLeft = differenceInDays(subscription.endDate, new Date());

        if (!mounted) {
          return;
        }

        setState({
          restaurantName: subscription.restaurantName,
          isExpired: daysLeft < 0,
          isLoading: false,
        });
      } catch (_error) {
        if (mounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (state.isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Загрузка...</div>;
  }

  if (state.isExpired) {
    if (role === 'owner') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={40} className="text-red-600" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Подписка истекла</h2>
            <p className="text-muted-foreground mb-2">
              Чтобы продолжить работу, оплатите подписку.
            </p>
            <p className="text-lg font-semibold text-[#1a5f3f] mb-6">
              Стоимость: 50 000 сум / месяц
            </p>

            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Ваше заведение</p>
              <p className="font-semibold">{state.restaurantName}</p>
            </div>

            <Link to="/owner/subscription">
              <Button className="w-full bg-[#1a5f3f] hover:bg-[#164d33] text-white">
                <CreditCard size={18} className="mr-2" />
                Оплатить
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-orange-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Доступ временно ограничен</h2>
          <p className="text-muted-foreground mb-6">
            Обратитесь к владельцу заведения.
          </p>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Заведение</p>
            <p className="font-semibold mb-3">{state.restaurantName}</p>
            <p className="text-xs text-muted-foreground">
              Подписка на систему BirLiy Kassa истекла. Владелец должен продлить подписку для продолжения работы.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
