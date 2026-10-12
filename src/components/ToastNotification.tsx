import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-[#005c55] text-white',
    info: 'bg-[#131b2e] text-white',
    warning: 'bg-[#ba0035] text-white',
  };

  const icons = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 animate-bounce sm:animate-none max-w-sm w-[90%] sm:w-auto text-sm justify-between backdrop-blur-md bg-opacity-95 text-center">
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full ${bgColors[type]}`}>
        <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
        <span className="font-medium flex-1 text-right">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-lg"
          aria-label="بستن"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
