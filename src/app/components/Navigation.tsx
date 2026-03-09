import { Home, History, BarChart3, Users, Calendar, Settings, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const waiterNav: NavItem[] = [
  { to: '/', icon: <Home size={20} />, label: 'Столы' },
];

const ownerNav: NavItem[] = [
  { to: '/owner/dashboard', icon: <BarChart3 size={20} />, label: 'Дашборд' },
  { to: '/owner/history', icon: <History size={20} />, label: 'История' },
  { to: '/owner/reports', icon: <FileText size={20} />, label: 'Отчеты' },
  { to: '/owner/staff', icon: <Users size={20} />, label: 'Персонал' },
  { to: '/owner/reservations', icon: <Calendar size={20} />, label: 'Брони' },
];

const adminNav: NavItem[] = [
  { to: '/admin', icon: <Settings size={20} />, label: 'Админ' },
];

interface NavigationProps {
  role?: 'waiter' | 'owner' | 'admin';
}

export function Navigation({ role = 'waiter' }: NavigationProps) {
  const location = useLocation();
  
  let navItems: NavItem[] = [];
  if (role === 'waiter') navItems = waiterNav;
  else if (role === 'owner') navItems = ownerNav;
  else if (role === 'admin') navItems = adminNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-border z-50 shadow-lg">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-white scale-105' 
                  : 'text-muted-foreground hover:text-[#1a5f3f] hover:bg-[#1a5f3f]/5'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a5f3f] to-[#2d8659] rounded-2xl shadow-lg" />
              )}
              <div className="relative z-10">
                {item.icon}
              </div>
              <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}