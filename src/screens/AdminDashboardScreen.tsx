import React, { useState } from 'react';
import { Listing, UserProfile, Order } from '../types';
import { formatToman, toPersianDigits } from '../data/mockData';

interface AdminDashboardScreenProps {
  listings: Listing[];
  user: UserProfile;
  orders?: Order[];
  onUpdateListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onUpdateUser: (user: UserProfile) => void;
  onNavigate: (screen: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  listings,
  user,
  orders = [],
  onUpdateListing,
  onDeleteListing,
  onUpdateUser,
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'subscriptions' | 'coupons' | 'admins' | 'site_settings'>('listings');
  const [searchAd, setSearchAd] = useState('');
  const [editingAd, setEditingAd] = useState<Listing | null>(null);

  // Quick edit inputs for chosen ad
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editImage, setEditImage] = useState('');
  const [editCondition, setEditCondition] = useState<'new' | 'like-new' | 'used'>('used');
  const [editVipTier, setEditVipTier] = useState<'diamond' | 'golden' | 'standard' | 'none'>('none');

  // User VIP Management state
  const [targetUserVip, setTargetUserVip] = useState<'free' | 'standard' | 'golden' | 'diamond'>(user.subscriptionPlan || 'diamond');
  const [bonusWallet, setBonusWallet] = useState(100000);
  const [customFreeAdsCount, setCustomFreeAdsCount] = useState<number>(user.freeAdsRemaining !== undefined ? user.freeAdsRemaining : 5);

