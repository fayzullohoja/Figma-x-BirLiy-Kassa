import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Navigation } from '../../components/layout/Navigation';
import { SubscriptionGuard } from '../../components/layout/SubscriptionGuard';
import { mockWaiters } from '../../lib/data/mockData';
import { Waiter } from '../../types';
import { Plus, UserCheck, UserX } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router';

export function StaffManagement() {
  const navigate = useNavigate();
  const [waiters, setWaiters] = useState(mockWaiters);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');

  const toggleWaiterStatus = (id: number) => {
    setWaiters((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === 'active' ? ('blocked' as const) : ('active' as const) }
          : w
      )
    );
  };

  const addWaiter = () => {
    if (newWaiterName.trim()) {
      const newWaiter: Waiter = {
        id: Math.max(...waiters.map((w) => w.id)) + 1,
        name: newWaiterName,
        status: 'active',
      };
      setWaiters((prev) => [...prev, newWaiter]);
      setNewWaiterName('');
      setShowAddDialog(false);
    }
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-background pb-20">
        <Header
          title="Управление персоналом"
          backButton
          onBack={() => navigate('/owner/dashboard')}
          action={
            <button
              onClick={() => setShowAddDialog(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          }
        />

        <div className="p-4 max-w-md mx-auto space-y-3">
          {waiters.map((waiter) => (
            <div
              key={waiter.id}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{waiter.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {waiter.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleWaiterStatus(waiter.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      waiter.status === 'active'
                        ? 'hover:bg-destructive/10 text-destructive'
                        : 'hover:bg-green-500/10 text-green-500'
                    }`}
                  >
                    {waiter.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50" aria-describedby={undefined}>
              <Dialog.Title className="text-xl font-semibold mb-4">
                Добавить официанта
              </Dialog.Title>
              <input
                type="text"
                value={newWaiterName}
                onChange={(e) => setNewWaiterName(e.target.value)}
                placeholder="Имя официанта"
                className="w-full px-4 py-3 bg-input-background rounded-xl mb-4 outline-none focus:ring-2 ring-[#1a5f3f]"
                autoFocus
              />
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                    Отмена
                  </button>
                </Dialog.Close>
                <button
                  onClick={addWaiter}
                  className="flex-1 py-3 bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-xl transition-colors"
                >
                  Добавить
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Navigation role="owner" />
      </div>
    </SubscriptionGuard>
  );
}