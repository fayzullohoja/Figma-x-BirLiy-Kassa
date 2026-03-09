import { useEffect, useMemo, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { formatCurrency } from '../../lib/utils/format';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate, useSearchParams } from 'react-router';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getSubscription } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurantName, setRestaurantName] = useState('Заведение');
  const [monthlyPrice, setMonthlyPrice] = useState(50000);
  const [endDate, setEndDate] = useState(new Date());

  const transactionId = searchParams.get('transactionId') ?? 'TRX-UNKNOWN';
  const queryAmount = searchParams.get('amount');
  const queryEndDate = searchParams.get('newEndDate');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const subscription = await getSubscription();
        if (!mounted) {
          return;
        }

        setRestaurantName(subscription.restaurantName);
        setMonthlyPrice(subscription.monthlyPrice);
        setEndDate(subscription.endDate);
      } catch (_error) {
        toast.error('Не удалось загрузить данные подписки');
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const shownAmount = useMemo(() => {
    if (!queryAmount) {
      return monthlyPrice;
    }

    const parsed = Number(queryAmount);
    return Number.isFinite(parsed) ? parsed : monthlyPrice;
  }, [monthlyPrice, queryAmount]);

  const shownEndDate = useMemo(() => {
    if (!queryEndDate) {
      return endDate;
    }

    const parsed = new Date(queryEndDate);
    return Number.isNaN(parsed.getTime()) ? endDate : parsed;
  }, [endDate, queryEndDate]);

  const handleReturn = () => {
    navigate('/owner/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Успешно" />

      <div className="p-4 max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center space-y-6 w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-once">
            <CheckCircle2 size={64} className="text-green-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Оплата прошла успешно!</h2>
            <p className="text-muted-foreground">
              Подписка активирована на 30 дней
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Заведение</span>
              <span className="font-semibold">{restaurantName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Сумма</span>
              <span className="font-semibold text-[#1a5f3f]">
                {formatCurrency(shownAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Транзакция</span>
              <span className="font-semibold">{transactionId}</span>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Активна до</p>
              <p className="text-2xl font-bold text-green-600">
                {format(shownEndDate, 'd MMMM yyyy', { locale: ru })}
              </p>
            </div>
          </div>

          <Button
            onClick={handleReturn}
            className="w-full h-12 bg-[#1a5f3f] hover:bg-[#164d33] text-white text-base font-semibold"
          >
            Вернуться в приложение
          </Button>
        </div>
      </div>
    </div>
  );
}
