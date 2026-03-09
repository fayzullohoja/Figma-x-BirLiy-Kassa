import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Header } from '../../components/layout/Header';
import { Navigation } from '../../components/layout/Navigation';
import { categories } from '../../lib/data/mockData';
import { formatCurrency } from '../../lib/utils/format';
import { Dish } from '../../types';
import { addDishToOrder, getDishes, getOrCreateActiveOrder } from '../../lib/api/birliyApi';
import { toast } from 'sonner';

export function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDishes = async () => {
      try {
        const nextDishes = await getDishes();
        if (mounted) {
          setDishes(nextDishes);
        }
      } catch (_error) {
        toast.error('Не удалось загрузить меню');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDishes();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredDishes = selectedCategory === 'Все'
    ? dishes
    : dishes.filter((dish) => dish.category === selectedCategory);

  const handleDishClick = async (dish: Dish) => {
    if (!tableNumber) {
      toast.error('Не выбран стол');
      return;
    }

    try {
      const order = await getOrCreateActiveOrder(Number(tableNumber));
      await addDishToOrder(order.id, dish);
      toast.success(`${dish.name} добавлено`);
      navigate(`/order/${tableNumber}`);
    } catch (_error) {
      toast.error('Не удалось добавить блюдо');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Меню" showBack />

      <div className="max-w-md mx-auto">
        {/* Categories */}
        <div className="sticky top-14 bg-white border-b border-border z-30 overflow-x-auto">
          <div className="flex gap-2 p-4 pb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#1a5f3f] text-white'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes */}
        <div className="p-4 space-y-3">
          {isLoading && (
            <div className="text-center py-10 text-muted-foreground">
              Загрузка меню...
            </div>
          )}
          {filteredDishes.map((dish) => (
            <button
              key={dish.id}
              onClick={() => handleDishClick(dish)}
              className="w-full bg-card border border-border hover:border-[#1a5f3f] rounded-xl p-4 transition-all active:scale-98 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground">{dish.category}</p>
                </div>
                <div className="font-semibold text-[#1a5f3f] ml-4">
                  {formatCurrency(dish.price)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Navigation role="waiter" />
    </div>
  );
}
