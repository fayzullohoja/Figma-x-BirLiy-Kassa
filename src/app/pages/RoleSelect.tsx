import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { User, Crown, Briefcase } from 'lucide-react';
import { setCurrentRole, setCurrentUserName, setRestaurantId } from '../../lib/appSession';
import { ensureSessionByRole } from '../../lib/api/birliyApi';
import { UserRole } from '../../types';

export function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'waiter' as UserRole,
      title: 'Официант',
      description: 'Управление столами и заказами',
      icon: <User size={32} />,
      color: 'bg-blue-500',
      route: '/',
    },
    {
      id: 'owner' as UserRole,
      title: 'Владелец',
      description: 'Дашборд и управление заведением',
      icon: <Briefcase size={32} />,
      color: 'bg-purple-500',
      route: '/owner/dashboard',
    },
    {
      id: 'admin' as UserRole,
      title: 'Супер-админ',
      description: 'Управление платформой',
      icon: <Crown size={32} />,
      color: 'bg-[#1a5f3f]',
      route: '/admin',
    },
  ];

  const handleRoleSelect = async (role: UserRole, route: string) => {
    setCurrentRole(role);
    setRestaurantId('11111111-1111-1111-1111-111111111111');

    if (role === 'waiter') {
      setCurrentUserName('Али');
    } else if (role === 'owner') {
      setCurrentUserName('Рустам');
    } else {
      setCurrentUserName('Супер-админ');
    }

    try {
      await ensureSessionByRole(role);
    } catch (_error) {
      // Local fallback is already set, so ignore bootstrap errors.
    }

    navigate(route);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Выбор роли" showBack />

      <div className="p-4 max-w-md mx-auto">
        <p className="text-muted-foreground mb-6 text-center">
          Выберите роль для просмотра интерфейса
        </p>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id, role.route)}
              className="w-full bg-card border border-border hover:border-[#1a5f3f] rounded-xl p-6 transition-all active:scale-98 flex items-center gap-4"
            >
              <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                {role.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg mb-1">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
