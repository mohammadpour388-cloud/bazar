import React, { useState, useRef } from 'react';
import { Listing, ScreenType, UserProfile, WalletTransaction, SellerReview } from '../types';
import { formatToman, numberToPersianWords, toPersianDigits } from '../data/mockData';
import { EditAdModal } from '../components/EditAdModal';
import { LadderPromoModal } from '../components/LadderPromoModal';
import { BankPaymentGatewayModal } from '../components/BankPaymentGatewayModal';
import { SuccessfulDealsModal } from '../components/SuccessfulDealsModal';

interface DashboardScreenProps {
  user: UserProfile;
  listings: Listing[];
  bookmarkedListings?: Listing[];
  transactions?: WalletTransaction[];
  reviews?: SellerReview[];
  onNavigate: (screen: ScreenType) => void;
  onSelectListing: (listing: Listing) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onRenewAd: (adId: string) => void;
  onDeleteAd: (adId: string) => void;
  onUpdateAd: (updatedAd: Listing) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onToggleBookmark: (id: string) => void;
  onDeposit: (amount: number, description?: string) => void;
  bookmarkedCount: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  listings,
  bookmarkedListings = [],
  transactions = [],
  reviews = [],
  onNavigate,
  onSelectListing,
  onShowToast,
  onRenewAd,
  onDeleteAd,
  onUpdateAd,
  onUpdateUser,
  onToggleBookmark,
  onDeposit,
  bookmarkedCount,
}) => {
  // Sidebar navigation tab
  const [sidebarTab, setSidebarTab] = useState<'my-ads' | 'subscriptions' | 'financials' | 'bookmarks' | 'transactions' | 'reviews' | 'profile-settings'>('my-ads');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [editingAd, setEditingAd] = useState<Listing | null>(null);
  const [ladderingAd, setLadderingAd] = useState<Listing | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isSuccessfulDealsModalOpen, setIsSuccessfulDealsModalOpen] = useState(false);
  const [customDepositAmount, setCustomDepositAmount] = useState<number>(100000);
  const [depositAmountStr, setDepositAmountStr] = useState<string>('۱۰۰,۰۰۰');

  // Bank Gateway Payment State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayAmount, setGatewayAmount] = useState(0);
  const [gatewayDescription, setGatewayDescription] = useState('');
  const [pendingGatewayAction, setPendingGatewayAction] = useState<{
    type: 'deposit' | 'subscription';
    amount: number;
    plan?: 'diamond' | 'golden' | 'standard';
    details?: {
      title: string;
      cost: number;
      days: number;
      expiry: string;
      badge: string;
    };
  } | null>(null);

  // File Input Ref for Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Settings Form State
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileEmail, setProfileEmail] = useState(user.email || 'kamran.rezvani@example.com');
  const [profileBio, setProfileBio] = useState(user.bio || 'فروشنده فعال و معتبر انواع کالای دیجیتال، لپ‌تاپ و گوشی با ضمانت سلامت و مهلت تست');
  const [profileNationalId, setProfileNationalId] = useState(user.nationalId || '۰۰۱۸۳۷۲۹۴۱');
  const [profileResponseHours, setProfileResponseHours] = useState(user.responseHours || '۹ صبح الی ۱۰ شب');
  const [profileCity, setProfileCity] = useState(user.city || 'تهران');
  const [profileDistrict, setProfileDistrict] = useState(user.district || 'سعادت‌آباد');
  const [profileAvatar, setProfileAvatar] = useState(user.avatar);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('لطفاً یک فایل تصویری (عکس) معتبر انتخاب فرمایید.', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfileAvatar(dataUrl);
        onUpdateUser({ ...user, avatar: dataUrl });
        onShowToast('تصویر پروفایل شما با موفقیت آپلود و ذخیره گردید.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const avatarPresets = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=BazarTechBot&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=BazarHeroStar&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/micah/svg?seed=BazarCyberMascot&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/big-smile/svg?seed=BazarVIPLeader&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/shapes/svg?seed=BazarGoldenBadge&backgroundColor=ffdfbf',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=200&q=80',
  ];

  // User's own ads
  const userListings = listings.filter((l) => l.seller.id === user.id || l.id.startsWith('ad_'));

  const filteredListings = userListings.filter((l) => {
    if (statusFilter === 'active' && l.status !== 'active') return false;
    if (statusFilter === 'pending' && l.status !== 'pending') return false;
    if (statusFilter === 'expired' && l.status !== 'expired') return false;
    if (searchQuery.trim() && !l.title.includes(searchQuery.trim()) && !l.code.includes(searchQuery.trim())) {
      return false;
    }
    return true;
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDepositAmount < 10000) {
      onShowToast('حداقل مبلغ شارژ کیف پول ۱۰,۰۰۰ تومان می‌باشد.', 'warning');
      return;
    }

    // Open real-feeling Shaparak Bank Gateway
    setGatewayAmount(customDepositAmount);
    setGatewayDescription('شارژ و افزایش موجودی کیف پول کاربری');
    setPendingGatewayAction({
      type: 'deposit',
      amount: customDepositAmount,
    });
    setIsDepositModalOpen(false);
    setIsGatewayOpen(true);
  };

  const handleActivateSubscription = (plan: 'diamond' | 'golden' | 'standard') => {
    const pkgDetails = {
      diamond: {
        title: 'اشتراک الماس VIP (۶ ماهه)',
        cost: 1490000,
        days: 180,
        expiry: '۶ ماه اعتبار فعال (۱۸۰ روز)',
        badge: '💎 اشتراک الماس ۶ ماهه',
      },
      golden: {
        title: 'اشتراک طلایی ویژه (۳ ماهه)',
        cost: 890000,
        days: 90,
        expiry: '۳ ماه اعتبار فعال (۹۰ روز)',
        badge: '🌟 اشتراک طلایی ۳ ماهه',
      },
      standard: {
        title: 'اشتراک معمولی استاندارد (۱ ماهه)',
        cost: 340000,
        days: 30,
        expiry: '۱ ماه اعتبار فعال (۳۰ روز)',
        badge: '⚡ اشتراک معمولی ۱ ماهه',
      },
    }[plan];

    // If user has enough wallet balance, activate directly from wallet
    if (user.walletBalance >= pkgDetails.cost) {
      onDeposit(-pkgDetails.cost, `خرید و فعال‌سازی ${pkgDetails.title} از موجودی کیف پول`);
      
      onUpdateUser({
        ...user,
        subscriptionPlan: plan,
        subscriptionTitle: pkgDetails.title,
        subscriptionRemainingDays: pkgDetails.days,
        subscriptionExpiry: pkgDetails.expiry,
      });

      userListings.forEach((ad) => {
        onUpdateAd({
          ...ad,
          vipTier: plan,
          vipBadge: pkgDetails.badge,
          vipExpiryDays: pkgDetails.days,
        });
      });

      onShowToast(`تبریک! ${pkgDetails.title} از موجودی کیف پول شما با موفقیت فعال شد و تمامی آگهی‌ها در بالاترین اولویت قرار گرفتند.`, 'success');
      return;
    }

    // If wallet balance is insufficient, route to Shaparak Payment Gateway
    setGatewayAmount(pkgDetails.cost);
    setGatewayDescription(`پرداخت آنلاین بانکی ${pkgDetails.title}`);
    setPendingGatewayAction({
      type: 'subscription',
      amount: pkgDetails.cost,
      plan,
      details: pkgDetails,
    });
    setIsGatewayOpen(true);
  };

  const handleGatewaySuccess = (referenceNumber: string) => {
    if (!pendingGatewayAction) return;

    if (pendingGatewayAction.type === 'deposit') {
      onDeposit(pendingGatewayAction.amount, `شارژ از درگاه شاپرک - شناسه ${referenceNumber}`);
      onShowToast(`کیف پول شما با موفقیت ${formatToman(pendingGatewayAction.amount)} تومان شارژ شد. (کد رهگیری: ${referenceNumber})`, 'success');
    } else if (pendingGatewayAction.type === 'subscription' && pendingGatewayAction.details && pendingGatewayAction.plan) {
      const plan = pendingGatewayAction.plan;
      const details = pendingGatewayAction.details;

      onUpdateUser({
        ...user,
        subscriptionPlan: plan,
        subscriptionTitle: details.title,
        subscriptionRemainingDays: details.days,
        subscriptionExpiry: details.expiry,
      });

      userListings.forEach((ad) => {
        onUpdateAd({
          ...ad,
          vipTier: plan,
          vipBadge: details.badge,
          vipExpiryDays: details.days,
        });
      });

      onShowToast(`پرداخت بانکی موفق! ${details.title} با موفقیت فعال شد. (کد رهگیری شاپرک: ${referenceNumber})`, 'success');
    }

    setIsGatewayOpen(false);
    setPendingGatewayAction(null);
  };

  const handleGatewayCancel = () => {
    setIsGatewayOpen(false);
    setPendingGatewayAction(null);
    onShowToast('پرداخت لغو گردید. هیچ تغییری در کیف پول یا اشتراک اعمال نشد.', 'warning');
  };

  const handleDepositInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = parseInt(raw, 10) || 0;
    setCustomDepositAmount(num);
    setDepositAmountStr(raw ? formatToman(num) : '');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      onShowToast('لطفاً نام و نام خانوادگی را وارد نمایید.', 'warning');
      return;
    }

    const updated: UserProfile = {
      ...user,
      name: profileName.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
      bio: profileBio.trim(),
      nationalId: profileNationalId.trim(),
      responseHours: profileResponseHours.trim(),
      city: profileCity.trim(),
      district: profileDistrict.trim(),
      avatar: profileAvatar.trim(),
    };

    onUpdateUser(updated);
    onShowToast('اطلاعات کاربری و پروفایل شما با موفقیت ذخیره و به‌روزرسانی شد.', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 text-right transition-colors">
      {/* Top Context & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
            <span>حساب کاربری</span>
            <span className="material-symbols-outlined text-[13px]">chevron_left</span>
            <span className="text-[#059669] dark:text-teal-400 font-bold">داشبورد و مدیریت آگهی‌ها</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            داشبورد کاربری و آگهی‌های من
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('post-ad')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>ثبت آگهی جدید</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Summary Cards (آگهی‌های من، ارتقاهای فعال، معاملات موفق، کل خریدهای انجام‌شده) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* 1: My Ads (Clickable to switch tab to my-ads) */}
        <div
          onClick={() => setSidebarTab('my-ads')}
          className="glass-card rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between gap-1.5 cursor-pointer hover:border-[#059669] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#059669] transition-colors">آگهی‌های من</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#059669]">
              {toPersianDigits(userListings.length)}
            </div>
            <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-0.5">
              <span>مشاهده و مدیریت آگهی‌ها</span>
              <span className="material-symbols-outlined text-[13px]">arrow_left</span>
            </span>
          </div>
        </div>

        {/* 2: Active Upgrades */}
        <div
          onClick={() => setSidebarTab('subscriptions')}
          className="glass-card rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between gap-1.5 cursor-pointer hover:border-[#ba0035] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#ba0035] transition-colors">ارتقاهای فعال</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#ba0035] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-[#ba0035]">
              ۳ بسته
            </div>
            <span className="text-[10px] text-slate-500">
              ۲ نردبان و ۱ فوری
            </span>
          </div>
        </div>

        {/* 3: Successful Deals (Clickable to open all 28 deals modal) */}
        <div
          onClick={() => setIsSuccessfulDealsModalOpen(true)}
          className="glass-card rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between gap-1.5 cursor-pointer hover:border-amber-500 hover:shadow-md transition-all group ring-1 ring-amber-400/30 bg-gradient-to-b from-amber-50/20 to-transparent"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 group-hover:text-amber-800 transition-colors">معاملات موفق</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">handshake</span>
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-amber-800 flex items-center gap-1.5">
              <span>۲۸</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded-full">مشاهده ۲۸ معامله</span>
            </div>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <span>تسویه‌شده با خریداران (کلیک کنید)</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </span>
          </div>
        </div>

        {/* 4: Total Purchases */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">کل خریدهای انجام‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                {formatToman(user.totalPurchases || 0)}
              </span>
              <span className="text-[10px] text-slate-500">تومان</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarTab('financials')}
              className="text-[10px] font-bold text-[#059669] hover:underline block text-right cursor-pointer mt-0.5"
            >
              مشاهده جزئیات گزارش مالی →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar (Col 4) & Content (Col 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Right Sidebar: Profile, Wallet & Menu */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Wallet Card with Arbitrary Deposit Amount */}
          <div className="bg-gradient-to-bl from-[#059669] to-[#0f766e] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-80">موجودی کیف پول و پرداخت</span>
              <span className="material-symbols-outlined opacity-60 text-[24px]">account_balance_wallet</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight">{formatToman(user.walletBalance)}</span>
              <span className="text-xs opacity-90">تومان</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-white/15">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-[#059669] text-xs font-bold hover:bg-slate-100 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>افزایش موجودی دلخواه</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('transactions')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="تاریخچه تراکنش‌ها"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </button>
            </div>
          </div>

          {/* Navigation Menu (All 6 interactive tabs) */}
          <nav className="bg-white rounded-3xl p-2 sm:p-3 shadow-xs border border-slate-100 flex flex-col gap-1 text-xs">
            <button
              type="button"
              onClick={() => setSidebarTab('my-ads')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'my-ads'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                <span>آگهی‌های من</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                sidebarTab === 'my-ads' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {toPersianDigits(userListings.length)}
              </span>
            </button>

            {/* NEW VIP SUBSCRIPTIONS TAB */}
            <button
              type="button"
              onClick={() => setSidebarTab('subscriptions')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'subscriptions'
                  ? 'bg-gradient-to-r from-purple-800 via-indigo-700 to-[#059669] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-amber-400">workspace_premium</span>
                <span>اشتراک‌های VIP و پکیج‌ها</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                sidebarTab === 'subscriptions'
                  ? 'bg-white/20 text-white'
                  : user.subscriptionPlan === 'diamond'
                  ? 'bg-purple-100 text-purple-800'
                  : user.subscriptionPlan === 'golden'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-[#059669]'
              }`}>
                {user.subscriptionPlan === 'diamond' ? '💎 الماس' : user.subscriptionPlan === 'golden' ? '🌟 طلایی' : '⚡ معمولی'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('financials')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'financials'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
                <span>گزارش درآمد و سود مالی</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                سودده
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('bookmarks')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'bookmarks'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
                <span>نشان‌شده‌ها و ذخیره‌ها</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                sidebarTab === 'bookmarks' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {toPersianDigits(bookmarkedCount)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">chat_bubble</span>
                <span>پیام‌ها و گفتگوها</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ba0035] text-white text-[10px] font-bold">
                ۳ جدید
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('transactions')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'transactions'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span>تراکنش‌ها و بسته‌ها</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('reviews')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'reviews'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">reviews</span>
                <span>نظرات و امتیازات</span>
              </div>
              <span className="text-amber-600 font-bold">۴.۹ ★</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('profile-settings')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                sidebarTab === 'profile-settings'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                <span>تنظیمات و اطلاعات شخصی</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_left</span>
            </button>
          </nav>

          {/* Seller Performance Pro-Tip Widget */}
          <div className="bg-slate-50 rounded-3xl p-4 sm:p-5 border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#059669]">
              <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
              <span className="font-bold text-xs text-slate-900">پکیج‌های تخفیف‌دار نردبان</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              با اعمال پکیج‌های ۳تایی و ۵تایی نردبان، تا <strong className="text-[#ba0035]">۴۰٪ تخفیف ویژه</strong> دریافت کرده و آگهی‌های خود را در ساعات پربازدید در صدر قرار دهید.
            </p>
            <button
              type="button"
              onClick={() => {
                if (userListings.length > 0) {
                  setLadderingAd(userListings[0]);
                } else {
                  onShowToast('ابتدا یک آگهی ثبت نمایید.', 'info');
                }
              }}
              className="text-[11px] text-[#059669] font-bold hover:underline flex items-center justify-end gap-1 mt-1 cursor-pointer"
            >
              <span>مشاهده پکیج‌های تخفیف نردبان</span>
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            </button>
          </div>
        </aside>

        {/* Left Main Content Pane */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* TAB 1: MY ADS */}
          {sidebarTab === 'my-ads' && (
            <>
              {/* Listings Management Stack */}
              <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      مدیریت و وضعیت آگهی‌های من
                    </h2>
                    <p className="text-xs text-slate-500">
                      برای ویرایش قیمت و مشخصات هر آگهی، روی دکمه ویرایش (کنار حذف) کلیک کنید.
                    </p>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs">
                    {[
                      { id: 'all' as const, label: 'همه', count: userListings.length },
                      { id: 'active' as const, label: 'فعال', count: userListings.filter((l) => l.status === 'active').length },
                      { id: 'pending' as const, label: 'در انتظار', count: userListings.filter((l) => l.status === 'pending').length },
                      { id: 'expired' as const, label: 'منقضی', count: userListings.filter((l) => l.status === 'expired').length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                          statusFilter === tab.id
                            ? 'bg-white text-[#059669] font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label} ({toPersianDigits(tab.count)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Toolbar */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در نام یا کد آگهی..."
                    className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* Listings Stack */}
                <div className="flex flex-col gap-3">
                  {filteredListings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl">inventory_2</span>
                      <p className="text-xs font-semibold">آگهی با این مشخصات یافت نشد.</p>
                    </div>
                  ) : (
                    filteredListings.map((ad) => (
                      <article
                        key={ad.id}
                        className="bg-white hover:bg-slate-50/70 rounded-2xl p-4 border border-slate-100 shadow-xs transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                      >
                        <div
                          onClick={() => onSelectListing(ad)}
                          className="flex items-start gap-4 min-w-0 cursor-pointer flex-1"
                        >
                          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100">
                            <img
                              src={ad.images[0]}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                            {ad.isUrgent && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#ba0035] text-white text-[10px] font-bold">
                                فوری
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col justify-between min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {ad.status === 'active' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                                  <span>فعال</span>
                                </span>
                              )}
                              {ad.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  <span>در حال بررسی</span>
                                </span>
                              )}
                              {ad.status === 'expired' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                  <span>منقضی شده</span>
                                </span>
                              )}
                              <span className="text-slate-400 text-xs">•</span>
                              <span className="text-[11px] text-slate-500">{ad.city}، {ad.neighborhood}</span>
                            </div>

                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 hover:text-[#059669] transition-colors mt-1">
                              {ad.title}
                            </h3>

                            <div className="mt-1 flex items-baseline gap-1 text-[#059669]">
                              <span className="font-extrabold text-xs sm:text-sm">
                                {ad.price === 0 || ad.isNegotiable ? 'توافقی' : formatToman(ad.price)}
                              </span>
                              {!ad.isNegotiable && ad.price > 0 && (
                                <span className="text-[10px] text-slate-400">تومان</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons (Next to delete button: EDIT BUTTON) */}
                        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-none border-slate-100 shrink-0">
                          {ad.status === 'expired' ? (
                            <button
                              type="button"
                              onClick={() => onRenewAd(ad.id)}
                              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#059669] text-white hover:bg-[#047857] text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">replay</span>
                              <span>تمدید آگهی</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLadderingAd(ad)}
                              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">bolt</span>
                              <span>ارتقا و نردبان</span>
                            </button>
                          )}

                          {/* EDIT AD BUTTON (کنار دکمه حذف) */}
                          <button
                            type="button"
                            onClick={() => setEditingAd(ad)}
                            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                            title="ویرایش محصول و مشخصات"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            <span className="hidden sm:inline">ویرایش</span>
                          </button>

                          {/* DELETE AD BUTTON */}
                          <button
                            type="button"
                            onClick={() => onDeleteAd(ad.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                            title="حذف آگهی"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB: VIP SUBSCRIPTIONS & PACKAGES (الماس ۶ ماهه، طلایی ۳ ماهه، معمولی ۱ ماهه) */}
          {sidebarTab === 'subscriptions' && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-[24px]">workspace_premium</span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      پکیج‌های اشتراک VIP فروشندگان و اولویت نمایش
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    پست‌ها و آگهی‌های دارای اشتراک VIP همیشه در بالاترین اولویت ویترین، اکسپلور و نتایج جستجو قرار می‌گیرند.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500">موجودی کیف پول:</span>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#059669] border border-teal-200 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{formatToman(user.walletBalance)} تومان</span>
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  </button>
                </div>
              </div>

              {/* Active Plan Hero Box */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-5 sm:p-6 text-white shadow-xl border border-purple-900/50">
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg text-2xl shrink-0">
                      {user.subscriptionPlan === 'diamond' ? '💎' : user.subscriptionPlan === 'golden' ? '🌟' : '⚡'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-300 font-extrabold">اشتراک فعال شما:</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                          فعال در کل سیستم
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black text-white mt-0.5">
                        {user.subscriptionTitle || 'اشتراک الماس ۶ ماهه (اولویت اول ویترین)'}
                      </h3>
                      <p className="text-xs text-purple-200/80 mt-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-400">schedule</span>
                        <span>
                          {toPersianDigits(user.subscriptionRemainingDays || 168)} روز اعتبار باقی‌مانده ({user.subscriptionExpiry || '۶ ماه کامل'})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-center">
                      <span className="text-[10px] text-purple-200 block">رتبه نمایش آگهی‌ها</span>
                      <strong className="text-xs text-amber-300 font-black">
                        {user.subscriptionPlan === 'diamond' ? 'بالاترین رتبه (اولویت ۱)' : user.subscriptionPlan === 'golden' ? 'رتبه ویژه (اولویت ۲)' : 'رتبه برتر (اولویت ۳)'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Section: Golden & Diamond Plans (اشتراک‌های طلایی و الماس به همراه پرداخت آنلاین و بات تلگرام) */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[24px]">workspace_premium</span>
                      <span>طرح‌های اشتراک فروشندگان برتر (طلایی و الماس VIP)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ارتقای رتبه آگهی‌ها در صدر نتایج، دریافت نشان رسمی و فعال‌سازی از طریق پرداخت آنلاین یا ربات تلگرام
                    </p>
                  </div>
                  <a
                    href="https://t.me/bazar_mahali_bot?start=vip_activation"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-black transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-sky-600">smart_toy</span>
                    <span>ربات رسمی: @bazar_mahali_bot</span>
                  </a>
                </div>

                {/* Grid of Golden and Diamond Plans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Plan 1: Golden Subscription (اشتراک طلایی) */}
                  <div className="relative rounded-3xl p-6 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/20 border-2 border-amber-300 shadow-md ring-1 ring-amber-400/20 flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                            🌟
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
                                پیشنهاد محبوب
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold">۳ ماهه (۹۰ روز)</span>
                            </div>
                            <h4 className="font-black text-base sm:text-lg text-slate-900 mt-1">
                              اشتراک طلایی فروشنده معتبر
                            </h4>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400 line-through">۴۵۰,۰۰۰ ت</span>
                          <span className="text-xl sm:text-2xl font-black text-amber-950">۳۴۰,۰۰۰ <span className="text-xs font-bold text-slate-500">تومان</span></span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-amber-100">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-amber-600">verified</span>
                          <span>نشان اصالت طلایی و تایید هویت در پروفایل و آگهی‌ها</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-amber-600">trending_up</span>
                          <span>نمایش در صدر نتایج دسته‌بندی و اولویت بالا در جستجو</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-amber-600">speed</span>
                          <span>۳۰ نردبان هوشمند خودکار در ساعات اوج ترافیک بازار</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-amber-600">smart_toy</span>
                          <span>دسترسی به ربات تلگرام جهت اعلام سریع و استعلام هوشمند</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-amber-100">
                      <a
                        href="https://t.me/bazar_mahali_bot?start=vip_golden"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                        <span>خرید از ربات تلگرام</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleActivateSubscription('golden')}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-400">credit_card</span>
                        <span>پرداخت آنلاین ({formatToman(450000)} ت)</span>
                      </button>
                    </div>
                  </div>

                  {/* Plan 2: Diamond Subscription (اشتراک الماس VIP) */}
                  <div className="relative rounded-3xl p-6 bg-gradient-to-b from-purple-50/70 via-white to-purple-50/20 border-2 border-purple-400 shadow-lg ring-1 ring-purple-400/30 flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                            💎
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black border border-purple-200">
                                بالاترین سطح VIP
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold">۶ ماهه (۱۸۰ روز)</span>
                            </div>
                            <h4 className="font-black text-base sm:text-lg text-purple-950 mt-1">
                              اشتراک الماس نامحدود (Diamond)
                            </h4>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400 line-through">۹۸۰,۰۰۰ ت</span>
                          <span className="text-xl sm:text-2xl font-black text-purple-950">۶۹۰,۰۰۰ <span className="text-xs font-bold text-slate-500">تومان</span></span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-purple-100">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-purple-600">diamond</span>
                          <span>نشان الماس درخشان VIP کنار نام فروشگاه و تمام آگهی‌ها</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-purple-600">stars</span>
                          <span>بالاترین اولویت مطلق در صدر صفحه اصلی، ویترین و اکسپلور</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-purple-600">all_inclusive</span>
                          <span>نردبان هوشمند نامحدود روزانه و کارمزد صفر درصد در معاملات</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-purple-600">support_agent</span>
                          <span>پشتیبانی مستقیم و اختصاصی ادمین ارشد ۲۴ ساعته</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-purple-100">
                      <a
                        href="https://t.me/bazar_mahali_bot?start=vip_diamond"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                        <span>خرید از ربات تلگرام</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleActivateSubscription('diamond')}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-purple-950 hover:bg-black text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-purple-300">credit_card</span>
                        <span>پرداخت آنلاین ({formatToman(690000)} ت)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* Admin Support Module (مرکز پیگیری مشکلات و پیام به ادمین ساپورت) */}
                {/* ============================================================== */}
                <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                      <span className="material-symbols-outlined text-[28px]">support_agent</span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>ارتباط مستقیم با ادمین ساپورت (پیگیری و حل مشکلات)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          پاسخگویی سریع
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        برای پیگیری واریز وجه، مشکلات سفارشات، فعال‌سازی اشتراک‌های الماس و طلایی، یا گزارش تخلف، مستقیماً به ادمین ساپورت پیام دهید.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                    <a
                      href="https://t.me/bazar_mahali_support"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>پیام به ادمین در تلگرام</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onShowToast('درخواست پیگیری شما برای ادمین ساپورت ثبت شد. کارشناسان به زودی در چت با شما تماس می‌گیرند.', 'info')}
                      className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-black text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#059669]">chat</span>
                      <span>ثبت درخواست پیگیری</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FINANCIALS & REVENUE ANALYTICS */}
          {sidebarTab === 'financials' && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#059669] text-[22px]">analytics</span>
                    <span>گزارش جامع مالی، درآمدها و سود معاملات</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">تحلیل دقیق خرید و فروش، سود ناخالص و درخواست تسویه حساب به شماره شبا</p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('درخواست تسویه حساب به شماره شبا با موفقیت ثبت شد و ظرف ۲۴ ساعت واریز می‌شود.', 'success')}
                  className="px-4 py-2 bg-gradient-to-r from-[#059669] to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  <span>درخواست تسویه به شبا</span>
                </button>
              </div>

              {/* 3 Core Finance Bento Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>مجموع درآمد ناخالص</span>
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-950">
                    {formatToman(user.totalRevenue || 34850000)} <span className="text-xs font-normal">تومان</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">از ۱۹ معامله فروش موفق</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                    <span>مجموع مخارج و خریدها</span>
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatToman(user.totalPurchases || 12400000)} <span className="text-xs font-normal">تومان</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">از ۹ معامله خرید موفق</span>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-[#059669] font-bold">
                    <span>سود خالص نهایی معاملات</span>
                    <span className="material-symbols-outlined text-[20px]">savings</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#059669]">
                    {formatToman(user.netProfit || 22450000)} <span className="text-xs font-normal">تومان</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold">حاشیه سود: ۶۴.۴٪ 📈</span>
                </div>
              </div>

              {/* Monthly Income Breakdown Bars */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#059669] text-[18px]">bar_chart</span>
                    <span>نمودار درآمد ماهانه فروش در بازار (۶ ماه اخیر):</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold">+۲۸.۵٪ رشد سالانه</span>
                </div>

                <div className="grid grid-cols-6 gap-2 items-end h-32 pt-4 px-2">
                  {[
                    { month: 'فروردین', amount: 3200000, height: '35%' },
                    { month: 'اردیبهشت', amount: 4800000, height: '50%' },
                    { month: 'خرداد', amount: 5600000, height: '60%' },
                    { month: 'تیر', amount: 6200000, height: '70%' },
                    { month: 'مرداد', amount: 7100000, height: '80%' },
                    { month: 'شهریور', amount: 7950000, height: '95%' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {toPersianDigits(Math.round(item.amount / 1000000))}M
                      </span>
                      <div
                        style={{ height: item.height }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#059669] to-teal-400 group-hover:from-[#047857] group-hover:to-teal-300 transition-all shadow-xs"
                      />
                      <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKMARKS & SAVED ADS */}
          {sidebarTab === 'bookmarks' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">نشان‌ها و آگهی‌های ذخیره‌شده</h2>
                  <p className="text-xs text-slate-500">لیست آگهی‌هایی که برای بررسی و خرید نشان کرده‌اید.</p>
                </div>
                <span className="text-xs text-[#059669] font-bold">{toPersianDigits(bookmarkedListings.length)} مورد</span>
              </div>

              {bookmarkedListings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">bookmark_border</span>
                  <p className="text-xs font-semibold">هنوز آگهی‌ای را ذخیره نکرده‌اید.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('categories')}
                    className="mt-2 px-4 py-2 bg-[#059669] text-white text-xs font-bold rounded-xl"
                  >
                    مشاهده آگهی‌های بازار
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedListings.map((ad) => (
                    <article
                      key={ad.id}
                      className="bg-white hover:bg-slate-50/80 rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between gap-3 group"
                    >
                      <div
                        onClick={() => onSelectListing(ad)}
                        className="cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                          <img src={ad.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(ad.id);
                            }}
                            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
                            title="حذف از ذخیره‌ها"
                          >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              bookmark
                            </span>
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-2">{ad.title}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-extrabold text-[#059669]">{formatToman(ad.price)} تومان</span>
                        <button
                          type="button"
                          onClick={() => onSelectListing(ad)}
                          className="text-xs text-[#059669] font-bold hover:underline"
                        >
                          مشاهده کامل ←
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSACTIONS & PACKAGES */}
          {sidebarTab === 'transactions' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">تاریخچه تراکنش‌ها و بسته‌های ارتقا</h2>
                  <p className="text-xs text-slate-500">لیست تمامی پرداختی‌ها، افزایش موجودی و خرید بسته‌های نردبان.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-3 py-1.5 bg-[#059669] text-white text-xs font-bold rounded-xl"
                >
                  + افزایش موجودی
                </button>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl">receipt</span>
                    <p className="text-xs font-semibold">تراکنشی یافت نشد.</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === 'deposit'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-[#ba0035]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {tx.type === 'deposit' ? 'arrow_downward' : 'rocket_launch'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{tx.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            کد پیگیری: {tx.referenceId} • {tx.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            tx.amount > 0 ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {tx.amount > 0 ? `+${formatToman(tx.amount)}` : formatToman(tx.amount)} تومان
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">موفق</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & RATINGS */}
          {sidebarTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">نظرات و امتیازات خریداران</h2>
                  <p className="text-xs text-slate-500">نظرات ثبت‌شده توسط مشتریان پس از معامله با شما.</p>
                </div>
                <span className="text-amber-600 font-bold text-sm">میانگین ۴.۹ از ۵ ★</span>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={rev.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                          <span className="text-[10px] text-slate-400 block">{rev.dealType} • {rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: rev.rating >= s ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAL PROFILE SETTINGS */}
          {sidebarTab === 'profile-settings' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#059669] text-[22px]">manage_accounts</span>
                    <span>تنظیمات و اطلاعات شخصی کاربر</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">نام، شماره همراه، تصویر آواتار، بیوگرافی و اطلاعات فروشندگی خود را ویرایش و ذخیره کنید.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  حساب کاربری فعال
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                {/* Avatar and Preset Selection */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <img src={profileAvatar} alt={profileName} className="w-18 h-18 rounded-2xl object-cover ring-2 ring-[#059669] shadow-xs" />
                    <span className="absolute -bottom-1 -left-1 bg-[#059669] text-white p-1 rounded-full text-[10px]">
                      <span className="material-symbols-outlined text-[12px] block">photo_camera</span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">انتخاب سریع آواتار یا لینک اختصاصی:</label>
                    <div className="flex items-center gap-2 mb-2">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfileAvatar(preset)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            profileAvatar === preset ? 'border-[#059669] ring-2 ring-[#059669]/30 scale-105' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="یا آدرس تصویر اختصاصی خود را وارد کنید..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">شماره همراه (تأیید پیامکی شده):</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Email & National ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">پست الکترونیکی (ایمیل):</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">کد ملی (جهت احراز هویت):</label>
                    <input
                      type="text"
                      value={profileNationalId}
                      onChange={(e) => setProfileNationalId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Bio / Seller Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">درباره شما / معرفی فروشنده:</label>
                  <textarea
                    rows={2}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="توضیح مختصری درباره سابقه فعالیت، شرایط فروش یا نحوه تحویل کالا بنویسید..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white resize-none"
                  />
                </div>

                {/* City, District & Response Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">شهر محل فعالیت:</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">محله پیش‌فرض:</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ساعات پاسخگویی به مشتریان:</label>
                    <input
                      type="text"
                      value={profileResponseHours}
                      onChange={(e) => setProfileResponseHours(e.target.value)}
                      placeholder="مثال: ۹ صبح الی ۱۰ شب"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#059669] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-7 py-3 bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>ذخیره کلیه تغییرات پروفایل</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* Successful Deals Modal (نمایش ۲۸ معامله موفق) */}
      <SuccessfulDealsModal
        isOpen={isSuccessfulDealsModalOpen}
        onClose={() => setIsSuccessfulDealsModalOpen(false)}
      />

      {/* Edit Ad Modal */}
      {editingAd && (
        <EditAdModal
          isOpen={!!editingAd}
          onClose={() => setEditingAd(null)}
          listing={editingAd}
          onSave={(updated) => {
            onUpdateAd(updated);
            setEditingAd(null);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Ladder Promo Modal */}
      {ladderingAd && (
        <LadderPromoModal
          isOpen={!!ladderingAd}
          onClose={() => setLadderingAd(null)}
          listing={ladderingAd}
          walletBalance={user.walletBalance}
          onApplyPromo={(pkgTitle, cost, discount) => {
            onRenewAd(ladderingAd.id);
            if (cost > 0) {
              onDeposit(-cost, `خرید پکیج ${pkgTitle}`);
            }
            setLadderingAd(null);
          }}
          onShowToast={onShowToast}
          onOpenWallet={() => {
            setLadderingAd(null);
            setIsDepositModalOpen(true);
          }}
        />
      )}

      {/* Custom Deposit Modal with Arbitrary Amount (مبلغ دلخواه) */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#059669] text-[24px]">account_balance_wallet</span>
                <h3 className="font-bold text-base text-slate-900">افزایش موجودی کیف پول</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4">
              {/* Arbitrary custom price input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  مبلغ دلخواه جهت شارژ (تومان):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={depositAmountStr}
                    onChange={handleDepositInputChange}
                    placeholder="مثال: ۱۵۰,۰۰۰"
                    className="w-full pr-4 pl-14 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold text-slate-900 focus:outline-none focus:border-[#059669] text-left"
                    dir="ltr"
                    autoFocus
                  />
                  <span className="absolute left-3 text-xs font-semibold text-slate-400">تومان</span>
                </div>
                <div className="text-[11px] text-teal-800 bg-teal-50 p-2 rounded-xl border border-teal-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-teal-600">info</span>
                  <span>معادل حروف: <strong>{numberToPersianWords(customDepositAmount)}</strong></span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">مبالغ سریع پیشنهادی:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setCustomDepositAmount(amt);
                        setDepositAmountStr(formatToman(amt));
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        customDepositAmount === amt
                          ? 'border-[#059669] bg-[#059669] text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{formatToman(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs text-white bg-[#059669] font-bold hover:bg-[#047857] rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  تکمیل شارژ حساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
