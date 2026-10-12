import React, { useState } from 'react';
import { Listing, Conversation } from '../types';
import { formatToman, toPersianDigits, numberToPersianWords } from '../data/mockData';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  conversation?: Conversation;
  onSubmitOffer: (amount: number, validity: string, note: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  listing,
  conversation,
  onSubmitOffer,
}) => {
  const [amount, setAmount] = useState<number>(Math.round(listing.price * 0.92));
  const [amountInputStr, setAmountInputStr] = useState<string>(
    formatToman(Math.round(listing.price * 0.92))
  );
  const [validity, setValidity] = useState<string>('۲۴ ساعت');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const originalPrice = listing.price;
  const difference = originalPrice - amount;
  const discountPercent =
    originalPrice > 0 ? (((originalPrice - amount) / originalPrice) * 100).toFixed(1) : '0';

  const handlePriceChange = (valStr: string) => {
    // strip non-numeric
    const rawNumber = valStr.replace(/[^\d]/g, '');
    const num = parseInt(rawNumber, 10) || 0;
    setAmount(num);
    setAmountInputStr(rawNumber ? formatToman(num) : '');
  };

  const applyPercent = (pct: number) => {
    const newPrice = Math.round(originalPrice * (1 - pct / 100));
    setAmount(newPrice);
    setAmountInputStr(formatToman(newPrice));
  };

  const addPresetNote = (preset: string) => {
    setNote((prev) => (prev ? `${prev} - ${preset}` : preset));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onSubmitOffer(amount, validity, note);
    onClose();
  };

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005c55]/10 text-[#005c55] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">local_offer</span>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900" id="modal-title">
                ارسال پیشنهاد قیمت جدید
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                پیشنهاد قیمت شما به صورت مستقیم برای طرف گفتگو ارسال شده و در چت ثبت می‌شود.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Ad Summary Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 shadow-sm">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {listing.title}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 truncate">
                <span>طرف گفتگو: {conversation?.user.name || listing.seller.name}</span>
                <span className="text-[10px] bg-[#9cf2e8]/40 text-[#005c55] px-1.5 py-0.5 rounded font-bold">
                  تایید شده
                </span>
              </div>
            </div>
            <div className="text-left shrink-0">
              <span className="text-[11px] text-slate-400 block">قیمت آگهی:</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {formatToman(originalPrice)} تومان
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                مبلغ پیشنهادی شما (تومان)*
              </label>
              {difference > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {toPersianDigits(discountPercent)}٪ تخفیف ({formatToman(difference)} تومان کمتر)
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={amountInputStr}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full text-right font-extrabold text-lg sm:text-xl text-[#005c55] bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pr-4 pl-16 focus:bg-white focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] focus:outline-none transition-all shadow-sm"
              />
              <span className="absolute left-4 text-xs font-bold text-slate-400 pointer-events-none">
                تومان
              </span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500">
                معادل:{' '}
                <strong className="text-[#005c55]">{numberToPersianWords(amount)}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAmount(0);
                  setAmountInputStr('');
                }}
                className="text-slate-400 hover:text-red-600 text-[11px] font-medium transition-colors"
              >
                پاک کردن
              </button>
            </div>
          </div>

          {/* Ready Preset Percentages */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">درصدهای پیشنهادی آماده:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[5, 8, 10, 15].map((pct) => {
                const calculated = Math.round(originalPrice * (1 - pct / 100));
                const isSelected = Math.abs(amount - calculated) < 1000;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercent(pct)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'bg-[#005c55] text-white shadow-sm font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    -{toPersianDigits(pct)}٪ ({formatToman(calculated)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validity */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-800">اعتبار زمانی این پیشنهاد:</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['۲۴ ساعت', '۴۸ ساعت', 'تا تصمیم فروشنده'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValidity(v)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center whitespace-nowrap ${
                    validity === v
                      ? 'border-[#005c55] bg-[#005c55]/10 text-[#005c55]'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Message */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                پیام یا توضیح به فروشنده (اختیاری)
              </label>
              <span className="text-[11px] text-slate-400">حداکثر ۲۰۰ حرف</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: خریدار نقد هستم و امکان تحویل فوری در سعادت‌آباد دارم..."
              rows={2}
              maxLength={200}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] focus:outline-none transition-all"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {[
                'خریدار نقدی و فوری',
                'امکان تست و تسویه در محل',
                'پرداخت آنی پس از تایید کارشناس',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => addPresetNote(chip)}
                  className="px-2.5 py-1 rounded-lg text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
              shield
            </span>
            <p className="text-[11px] leading-relaxed">
              <strong>نکته امنیتی معامله:</strong> پیشنهاد قیمت تعهد قطعی برای معامله ایجاد نمی‌کند
              و معامله تنها پس از رویت کالا و توافق نهایی رسمیت می‌یابد. از پرداخت بیعانه اکیداً خودداری فرمایید.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#005c55] text-white hover:bg-[#004741] shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>ثبت و ارسال پیشنهاد قیمت</span>
          </button>
        </div>
      </div>
    </div>
  );
};
