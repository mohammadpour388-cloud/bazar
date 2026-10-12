import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDark,
  onToggle,
  className = '',
  showLabel = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
      title={isDark ? 'حالت روشن (روز)' : 'حالت تاریک (شب)'}
      className={`relative inline-flex items-center gap-1.5 p-1 rounded-full transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-inner'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 shadow-xs'
      } ${className}`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-indigo-900 to-slate-800 text-amber-300 shadow-md transform rotate-0'
            : 'bg-white text-amber-500 shadow-xs transform rotate-180'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
      {showLabel && (
        <span className="text-[11px] font-bold px-1.5 text-slate-600 dark:text-slate-300 select-none">
          {isDark ? 'حالت شب' : 'حالت روز'}
        </span>
      )}
    </button>
  );
};
