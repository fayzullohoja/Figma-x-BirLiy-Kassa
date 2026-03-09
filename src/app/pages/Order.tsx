import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Header } from '../../components/Header';
import { Navigation } from '../../components/Navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Order as OrderType, OrderItem } from '../../types';
import { formatCurrency } from '../../lib/utils/format';
import { paymentMethods } from '../../lib/data/mockData';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { closeOrder, getOrCreateActiveOrder, updateOrderItemQuantity } from '../../lib/api/birliyApi';

export function Order() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!tableNumber) {
        toast.error('Стол не найден');
        navigate('/');
        return;
      }

      try {
        const activeOrder = await getOrCreateActiveOrder(Number(tableNumber));
        if (mounted) {
          setOrder(activeOrder);
          setOrderItems(activeOrder.items);
        }
      } catch (_error) {
        toast.error('Не удалось открыть заказ');
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
  }, [navigate, tableNumber]);

  const total = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  }, [orderItems]);

  const updateQuantity = async (dishId: string | number, delta: number) => {
    if (!order) {
      return;
    }

    const current = orderItems.find((item) => item.dish.id === dishId);
    if (!current) {
      return;
    }

    const nextQuantity = Math.max(0, current.quantity + delta);

    setOrderItems((items) =>
      items
        .map((item) =>
          item.dish.id === dishId
            ? { ...item, quantity: nextQuantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    try {
      await updateOrderItemQuantity(order.id, dishId, nextQuantity);
    } catch (_error) {
      toast.error('Не удалось обновить позицию');
      try {
        const refreshed = await getOrCreateActiveOrder(Number(tableNumber));
        setOrder(refreshed);
        setOrderItems(refreshed.items);
      } catch {
        // keep optimistic state if reload also fails
      }
    }
  };

  const removeItem = async (dishId: string | number) => {
    await updateQuantity(dishId, -999);
  };

  const handleCloseOrder = () => {
    setShowPaymentDialog(true);
  };

  const handlePayment = async (method: string) => {
    if (!order || !tableNumber) {
      return;
    }

    try {
      await closeOrder(order.id, method, Number(tableNumber));
      toast.success(`Заказ закрыт. Оплата: ${method}`);
      setShowPaymentDialog(false);
      navigate('/');
    } catch (_error) {
      toast.error('Не удалось закрыть заказ');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={`Стол ${tableNumber}`} showBack />

      <div className="p-4 max-w-md mx-auto">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">Загрузка заказа...</div>
        )}

        {!isLoading && order && (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Официант: {order.waiter}</p>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Заказ пуст</p>
                <p className="text-sm mt-2">Добавьте блюда из меню</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div
                    key={item.dish.id}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium flex-1">{item.dish.name}</h3>
                      <button
                        onClick={() => removeItem(item.dish.id)}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.dish.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.dish.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-lg transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.dish.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-accent rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Итого:</span>
                <span className="text-xl font-bold text-[#1a5f3f]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(`/menu?table=${tableNumber}`)}
                className="w-full py-3 bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-xl transition-colors"
              >
                Добавить блюдо
              </button>
              {orderItems.length > 0 && (
                <button
                  onClick={handleCloseOrder}
                  className="w-full py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl transition-colors"
                >
                  Закрыть заказ
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog.Root open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50" aria-describedby={undefined}>
            <Dialog.Title className="text-xl font-semibold mb-4">
              Способ оплаты
            </Dialog.Title>
            <div className="space-y-2 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => handlePayment(method)}
                  className="w-full py-3 px-4 bg-accent hover:bg-[#1a5f3f] hover:text-white rounded-xl transition-colors text-left"
                >
                  {method}
                </button>
              ))}
            </div>
            <Dialog.Close asChild>
              <button className="w-full py-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                Отмена
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Navigation role="waiter" />
    </div>
  );
}
