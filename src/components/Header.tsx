import React, { useState } from 'react';
import { ScreenType, UserProfile, Listing } from '../types';
import { toPersianDigits } from '../data/mockData';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, category?: string) => void;
  selectedCity: string;
  selectedDistrict: string;
  onOpenCityModal: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  unreadChatsCount: number;
  cartItemsCount?: number;
  onOpenCart?: () => void;
  onOpenAndroidApp?: () => void;
  selectedCategory?: string;
  isDark?: boolean;
  onToggleTheme?: () => void;
  listings?: Listing[];
  onSelectListing?: (listing: Listing) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onSwitchUserRole?: (role: 'admin1' | 'admin2' | 'regular') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  selectedCity,
  onOpenCityModal,
  user,
  onLogout,
  unreadChatsCount,
  cartItemsCount = 0,
  onOpenCart,
  onOpenAndroidApp,
  onShowToast,
  onSwitchUserRole,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Right Zone (RTL): Brand Logo & City Selector */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Logo Lockup - Avan Market (برند مدرن و اختصاصی آوان مارکت) */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-right focus:outline-none cursor-pointer"
              title="صفحه اصلی آوان مارکت"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-2 transition-all">
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl text-slate-950 tracking-tight leading-tight">
                    آوان مارکت
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
                    هوشمند
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold hidden sm:inline leading-none mt-0.5">
                  خرید و فروش بی‌واسطه کالا و خدمات
                </span>
              </div>
            </button>

            {/* City Selector Pill */}
            <button
              type="button"
              onClick={onOpenCityModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer transition-all border border-emerald-200/70 shadow-2xs group"
              title="تغییر شهر"
            >
              <span className="material-symbols-outlined text-emerald-600 text-[17px] group-hover:scale-110 transition-transform">
                location_on
              </span>
              <span className="max-w-[80px] sm:max-w-none truncate">{selectedCity}</span>
              <span className="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
            </button>
          </div>

          {/* Center Zone: Clean & Non-redundant Navigation (بدون تکرار و گزینه‌های اضافه) */}
          <nav className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
            {/* 1. Categories (یکبار فقط دسته‌بندی‌ها) */}
            <button
              onClick={() => onNavigate('categories')}
              className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'categories'
                  ? 'text-emerald-700 font-black bg-emerald-50 border border-emerald-200/80 shadow-xs'
                  : 'hover:text-emerald-700 hover:bg-slate-100/80'
              }`}
            >
              <span className="material-symbols-outlined text-[19px] text-teal-600">grid_view</span>
              <span>دسته‌بندی‌ها</span>
            </button>

            {/* 2. Showcase / Videos (یکبار فقط ویترین ویدیوها) */}
            <button
              onClick={() => onNavigate('showcase')}
              className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'showcase'
                  ? 'text-emerald-700 font-black bg-emerald-50 border border-emerald-200/80 shadow-xs'
                  : 'hover:text-emerald-700 hover:bg-slate-100/80'
              }`}
            >
              <span className="material-symbols-outlined text-[19px] text-rose-600">smart_display</span>
              <span>ویترین ویدیوها</span>
            </button>

            {/* 3. Incredible Offers (پیشنهادهای شگفت‌انگیز) */}
            <button
              onClick={() => onNavigate('home')}
              className="py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-rose-600 hover:bg-rose-50 font-bold"
            >
              <span className="material-symbols-outlined text-[19px] text-[#ef394a] animate-pulse">local_fire_department</span>
              <span>شگفت‌انگیزها</span>
            </button>
          </nav>

          {/* Left Zone: Action Tools & User Account (خلوت، مرتب و بدون دکمه‌های تکراری) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Single Chat & Messages Action Button with Unread Badge */}
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className={`relative p-2 sm:p-2.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs group ${
                currentScreen === 'chat'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-300'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80'
              }`}
              title="چت و پیام‌ها"
            >
              <span className="material-symbols-outlined text-[21px] group-hover:scale-110 transition-transform">
                chat_bubble
              </span>
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                  {toPersianDigits(unreadChatsCount)}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-full flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 transition-all cursor-pointer shadow-2xs group"
              title="سبد خرید"
            >
              <span className="material-symbols-outlined text-[21px] text-[#005c55] group-hover:scale-110 transition-transform">
                shopping_bag
              </span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                  {toPersianDigits(cartItemsCount)}
                </span>
              )}
            </button>

            {/* Android App Download Pill (Desktop only) */}
            <button
              type="button"
              onClick={() => {
                onShowToast?.('اپلیکیشن رسمی آوان مارکت به زودی در دسترس کاربران قرار می‌گیرد.', 'info');
                onOpenAndroidApp?.();
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs group"
              title="دانلود اپلیکیشن اندروید آوان مارکت"
            >
              <span className="material-symbols-outlined text-[17px] text-rose-600 group-hover:scale-110 transition-transform">
                android
              </span>
              <span>دانلود اپ</span>
            </button>

            {/* User Profile Dropdown or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-700/60 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                  title="حساب کاربری من"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 group-hover:border-teal-700/50 transition-colors"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 max-w-[85px] sm:max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-teal-700 text-[18px] transition-colors">
                    expand_more
                  </span>
                </button>

                {/* Profile menu popup */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 text-right animate-in fade-in zoom-in-95 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-extrabold text-sm text-slate-900 truncate">{user.name}</p>
                            {user.isVerified && (
                              <span className="material-symbols-outlined text-teal-700 text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                verified
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user.phone}</p>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigate('dashboard');
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[19px] text-teal-700">
                            space_dashboard
                          </span>
                          <span>داشبورد و آگهی‌های من</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenCart) onOpenCart();
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[19px] text-[#005c55]">
                              shopping_cart
                            </span>
                            <span>سبد خرید و سفارشات</span>
                          </div>
                          {cartItemsCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                              {toPersianDigits(cartItemsCount)}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onShowToast?.('اپلیکیشن رسمی آوان مارکت به زودی در دسترس کاربران قرار می‌گیرد.', 'info');
                            if (onOpenAndroidApp) onOpenAndroidApp();
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[19px] text-rose-600">
                            android
                          </span>
                          <span>دانلود و نصب اپلیکیشن آوان مارکت</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigate('chat');
                          }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[19px] text-teal-700">
                              chat_bubble
                            </span>
                            <span>پیام‌ها و گفتگوها</span>
                          </div>
                          {unreadChatsCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                              {toPersianDigits(unreadChatsCount)}
                            </span>
                          )}
                        </button>

                        {/* Admin Panel Link for Admins */}
                        {(user.role === 'admin' || user.isAdmin) && (
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-right px-4 py-2.5 text-xs font-black text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between cursor-pointer transition-colors border-y border-amber-200/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[19px] text-amber-600">
                                admin_panel_settings
                              </span>
                              <span>پنل اختصاصی مدیریت کل سایت</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">۲ ادمین مجاز</span>
                          </button>
                        )}

                        {/* Role Switcher for Owner Testing */}
                        {onSwitchUserRole && (
                          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 block mb-1.5">
                              سوئیچ نقش برای تست (سازنده سایت):
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  onSwitchUserRole('admin1');
                                }}
                                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center ${
                                  user.id === 'admin_1' || (user.isAdmin && user.phone === '۰۹۱۲۳۴۵۶۷۸۹')
                                    ? 'bg-[#005c55] text-white'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                مدیر ۱ (اصلی)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  onSwitchUserRole('admin2');
                                }}
                                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center ${
                                  user.id === 'admin_2'
                                    ? 'bg-[#005c55] text-white'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                مدیر ۲ (پشتیبانی)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  onSwitchUserRole('regular');
                                }}
                                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center ${
                                  !user.isAdmin
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                کاربر عادی
                              </button>
                            </div>
                          </div>
                        )}
                        <a
                          href="https://t.me/avan_market_support"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[19px] text-sky-600">
                            support_agent
                          </span>
                          <span>پیام به پشتیبانی آنلاین تلگرام</span>
                        </a>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-right px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                ورود / ثبت‌نام
              </button>
            )}

            {/* Post Ad Button (شاد، انرژی‌بخش و برجسته) */}
            <button
              type="button"
              onClick={() => onNavigate('post-ad')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 rounded-full bg-gradient-to-r from-rose-600 via-[#e11d48] to-rose-500 hover:opacity-95 text-white text-xs font-black shadow-md shadow-rose-600/25 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">ثبت رایگان آگهی</span>
              <span className="sm:hidden">ثبت آگهی</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
