import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { formatCurrency, formatDateTime } from '../../lib/utils/format';
import { Order } from '../../types';
import { getOrderById } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getOrderById(orderId);
        if (mounted) {
          setOrder(data);
        }
      } catch (_error) {
        toast.error('Не удалось загрузить заказ');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Детали заказа" showBack />
        <div className="p-4 max-w-md mx-auto text-center py-12">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Детали заказа" showBack />
        <div className="p-4 max-w-md mx-auto text-center py-12">
          <p className="text-muted-foreground">Заказ не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={`Заказ #${order.id}`} showBack />

      <div className="p-4 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Стол</p>
              <p className="font-medium">{order.tableNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Официант</p>
              <p className="font-medium">{order.waiter}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Время открытия</p>
              <p className="font-medium">{formatDateTime(order.openedAt)}</p>
            </div>
            {order.closedAt && (
              <div>
                <p className="text-muted-foreground mb-1">Время закрытия</p>
                <p className="font-medium">{formatDateTime(order.closedAt)}</p>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <p className="text-muted-foreground mb-1">Способ оплаты</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">Блюда</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{item.dish.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.dish.price)}
                  </p>
                </div>
                <div className="font-semibold">
                  {formatCurrency(item.dish.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a5f3f] text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Итого:</span>
            <span className="text-2xl font-bold">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <Navigation role="owner" />
    </div>
  );
}
