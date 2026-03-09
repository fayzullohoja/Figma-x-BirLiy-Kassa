import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

const statusConfig = {
  free: {
    label: 'Свободен',
    bgColor: 'bg-[#22c55e]',
    textColor: 'text-white',
  },
  'occupied-self': {
    label: 'Занят вами',
    bgColor: 'bg-[#3b82f6]',
    textColor: 'text-white',
  },
  'occupied-other': {
    label: 'Занят другим официантом',
    bgColor: 'bg-[#f97316]',
    textColor: 'text-white',
  },
  reserved: {
    label: 'Забронирован',
    bgColor: 'bg-[#a855f7]',
    textColor: 'text-white',
  },
};

export function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status];
  const isClickable = table.status === 'free' || table.status === 'occupied-self';

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      className={`p-4 rounded-xl border-2 transition-all min-h-[120px] flex flex-col justify-center items-center ${
        isClickable
          ? 'border-transparent hover:border-[#1a5f3f] active:scale-95'
          : 'border-transparent opacity-70 cursor-not-allowed'
      } ${config.bgColor} ${config.textColor}`}
      disabled={!isClickable}
    >
      <div className="text-2xl font-bold mb-2">Стол {table.number}</div>
      <div className="text-sm text-center">{config.label}</div>
      {table.waiter && table.status === 'occupied-other' && (
        <div className="text-xs mt-1 opacity-90">{table.waiter}</div>
      )}
      {table.reservationTime && table.status === 'reserved' && (
        <div className="text-sm mt-1 font-semibold">{table.reservationTime}</div>
      )}
    </button>
  );
}
