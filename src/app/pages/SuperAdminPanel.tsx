import { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Navigation } from '../../components/layout/Navigation';
import { Plus, Store, Users, Calendar, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { formatCurrency } from '../../lib/utils/format';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AdminRestaurant,
  AdminUser,
  SUBSCRIPTION_PRICE,
  createAdminRestaurant,
  extendAdminRestaurantSubscription,
  getAdminRestaurants,
  getAdminUsers,
  toggleAdminRestaurantStatus,
} from '../../lib/api/birliyApi';

export function SuperAdminPanel() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRestaurantDialog, setShowAddRestaurantDialog] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    owner: '',
    tablesCount: '',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [nextRestaurants, nextUsers] = await Promise.all([
        getAdminRestaurants(),
        getAdminUsers(),
      ]);
      setRestaurants(nextRestaurants);
      setUsers(nextUsers);
    } catch (_error) {
      toast.error('Не удалось загрузить данные админки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addRestaurant = async () => {
    const parsedTablesCount = Number(newRestaurant.tablesCount);
    if (!newRestaurant.name.trim() || !newRestaurant.owner.trim() || !Number.isFinite(parsedTablesCount) || parsedTablesCount <= 0) {
      toast.error('Заполните поля корректно');
      return;
    }

    try {
      const created = await createAdminRestaurant({
        name: newRestaurant.name,
        owner: newRestaurant.owner,
        tablesCount: parsedTablesCount,
      });

      setRestaurants((prev) => [created, ...prev]);
      setNewRestaurant({ name: '', owner: '', tablesCount: '' });
      setShowAddRestaurantDialog(false);
      toast.success('Заведение успешно создано');
      await loadData();
    } catch (_error) {
      toast.error('Не удалось создать заведение');
    }
  };

  const handleToggleRestaurantStatus = async (restaurant: AdminRestaurant) => {
    try {
      const nextStatus = await toggleAdminRestaurantStatus(restaurant.id, restaurant.status);
      setRestaurants((prev) =>
        prev.map((item) =>
          item.id === restaurant.id ? { ...item, status: nextStatus } : item
        )
      );
      toast.success('Статус заведения изменен');
    } catch (_error) {
      toast.error('Не удалось обновить статус заведения');
    }
  };

  const handleExtendSubscription = async (restaurant: AdminRestaurant) => {
    try {
      const nextEndDate = await extendAdminRestaurantSubscription(restaurant.id, 1);
      setRestaurants((prev) =>
        prev.map((item) =>
          item.id === restaurant.id ? { ...item, subscriptionEndDate: nextEndDate } : item
        )
      );
      toast.success('Подписка продлена на 1 месяц');
    } catch (_error) {
      toast.error('Не удалось продлить подписку');
    }
  };

  const getSubscriptionStatus = (restaurant: AdminRestaurant) => {
    const today = new Date();
    const daysLeft = differenceInDays(restaurant.subscriptionEndDate, today);

    if (daysLeft < 0) {
      return { text: 'Истекла' };
    }

    if (daysLeft <= 7) {
      return { text: `${daysLeft} дней` };
    }

    return { text: `${daysLeft} дней` };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="Панель администратора"
        action={
          <button
            onClick={loadData}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Обновить"
          >
            <RefreshCw size={20} className="text-[#1a5f3f]" />
          </button>
        }
      />

      <div className="p-4 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-600 mb-1">Активных</p>
            <p className="text-xl font-bold text-green-700">
              {restaurants.filter((item) => item.status === 'active').length}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-600 mb-1">Истекает</p>
            <p className="text-xl font-bold text-orange-700">
              {restaurants.filter((item) => {
                const days = differenceInDays(item.subscriptionEndDate, new Date());
                return days >= 0 && days <= 7;
              }).length}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 mb-1">Просрочено</p>
            <p className="text-xl font-bold text-red-700">
              {restaurants.filter((item) => differenceInDays(item.subscriptionEndDate, new Date()) < 0).length}
            </p>
          </div>
        </div>

        <Tabs.Root defaultValue="restaurants">
          <Tabs.List className="flex gap-2 mb-4 bg-accent rounded-xl p-1">
            <Tabs.Trigger
              value="restaurants"
              className="flex-1 py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Store size={18} className="inline mr-2" />
              Заведения
            </Tabs.Trigger>
            <Tabs.Trigger
              value="users"
              className="flex-1 py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Users size={18} className="inline mr-2" />
              Пользователи
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="restaurants">
            <div className="mb-4">
              <button
                onClick={() => setShowAddRestaurantDialog(true)}
                className="w-full py-3 bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Создать заведение
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-10 text-muted-foreground">Загрузка...</div>
            )}

            <div className="space-y-3">
              {restaurants.map((restaurant) => {
                const subStatus = getSubscriptionStatus(restaurant);
                const daysLeft = differenceInDays(restaurant.subscriptionEndDate, new Date());

                return (
                  <div
                    key={restaurant.id}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">Владелец: {restaurant.owner}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {restaurant.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 size={14} className="mr-1" />
                            Активен
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            <XCircle size={14} className="mr-1" />
                            Неактивен
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-1">Столов</p>
                        <p className="font-semibold">{restaurant.tablesCount}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-1">Пользователи</p>
                        <p className="font-semibold">{restaurant.activeUsers}</p>
                      </div>
                      <div className={`rounded-lg p-2 ${
                        daysLeft < 0 ? 'bg-red-50' : daysLeft <= 7 ? 'bg-orange-50' : 'bg-green-50'
                      }`}>
                        <p className="text-xs text-muted-foreground mb-1">Подписка</p>
                        <p className={`font-semibold ${
                          daysLeft < 0 ? 'text-red-700' : daysLeft <= 7 ? 'text-orange-700' : 'text-green-700'
                        }`}>
                          {subStatus.text}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar size={14} />
                          До
                        </span>
                        <span className="font-medium">
                          {format(restaurant.subscriptionEndDate, 'dd.MM.yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleToggleRestaurantStatus(restaurant)}
                        variant={restaurant.status === 'active' ? 'outline' : 'default'}
                        className={`h-9 text-sm ${
                          restaurant.status === 'active'
                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {restaurant.status === 'active' ? 'Деактивировать' : 'Активировать'}
                      </Button>

                      <Button
                        onClick={() => handleExtendSubscription(restaurant)}
                        variant="outline"
                        className="h-9 text-sm border-[#1a5f3f]/30 text-[#1a5f3f] hover:bg-[#1a5f3f]/5"
                      >
                        Продлить +1 мес
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Tabs.Content>

          <Tabs.Content value="users">
            {isLoading && (
              <div className="text-center py-10 text-muted-foreground">Загрузка...</div>
            )}

            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.role} · {user.restaurantName}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </div>
                  </div>
                </div>
              ))}

              {!isLoading && users.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">Пользователей пока нет</div>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <Dialog.Root open={showAddRestaurantDialog} onOpenChange={setShowAddRestaurantDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50" aria-describedby={undefined}>
            <Dialog.Title className="text-xl font-semibold mb-4">
              Создать заведение
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Название заведения</label>
                <input
                  type="text"
                  value={newRestaurant.name}
                  onChange={(event) =>
                    setNewRestaurant({ ...newRestaurant, name: event.target.value })
                  }
                  placeholder="Например: Чайхана Навруз"
                  className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Владелец</label>
                <input
                  type="text"
                  value={newRestaurant.owner}
                  onChange={(event) =>
                    setNewRestaurant({ ...newRestaurant, owner: event.target.value })
                  }
                  placeholder="Имя владельца"
                  className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Количество столов</label>
                <input
                  type="number"
                  value={newRestaurant.tablesCount}
                  onChange={(event) =>
                    setNewRestaurant({ ...newRestaurant, tablesCount: event.target.value })
                  }
                  placeholder="20"
                  className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  При создании заведения предоставляется 1 месяц бесплатной подписки
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">Стоимость подписки:</p>
                  <p className="text-sm font-bold text-blue-800">{formatCurrency(SUBSCRIPTION_PRICE)}/мес</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <button className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                  Отмена
                </button>
              </Dialog.Close>
              <button
                onClick={addRestaurant}
                className="flex-1 py-3 bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-xl transition-colors"
              >
                Создать
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Navigation role="admin" />
    </div>
  );
}
