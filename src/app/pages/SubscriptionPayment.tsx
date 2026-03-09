import { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { formatCurrency } from '../../lib/utils/format';
import { CreditCard, ArrowLeft, Clock3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { addMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getSubscription } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function SubscriptionPayment() {
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('Заведение');
  const [monthlyPrice, setMonthlyPrice] = useState(50000);
  const [newEndDate, setNewEndDate] = useState(addMonths(new Date(), 1));

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
        setNewEndDate(
          addMonths(
            subscription.endDate > new Date() ? subscription.endDate : new Date(),
            1
          )
        );
      } catch (_error) {
        toast.error('Не удалось загрузить данные подписки');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Оплата"
        backButton
        onBack={() => navigate('/owner/subscription')}
      />

      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-[#00AEEF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Оплата через Click</h2>
            <p className="text-muted-foreground">
              Раздел оплаты временно недоступен
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Заведение</span>
              <span className="font-semibold">{restaurantName}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Период</span>
              <span className="font-semibold">1 месяц</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Будет активно до</span>
              <span className="font-semibold text-green-600">
                {format(newEndDate, 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-semibold">Сумма</span>
              <span className="text-2xl font-bold text-[#1a5f3f]">
                {formatCurrency(monthlyPrice)}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Clock3 size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Оплата в разработке</p>
              <p className="text-sm text-amber-700">
                Скоро будет доступна оплата подписки через Click.
              </p>
            </div>
          </div>

          <Button
            disabled
            className="w-full h-12 bg-[#00AEEF] text-white text-base font-semibold opacity-60 cursor-not-allowed"
          >
            <CreditCard size={20} className="mr-2" />
            Скоро будет доступно
          </Button>

          <Button
            onClick={() => navigate('/owner/subscription')}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <ArrowLeft size={20} className="mr-2" />
            Назад к подписке
          </Button>
        </div>
      </div>
    </div>
  );
}
