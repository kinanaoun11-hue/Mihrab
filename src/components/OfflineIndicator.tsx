import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  message?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  message = 'وضع عدم الاتصال · يتم استخدام البيانات المحفوظة',
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-sheet-enter fixed bottom-24 start-4 z-50 flex items-center gap-2 rounded-2xl bg-[#111114]/95 px-3.5 py-2 text-xs font-medium text-[#10B981] shadow-xl backdrop-blur-md"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
