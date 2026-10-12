import React, { useState } from 'react';
import { WalletTransaction, UserProfile } from '../types';
import { formatToman, numberToPersianWords, toPersianDigits } from '../data/mockData';
import { BankPaymentGatewayModal } from './BankPaymentGatewayModal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  walletBalance: number;
  onDeposit: (amount: number, description?: string) => void;
  onUpdateUser?: (user: any) => void;
  transactions: WalletTransaction[];
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  walletBalance,
  onDeposit,
  onUpdateUser,
  transactions,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [customAmount, setCustomAmount] = useState<number>(100000);
  const [amountInputStr, setAmountInputStr] = useState<string>('۱۰۰,۰۰۰');
  const [selectedGateway, setSelectedGateway] = useState<'shaparak' | 'zarinpal' | 'mellat'>('shaparak');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [isCreatingTx, setIsCreatingTx] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [
    100000,
    250000,
    500000,
    1000000,
    2000000,
    5000000,
  ];

  const handleQuickAmount = (val: number) => {
    setCustomAmount(val);
    setAmountInputStr(formatToman(val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^\d]/g, '');
    const num = parseInt(rawDigits, 10) || 0;
    setCustomAmount(num);
    setAmountInputStr(rawDigits ? formatToman(num) : '');
  };

  const handleStartDepositPayment = async () => {
    if (customAmount < 10000) {
      onShowToast('حداقل مبلغ شارژ کیف پول ۱۰,۰۰۰ تومان می‌باشد.', 'warning');
      return;
    }

    setIsCreatingTx(true);
    const gatewayName = selectedGateway === 'shaparak' ? 'شاپرک' : selectedGateway === 'zarinpal' ? 'زرین‌پال' : 'به‌پرداخت ملت';

    try {
      // 1. Create Transaction on Backend DB with status = 'pending'
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: customAmount,
          type: 'wallet_deposit',
          description: `شارژ آنلاین کیف پول از درگاه ${gatewayName}`,
          gateway: selectedGateway,
        }),
      });

      const data = await res.json();
      setIsCreatingTx(false);

      if (data.success && data.transactionId) {
        setActiveTransactionId(data.transactionId);
        setIsGatewayOpen(true);
      } else {
        onShowToast(data.error || 'خطا در ایجاد تراکنش درگاه پرداخت.', 'warning');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      setIsCreatingTx(false);
      // Fallback: open gateway anyway, BankPaymentGatewayModal will ensure server transaction
      setIsGatewayOpen(true);
    }
  };

  const handleGatewaySuccess = (trackingNumber: string, updatedUser?: any) => {
    setIsGatewayOpen(false);
    const gatewayName = selectedGateway === 'shaparak' ? 'شاپرک' : selectedGateway === 'zarinpal' ? 'زرین‌پال' : 'بانک ملت';

    if (updatedUser && onUpdateUser) {
      onUpdateUser(updatedUser);
    } else {
      onDeposit(customAmount, `شارژ از درگاه ${gatewayName} - کد پیگیری ${trackingNumber}`);
    }

    onShowToast(`✅ پرداخت موفق! کیف پول شما به مبلغ ${formatToman(customAmount)} تومان شارژ گردید. (کد پیگیری: ${trackingNumber})`, 'success');
  };

  const handleGatewayFailure = (errorMsg: string) => {
    setIsGatewayOpen(false);
    onShowToast(errorMsg || '❌ پرداخت تأیید نشد. هیچ مبلغی به کیف پول اضافه نگردید.', 'warning');
  };

  const handleGatewayCancel = () => {
    setIsGatewayOpen(false);
    onShowToast('❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.', 'warning');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-[#005c55] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">کیف پول کاربری</h3>
              <p className="text-xs text-teal-100/80">شارژ آنلاین، پرداخت ارتقای آگهی و پست‌های ویژه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-500 font-medium">موجودی فعال کیف پول شما:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#005c55] tracking-tight">
                {formatToman(walletBalance)}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600">تومان</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>آماده خرج و پرداخت</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-100 px-4 pt-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'deposit'
                ? 'border-[#005c55] text-[#005c55]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>افزایش و شارژ موجودی</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#005c55] text-[#005c55]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>تاریخچه تراکنش‌ها ({toPersianDigits(transactions.length)})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          {activeTab === 'deposit' ? (
            <>
              {/* Custom Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  مبلغ دلخواه برای شارژ (تومان):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={amountInputStr}
                    onChange={handleInputChange}
                    placeholder="مثال: ۱۰۰,۰۰۰"
                    className="w-full pr-4 pl-14 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold text-slate-900 focus:outline-none focus:border-[#005c55] focus:bg-white focus:ring-2 focus:ring-[#005c55]/15 transition-all text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-3 text-xs font-semibold text-slate-400">تومان</span>
                </div>
                <div className="text-[11px] text-teal-800 bg-teal-50/70 p-2 rounded-xl border border-teal-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-teal-600">info</span>
                  <span>معادل حروف: <strong>{numberToPersianWords(customAmount)}</strong></span>
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-bold text-slate-700">مبالغ پیشنهادی و پرتکرار:</label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => {
                    const isSelected = customAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmount(amt)}
                        className={`p-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#005c55] text-white border-[#005c55] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        +{formatToman(amt)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Payment Gateway */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-slate-700">انتخاب درگاه پرداخت امن بانکی:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'shaparak' as const, name: 'درگاه شاپرک', desc: 'تمامی کارت‌های عضو شتاب' },
                    { id: 'zarinpal' as const, name: 'زرین‌پال', desc: 'پرداخت امن و سریع' },
                    { id: 'mellat' as const, name: 'به‌پرداخت ملت', desc: 'درگاه مستقیم بانک ملت' },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-3 rounded-2xl text-right flex flex-col gap-0.5 border transition-all cursor-pointer ${
                        selectedGateway === gw.id
                          ? 'border-[#005c55] bg-teal-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{gw.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{gw.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card-to-Card & Telegram Support Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">credit_card</span>
                    <span className="text-xs font-bold text-slate-100">شماره کارت اختصاصی بازار جهت واریز کارت به کارت:</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    بانک ملی ایران
                  </span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-300">به نام: آوان مارکت (کامران رضوانی)</span>
                    <span className="text-base sm:text-lg font-mono font-extrabold tracking-widest text-amber-300 dir-ltr text-right">
                      ۶۰۳۷-۹۹۷۵-۸۸۳۴-۱۲۹۰
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('6037997588341290');
                      onShowToast('شماره کارت بانکی کپی شد.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>کپی کارت</span>
                  </button>
                </div>

                {/* Shaba Number */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg">
                  <span>شماره شبا: <strong className="text-white font-mono">IR12 0170 0000 0012 8834 1290</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('IR1201700000001288341290');
                      onShowToast('شماره شبا کپی شد.', 'success');
                    }}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    کپی شبا
                  </button>
                </div>

                {/* Telegram & Support contacts */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="material-symbols-outlined text-teal-400 text-[18px]">send</span>
                    <span>پشتیبانی تلگرام جهت ارسال فیش:</span>
                    <a
                      href="https://t.me/bazar_mahali_support"
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-teal-300 font-bold hover:underline"
                    >
                      @bazar_mahali_support
                    </a>
                  </div>
                  <span className="text-[11px] text-slate-400">تلفن پشتیبانی: ۰۲۱-۸۸۸۸۹۹۹۹</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  * پس از واریز، تصویر فیش یا شماره پیگیری را به آیدی تلگرام بالا ارسال نمایید تا در کمتر از ۱۰ دقیقه شارژ اعمال گردد.
                </p>
              </div>

              {/* Usage Notice */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[#005c55] font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>کاربردهای موجودی کیف پول بازار:</span>
                </div>
                <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                  <li>ارتقای ویدیوها در اکسپلور به پکیج طلایی VIP (۸۵۰,۰۰۰ تومان)</li>
                  <li>انتشار پست‌های ویژه و استوری اکسپلور (۵۰۰,۰۰۰ تومان)</li>
                  <li>سوپر پکیج نردبان و ارتقای ۱ ماهه و ۲ ماهه آگهی‌ها (تا ۱,۱۵۰,۰۰۰ تومان)</li>
                </ul>
              </div>
            </>
          ) : (
            /* Transaction History */
            <div className="flex flex-col gap-2.5">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">receipt</span>
                  <p className="text-xs font-semibold">هنوز تراکنشی ثبت نشده است.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.amount > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {tx.amount > 0 ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tx.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>پیگیری: {tx.referenceId}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      {tx.amount > 0 ? `+${formatToman(tx.amount)}` : formatToman(tx.amount)} تومان
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'deposit' && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400">مبلغ قابل پرداخت در درگاه:</span>
              <span className="text-sm sm:text-base font-extrabold text-[#005c55]">
                {formatToman(customAmount)} تومان
              </span>
            </div>
            <button
              type="button"
              disabled={customAmount < 10000 || isCreatingTx}
              onClick={handleStartDepositPayment}
              className="px-6 py-2.5 rounded-2xl bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isCreatingTx ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>در حال ایجاد تراکنش امن...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payment</span>
                  <span>اتصال به درگاه شاپرک و پرداخت</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Embedded Bank Payment Gateway Modal */}
      <BankPaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        transactionId={activeTransactionId}
        amount={customAmount}
        description={`شارژ آنلاین کیف پول آوان مارکت (${selectedGateway === 'shaparak' ? 'درگاه شاپرک' : selectedGateway === 'zarinpal' ? 'زرین‌پال' : 'به‌پرداخت ملت'})`}
        onSuccess={handleGatewaySuccess}
        onFailure={handleGatewayFailure}
        onCancel={handleGatewayCancel}
      />
    </div>
  );
};
