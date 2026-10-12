import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { toPersianDigits } from '../data/mockData';

interface FooterProps {
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowToast }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [currentDateTimeStr, setCurrentDateTimeStr] = useState<string>('');
  const [smsPhone, setSmsPhone] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          calendar: 'persian',
          numberingSystem: 'persian',
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          calendar: 'persian',
          numberingSystem: 'persian',
        };
        const dateStr = new Intl.DateTimeFormat('fa-IR', dateOptions).format(now);
        const timeStr = new Intl.DateTimeFormat('fa-IR', timeOptions).format(now);
        setCurrentDateTimeStr(`${dateStr} • ساعت ${timeStr}`);
      } catch (e) {
        setCurrentDateTimeStr('دوشنبه ۱۵ مهر ۱۴۰۵ • ساعت ۱۱:۴۵');
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      onShowToast('ایمیل شما با موفقیت در خبرنامه ثبت گردید.');
      setNewsletterEmail('');
    }
  };

  const handleCopyTelegram = () => {
    navigator.clipboard?.writeText('@bazar_mahali_support');
    onShowToast('آیدی تلگرام پشتیبانی کپی شد: @bazar_mahali_support');
  };

  return (
    <footer className="w-full bg-[#ffffff] mt-10 sm:mt-14 border-t border-slate-100 shadow-[0_-1px_8px_rgba(0,0,0,0.02)] pb-20 md:pb-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Support & Live Persian Date & Time Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-teal-50/95 via-emerald-50/90 to-cyan-50/80 border border-teal-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100/90 text-[#005c55] flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#000000]">
                  پشتیبانی آنلاین و تلگرام:
                </span>
                <a
                  href="https://t.me/bazar_mahali_support"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs sm:text-sm font-extrabold text-[#005c55] bg-white/90 px-2.5 py-1 rounded-xl border border-teal-200/80 hover:bg-teal-50 transition-colors dir-ltr shadow-2xs"
                >
                  @bazar_mahali_support
                </a>
                <button
                  type="button"
                  onClick={handleCopyTelegram}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="کپی آیدی تلگرام"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                پاسخگویی سریع ۲۴ ساعته در ۷ روز هفته
              </span>
            </div>
          </div>
        </div>

        {/* Gorgeous App Download Showcase Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-br from-[#004741] via-[#005c55] to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Decorative background glows */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col / QR & App Preview */}
            <div className="lg:col-span-4 flex flex-col items-center text-center bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-inner">
              <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-md mb-3 flex items-center justify-center relative group cursor-pointer" onClick={() => setShowQrModal(true)}>
                {/* Visual QR Code Representation */}
                <div className="w-full h-full bg-slate-900 rounded-xl p-2 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-4 border-teal-400 rounded-sm"></div>
                    <div className="w-6 h-6 border-4 border-teal-400 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl animate-pulse">qr_code_scanner</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-4 border-teal-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-teal-300 rounded-xs self-end"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold">
                  کلیک جهت بزرگنمایی
                </div>
              </div>
              <span className="text-xs font-bold text-rose-200">اسکن با دوربین موبایل</span>
              <span className="text-[11px] text-slate-200 mt-0.5">دانلود آنی نسخه ۲.۴ آوان مارکت</span>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>تایید شده توسط گوگل‌پلی پروتکت</span>
              </div>
            </div>

            {/* Right Col / App Features & Download Buttons */}
            <div className="lg:col-span-8 flex flex-col text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm self-start mb-2 text-xs font-bold text-rose-200 border border-white/10">
                <span className="material-symbols-outlined text-[16px]">install_mobile</span>
                <span>اپلیکیشن رسمی و هوشمند آوان مارکت</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                تجربه‌ای سریع‌تر، امن‌تر و همیشه همراه در گوشی شما
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-300 text-[20px]">notifications_active</span>
                  <span className="text-xs font-bold">اعلان فوری چت و پیشنهادها</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-300 text-[20px]">speed</span>
                  <span className="text-xs font-bold">بدون فیلتر و مصرف نیم‌بها</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-300 text-[20px]">near_me</span>
                  <span className="text-xs font-bold">جستجوی دقیق روی نقشه محله</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Android APK Button */}
                <button
                  type="button"
                  onClick={() => onShowToast('دانلود فایل مستقیم اندروید (APK) آغاز شد.', 'success')}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-teal-50 transition-all font-bold shadow-md cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[24px] text-emerald-600 group-hover:scale-110 transition-transform">
                    android
                  </span>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500">دانلود مستقیم (۲۴ مگابایت)</span>
                    <span className="text-xs font-extrabold text-slate-900">نسخه اندروید APK</span>
                  </div>
                </button>

                {/* iPhone iOS PWA Button */}
                <button
                  type="button"
                  onClick={() => setShowIosGuide(true)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white hover:bg-slate-950 border border-white/20 transition-all font-bold shadow-md cursor-pointer group"
                >
                  <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.1-1.9-14.24-6.08-3.59-2.92-7.5-7.66-11.74-14.21-6.1-9.45-10.9-19.88-14.4-31.3-3.5-11.41-5.25-22.37-5.25-32.88 0-14.65 3.8-26.4 11.4-35.26 7.6-8.86 17.1-13.36 28.5-13.36 4.78 0 10.03 1.22 15.75 3.66 5.72 2.44 9.5 3.66 11.34 3.66 1.74 0 5.64-1.28 11.7-3.83 6.06-2.55 11.45-3.75 16.17-3.6 15.22.43 27.28 5.48 36.19 15.15-13.39 8.16-19.95 19.37-19.68 33.62.27 11.66 4.7 21.07 13.29 28.24 8.59 7.17 18.79 11.03 30.6 11.58-2.61 7.64-6.22 15.13-10.83 22.47zM119.22 31.83c0-7.85 2.87-15.14 8.61-21.87 5.74-6.73 13.06-10.59 21.96-11.58.11 1.09.16 2.07.16 2.94 0 7.41-2.9 14.8-8.7 22.17-5.8 7.37-13.08 11.47-21.84 12.3-0.08-.98-.19-2.06-.19-3.96z"/>
                  </svg>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-300">نسخه وب‌اپ پیشرفته (PWA)</span>
                    <span className="text-xs font-extrabold text-white">ویژه آیفون و آیپد (iOS)</span>
                  </div>
                </button>

                {/* Cafe Bazaar / Myket Button */}
                <button
                  type="button"
                  onClick={() => onShowToast('لینک کافه‌بازار و مایکت باز شد.')}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px] text-amber-300">shopping_bag</span>
                  <span>کافه‌بازار و مایکت</span>
                </button>
              </div>

              {/* SMS Download Link Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!smsPhone.trim()) {
                    onShowToast('لطفاً شماره تلفن همراه را وارد فرمایید.');
                    return;
                  }
                  setIsSendingSms(true);
                  setTimeout(() => {
                    setIsSendingSms(false);
                    onShowToast(`لینک مستقیم دانلود اپلیکیشن به شماره ${smsPhone} پیامک شد.`, 'success');
                    setSmsPhone('');
                  }, 600);
                }}
                className="flex flex-col sm:flex-row items-center gap-2 max-w-lg"
              >
                <div className="relative w-full">
                  <input
                    type="tel"
                    placeholder="ارسال پیامکی لینک دانلود (مثال: ۰۹۱۲...)"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSendingSms ? 'در حال ارسال...' : 'ارسال لینک'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Column 1: Brand & Newsletter */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ef394a] to-[#ff6b81] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <span className="font-extrabold text-lg text-slate-900">آوان مارکت</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              سامانه پرانرژی، امن، بی‌واسطه و مدرن تبادل مستقیم کالا و خدمات در محله‌ها و شهرهای سراسر کشور با کارمزد صفر.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-1.5 mt-1">
              <span className="text-xs font-bold text-slate-700">عضویت در خبرنامه تخفیف‌ها:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="ایمیل خود را بنویسید..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005c55]"
                />
                <button
                  type="submit"
                  className="bg-[#005c55] text-white hover:bg-[#004741] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  ثبت
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Popular Categories */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-sm text-slate-900">
              دسته‌بندی‌های برگزیده
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <button
                onClick={() => onNavigate('categories')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                املاک و مستغلات مسکونی
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                وسایل نقلیه، خودرو و قطعات
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                کالای دیجیتال، موبایل و لپ‌تاپ
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                صنوف و خدمات تخصصی محله
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                لوازم خانگی و دکوراسیون
              </button>
            </div>
          </div>

          {/* Column 3: Customer Guide */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-sm text-slate-900">
              راهنما و پشتیبانی
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <button
                onClick={() => onShowToast('پشتیبانی تلگرام ۲۴ ساعته: @bazar_mahali_support')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer flex items-center gap-1 font-bold text-teal-800"
              >
                <span className="material-symbols-outlined text-[16px]">headset_mic</span>
                <span>پشتیبانی تلگرام (@bazar_mahali_support)</span>
              </button>
              <button
                onClick={() => onShowToast('راهنمای معامله امن و احراز هویت شاهکار')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                راهنمای خرید امن و عدم پرداخت بیعانه
              </button>
              <button
                onClick={() => onShowToast('قوانین و حریم خصوصی سامانه')}
                className="text-right hover:text-[#005c55] transition-colors cursor-pointer"
              >
                قوانین، مقررات و حریم خصوصی
              </button>
              <button
                onClick={() => onShowToast('درباره ما: سامانه سراسری آوان مارکت')}
                className="text-right hover:text-rose-600 transition-colors cursor-pointer"
              >
                درباره سامانه آوان مارکت
              </button>
            </div>
          </div>

          {/* Column 4: Trust & Fast App Download */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-sm text-slate-900">
              اعتبار و مجوزهای قانونی
            </span>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 flex-1">
                <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified_user</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">اینماد رسمی</span>
                  <span className="text-[10px] text-slate-400">نماد اعتماد الکترونیکی</span>
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 flex-1">
                <span className="material-symbols-outlined text-rose-600 text-[24px]">security</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">سامانه ساماندهی</span>
                  <span className="text-[10px] text-slate-400">وزارت صمت و ارشاد</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تمامی خدمات این سامانه بر اساس قوانین جاری تجارت الکترونیک جمهوری اسلامی ایران می‌باشد.
            </p>
          </div>
        </div>

        {/* Bottom copyright & live date/time row */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p className="text-center sm:text-right font-medium">
            تمامی حقوق محفوظ است © سامانه هوشمند آوان مارکت ایران
          </p>

          {/* Live Date and Time Widget (شیک و مشخص در فوتر بدون بولد بودن افراطی) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs">
            <span className="material-symbols-outlined text-[15px] text-rose-600 animate-pulse">
              schedule
            </span>
            <span>{currentDateTimeStr || 'ساعت رسمی و تقویم ایران'}</span>
          </div>

          <div className="flex items-center gap-3 font-medium flex-wrap">
            <a
              href="https://t.me/avan_market_bot"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-sky-700"
            >
              <span>ربات رسمی:</span>
              <strong className="font-mono dir-ltr">@bazar_mahali_bot</strong>
            </a>
            <span>•</span>
            <span>پشتیبانی: <strong className="font-mono text-[#005c55]">@bazar_mahali_support</strong></span>
          </div>
        </div>
      </div>

      {/* MODAL: iOS Safari PWA Installation Guide */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-right shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-slate-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.1-1.9-14.24-6.08-3.59-2.92-7.5-7.66-11.74-14.21-6.1-9.45-10.9-19.88-14.4-31.3-3.5-11.41-5.25-22.37-5.25-32.88 0-14.65 3.8-26.4 11.4-35.26 7.6-8.86 17.1-13.36 28.5-13.36 4.78 0 10.03 1.22 15.75 3.66 5.72 2.44 9.5 3.66 11.34 3.66 1.74 0 5.64-1.28 11.7-3.83 6.06-2.55 11.45-3.75 16.17-3.6 15.22.43 27.28 5.48 36.19 15.15-13.39 8.16-19.95 19.37-19.68 33.62.27 11.66 4.7 21.07 13.29 28.24 8.59 7.17 18.79 11.03 30.6 11.58-2.61 7.64-6.22 15.13-10.83 22.47zM119.22 31.83c0-7.85 2.87-15.14 8.61-21.87 5.74-6.73 13.06-10.59 21.96-11.58.11 1.09.16 2.07.16 2.94 0 7.41-2.9 14.8-8.7 22.17-5.8 7.37-13.08 11.47-21.84 12.3-0.08-.98-.19-2.06-.19-3.96z"/>
                </svg>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">راهنمای نصب ۳ ثانیه‌ای در آیفون (iOS)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#005c55] text-white flex items-center justify-center font-bold text-xs shrink-0">۱</span>
                <p>در مرورگر سافاری گوشی آیفون، روی دکمه <strong>Share</strong> (مربع با فلش رو به بالا) کلیک فرمایید.</p>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#005c55] text-white flex items-center justify-center font-bold text-xs shrink-0">۲</span>
                <p>منو را کمی پایین کشیده و گزینه <strong>Add to Home Screen</strong> (افزودن به صفحه اصلی) را انتخاب کنید.</p>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#005c55] text-white flex items-center justify-center font-bold text-xs shrink-0">۳</span>
                <p>در گوشه بالا دکمه <strong>Add</strong> را لمس کنید تا آیکون برنامه در صفحه گوشی شما بدون فیلتر قرار گیرد.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIosGuide(false);
                onShowToast('آیکون برنامه آماده افزودن به صفحه اصلی آیفون است.', 'success');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#005c55] text-white font-bold text-xs hover:bg-[#004741] transition-colors"
            >
              متوجه شدم، تشکر
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Large QR Code Preview */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in" onClick={() => setShowQrModal(false)}>
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">اسکن مستقیم جهت نصب</h3>
            <p className="text-xs text-slate-500 mb-4">دوربین گوشی خود را روبه‌روی بارکد بگیرید</p>
            <div className="w-52 h-52 mx-auto bg-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-teal-400 rounded-sm"></div>
                <div className="w-10 h-10 border-4 border-teal-400 rounded-sm"></div>
              </div>
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl animate-pulse">qr_code_2</span>
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-teal-400 rounded-sm"></div>
                <div className="w-5 h-5 bg-teal-300 rounded-xs self-end"></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