  // Coupons Manager
  const [coupons, setCoupons] = useState([
    { id: 'c1', code: 'BAZAR50', percent: 50, title: 'تخفیف شگفت‌انگیز نوروزی ۵۰٪', expiry: '۱۴۰۵/۰۱/۳۰', active: true, usageCount: 42 },
    { id: 'c2', code: 'LADDER30', percent: 30, title: 'تخفیف اختصاصی نردبان ۳۰٪', expiry: '۱۴۰۵/۰۲/۱۵', active: true, usageCount: 89 },
    { id: 'c3', code: 'VIP20', percent: 20, title: 'تخفیف اشتراک ویژه ۲۰٪', expiry: '۱۴۰۵/۰۳/۰۱', active: true, usageCount: 15 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(40);
  const [newCouponTitle, setNewCouponTitle] = useState('');

  // Start editing an ad
  const handleOpenEdit = (ad: Listing) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(ad.price);
    setEditImage(ad.images[0] || '');
    setEditCondition(ad.condition);
    setEditVipTier(ad.vipTier || 'none');
  };

  const handleSaveAdEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    const updated: Listing = {
      ...editingAd,
      title: editTitle.trim(),
      price: editPrice,
      condition: editCondition,
      vipTier: editVipTier,
      images: editImage ? [editImage, ...editingAd.images.slice(1)] : editingAd.images,
    };

    onUpdateListing(updated);
    onShowToast(`آگهی «${updated.title}» توسط ادمین سایت با موفقیت ویرایش شد.`, 'success');
    setEditingAd(null);
  };

  // Gift or manually assign VIP subscription
  const handleApplyUserSubscription = (plan: 'free' | 'standard' | 'golden' | 'diamond') => {
    const planTitles = {
      diamond: 'اشتراک الماس VIP ۶ ماهه (هدیه ادمین)',
      golden: 'اشتراک طلایی ۳ ماهه (هدیه ادمین)',
      standard: 'اشتراک معمولی ۱ ماهه (هدیه ادمین)',
      free: 'پلن عادی رایگان',
    };

    onUpdateUser({
      ...user,
      subscriptionPlan: plan,
      subscriptionTitle: planTitles[plan],
      subscriptionRemainingDays: plan === 'diamond' ? 180 : plan === 'golden' ? 90 : plan === 'standard' ? 30 : 0,
      subscriptionExpiry: plan === 'diamond' ? '۶ ماه اعتبار هدیه ادمین' : plan === 'golden' ? '۳ ماه اعتبار هدیه ادمین' : 'عادی',
    });

    onShowToast(`سطح اشتراک کاربر به «${planTitles[plan]}» با دسترسی ادمین تغییر یافت!`, 'success');
  };

  const handleGiftWallet = () => {
    onUpdateUser({
      ...user,
      walletBalance: (user.walletBalance || 0) + bonusWallet,
    });
    onShowToast(`مبلغ ${formatToman(bonusWallet)} تومان به عنوان هدیه ادمین به کیف پول کاربر اضافه شد.`, 'success');
  };

  const handleUpdateFreeAds = () => {
    onUpdateUser({
      ...user,
      freeAdsRemaining: customFreeAdsCount,
    });
    onShowToast(`تعداد سهمیه آگهی رایگان کاربر روی ${toPersianDigits(customFreeAdsCount)} عدد تنظیم شد.`, 'success');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setCoupons((prev) => [
      {
        id: `c_${Date.now()}`,
        code: newCouponCode.trim().toUpperCase(),
        percent: newCouponPercent,
        title: newCouponTitle.trim() || `کد تخفیف ${toPersianDigits(newCouponPercent)}٪`,
        expiry: '۱۴۰۵/۰۶/۳۱',
        active: true,
        usageCount: 0,
      },
      ...prev,
    ]);

    setNewCouponCode('');
    setNewCouponTitle('');
    onShowToast('کد تخفیف جدید با موفقیت در سیستم ثبت و فعال گردید.', 'success');
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    onShowToast('وضعیت فعال بودن کد تخفیف تغییر یافت.', 'info');
  };

  // Security Gate: Ensure ONLY creator / super admin has access
  const isAuthorizedAdmin = Boolean(
    user?.role === 'admin' ||
    user?.isAdmin ||
    user?.phone === '۰۹۱۲۳۴۵۶۷۸۹'
  );

  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-right">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 shadow-xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl">
            <span className="material-symbols-outlined text-[36px]">lock</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            دسترسی به پنل ادمین محدود شده است
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            این بخش منحصراً در اختیار سازنده سایت و مدیریت ارشد است. کاربران عادی آوان مارکت اجازه دسترسی و مشاهده این صفحه را ندارند.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  const filteredListings = listings.filter((ad) =>
    ad.title.toLowerCase().includes(searchAd.toLowerCase()) ||
    ad.category.toLowerCase().includes(searchAd.toLowerCase()) ||
    ad.city.toLowerCase().includes(searchAd.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 text-right">
      
      {/* Top Banner: Master Admin Bar */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl border border-slate-700/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                دسترسی سازنده و مدیر کل
              </span>
              <span className="text-xs text-slate-400 font-bold">نسخه ۳.۸ پنل ادمین</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              داشبورد مدیریت کل آوان مارکت (Super Admin)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              مدیریت کامل و بدون محدودیت: ویرایش یا حذف آگهی‌های نامناسب، اعطای اشتراک VIP الماس/طلایی، تمدید کدهای تخفیف، آپلود مستقیم عکس و شارژ هدیه.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span>مشاهده داشبورد کاربر</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>مشاهده صفحه اصلی سایت</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'listings', label: 'مدیریت و ویرایش آگهی‌ها', icon: 'inventory_2', count: listings.length },
          { id: 'subscriptions', label: 'اعطای دستی اشتراک VIP و هدایا', icon: 'workspace_premium' },
          { id: 'coupons', label: 'تمدید و مدیریت کدهای تخفیف', icon: 'sell', count: coupons.length },
          { id: 'admins', label: 'مدیریت ۲ ادمین مجاز سایت', icon: 'admin_panel_settings', count: 2 },
          { id: 'users', label: 'کاربران و پشتیبانی مشکلات', icon: 'manage_accounts' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {toPersianDigits(tab.count)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT & FAST EDITING */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                value={searchAd}
                onChange={(e) => setSearchAd(e.target.value)}
                placeholder="جستجوی سریع آگهی بر اساس عنوان، دسته یا شهر..."
                className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              مجموع آگهی‌های فعال در سرور: <strong>{toPersianDigits(listings.length)} آگهی</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 group hover:border-amber-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                        {ad.category}
                      </span>
                      {ad.vipTier && ad.vipTier !== 'none' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black">
                          {ad.vipTier === 'diamond' ? '💎 الماس' : '🌟 طلایی'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 line-clamp-2">
                      {ad.title}
                    </h3>
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {formatToman(ad.price)} تومان
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      فروشنده: {ad.seller.name} • {ad.city}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ad)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>ویرایش مستقیم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`آیا از حذف این آگهی نامناسب (${ad.title}) اطمینان دارید؟`)) {
                        onDeleteListing(ad.id);
                        onShowToast('آگهی نامناسب توسط ادمین به صورت کامل از سایت پاک شد.', 'info');
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                    title="حذف کامل آگهی نامناسب"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL VIP SUBSCRIPTIONS & GIFTS */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: VIP Plans Gift */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl font-black">
                💎
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  اعطای دستی اشتراک VIP به کاربر (بدون نیاز به خرید خودکار)
                </h3>
                <p className="text-xs text-slate-500">
                  اگر کاربری فیش واریزی ارسال کرده یا قصد دارید اشتراک VIP را به عنوان هدیه یا جبران مشکل فعال کنید:
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                کاربر فعلی سیستم: <strong>{user.name}</strong> ({user.phone})
              </span>
              <span className="text-xs text-slate-500">
                اشتراک فعال کنونی: <strong className="text-purple-600">{user.subscriptionTitle || 'عادی'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleApplyUserSubscription('diamond')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer shadow-md"
              >
                <span className="text-lg">💎</span>
                <span>اعطای اشتراک الماس (۶ ماهه)</span>
                <span className="text-[10px] text-purple-200">بالاترین اولویت ویترین</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyUserSubscription('golden')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer shadow-md"
              >
                <span className="text-lg">🌟</span>
                <span>اعطای اشتراک طلایی (۳ ماهه)</span>
                <span className="text-[10px] text-amber-950 font-bold">اولویت ویژه فروشگاهی</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyUserSubscription('standard')}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer shadow-md"
              >
                <span className="text-lg">⚡</span>
                <span>اشتراک معمولی (۱ ماهه)</span>
                <span className="text-[10px] text-slate-300">۳۰ روز نردبان</span>
              </button>
            </div>
          </div>

          {/* Card 2: Wallet Bonus & Free Ads Quota */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black">
                <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  شارژ کیف پول هدیه و تنظیم سهمیه آگهی رایگان
                </h3>
                <p className="text-xs text-slate-500">
                  تنظیم دستی تعداد آگهی‌های رایگان کاربر یا واریز اعتبار تشویقی
                </p>
              </div>
            </div>

            {/* Set Free Ads */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                تنظیم سهمیه آگهی رایگان کاربر:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={customFreeAdsCount}
                  onChange={(e) => setCustomFreeAdsCount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-black text-sm"
                />
                <button
                  type="button"
                  onClick={handleUpdateFreeAds}
                  className="px-4 py-2 bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  ثبت سهمیه جدید
                </button>
                <span className="text-xs text-slate-500">
                  (سهمیه فعلی: {toPersianDigits(user.freeAdsRemaining ?? 5)} عدد)
                </span>
              </div>
            </div>

            {/* Gift Wallet */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                هدیه نقدی به کیف پول کاربر:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={bonusWallet}
                  onChange={(e) => setBonusWallet(Number(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value={50000}>۵۰,۰۰۰ تومان</option>
                  <option value={100000}>۱۰۰,۰۰۰ تومان</option>
                  <option value={200000}>۲۰۰,۰۰۰ تومان</option>
                  <option value={500000}>۵۰۰,۰۰۰ تومان</option>
                  <option value={1000000}>۱,۰۰۰,۰۰۰ تومان</option>
                </select>
                <button
                  type="button"
                  onClick={handleGiftWallet}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  واریز اعتبار هدیه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS EXTENSION & CREATION */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Coupon Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">add_circle</span>
              <span>تعریف یا تمدید کد تخفیف جدید</span>
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  کد تخفیف (انگلیسی):
                </label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="مثال: GOLDEN50 یا VIP40"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان و توضیح کد:
                </label>
                <input
                  type="text"
                  value={newCouponTitle}
                  onChange={(e) => setNewCouponTitle(e.target.value)}
                  placeholder="مثال: تخفیف ۴۰ درصدی ویژه کاربران VIP"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  درصد تخفیف ({toPersianDigits(newCouponPercent)}٪):
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={newCouponPercent}
                  onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer mt-2"
              >
                ثبت و فعال‌سازی کد تخفیف در سایت
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              کدهای تخفیف فعال و تمدیدشده سیستم
            </h3>

            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm shrink-0">
                    %{toPersianDigits(coupon.percent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white font-mono uppercase">
                        {coupon.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.active ? 'فعال و معتبر' : 'غیرفعال'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{coupon.title}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      انقضا: {coupon.expiry} • استفاده‌شده: {toPersianDigits(coupon.usageCount)} بار
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(coupon.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    {coupon.active ? 'غیرفعال‌سازی' : 'تمدید و فعال‌سازی'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & PROBLEM RESOLUTION */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                حل مستقیم مشکلات کاربران و پشتیبانی زنده
              </h3>
              <p className="text-xs text-slate-500">
                هر جا کاربری مشکلی در آپلود عکس، تایید شماره یا ویرایش مشخصات داشته باشد، از اینجا حل می‌شود:
              </p>
            </div>
            <a
              href="https://t.me/bazar_mahali_support"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>ورود به تلگرام پشتیبانی @bazar_mahali_support</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-white">کاربر آزمایشی: کامران رضوانی</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">احراز هویت شده</span>
              </div>
              <p className="text-xs text-slate-500">شماره تماس: ۰۹۱۲۳۴۵۶۷۸۹ • شهر: تهران</p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('درخواست آپلود مستقیم تصاویر کاربر توسط ادمین فعال شد.', 'success')}
                  className="px-3 py-1.5 rounded-xl bg-[#005c55] text-white text-xs font-bold cursor-pointer"
                >
                  آپلود عکس برای کاربر
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('پیام پشتیبانی به چت آنلاین کاربر ارسال شد.', 'info')}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
                >
                  ارسال پیام در چت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Manage Authorized Admins (۲ مدیر ارشد مجاز) */}
      {activeTab === 'admins' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">admin_panel_settings</span>
                <span>مدیریت ۲ مدیر ارشد و ادمین مجاز کل سایت</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                دسترسی به تمام ابزارها و تغییرات سایت منحصراً برای این ۲ اکانت مدیر فعال است و سایر اعضا امکان ورود ندارند.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>۲ مدیر مجاز فعال در سیستم</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-amber-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Master Admin 1"
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>امیر مازنی</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                        سازنده و مدیر ارشد ۱
                      </span>
                    </h3>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">۰۹۱۲۳۴۵۶۷۸۹</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-xl">
                  فعال (مالک کل)
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-100 dark:border-slate-800">
                <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200">مجوزهای سطح ۱:</span>
                • دسترسی کامل به دیتابیس، پاکسازی آگهی‌های نامناسب<br />
                • اعطای هدیه VIP الماس و طلایی به کاربران<br />
                • شارژ دستی کیف‌پول و تمدید کدهای تخفیف<br />
                • ویرایش تمام آگهی‌ها و مشخصات سایت
              </div>
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                <span>ایمیل: amir.mazani9988@gmail.com</span>
                <span className="font-bold text-amber-700">تایید دو مرحله‌ای فعال</span>
              </div>
            </div>

            {/* Admin 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Master Admin 2"
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>امیرحسین رضایی</span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-500 text-white text-[10px] font-black">
                        مدیر پشتیبانی ۲
                      </span>
                    </h3>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">۰۹۱۲۲۲۲۲۲۲۲</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-xl">
                  فعال (پشتیبانی ۲۴/۷)
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-sky-100 dark:border-slate-800">
                <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200">مجوزهای سطح ۲:</span>
                • مدیریت و پاسخگویی به چت آنلاین ۲۴ ساعته پشتیبانی<br />
                • رفع مشکل آپلود عکس کاربران و جایگزینی تصویر<br />
                • بررسی و تایید ویرایش آگهی‌های کاربران<br />
                • ثبت کدهای تخفیف اختصاصی
              </div>
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                <span>ایمیل: rezaei.support@bazar.ir</span>
                <span className="font-bold text-sky-700">تایید دو مرحله‌ای فعال</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">shield</span>
              <span className="font-bold">
                محافظت امنیتی: اعضای معمولی یا بازدیدکنندگان به هیچ وجه به این پنل دسترسی ندارند.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onShowToast('کد دعوتی برای اضافه کردن مدیر جدید ایجاد شد.', 'info')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shrink-0 cursor-pointer"
            >
              افزودن ادمین جدید با رمز یکبارمصرف
            </button>
          </div>
        </div>
      )}

      {/* Direct Ad Editor Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">edit_note</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ویرایش آگهی توسط ادمین (جایگزینی عکس، عنوان یا قیمت)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAd(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان آگهی:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  قیمت آگهی (تومان):
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  معادل: {formatToman(editPrice)} تومان
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  لینک مستقیم تصویر اصلی (آپلود عکس برای کاربر):
                </label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                {editImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden mt-2 border border-slate-200">
                    <img src={editImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  سطح نشان VIP در صفحه:
                </label>
                <select
                  value={editVipTier}
                  onChange={(e) => setEditVipTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="none">عادی (بدون نشان)</option>
                  <option value="standard">نشان استاندارد</option>
                  <option value="golden">نشان طلایی VIP</option>
                  <option value="diamond">نشان الماس VIP</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs text-white bg-slate-900 hover:bg-black font-black rounded-xl shadow-md"
                >
                  ذخیره تغییرات ادمین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
