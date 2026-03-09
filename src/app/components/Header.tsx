import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function Header({ title, showBack = false, backButton = false, onBack, action }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const shouldShowBack = showBack || backButton;

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-border z-40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto">
        {shouldShowBack ? (
          <button
            onClick={handleBack}
            className="p-2.5 -ml-2 hover:bg-[#1a5f3f]/10 rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft size={22} className="text-[#1a5f3f]" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        <div className="w-9 flex justify-end">{action}</div>
      </div>
    </header>
  );
}