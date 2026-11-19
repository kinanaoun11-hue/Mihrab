import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Clock,
  Compass,
  Fingerprint,
  Headphones,
  HeartHandshake,
  Home,
  X,
} from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import type { AppTab } from '../types/islamic';

interface NavigationDrawerProps {
  isOpen: boolean;
  activeTab: AppTab;
  dir: 'rtl' | 'ltr';
  onClose: () => void;
  onSelectTab: (tab: AppTab) => void;
  t: TranslationStrings;
}

const DRAWER_ROUTES: Array<{
  id: AppTab;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'home', icon: Home },
  { id: 'quran', icon: BookOpen },
  { id: 'audio', icon: Headphones },
  { id: 'prayer', icon: Clock },
  { id: 'qibla', icon: Compass },
  { id: 'adhkar', icon: HeartHandshake },
  { id: 'tasbih', icon: Fingerprint },
];

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  activeTab,
  dir,
  onClose,
  onSelectTab,
  t,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const isRtl = dir === 'rtl';
  const sidePositionClass = isRtl ? 'right-0 border-l' : 'left-0 border-r';
  const hiddenTranslateClass = isRtl ? 'translate-x-full' : '-translate-x-full';

  const drawerContent = (
    <>
      {/* Backdrop Overlay */}
      <div
        aria-hidden="true"
        data-testid="drawer-backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* GPU-Accelerated Slide-Out Navigation Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label={t.drawerTitle}
        data-testid="navigation-drawer"
        dir={dir}
        className={`fixed inset-y-0 ${sidePositionClass} z-50 flex w-[290px] max-w-[84vw] flex-col border-zinc-800/80 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : `${hiddenTranslateClass} pointer-events-none`
        }`}
      >
        <div className="flex items-center justify-between gap-3 pb-5">
          <div>
            <div className="text-lg font-bold tracking-tight text-[#F4F4F5]">{t.brandName}</div>
            <div className="text-xs text-[#71717A]">{t.drawerTitle}</div>
          </div>
          <button
            type="button"
            data-testid="drawer-close-btn"
            onClick={onClose}
            aria-label={t.closeMenuLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[#71717A] transition hover:bg-white/[0.1] hover:text-[#F4F4F5] active:scale-[0.95]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label={t.drawerTitle} className="flex-1 space-y-1.5 overflow-y-auto py-1">
          {DRAWER_ROUTES.map((route) => {
            const Icon = route.icon;
            const active = activeTab === route.id;
            const label = t.drawerItems[route.id];
            return (
              <button
                key={route.id}
                type="button"
                data-testid={`drawer-nav-${route.id}`}
                aria-current={active ? 'page' : undefined}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => onSelectTab(route.id)}
                className={`flex min-h-[48px] w-full items-center gap-3.5 rounded-2xl px-4 py-2.5 text-start text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : 'text-[#F4F4F5] hover:bg-white/[0.06]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active ? 'bg-[#10B981] text-[#0A0A0C]' : 'bg-white/[0.06] text-[#10B981]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }
  return drawerContent;
};
