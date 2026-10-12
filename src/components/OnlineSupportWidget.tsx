import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  FolderKanban,
  Headphones,
  Move,
  ChevronDown,
} from 'lucide-react';
import { toPersianDigits } from '../data/mockData';

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  text: string;
  time: string;
  avatar?: string;
  attachments?: string[];
  quickActions?: {
    label: string;
    action: () => void;
  }[];
}

interface OnlineSupportWidgetProps {
  userName?: string;
  userPhone?: string;
  isAdmin?: boolean;
  onNavigateToAdmin?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const OnlineSupportWidget: React.FC<OnlineSupportWidgetProps> = ({
  userName = 'کاربر گرامی',
  userPhone = '۰۹۱۲***۶۷۸۹',
  isAdmin = false,
  onNavigateToAdmin,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Position state (offsets from default bottom-left anchor)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    hasMoved: boolean;
    startTime: number;
  }>({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    hasMoved: false,
    startTime: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y,
      hasMoved: false,
      startTime: Date.now(),
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Movement threshold for drag vs click
    if (Math.hypot(deltaX, deltaY) > 5) {
      if (!isDragging) setIsDragging(true);
      dragRef.current.hasMoved = true;

      // Keep within comfortable bounds on screen
      const nextX = dragRef.current.initialOffsetX + deltaX;
      const nextY = dragRef.current.initialOffsetY + deltaY;

      // Bound clamps so widget cannot be pushed out of window
      const maxClampX = typeof window !== 'undefined' ? window.innerWidth - 80 : 400;
      const maxClampY = typeof window !== 'undefined' ? window.innerHeight - 80 : 600;

      const clampedX = Math.max(-20, Math.min(nextX, maxClampX));
      const clampedY = Math.max(-maxClampY + 100, Math.min(nextY, 60));

      setOffset({ x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    const elapsed = Date.now() - dragRef.current.startTime;

    // If tapped/clicked without substantial dragging
    if (!dragRef.current.hasMoved || elapsed < 250) {
      setIsOpen((prev) => !prev);
    }
  };

  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'admin',
      text: `سلام ${userName} عزیز! به پشتیبانی آنلاین و ۲۴ ساعته آوان مارکت خوش آمدید. 👋\nچطور می‌تونم کمکتون کنم؟ (مشکل در ثبت آگهی، ویرایش تصاویر، پیگیری اشتراک VIP یا سوال درباره خرید)`,
      time: 'هم‌اکنون',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadBadge(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: SupportChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Dynamic Admin Intelligent Response
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'پیام شما دریافت شد. همکاران پشتیبانی به زودی پاسخ خواهند داد.';

      if (text.includes('آپلود') || text.includes('عکس') || text.includes('تصویر')) {
        replyText = 'در صورتی که در آپلود تصاویر آگهی با مشکل مواجه شدید، مطمئن شوید حجم هر عکس کمتر از ۱۰ مگابایت بوده و فرمت‌های JPG یا PNG باشند. همچنین از اتصال اینترنت خود اطمینان حاصل فرمایید.';
      } else if (text.includes('ویرایش') || text.includes('مشخصات') || text.includes('قیمت')) {
        replyText = 'برای ویرایش آگهی، از منوی بالا یا تب «حساب من»، وارد بخش «آگهی‌های من» شوید و دکمه ویرایش (آیکون مداد) را انتخاب کنید.';
      } else if (text.includes('vip') || text.includes('الماس') || text.includes('طلایی') || text.includes('اشتراک')) {
        replyText = 'پلن‌های ویژه VIP (الماس و طلایی) بلافاصله پس از پرداخت فعال شده و آگهی شما را در صدر نتایج با نشان مخصوص و گارانتی نمایش می‌دهند.';
      } else if (text.includes('تخفیف') || text.includes('کد')) {
        replyText = '🎉 یک کد تخفیف اختصاصی برای شما: «BAZAR-VIP20» با ۲۰٪ تخفیف برای ارتقای آگهی‌ها یا بسته‌های ویژه!';
      } else if (text.includes('سلام') || text.includes('درود')) {
        replyText = `سلام مجدد ${userName} عزیز! در خدمت شما هستیم. اگر هرگونه راهنمایی در معامله یا ثبت آگهی نیاز دارید بفرمایید.`;
      }

      const adminReply: SupportChatMessage = {
        id: `admin_${Date.now()}`,
        sender: 'admin',
        text: replyText,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };

      setMessages((prev) => [...prev, adminReply]);
      if (!isOpen) {
        setUnreadBadge((prev) => prev + 1);
      }
    }, 1100);
  };

  const quickQuestions = [
    'مشکل در ویرایش مشخصات آگهی دارم',
    'تصاویر آگهی من آپلود نمی‌شود',
    'درخواست فعال‌سازی دستی اشتراک VIP',
    'دریافت کد تخفیف اختصاصی',
  ];

  return (
    <>
      {/*
        Circular Floating Chat Support Launcher (دایره کامل، اندازه استاندارد و خوش‌دست، انیمیشن ضربان ملایم، قابل تکان دادن و جابه‌جایی آزاد)
        Default position on mobile: bottom-[76px] (above MobileNav), left-4
        Default position on desktop: bottom-6, left-6
      */}
      <div
        className="fixed bottom-[76px] sm:bottom-6 left-4 sm:left-6 z-50 touch-none select-none"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {!isOpen ? (
          <div className="relative group cursor-grab active:cursor-grabbing">
            {/* Outer Pulsing Wave Rings (انیمیشن ضربان ملایم و جذاب آوان مارکت) */}
            <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#ba0035] via-[#ef394a] to-[#ff4757] opacity-65 animate-digi-ripple pointer-events-none" />
            <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#ef394a] via-[#ff5263] to-amber-400 opacity-50 animate-digi-ripple-delayed pointer-events-none" />

            {/* Core Circular Button (دایره کامل، شیک، اندازه استاندارد ~۵۲ پیکسل) */}
            <button
              type="button"
              className="relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-gradient-to-tr from-[#ba0035] via-[#e02030] to-[#ff4757] text-white flex items-center justify-center shadow-digi-glow ring-2 ring-white/90 dark:ring-slate-900/90 transition-transform duration-200 group-hover:scale-105 active:scale-95 focus:outline-none"
              title="پشتیبانی آنلاین ادمین (یک کلیک: باز کردن | نگه داشتن: جابه‌جایی)"
              aria-label="پشتیبانی آنلاین ادمین"
            >
              {/* Inner Gloss / Specular Lighting */}
              <span className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/30 blur-[1px] pointer-events-none" />

              {/* Icon Lockup: Clean Chat / Headphones / Folder icon */}
              <div className="relative flex items-center justify-center">
                <MessageCircle className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-white fill-white/15 stroke-[2.2]" />
              </div>

              {/* Online Green Indicator Dot */}
              <span className="absolute bottom-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
              </span>

              {/* Unread Message Badge */}
              {unreadBadge > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-slate-950 text-[10px] font-black text-rose-300 border-2 border-white dark:border-slate-900 shadow-md animate-bounce">
                  {toPersianDigits(unreadBadge)}
                </span>
              )}
            </button>

            {/* Subtle Drag Hint Indicator Tooltip on Hover */}
            <div className="absolute right-full ml-0 mr-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 text-white text-[10px] font-bold whitespace-nowrap shadow-xl border border-white/10 pointer-events-none backdrop-blur-md">
              <Move className="w-3 h-3 text-rose-400" />
              <span>پشتیبانی آنلاین (کلیک: باز کردن | نگه داشتن: حرکت)</span>
            </div>
          </div>
        ) : (
          /* Close Circle Button when chat is opened */
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-slate-950 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-rose-500/80 ring-2 ring-white/80 group"
            title="بستن چت پشتیبانی"
          >
            <X className="w-6 h-6 text-slate-100 group-hover:text-rose-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Support Chat Popup Modal (Docked cleanly in viewport) */}
      {isOpen && (
        <div
          className="fixed bottom-[80px] sm:bottom-24 left-3 right-3 sm:right-auto sm:left-6 z-50 sm:w-[390px] h-[500px] max-h-[75vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-right"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-[#ba0035] to-[#ef394a] text-white flex items-center justify-between shrink-0 shadow-md border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-inner border border-white/20">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 ring-1 ring-emerald-500" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>پشتیبانی آنلاین ادمین</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-medium">۲۴/۷</span>
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>پاسخگویی سریع کمتر از ۱ دقیقه</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isAdmin && onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToAdmin();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-black transition-colors flex items-center gap-1 cursor-pointer"
                  title="ورود به داشبورد مدیریت و ادمین سایت"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>پنل ادمین</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Quick Problem Shortcuts Banner */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">سوالات رایج:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-rose-400 hover:text-rose-600 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <img
                      src={msg.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt="Admin"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#ba0035] to-[#ef394a] text-white rounded-bl-xs shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-br-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-left ${
                        isUser ? 'text-rose-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse delay-150" />
                <span className="text-[11px] font-semibold text-slate-500">ادمین در حال تایپ پاسخ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Telegram Alternative Link */}
          <div className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 border-t border-sky-100 dark:border-sky-900 flex items-center justify-between text-[11px] text-sky-800 dark:text-sky-200 shrink-0">
            <span>گفتگو در تلگرام با ادمین:</span>
            <a
              href="https://t.me/bazar_mahali_support"
              target="_blank"
              rel="noreferrer"
              className="font-black text-sky-700 hover:underline flex items-center gap-1"
            >
              <span>@bazar_mahali_support</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          </div>

          {/* Input Footer */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="پیام خود را برای پشتیبانی بنویسید..."
              className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 border border-transparent focus:border-rose-500"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ba0035] to-[#ef394a] hover:brightness-110 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
              title="ارسال پیام"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
