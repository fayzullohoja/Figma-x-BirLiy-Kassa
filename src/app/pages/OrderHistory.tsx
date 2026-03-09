import { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import { Navigation } from '../../components/Navigation';
import { SubscriptionGuard } from '../../components/SubscriptionGuard';
import { Clock, User } from 'lucide-react';
import { formatCurrency } from '../../lib/utils/format';
import { Link, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Order } from '../../types';
import { getClosedOrders } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const nextOrders = await getClosedOrders();
        if (mounted) {
          setOrders(nextOrders);
        }
      } catch (_error) {
        toast.error('Не удалось загрузить историю заказов');
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-[#f0fdf4] pb-24">
        <Header title="История заказов" backButton onBack={() => navigate('/owner/dashboard')} />

        <div className="p-6 max-w-md mx-auto space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/owner/order/${order.id}`}
              className="block bg-white border border-border hover:border-[#1a5f3f] hover:shadow-lg rounded-2xl p-5 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">Заказ #{order.id}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock size={14} />
                    Стол {order.tableNumber}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1a5f3f] text-xl">{formatCurrency(order.total)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User size={14} />
                  Официант: {order.waiter}
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] text-[#1a5f3f] rounded-lg text-xs font-semibold">
                  {order.paymentMethod}
                </span>
              </div>
              {order.closedAt && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  {format(new Date(order.closedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </p>
              )}
            </Link>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Закрытых заказов пока нет</div>
          )}
        </div>

        <Navigation role="owner" />
      </div>
    </SubscriptionGuard>
  );
}
