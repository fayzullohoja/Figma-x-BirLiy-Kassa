import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { formatCurrency } from '../../lib/utils/format';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, CreditCard, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { getPaymentHistory, getSubscription } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function Subscription() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<{
    restaurantName: string;
    restaurantStatus: 'active' | 'inactive';
    endDate: Date;
    monthlyPrice: number;
  } | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{ id: string | number; date: Date; amount: number; method: string }>>([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [nextSubscription, history] = await Promise.all([
          getSubscription(),
          getPaymentHistory(),
        ]);

        if (!mounted) {
          return;
        }

        setSubscription({
          restaurantName: nextSubscription.restaurantName,
          restaurantStatus: nextSubscription.restaurantStatus,
          endDate: nextSubscription.endDate,
          monthlyPrice: nextSubscription.monthlyPrice,
        });
        setPaymentHistory(history);
      } catch (_error) {
        toast.error('Не удалось загрузить подписку');
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const daysLeft = subscription ? differenceInDays(subscription.endDate, new Date()) : 0;
  const isExpired = daysLeft < 0;
  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;

  const handlePayment = () => {
    navigate('/owner/subscription/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[#f0fdf4] pb-24">
      <Header title="Подписка" backButton onBack={() => navigate('/owner/dashboard')} />

      <div className="p-6 max-w-md mx-auto space-y-6">
        {!subscription && (
          <div className="text-center py-8 text-muted-foreground">Загрузка подписки...</div>
        )}

        {subscription && (
          <>
            <div className={`rounded-2xl p-6 border-2 shadow-lg ${
              isExpired
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                : isExpiringSoon
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1">
                    Подписка BirLiy Kassa
                  </h2>
                  <p className="text-sm text-muted-foreground">{subscription.restaurantName}</p>
                </div>
                {subscription.restaurantStatus === 'active' && !isExpired ? (
                  <Badge className="bg-green-500 text-white hover:bg-green-500 shadow-md">
                    <CheckCircle2 size={14} className="mr-1" />
                    Активна
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white hover:bg-red-500 shadow-md">
                    <XCircle size={14} className="mr-1" />
                    {isExpired ? 'Истекла' : 'Неактивна'}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                  <span className="text-sm font-medium text-muted-foreground">Тариф</span>
                  <span className="font-bold text-[#1a5f3f] text-lg">
                    {formatCurrency(subscription.monthlyPrice)} / месяц
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                  <span className="text-sm font-medium text-muted-foreground">Статус</span>
                  <span className={`font-bold ${
                    isExpired
                      ? 'text-red-700'
                      : isExpiringSoon
                        ? 'text-orange-700'
                        : 'text-green-700'
                  }`}>
                    {isExpired
                      ? 'Подписка просрочена'
                      : isExpiringSoon
                        ? `Истекает через ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`
                        : 'Активна'
                    }
                  </span>
                </div>

                <div className="pt-3 border-t border-current/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar size={16} />
                      Активна до
                    </span>
                  </div>
                  <p className={`text-xl font-bold text-right ${
                    isExpired ? 'text-red-700' : isExpiringSoon ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {format(subscription.endDate, 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              </div>
            </div>

            {isExpired && (
              <div className="rounded-xl p-4 flex gap-3 bg-red-100 border border-red-300">
                <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-red-800">
                    Подписка истекла!
                  </p>
                  <p className="text-sm text-red-700">
                    Чтобы продолжить работу, оплатите подписку.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handlePayment}
              className="w-full h-12 bg-[#1a5f3f] hover:bg-[#164d33] text-white text-base font-semibold"
            >
              <CreditCard size={20} className="mr-2" />
              Оплатить подписку
            </Button>
          </>
        )}

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">История платежей</h3>

          {paymentHistory.length > 0 ? (
            <div className="space-y-2">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(payment.date, 'd MMMM yyyy', { locale: ru })}
                      </p>
                      <p className="text-sm text-muted-foreground">{payment.method}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-[#1a5f3f]">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">История платежей пуста</p>
            </div>
          )}
        </div>
      </div>

      <Navigation role="owner" />
    </div>
  );
}
