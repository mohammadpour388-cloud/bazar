import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ScreenType } from '../types';
import { toPersianDigits } from '../data/mockData';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onNavigate,
  onShowToast,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration Form State for new users
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('تهران');
  const [district, setDistrict] = useState('سعادت‌آباد');

  // Interactive Live Backend/SMS Telemetry Log
  const [serverLogs, setServerLogs] = useState<
    Array<{ id: number; timestamp: string; method: string; path: string; status: number; text: string }>
  >([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      method: 'INIT',
      path: '/api/auth/system',
      status: 200,
      text: 'اتصال به دیتابیس محلی و درگاه پیامک برقرار شد. آماده دریافت شماره.',
    },
  ]);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const addLog = (method: string, path: string, status: number, text: string) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR');
    setServerLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), timestamp: timeStr, method, path, status, text },
    ]);
  };

  /**
   * Step 1: Request OTP -> POST /api/auth/send-otp
   */
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!phone || phone.trim().length < 10) {
      setErrorMessage('شماره موبایل وارد شده صحیح نیست. لطفاً شماره معتبر ۱۱ رقمی وارد نمایید.');
      onShowToast('لطفاً شماره موبایل معتبر وارد کنید', 'warning');
      return;
    }

    setIsLoading(true);
    addLog('POST', '/api/auth/send-otp', 202, `درخواست ارسال OTP برای شماره: ${phone}`);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
        setTimer(data.expiresIn || 120);
        setOtp(['', '', '', '', '', '']);
        addLog('SMS', 'sms.provider.dispatch', 200, `پیامک کد فعال‌سازی ۶ رقمی با موفقیت صادر و ذخیره شد.`);
        onShowToast(data.message || 'کد تأیید ۶ رقمی از طریق پیامک ارسال شد.', 'success');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        const errorText = data.error || 'ارسال کد با مشکل مواجه شد. لطفاً دوباره تلاش کنید.';
        setErrorMessage(errorText);
        addLog('ERROR', '/api/auth/send-otp', response.status, errorText);
        onShowToast(errorText, 'warning');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const networkErr = 'ارسال کد با مشکل مواجه شد. لطفاً اتصال اینترنت خود را بررسی نمایید.';
      setErrorMessage(networkErr);
      addLog('FAIL', '/api/auth/send-otp', 500, networkErr);
      onShowToast(networkErr, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP -> POST /api/auth/verify-otp
   */
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otp.join('').trim();
    if (enteredOtp.length < 6) {
      setErrorMessage('لطفاً کد ۶ رقمی کامل را وارد فرمایید.');
      onShowToast('لطفاً کد ۶ رقمی کامل را وارد کنید', 'warning');
      return;
    }

    setIsLoading(true);
    addLog('POST', '/api/auth/verify-otp', 202, `بررسی صحت هش کد وارد شده در پایگاه داده...`);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.isNewUser) {
          // Proceed to Registration Completion Form
          setStep('register');
          addLog('OTP_OK', '/api/auth/verify-otp', 200, `کد تأیید شد. کاربر جدید است، ورود به فرم تکمیل ثبت‌نام.`);
          onShowToast(data.message || 'شماره تأیید شد. لطفاً اطلاعات خود را وارد فرمایید.', 'info');
        } else {
          // Existing User -> Login Success
          addLog('AUTH', '/api/auth/verify-otp', 200, `احراز هویت کاربر ${data.user?.name} تأیید و نشست امن ایجاد شد.`);
          onShowToast(data.message || 'ورود با موفقیت انجام شد. خوش آمدید!', 'success');
          onLoginSuccess(data.user);
          onNavigate('dashboard');
        }
      } else {
        const errText = data.error || 'کد تأیید صحیح نیست یا منقضی شده است.';
        setErrorMessage(errText);
        addLog('INVALID_OTP', '/api/auth/verify-otp', response.status, errText);
        onShowToast(errText, 'warning');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      const networkErr = 'خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش فرمایید.';
      setErrorMessage(networkErr);
      addLog('FAIL', '/api/auth/verify-otp', 500, networkErr);
      onShowToast(networkErr, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 3: Register New User -> POST /api/auth/register
   */
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('نام و نام خانوادگی الزامی است.');
      onShowToast('لطفاً نام و نام خانوادگی را وارد کنید', 'warning');
      return;
    }

    setIsLoading(true);
    addLog('POST', '/api/auth/register', 202, `ثبت کاربر جدید در پایگاه داده با شماره: ${phone}`);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          username: username.trim() || undefined,
          email: email.trim() || undefined,
          city: city.trim(),
          district: district.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addLog('DB_INSERT', '/api/auth/register', 201, `کاربر جدید با شناسه ${data.user?.id} با موفقیت ثبت شد.`);
        onShowToast(data.message || 'ثبت‌نام شما با موفقیت انجام شد. خوش آمدید!', 'success');
        onLoginSuccess(data.user);
        onNavigate('dashboard');
      } else {
        const errText = data.error || 'ثبت‌نام با خطا مواجه شد. لطفاً دوباره تلاش نمایید.';
        setErrorMessage(errText);
        addLog('ERROR', '/api/auth/register', response.status, errText);
        onShowToast(errText, 'warning');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const networkErr = 'خطا در ثبت‌نام. لطفاً اتصال اینترنت را چک نمایید.';
      setErrorMessage(networkErr);
      addLog('FAIL', '/api/auth/register', 500, networkErr);
      onShowToast(networkErr, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP -> POST /api/auth/resend-otp
   */
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    addLog('POST', '/api/auth/resend-otp', 202, `درخواست ارسال مجدد کد پیامکی برای ${phone}`);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimer(data.expiresIn || 120);
        setOtp(['', '', '', '', '', '']);
        addLog('SMS_RESEND', 'sms.provider.dispatch', 200, `کد تأیید جدید مجدداً ارسال شد.`);
        onShowToast(data.message || 'کد تأیید جدید ارسال شد.', 'success');
      } else {
        const errText = data.error || 'لطفاً کمی صبر کنید و دوباره تلاش کنید.';
        setErrorMessage(errText);
        addLog('ERROR', '/api/auth/resend-otp', response.status, errText);
        onShowToast(errText, 'warning');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      onShowToast('خطا در ارسال مجدد کد تأیید.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-right">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Auth Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
          
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {step === 'register' ? 'تکمیل ثبت‌نام و ساخت حساب' : 'ورود / ثبت‌نام در آوان مارکت'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              {step === 'register'
                ? 'شماره شما تأیید شد. لطفاً اطلاعات هویتی خود را وارد نمایید.'
                : 'احراز هویت امن و سریع با شماره موبایل و کد پیامکی OTP'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs sm:text-sm font-semibold animate-in fade-in">
              <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: ENTER PHONE NUMBER ================= */}
          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                  شماره موبایل خود را وارد نمایید:
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-slate-400 text-xs border-r border-slate-200 pr-2 pl-1">
                    <span className="text-slate-700 font-bold" dir="ltr">
                      +98
                    </span>
                    <span>🇮🇷</span>
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-[#005c55] focus:bg-white text-left tracking-widest text-base sm:text-lg transition-all font-mono"
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  کد تأیید ۶ رقمی امن از طریق سرویس پیامک برای این شماره صادر و ارسال خواهد شد.
                </p>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <input
                  type="checkbox"
                  defaultChecked
                  id="terms"
                  className="mt-1 w-4 h-4 text-[#005c55] rounded border-slate-300 focus:ring-[#005c55]"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  با ورود یا عضویت در پلتفرم آوان مارکت، تمام{' '}
                  <span className="text-rose-600 underline font-bold">قوانین و مقررات معاملات امن</span> و{' '}
                  <span className="text-rose-600 underline font-bold">حریم خصوصی کاربران</span> را می‌پذیرم.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#005c55] hover:bg-[#004741] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    در حال اعتبارسنجی و ارسال پیامک...
                  </>
                ) : (
                  <>
                    <span>دریافت کد تأیید پیامکی</span>
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: VERIFY OTP ================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">کد تأیید پیامک شده به شماره:</div>
                  <div className="font-bold text-teal-900 text-sm mt-0.5 tracking-wider font-mono" dir="ltr">
                    {phone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-[#005c55] hover:underline font-bold"
                >
                  ویرایش شماره
                </button>
              </div>

              {/* 6-digit OTP Inputs */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-3 text-center">
                  کد ۶ رقمی دریافتی را وارد کنید:
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#005c55] focus:bg-white focus:ring-2 focus:ring-[#005c55]/15 transition-all font-mono"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Timer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                {timer > 0 ? (
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="material-symbols-outlined text-slate-400 text-base">timer</span>
                    <span>
                      امکان ارسال مجدد کد تا: <strong>{toPersianDigits(Math.floor(timer / 60))}:{toPersianDigits((timer % 60).toString().padStart(2, '0'))}</strong>
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-[#005c55] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    <span>ارسال مجدد کد پیامکی</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  تغییر شماره همراه
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full py-3.5 bg-[#005c55] hover:bg-[#004741] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    در حال بررسی کد OTP در دیتابیس...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">verified</span>
                    <span>تأیید کد و ورود</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 3: COMPLETE REGISTRATION ================= */}
          {step === 'register' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>شماره {phone} با موفقیت در سیستم تأیید شد. لطفاً فرم زیر را تکمیل کنید:</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نام و نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: کامران رضوانی"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#005c55] focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام کاربری (اختیاری)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: kamran_store"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55] focus:bg-white text-left font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">آدرس ایمیل (اختیاری)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55] focus:bg-white text-left font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شهر محل سکونت</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: تهران یا ساری"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">محله یا منطقه</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: سعادت‌آباد"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full py-3.5 bg-[#005c55] hover:bg-[#004741] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    در حال ثبت اطلاعات کاربر در دیتابیس...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">how_to_reg</span>
                    <span>تکمیل ثبت‌نام و ورود به داشبورد</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600 block mb-2 text-center">
              اکانت‌های آماده تستی جهت تست سریع:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhone('09123456789');
                  handleRequestOtp();
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col text-right">
                  <span className="font-bold">کامران رضوانی (فروشنده)</span>
                  <span className="text-[10px] text-slate-400 font-mono">09123456789</span>
                </div>
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('09129876543');
                  handleRequestOtp();
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col text-right">
                  <span className="font-bold">کامبیز رضوانی (فروشگاه)</span>
                  <span className="text-[10px] text-slate-400 font-mono">09129876543</span>
                </div>
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Info & Live Architecture Telemetry Logs Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Security & Verification Highlights Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[22px]">shield</span>
              <span>امنیت و احراز هویت در آوان مارکت</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-[#005c55] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">sms</span>
                </div>
                <p>
                  <strong>اعتبارسنجی دو مرحله‌ای با پیامک (OTP):</strong> جلوگیری از ثبت هویت جعلی و تضمین هویت واقعی فروشندگان و خریداران.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-[#005c55] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                </div>
                <p>
                  <strong>رمزنگاری هش با نمک یکتا (Salt):</strong> کدهای یک‌بارمصرف به صورت رمزنگاری‌شده در پایگاه داده ذخیره می‌شوند.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-[#005c55] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">security</span>
                </div>
                <p>
                  <strong>کوکی‌های امن HttpOnly:</strong> نشست‌های کاربری بدون دسترسی اسکریپت در مرورگر نگهداری می‌شوند.
                </p>
              </div>
            </div>
          </div>

          {/* Live System Architecture Logs Terminal */}
          <div className="bg-slate-950 text-slate-200 rounded-3xl p-5 shadow-xl border border-slate-800 font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white text-[11px]">گزارشات زنده ارتباط Frontend ↔ Backend ↔ DB ↔ SMS</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">REST API v1</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-[11px] scrollbar-thin scrollbar-thumb-slate-800 pr-1" dir="ltr">
              {serverLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-slate-300">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 ${
                      log.status === 200 || log.status === 201
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.status === 202
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {log.method} {log.status}
                  </span>
                  <span className="text-slate-400 font-sans text-[11px] text-right" dir="rtl">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
