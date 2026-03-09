import { useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { mockReservations, mockTables } from '../../lib/data/mockData';
import { Reservation } from '../../types';
import { Plus, Calendar, User, MessageSquare } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router';

export function TableReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState(mockReservations);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newReservation, setNewReservation] = useState({
    tableNumber: '',
    customerName: '',
    time: '',
    comment: '',
  });

  const addReservation = () => {
    if (
      newReservation.tableNumber &&
      newReservation.customerName &&
      newReservation.time
    ) {
      const reservation: Reservation = {
        id: Math.max(...reservations.map((r) => r.id)) + 1,
        tableNumber: Number(newReservation.tableNumber),
        customerName: newReservation.customerName,
        time: newReservation.time,
        comment: newReservation.comment,
      };
      setReservations((prev) => [...prev, reservation]);
      setNewReservation({ tableNumber: '', customerName: '', time: '', comment: '' });
      setShowAddDialog(false);
    }
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-background pb-20">
        <Header
          title="Бронирование столов"
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

        <div className="p-4 max-w-md mx-auto">
          {reservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет активных бронирований</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">Стол {reservation.tableNumber}</h3>
                      <p className="text-muted-foreground">{reservation.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="font-medium">{reservation.time}</span>
                  </div>
                  {reservation.comment && (
                    <p className="text-sm text-muted-foreground">{reservation.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50 max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
              <Dialog.Title className="text-xl font-semibold mb-4">
                Новое бронирование
              </Dialog.Title>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Стол</label>
                  <select
                    value={newReservation.tableNumber}
                    onChange={(e) =>
                      setNewReservation({ ...newReservation, tableNumber: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                  >
                    <option value="">Выберите стол</option>
                    {mockTables.map((table) => (
                      <option key={table.id} value={table.number}>
                        Стол {table.number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Имя клиента</label>
                  <input
                    type="text"
                    value={newReservation.customerName}
                    onChange={(e) =>
                      setNewReservation({ ...newReservation, customerName: e.target.value })
                    }
                    placeholder="Введите имя"
                    className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Время</label>
                  <input
                    type="time"
                    value={newReservation.time}
                    onChange={(e) =>
                      setNewReservation({ ...newReservation, time: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Комментарий</label>
                  <textarea
                    value={newReservation.comment}
                    onChange={(e) =>
                      setNewReservation({ ...newReservation, comment: e.target.value })
                    }
                    placeholder="Необязательно"
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background rounded-xl outline-none focus:ring-2 ring-[#1a5f3f] resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Dialog.Close asChild>
                  <button className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                    Отмена
                  </button>
                </Dialog.Close>
                <button
                  onClick={addReservation}
                  className="flex-1 py-3 bg-[#1a5f3f] hover:bg-[#1a5f3f]/90 text-white rounded-xl transition-colors"
                >
                  Забронировать
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
