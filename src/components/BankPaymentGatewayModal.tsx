import React, { useState, useEffect } from 'react';
import { formatToman, toPersianDigits, numberToPersianWords } from '../data/mockData';

interface BankPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string | null;
  amount: number;
  description: string;
  onSuccess: (trackingNumber: string, updatedUser?: any) => void;
  onFailure?: (errorMsg: string) => void;
  onCancel?: () => void;
}

export const BankPaymentGatewayModal: React.FC<BankPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  amount,
  description,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  // Card Form Inputs
  const [c1, setC1] = useState('۶۰۳۷');
  const [c2, setC2] = useState('۹۹۷۵');
  const [c3, setC3] = useState('');
  const [c4, setC4] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('۰۸');
  const [expYear, setExpYear] = useState('۰۶');
  const [dynamicOtp, setDynamicOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('۵۸۹۲');
  const [emailOrMobile, setEmailOrMobile] = useState('');

  // Status Indicator States
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Remaining Gateway Countdown Timer (10 minutes)
  const [timeLeft, setTimeLeft] = useState(600);

  // Generate random captcha on open
  const refreshCaptcha = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(toPersianDigits(randomCode));
    setCaptchaInput('');
  };

  useEffect(() => {
    if (isOpen) {
      refreshCaptcha();
      setTimeLeft(600);
      setErrorMessage(null);
      setOtpSent(false);
      setIsProcessing(false);
      setVerificationStatus('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  // Dynamic OTP timer
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpTimer]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${toPersianDigits(m.toString().padStart(2, '0'))}:${toPersianDigits(s.toString().padStart(2, '0'))}`;
  };

  const getBankName = () => {
    const prefix = `${c1}${c2}`.replace(/[^\d]/g, '');
    if (prefix.startsWith('603799')) return 'بانک ملی ایران';
    if (prefix.startsWith('589210')) return 'بانک سپه';
    if (prefix.startsWith('627412')) return 'بانک اقتصاد نوین';
    if (prefix.startsWith('621986')) return 'بانک سامان';
    if (prefix.startsWith('502229')) return 'بانک پاسارگاد';
    if (prefix.startsWith('610433')) return 'بانک ملت';
    if (prefix.startsWith('627353')) return 'بانک تجارت';
    if (prefix.startsWith('603769')) return 'بانک صادرات ایران';
    if (prefix.startsWith('504706')) return 'بانک شهر';
    if (prefix.startsWith('603770')) return 'بانک کشاورزی';
    if (prefix.startsWith('628023')) return 'بانک مسکن';
    return 'شبکه شتاب بانکی';
  };

  const handleRequestDynamicOtp = () => {
    setIsRequestingOtp(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsRequestingOtp(false);
      setOtpSent(true);
      setOtpTimer(120);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDynamicOtp(generatedOtp);
    }, 800);
  };

  // Ensure transaction is created on server backend if not already created
  const ensureBackendTransactionId = async (): Promise<string | null> => {
    if (transactionId) return transactionId;
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: 'wallet_deposit',
          description: description || 'تراکنش درگاه پرداخت شاپرک',
          gateway: 'shaparak',
        }),
      });
      const data = await res.json();
      if (data.success && data.transactionId) {
        return data.transactionId;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Real Backend Verification Call
  const executePaymentVerification = async (gatewayStatus: 'success' | 'failed' | 'canceled') => {
    setIsProcessing(true);
    setVerificationStatus('checking');
    setErrorMessage(null);

    const txId = await ensureBackendTransactionId();
    if (!txId) {
      setIsProcessing(false);
      setVerificationStatus('failed');
      const failMsg =
        '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.';
      setErrorMessage(failMsg);
      if (onFailure) onFailure(failMsg);
      return;
    }

    const refNum = `SHP-${Math.floor(100000000 + Math.random() * 900000000)}`;

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txId,
          refNum,
          gatewayStatus,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success && data.verified) {
        setVerificationStatus('success');
        setTimeout(() => {
          onSuccess(refNum, data.user);
          onClose();
        }, 1200);
      } else {
        setVerificationStatus('failed');
        const defaultFailMsg =
          '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.';
        setErrorMessage(data.message || defaultFailMsg);
        if (onFailure) onFailure(data.message || defaultFailMsg);
      }
    } catch (err) {
      console.error('Payment verification request failed:', err);
      setIsProcessing(false);
      setVerificationStatus('failed');
      const networkFailMsg =
        '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.';
      setErrorMessage(networkFailMsg);
      if (onFailure) onFailure(networkFailMsg);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCardNumber = `${c1}${c2}${c3}${c4}`.replace(/[^\d]/g, '');
    if (fullCardNumber.length < 16) {
      setErrorMessage('شماره کارت ۱۶ رقمی را به طور کامل وارد نمایید.');
      return;
    }

    if (cvv2.length < 3) {
      setErrorMessage('کد امنیتی CVV2 نامعتبر است (حداقل ۳ رقم).');
      return;
    }

    if (!dynamicOtp || dynamicOtp.length < 5) {
      setErrorMessage('لطفاً رمز پویا (رمز دوم اینترنتی) را دریافت و وارد کنید.');
      return;
    }

    if (!captchaInput) {
      setErrorMessage('کد امنیتی تصویر را وارد فرمایید.');
      return;
    }

    // Call server verify API for success
    executePaymentVerification('success');
  };

  const handleSimulateFailedPayment = () => {
    // Call server verify API for failure
    executePaymentVerification('failed');
  };

  const handleCancelClick = () => {
    executePaymentVerification('canceled');
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 text-right">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* Official Shaparak & Banking Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-4 sm:p-5 text-slate-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px] text-amber-600 font-bold">
                shield_locked
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black">درگاه پرداخت اینترنتی شاپرک</h2>
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  استعلام آنلاین SSL 256-bit
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900/90 mt-0.5">
                سامانه یکپارچه استعلام و تأیید تراکنش‌های شتاب
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center bg-slate-950/90 text-white px-3 py-1.5 rounded-xl border border-amber-400/40 text-xs font-bold" dir="ltr">
            <span className="text-[10px] text-amber-300 font-medium">زمان باقیمانده</span>
            <span className="text-sm font-black font-mono tracking-wider text-amber-400 animate-pulse">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Merchant & Order Details Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-normal">نام پذیرنده:</span>
            <span className="font-extrabold text-slate-900">آوان مارکت</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-normal">بابت:</span>
            <span className="font-bold text-teal-800 truncate" title={description}>{description}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <span className="text-slate-400 font-normal">مبلغ:</span>
            <span className="font-black text-sm text-[#005c55] font-mono">
              {formatToman(amount)} <span className="text-[11px] font-bold">تومان</span>
            </span>
          </div>
        </div>

        {/* Amount & Transaction Status Banner */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] flex items-center justify-between gap-2">
          <span className="text-[#005c55] font-bold">
            مبلغ به حروف: {numberToPersianWords(amount)} تومان
          </span>

          {/* Live Status Indicator Pill */}
          {verificationStatus === 'checking' && (
            <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-1.5 animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin text-amber-700">hourglass_empty</span>
              <span>⏳ در حال بررسی تراکنش</span>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
              <span>✅ پرداخت موفق</span>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 font-black text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-700">cancel</span>
              <span>❌ پرداخت ناموفق</span>
            </div>
          )}

          {verificationStatus === 'idle' && (
            <span className="text-[10px] text-slate-500 font-mono">
              شناسه: {transactionId || 'تولید سرور'}
            </span>
          )}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs sm:text-sm font-extrabold flex flex-col gap-1.5 shadow-sm whitespace-pre-line animate-shake">
              <div className="flex items-center gap-2 text-rose-700 font-black">
                <span className="material-symbols-outlined text-[22px]">error</span>
                <span>نتیجه استعلام سرور پرداخت:</span>
              </div>
              <p className="leading-relaxed text-rose-900">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="flex flex-col gap-4">
            {/* Card Number 16 digits */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>شماره کارت ۱۶ رقمی:</span>
                  <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {getBankName()}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2" dir="ltr">
                <input
                  type="text"
                  maxLength={4}
                  value={c1}
                  onChange={(e) => setC1(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="6037"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm sm:text-base focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={c2}
                  onChange={(e) => setC2(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="9975"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm sm:text-base focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={c3}
                  onChange={(e) => setC3(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="1234"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm sm:text-base focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={c4}
                  onChange={(e) => setC4(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="5678"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm sm:text-base focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* CVV2 and Expiry Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CVV2 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>کد شناسایی دوم (CVV2):</span>
                  <span className="text-[10px] text-slate-400 font-normal">۳ یا ۴ رقمی</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="•••"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-base focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                  dir="ltr"
                />
              </div>

              {/* Expiry Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>تاریخ انقضا:</span>
                  <span className="text-[10px] text-slate-400 font-normal">ماه / سال</span>
                </label>
                <div className="grid grid-cols-2 gap-2" dir="ltr">
                  <input
                    type="text"
                    maxLength={2}
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="ماه"
                    className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="سال"
                    className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic OTP (رمز دوم پویا) */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[17px] text-amber-700">sms</span>
                  <span>رمز دوم پویا (رمز پیامکی):</span>
                </label>
                {otpSent && otpTimer > 0 && (
                  <span className="text-[11px] text-amber-800 font-mono font-bold" dir="ltr">
                    {formatTimer(otpTimer)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={8}
                  value={dynamicOtp}
                  onChange={(e) => setDynamicOtp(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="رمز پیامک‌شده را وارد کنید"
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 font-mono font-black text-base focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none bg-white transition-all shadow-inner"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleRequestDynamicOtp}
                  disabled={isRequestingOtp || (otpSent && otpTimer > 0)}
                  className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  {isRequestingOtp ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span>در حال ارسال...</span>
                    </>
                  ) : otpSent ? (
                    <span>ارسال مجدد ({toPersianDigits(otpTimer)})</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>دریافت رمز پویا</span>
                    </>
                  )}
                </button>
              </div>

              {otpSent && (
                <div className="p-2 rounded-lg bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">mark_chat_read</span>
                  <span>پیامک ارسال شد: رمز پویا به صورت خودکار درج گردید ({toPersianDigits(dynamicOtp)}).</span>
                </div>
              )}
            </div>

            {/* Captcha & Receipt Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Captcha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800">کد امنیتی تصویر:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="کد مقابل"
                    className="flex-1 text-center py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:border-[#005c55] focus:outline-none bg-slate-50 focus:bg-white"
                  />
                  <div
                    onClick={refreshCaptcha}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 border border-slate-300 font-mono font-black text-base text-slate-800 tracking-widest select-none cursor-pointer flex items-center gap-1"
                    title="تغییر کد امنیتی"
                  >
                    <span>{captchaCode}</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-500">refresh</span>
                  </div>
                </div>
              </div>

              {/* Email / Mobile */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">شماره موبایل یا ایمیل (جهت رسید):</label>
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  placeholder="۰۹۱۲... یا ایمیل شما"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs focus:border-[#005c55] focus:outline-none bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Test Payment Simulation Bar */}
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700">تست سناریوهای درگاه پرداخت:</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSimulateFailedPayment}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-black text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                  <span>تست پرداخت ناموفق / رد درگاه</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Submit or Cancel */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#005c55] hover:from-emerald-700 hover:to-[#004741] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>⏳ در حال استعلام و بررسی تراکنش از Backend...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span>پرداخت و استعلام آنلاین {formatToman(amount)} تومان</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelClick}
                disabled={isProcessing}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف از پرداخت
              </button>
            </div>
          </form>
        </div>

        {/* Footer Security Notice */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
          <span>منطق شارژ کیف پول کاملاً بر روی Backend بوده و تنها پس از Verify رسمی درگاه اعمال می‌گردد.</span>
        </div>
      </div>
    </div>
  );
};
