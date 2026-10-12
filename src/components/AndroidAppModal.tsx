import React, { useState } from 'react';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'ios'>('apk');

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    onShowToast('اپلیکیشن رسمی آوان مارکت به زودی در دسترس کاربران قرار می‌گیرد.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 text-right">
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 rounded-3xl sm:rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-white/60 dark:border-slate-700 backdrop-blur-2xl overflow-hidden flex flex-col">
        
        {/* Header Hero Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-tr from-rose-700 via-rose-600 to-amber-500 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                <span className="material-symbols-outlined text-[32px] text-amber-200">android</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">اپلیکیشن رسمی آوان مارکت</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
                    به زودی
                  </span>
                </div>
                <p className="text-xs text-rose-100/90 mt-1">
                  اپلیکیشن رسمی آوان مارکت به زودی در دسترس کاربران قرار می‌گیرد.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Selection: APK / WebApp PWA / iOS */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 bg-slate-50/70 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-700 text-[#005c55] dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">apk_install</span>
            <span>دانلود مستقیم APK</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-700 text-[#005c55] dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span>وب‌اپلیکیشن (PWA)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-700 text-[#005c55] dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
            <span>آیفون (iOS)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {activeTab === 'apk' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
                <div className="leading-relaxed">
                  <strong>دانلود فایل نصبی مستقیم اندروید (APK):</strong>
                  <p className="text-[11px] mt-0.5 text-emerald-800 dark:text-emerald-300">
                    سازگار با تمامی گوشی‌ها و تبلت‌های اندروید (سامسونگ، شیائومی، هواوی و...) با حجم تقریبی ۱۲ مگابایت.
                  </p>
                </div>
              </div>

              {/* App Key Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">notifications_active</span>
                  <span>اعلان پیام و استعلام مشتری</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">bolt</span>
                  <span>سرعت لودینگ تا ۵ برابر سریع‌تر</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">vpn_key_off</span>
                  <span>بدون فیلتر با سرورهای ملی</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">wifi_off</span>
                  <span>پشتیبانی از حالت آفلاین PWA</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadApk}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>اپلیکیشن رسمی آوان مارکت (به زودی در دسترس قرار می‌گیرد)</span>
              </button>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="flex flex-col gap-3 leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                وب‌اپلیکیشن پیش‌رونده (PWA) آوان مارکت بدون نیاز به دانلود مستقیم از گوگل‌پلی یا بازار، مستقیماً روی صفحه اصلی گوشی شما نصب می‌شود.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <span className="font-bold text-slate-900 dark:text-white">نحوه نصب در مرورگر کروم اندروید:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>منوی ۳ نقطه بالای مرورگر کروم را لمس کنید.</li>
                  <li>گزینه <strong>«افزودن به صفحه اصلی» (Install App / Add to Home)</strong> را انتخاب نمایید.</li>
                  <li>آیکون آوان مارکت بلافاصله در لیست برنامه‌های گوشی شما قرار می‌گیرد.</li>
                </ol>
              </div>
              <button
                type="button"
                onClick={() => {
                  onShowToast('درخواست نصب وب‌اپلیکیشن به مرورگر ارسال شد.', 'success');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs cursor-pointer shadow-md"
              >
                نصب آنی روی صفحه اصلی گوشی (PWA)
              </button>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="flex flex-col gap-3 leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <span className="font-bold text-slate-900 dark:text-white">نصب آسان روی آیفون و آیپد (Safari):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>در مرورگر سافاری، دکمه <strong>اشتراک‌گذاری (Share ⬆️)</strong> در پایین صفحه را لمس کنید.</li>
                  <li>صفحه را کمی به پایین بکشید و گزینه <strong>Add to Home Screen (➕)</strong> را انتخاب کنید.</li>
                  <li>در گوشه بالا دکمه <strong>Add</strong> را بزنید.</li>
                </ol>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                نسخه وب‌اپلیکیشن آیفون با طراحی مات شیشه‌ای iOS 27 کاملاً سازگار است.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
          <span className="text-slate-400">پشتیبانی تلگرام: @bazar_mahali_support</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
