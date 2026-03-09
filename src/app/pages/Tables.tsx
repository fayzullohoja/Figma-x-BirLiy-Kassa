import { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Navigation } from '../../components/layout/Navigation';
import { SubscriptionGuard } from '../../components/layout/SubscriptionGuard';
import { Table as TableType } from '../../types';
import { Link } from 'react-router';
import { User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getTables } from '../../lib/api/birliyApi';
import { getCurrentUserName } from '../../lib/appSession';

export function Tables() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentWaiter = getCurrentUserName();

  useEffect(() => {
    let mounted = true;

    const loadTables = async () => {
      try {
        const nextTables = await getTables();
        if (mounted) {
          setTables(nextTables);
        }
      } catch (_error) {
        toast.error('Не удалось загрузить столы');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadTables();
    return () => {
      mounted = false;
    };
  }, []);

  const getTableColor = (table: TableType) => {
    switch (table.status) {
      case 'free':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 shadow-lg shadow-emerald-200';
      case 'occupied-self':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-200';
      case 'occupied-other':
        return 'bg-gradient-to-br from-orange-300 to-orange-500 opacity-70 cursor-not-allowed';
      case 'reserved':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-lg shadow-purple-200';
    }
  };

  const getTableLabel = (table: TableType) => {
    switch (table.status) {
      case 'free':
        return 'Свободен';
      case 'occupied-self':
        return `Занят (${table.waiter})`;
      case 'occupied-other':
        return `Занят (${table.waiter})`;
      case 'reserved':
        return `Бронь ${table.reservationTime}`;
    }
  };

  return (
    <SubscriptionGuard role="waiter">
      <div className="min-h-screen bg-gradient-to-b from-background to-[#f0fdf4] pb-24">
        <Header 
          title="BirLiy Kassa" 
          action={
            <Link 
              to="/role-select"
              className="p-2.5 hover:bg-[#1a5f3f]/10 rounded-xl transition-all active:scale-95"
            >
              <User size={20} className="text-[#1a5f3f]" />
            </Link>
          }
        />
        
        <div className="p-6 max-w-md mx-auto">
          <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d8659] flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Официант</p>
                <p className="font-semibold text-foreground">{currentWaiter}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isLoading && (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                Загрузка столов...
              </div>
            )}
            {tables.map((table) => {
              const canClick = table.status !== 'occupied-other';
              const TableWrapper = canClick ? Link : 'div';
              const wrapperProps = canClick ? { to: `/order/${table.number}` } : {};

              return (
                <TableWrapper
                  key={table.id}
                  {...wrapperProps}
                  className={`${getTableColor(table)} rounded-3xl p-8 text-white transition-all transform ${
                    canClick ? 'active:scale-95 hover:scale-105' : ''
                  }`}
                >
                  <div className="text-center relative">
                    {table.status === 'free' && (
                      <div className="absolute -top-2 -right-2">
                        <Sparkles size={16} className="text-white/80" />
                      </div>
                    )}
                    <p className="text-5xl font-black mb-3 drop-shadow-lg">{table.number}</p>
                    <p className="text-sm font-medium opacity-95">{getTableLabel(table)}</p>
                  </div>
                </TableWrapper>
              );
            })}
          </div>
        </div>

        <Navigation role="waiter" />
      </div>
    </SubscriptionGuard>
  );
}
