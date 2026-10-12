import React, { useState } from 'react';
import { Listing, PromoPackage } from '../types';
import { formatToman, toPersianDigits } from '../data/mockData';

interface LadderPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  walletBalance: number;
  onApplyPromo: (packageTitle: string, finalCost: number, discountApplied: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenWallet: () => void;
}

export const ladderPackages: PromoPackage[] = [
  {
    id: 'sub_vip_activation',
    title: 'پکیج جامع فعال‌سازی ویژه و نشان طلایی VIP (۳۰ روزه)',
    subtitle: 'بالاترین اولویت در صدر آگهی‌ها، ۳۰ نردبان هوشمند هفتگی و نشان فروشنده معتبر',
    count: 30,
    durationDays: 30,
    durationTitle: '۱ ماهه (۳۰ روز)',
    originalPrice: 490000,
    discountedPrice: 340000,
    discountPercent: 30,
    badge: '🌟 پکیج انحصاری فعال‌سازی',
    popular: true,
    features: [
      'اعطای نشان تاییدیه طلایی فروشنده معتبر روی تمامی آگهی‌ها',
      'بالاترین اولویت قطعی در صدر نتایج جستجو و دسته‌بندی‌های محلی',
      '۳۰ بار نردبان خودکار هوشمند در ساعات اوج ترافیک شبانه (۱۹ تا ۲۳)',
      'ثبت و انتشار نامحدود آگهی و ویدیوهای ریلز بدون کارمزد',
      'فعال‌سازی و تحویل فوری کد لایسنس از طریق ربات تلگرام @bazar_mahali_bot',
    ],
  },
];

export const LadderPromoModal: React.FC<LadderPromoModalProps> = ({
  isOpen,
  onClose,
  listing,
  walletBalance,
  onApplyPromo,
  onShowToast,
  onOpenWallet,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>('sub_vip_activation');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponAppliedMessage, setCouponAppliedMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'gateway'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedPkg = ladderPackages.find((p) => p.id === selectedPkgId) || ladderPackages[1];

  // Calculate final cost with package base discount + additional coupon code
  const basePrice = selectedPkg.discountedPrice;
  const couponDiscountAmount = couponDiscountPercent > 0 ? Math.round((basePrice * couponDiscountPercent) / 100) : 0;
  const finalPayable = Math.max(0, basePrice - couponDiscountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'BAZAR50' || code === 'NOROOZ50') {
      setCouponDiscountPercent(50);
      setCouponAppliedMessage('کد تخفیف ۵۰٪ شگفت‌انگیز اعمال شد!');
      onShowToast('کد تخفیف ۵۰٪ با موفقیت فعال شد.', 'success');
    } else if (code === 'BAZAR30' || code === 'TAKHFIF30' || code === 'LADDER30') {
      setCouponDiscountPercent(30);
      setCouponAppliedMessage('کد تخفیف ۳۰٪ ویژه نردبان اعمال شد.');
      onShowToast('کد تخفیف ۳۰٪ اعمال گردید.', 'success');
    } else if (code === 'VIP20' || code === 'OFF20') {
      setCouponDiscountPercent(20);
      setCouponAppliedMessage('کد تخفیف ۲۰٪ فعال شد.');
      onShowToast('کد تخفیف ۲۰٪ اعمال شد.', 'success');
    } else {
      setCouponDiscountPercent(0);
      setCouponAppliedMessage(null);
      onShowToast('کد تخفیف وارد شده معتبر یا فعال نمی‌باشد.', 'warning');
    }
  };

  const handleConfirmPurchase = () => {
    if (paymentMethod === 'wallet' && walletBalance < finalPayable) {
      onShowToast('موجودی کیف پول شما برای این بسته کافی نیست. لطفاً کیف پول را شارژ نمایید.', 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onApplyPromo(
        selectedPkg.title,
        finalPayable,
        (selectedPkg.originalPrice - selectedPkg.discountedPrice) + couponDiscountAmount
      );
      onShowToast(`پکیج «${selectedPkg.title}» با موفقیت برای آگهی اعمال گردید!`, 'success');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-950 via-[#ba0035] to-[#9e002d] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">پکیج‌های تخفیف‌دار نردبان و ارتقای آگهی</h3>
              <p className="text-xs text-red-100/90 truncate max-w-md">ارتقای فوری «{listing.title}»</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Package List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">یک پکیج تخفیف نردبان را انتخاب نمایید:</span>
            <span className="text-slate-500">موجودی کیف پول: <strong className="text-[#005c55] font-extrabold">{formatToman(walletBalance)} تومان</strong></span>
          </div>

          {/* Packages List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ladderPackages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#ba0035] bg-red-50/40 shadow-md ring-1 ring-[#ba0035]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#ba0035] text-white text-[10px] font-extrabold shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#ba0035] bg-[#ba0035]' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{pkg.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{pkg.subtitle}</p>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1 my-1">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">check_small</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    {pkg.discountPercent > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-400 line-through">{formatToman(pkg.originalPrice)}</span>
                        <span className="text-base font-extrabold text-[#ba0035]">{formatToman(pkg.discountedPrice)} تومان</span>
                      </div>
                    ) : (
                      <span className="text-base font-extrabold text-slate-900">{formatToman(pkg.originalPrice)} تومان</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">sell</span>
              <span>کد تخفیف اختصاصی نردبان داری؟</span>
            </label>
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="کد تخفیف (مثال: BAZAR50 یا NOROOZ50)..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider text-slate-900 focus:outline-none focus:border-[#ba0035]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                اعمال تخفیف
              </button>
            </form>
            {couponAppliedMessage && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{couponAppliedMessage}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>کدهای فعال تستی:</span>
              <button
                type="button"
                onClick={() => setCouponCode('BAZAR50')}
                className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700 font-mono hover:border-slate-400"
              >
                BAZAR50 (۵۰٪)
              </button>
              <button
                type="button"
                onClick={() => setCouponCode('LADDER30')}
                className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700 font-mono hover:border-slate-400"
              >
                LADDER30 (۳۰٪)
              </button>
            </div>
          </div>

          {/* Payment Method Selector & Telegram Bot Link */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-800">روش خرید و فعال‌سازی اشتراک VIP و نردبان:</span>
            
            {/* Telegram Bot Direct Link Banner */}
            <a
              href={`https://t.me/bazar_mahali_bot?start=${selectedPkg.id}`}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 text-white font-extrabold text-xs flex items-center justify-between gap-3 transition-all hover:opacity-95 shadow-lg group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-black text-white">خرید و فعال‌سازی پکیج «{selectedPkg.title}» از ربات تلگرام</span>
                  <span className="text-xs text-sky-100 font-bold">ربات تلگرام رسمی: @bazar_mahali_bot</span>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-white text-sky-950 text-xs font-black shrink-0 shadow-md flex items-center gap-1.5 group-hover:bg-sky-50 transition-colors">
                <span>ورود به ربات</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </span>
            </a>
          </div>
        </div>

        {/* Footer Summary & Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">مبلغ پکیج انتخاب شده:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#005c55]">{formatToman(finalPayable)}</span>
              <span className="text-xs font-bold text-slate-600">تومان</span>
              {selectedPkg.originalPrice > finalPayable && (
                <span className="text-xs text-emerald-700 font-bold mr-2">
                  (سود شما: {formatToman(selectedPkg.originalPrice - finalPayable)} تومان)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            >
              بستن پنجره
            </button>
            <button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isProcessing ? 'در حال فعال‌سازی...' : 'فعال‌سازی فوری پکیج روی آگهی'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
