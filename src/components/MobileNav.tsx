import React from 'react';
import { ScreenType } from '../types';

interface MobileNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentScreen,
  onNavigate,
  unreadCount,
}) => {
  const navItems = [
    {
      id: 'home' as ScreenType,
      label: 'خانه',
      icon: 'storefront',
    },
    {
      id: 'categories' as ScreenType,
      label: 'دسته‌ها',
      icon: 'category',
    },
    {
      id: 'post-ad' as ScreenType,
      label: 'ثبت آگهی',
      icon: 'add_circle',
      isPrimary: true,
    },
    {
      id: 'chat' as ScreenType,
      label: 'پیام‌ها',
      icon: 'chat_bubble',
      badge: unreadCount,
    },
    {
      id: 'dashboard' as ScreenType,
      label: 'حساب من',
      icon: 'person',
    },
  ];

  return (
    <nav
      aria-label="منوی موبایل"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)] transition-colors"
    >
      <div className="grid grid-cols-5 items-center h-15 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group relative cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#ba0035] text-white flex items-center justify-center shadow-md shadow-[#ba0035]/30 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <span className="text-[9px] font-bold text-[#ba0035] mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer ${
                isActive ? 'text-[#005c55] dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[21px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-[#ba0035] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
