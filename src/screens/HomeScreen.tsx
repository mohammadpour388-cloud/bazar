import React, { useState, useEffect, useMemo } from 'react';
import { Listing, ScreenType } from '../types';
import { formatToman, toPersianDigits, mainCategories } from '../data/mockData';

interface HomeScreenProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onNavigate: (screen: ScreenType, category?: string) => void;
  selectedCity: string;
  selectedDistrict: string;
  onOpenCityModal: () => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onAddToCart?: (listing: Listing, quantity?: number) => void;
  onOpenCart?: () => void;
  onSearch?: (query: string) => void;
}

// Helper to normalize Persian characters and Arabic variants for 100% accurate search matching
const normalizePersian = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[آأإ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[\u200c\u200b]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const POPULAR_SEARCH_KEYWORDS = [
  'آیفون ۱۵ پرو مکس',
  'آیفون ۱۳ پرومکس',
  'آیفون کارکرده با فاکتور',
  'مک‌بوک پرو M3',
  'مک‌بوک ایر اپل',
  'لپ‌تاپ گیمینگ لنوو',
  'لپ‌تاپ ایسوس ROG',
  'پلی‌استیشن ۵ (PS5)',
  'گوشی سامسونگ S24 Ultra',
  'گوشی شیائومی پوکو',
  'ایرپاد پرو ۲ اپل',
  'ساعت هوشمند اپل واچ',
  'پژو ۲۰۷ اتوماتیک',
  'پراید ۱۱۱ و ۱۳۱',
  'تارا اتوماتیک صفر',
  'دنا پلاس توربو',
  'آپارتمان نوساز سعادت‌آباد',
  'اجاره آپارتمان نیاوران',
  'ویلا لوکس شمال',
  'تعمیرات پکیج و اسپلیت',
  'تاسیسات و لوله‌کشی فوری',
  'اتوبار و باربری اثاثیه منزل',
  'نظافت منزل و مهمانداری',
  'سوپرمارکت و میوه تازه',
  'پوشاک و هودی مردانه',
  'کفش نایک اورجینال',
  'فرش دستباف تبریز',
  'مبلمان راحتی چستر',
  'دوربین عکاسی سونی',
  'تلویزیون ۶۵ اینچ ۴K',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  listings,
  onSelectListing,
  onNavigate,
  selectedCity,
  selectedDistrict,
  onOpenCityModal,
  bookmarkedIds,
  onToggleBookmark,
  onShowToast,
  onAddToCart,
  onOpenCart,
  onSearch,
}) => {
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Live Autocomplete Keyword Phrases (کلمات و عبارات پیشنهادی فوری حین تایپ)
  const matchingKeywordPhrases = useMemo(() => {
    const q = normalizePersian(heroSearchQuery);
    if (!q) return [];
    
    const matchedCatalog = POPULAR_SEARCH_KEYWORDS.filter((phrase) =>
      normalizePersian(phrase).includes(q)
    );

    const listingTitles = listings
      .map((l) => l.title)
      .filter((t) => normalizePersian(t).includes(q))
      .slice(0, 4);

    return Array.from(new Set([...matchedCatalog, ...listingTitles])).slice(0, 5);
  }, [heroSearchQuery, listings]);

  // Live Autocomplete Matching Categories
  const matchingCategories = useMemo(() => {
    const q = normalizePersian(heroSearchQuery);
    if (!q) return [];
    return mainCategories.filter(
      (cat) =>
        normalizePersian(cat.title).includes(q) ||
        normalizePersian(cat.desc).includes(q)
    ).slice(0, 3);
  }, [heroSearchQuery]);

  // Live Autocomplete Matching Listings (کالاهای مرتبط با عکس و قیمت)
  const searchSuggestions = useMemo(() => {
    const q = normalizePersian(heroSearchQuery);
    if (!q) return [];
    return listings
      .filter((item) => {
        return (
          normalizePersian(item.title).includes(q) ||
          normalizePersian(item.category).includes(q) ||
          normalizePersian(item.description || '').includes(q) ||
          (item.tags && item.tags.some((t) => normalizePersian(t).includes(q))) ||
          normalizePersian(item.neighborhood).includes(q) ||
          normalizePersian(item.city).includes(q)
        );
      })
      .slice(0, 5);
  }, [heroSearchQuery, listings]);

  const [activeRecentFilter, setActiveRecentFilter] = useState<'all' | 'with-photo' | 'with-price' | 'verified'>('all');
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('all');
  const [isRegisterBizModalOpen, setIsRegisterBizModalOpen] = useState(false);
  const [isRequestServiceModalOpen, setIsRequestServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  // Digikala & Apple Hero Banner Carousel State
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Digikala Incredible Offers Countdown Timer (ساعت شگفت‌انگیز)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 48, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Business registration form
  const [bizForm, setBizForm] = useState({
    title: '',
    category: 'plumbing',
    categoryName: 'فنی و لوله‌کشی',
    ownerName: '',
    phone: '',
    city: selectedCity || 'تهران',
    licenseNumber: '',
    description: '',
  });

  // Service dispatch request form
  const [serviceReqForm, setServiceReqForm] = useState({
    phone: '',
    address: selectedDistrict ? `${selectedDistrict}، ` : '',
    timing: 'فوری (کمتر از ۲۰ دقیقه)',
    notes: '',
  });

  const [businessList, setBusinessList] = useState([
    {
      id: 'biz-1',
      title: 'تاسیسات و لوله‌کشی نوین',
      category: 'plumbing',
      categoryTitle: 'فنی و لوله‌کشی',
      icon: 'plumbing',
      iconBg: 'bg-[#9cf2e8]/30 text-[#059669]',
      phone: '۰۲۱-۲۲۰۰۳۳۰۰',
      rating: 4.8,
      reviewsCount: 124,
      desc: 'تشخیص ترکیدگی لوله با دستگاه دیجیتال، لوله‌بازکنی فوری و نصب شیرآلات در سراسر مناطق با ضمانت کتبی.',
      perk: 'اعزام کمتر از ۲۰ دقیقه • ضمانت ۶ ماهه',
      buttonAction: 'تماس مستقیم',
      tags: ['رفع نم و بو', 'دستگاه نشت‌یاب دیجیتال', 'نرخ اتحادیه'],
    },
    {
      id: 'biz-2',
      title: 'اتوبار و باربری امین شهر',
      category: 'cargo',
      categoryTitle: 'باربری و حمل بار',
      icon: 'local_shipping',
      iconBg: 'bg-[#ffdada] text-[#ba0035]',
      phone: '۰۲۱-۴۴۰۰۵۵۰۰',
      rating: 4.9,
      reviewsCount: 310,
      desc: 'بسته‌بندی حرفه‌ای اثاثیه منزل با کارتن چندلایه، کارگران مجرب و بیمه‌نامه معتبر با خاورهای مسقف و موکت‌کاری شده.',
      perk: 'بیمه رایگان تا ۱۰۰ میلیون • اعزام کارگر متخصص',
      buttonAction: 'استعلام قیمت',
      tags: ['کارتن ۵ لایه', 'کامیونت مسقف', 'پوشش سراسری'],
    },
    {
      id: 'biz-3',
      title: 'سرویس تخصصی پکیج و اسپلیت دماوند',
      category: 'hvac',
      categoryTitle: 'تهویه و سرمایش/گرمایش',
      icon: 'hvac',
      iconBg: 'bg-amber-100 text-amber-800',
      phone: '۰۲۱-۸۸۰۰۹۹۰۰',
      rating: 4.7,
      reviewsCount: 88,
      desc: 'سرویس دوره‌ای، رسوب‌زدایی پکیج، عیب‌یابی بردهای الکترونیکی و شارژ گاز کولر گازی با قطعات فابریک و نرخ اتحادیه.',
      perk: 'تضمین ۶ ماهه خدمات • قطعات اورجینال شرکتی',
      buttonAction: 'درخواست متخصص',
      tags: ['شارژ گاز R410', 'رسوب‌زدایی پکیج', 'تکنسین مجاز'],
    },
    {
      id: 'biz-4',
      title: 'خدمات نظافت و تشریفات پاکیزان',
      category: 'cleaning',
      categoryTitle: 'نظافت و مهمانداری',
      icon: 'cleaning_services',
      iconBg: 'bg-emerald-100 text-emerald-800',
      phone: '۰۲۱-۷۷۰۰۴۴۱۱',
      rating: 4.9,
      reviewsCount: 205,
      desc: 'اعزام نیروی خانم و آقا با احراز هویت کامل و عدم سوء‌پیشینه جهت نظافت منازل، راه‌پله، دفاتر اداری و پذیرایی مراسم.',
      perk: 'نیروهای گزینش شده • همراه با مواد شوینده نانو',
      buttonAction: 'رزرو نیرو',
      tags: ['تایید عدم سوءپیشینه', 'نظافت راه‌پله', 'پذیرایی مجالس'],
    },
    {
      id: 'biz-5',
      title: 'امداد خودرو و مکانیک سیار پایتخت',
      category: 'auto',
      categoryTitle: 'خدمات خودرو و یدک‌کش',
      icon: 'car_repair',
      iconBg: 'bg-blue-100 text-blue-800',
      phone: '۰۲۱-۵۵۴۴۲۲۰۰',
      rating: 4.8,
      reviewsCount: 167,
      desc: 'حمل با خودروبر کفی هیدرولیک بدون آسیب به سپر، تعویض لنت، باتری به باتری و پنچرگیری سیار ۲۴ ساعته در محل.',
      perk: 'حضور فوری در محل • امداد ۲۴ ساعته شبانه‌روزی',
      buttonAction: 'امداد فوری',
      tags: ['خودروبر کفی', 'تعویض باتری', 'مکانیک سیار'],
    },
    {
      id: 'biz-6',
      title: 'دپارتمان املاک و مشاوره حقوقی مسکن نوین',
      category: 'realestate',
      categoryTitle: 'املاک و معاملات ملکی',
      icon: 'apartment',
      iconBg: 'bg-purple-100 text-purple-800',
      phone: '۰۲۱-۲۲۱۱۴۴۳۳',
      rating: 4.9,
      reviewsCount: 95,
      desc: 'کارشناسی قیمت ملک، تنظیم قرارداد با کدرهگیری معتبر زیر نظر وکلای پایه یک و فایل‌های اختصاصی فروش و رهن منطقه.',
      perk: 'تنظیم قرارداد با کدرهگیری سامانه خودنویس',
      buttonAction: 'مشاوره رایگان',
      tags: ['کد رهگیری آنی', 'کارشناسی قیمت', 'مشاوره حقوقی'],
    },
  ]);

  // VIP Priority sorting weights: Diamond (3000), Golden (2000), Standard (1000)
  const getListingPriorityWeight = (ad: Listing): number => {
    if (ad.vipTier === 'diamond') return 3000;
    if (ad.vipTier === 'golden') return 2000;
    if (ad.vipTier === 'standard') return 1000;
    if (ad.isLaddered) return 200;
    if (ad.isFeatured) return 150;
    if (ad.isUrgent) return 100;
    return 0;
  };

  const urgentListings = [...listings]
    .filter((l) => l.isUrgent)
    .sort((a, b) => getListingPriorityWeight(b) - getListingPriorityWeight(a));
  
  const recentListings = [...listings]
    .filter((l) => {
      if (activeRecentFilter === 'with-photo') return l.images.length > 0;
      if (activeRecentFilter === 'with-price') return l.price > 0;
      if (activeRecentFilter === 'verified') return l.isVerifiedSeller;
      return true;
    })
    .sort((a, b) => {
      // 1. VIP Subscription Priority ALWAYS first!
      const vipDiff = getListingPriorityWeight(b) - getListingPriorityWeight(a);
      if (vipDiff !== 0) return vipDiff;

      // 2. City match
      if (selectedCity && selectedCity !== 'کل ایران' && selectedCity !== 'همه شهرها') {
        const aMatch = a.city === selectedCity ? 1 : 0;
        const bMatch = b.city === selectedCity ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
      return 0;
    });

  // Joyful Story Circles & Quick Access Categories (حلقه‌های استوری شاد آوان مارکت با رینگ‌های خوش‌رنگ و متمایز)
  const storyItems = [
    {
      id: 'incredible',
      title: 'شگفت‌انگیزها',
      icon: 'local_fire_department',
      color: 'from-[#ff2d55] via-[#ff3b30] to-[#ff9500]',
      badge: 'داغ',
      onClick: () => {
        const el = document.getElementById('incredible-deals-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else onNavigate('home');
      },
    },
    {
      id: 'digital',
      title: 'دیجیتال & اپل',
      icon: 'devices',
      color: 'from-[#007aff] via-[#5856d6] to-[#00c7be]',
      badge: 'مهلت تست',
      onClick: () => onNavigate('categories', 'کالای دیجیتال'),
    },
    {
      id: 'supermarket',
      title: 'سوپرمارکت',
      icon: 'bolt',
      color: 'from-[#34c759] via-[#30b0c7] to-[#00c7be]',
      badge: 'فوری ۴۵m',
      onClick: () => onNavigate('categories', 'دارو، مکمل و سلامت'),
    },
    {
      id: 'vehicles',
      title: 'خودرو و موتور',
      icon: 'directions_car',
      color: 'from-[#ff9500] via-[#ff3b30] to-[#af52de]',
      badge: 'کارشناسی',
      onClick: () => onNavigate('categories', 'وسایل نقلیه'),
    },
    {
      id: 'realestate',
      title: 'املاک & مسکن',
      icon: 'apartment',
      color: 'from-[#00c7be] via-[#34c759] to-[#30b0c7]',
      badge: 'کدرهگیری',
      onClick: () => onNavigate('categories', 'املاک'),
    },
    {
      id: 'vip',
      title: 'ویترین VIP',
      icon: 'diamond',
      color: 'from-[#af52de] via-[#bf5af2] to-[#ff2d55]',
      badge: 'ویدیوها',
      onClick: () => onNavigate('showcase'),
    },
    {
      id: 'fashion',
      title: 'مد و پوشاک',
      icon: 'checkroom',
      color: 'from-[#ff2d55] via-[#ff375f] to-[#ff6482]',
      badge: 'حراجی',
      onClick: () => onNavigate('categories', 'وسایل شخصی'),
    },
    {
      id: 'services',
      title: 'خدمات فوری',
      icon: 'home_repair_service',
      color: 'from-[#007aff] via-[#00c7be] to-[#5856d6]',
      badge: 'تضمینی',
      onClick: () => onNavigate('categories', 'خدمات'),
    },
  ];

  // Joyful Hero Promotional Banners Carousel (با برند اختصاصی آوان مارکت با رنگ‌های شاد و زنده)
  const heroBanners = [
    {
      id: 'banner-apple',
      title: 'جشنواره بزرگ محصولات دیجیتال و اپل',
      subtitle: 'آیفون ۱۳ و ۱۵ پرو مکس، مک‌بوک و ایرپاد با تست ۴۸ ساعته و فاکتور اصالت',
      discountBadge: 'تخفیف ویژه تا ۲۸٪',
      bgGradient: 'from-blue-700 via-indigo-600 to-sky-600',
      accentColor: 'text-cyan-200',
      btnText: 'مشاهده آیفون و گجت‌ها',
      category: 'کالای دیجیتال',
      badge: 'جشنواره طلایی',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAdxIatkIF7qLU9jrVUW6fcSCszt6SsOH5x6PMxR6VWBjnKMUiCU_UR2URm65xgS7ZIitjjTNaO4hQELKTBAIlpTcwQvDYKEpDyNzOxSjltLa92MPHyA7HXyM4OX55waQImgo2OA5R-2pYJTK9W8Ys6aXY1UBCfI0NxZgQiKbSP61oKEaVFdxXcIcZgAdscvzdhAHC8_U-pXNkDk-xuZP0Z21NrdO97snT4xU712FWI62CD6H84HvU6Q',
    },
    {
      id: 'banner-incredible',
      title: 'پیشنهادهای شگفت‌انگیز ۲۴ ساعته',
      subtitle: 'حراج استثنایی انواع کالاها، دیجیتال و تجهیزات بدون کمیسیون و ۱۰۰٪ بی‌واسطه',
      discountBadge: 'تا ۴۵٪ تخفیف',
      bgGradient: 'from-rose-600 via-red-600 to-amber-500',
      accentColor: 'text-yellow-200',
      btnText: 'ورود به حراج شگفت‌انگیز',
      category: 'همه',
      badge: '۲۴ ساعته',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwgH-iIZTUCXiNR8rDGo5iJZwWy2uvCNlWsMOs_cDSL8-WkDmsFgkgCzM4FnwkKrXJMRgjXQczyGGy9ZcoT8rtjSywVXy8bAT40AI_nhrxr9ae38Ihn4c3gh-zKUTaw8xvT-9u0_pMk1WIOazK92FI7GnbuoUDKBPtSxJC0C0VcreW1eLVBimN4ebWofeARxUfpZIJUdKl-ErOuQ-tfP7ioPjNwA5uSyveQpkReovgA71kNwMOvYsh7g',
    },
    {
      id: 'banner-express',
      title: 'سوپرمارکت و تحویل فوری زیر ۴۵ دقیقه',
      subtitle: 'خرید مواد غذایی، مکمل و نیازهای روزمره محله با ارسال رایگان و تحویل در محل',
      discountBadge: 'ارسال رایگان محله',
      bgGradient: 'from-emerald-700 via-teal-600 to-emerald-500',
      accentColor: 'text-emerald-200',
      btnText: 'سفارش فوری سوپرمارکت',
      category: 'دارو، مکمل و سلامت',
      badge: 'اکسپرس فوری',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2QgD7rzD9WlqoakBFTnnznHeeBiz2LMEhkTmdCBI9f5HDxLkIG_vCaG30o4IA8TKjxGoYir-9sYxKewhlzgpGXHf6BYLFcAauIUoF3mKUzuEZXfiEAEz3KnhCInPjCatWUsUu_5EsgA2cgbc3PNVgeIByVtVgff6ToRsUA12KTZdoKxaDE4KFqnJyngCa2JLRORErtLEpDR1xvQ-hmMMx8mDE6HbFzNubuZIvmd87XVQiTIR1GG0Bbg',
    },
  ];

  // Auto-switch hero banners
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % heroBanners.length);
    }, 5500);
    return () => clearInterval(bannerTimer);
  }, [heroBanners.length]);

  // Digikala Incredible Deals Data
  const incredibleDeals = useMemo(() => {
    return listings.slice(0, 8).map((item, idx) => {
      const discountPercent = [35, 24, 18, 42, 28, 15, 30, 22][idx % 8];
      const originalPrice = Math.round(item.price / (1 - discountPercent / 100));
      return {
        ...item,
        discountPercent,
        originalPrice,
        stockSold: [85, 92, 60, 78, 90, 45, 88, 70][idx % 8],
      };
    });
  }, [listings]);


  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      if (onSearch) {
        onSearch(heroSearchQuery.trim());
      } else {
        onNavigate('categories');
      }
    } else {
      onNavigate('categories');
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#ffffff] selection:bg-[#ef394a] selection:text-white">
      {/* 1. Joyful Story Circles & Quick Access - Centered & Balanced Layout (استوری‌های شاد آوان مارکت - کاملاً وسط‌چین) */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-2">
        <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-3 sm:gap-6 py-2 px-1 mx-auto overflow-x-auto sm:overflow-visible scrollbar-none">
          {storyItems.map((story) => (
            <button
              key={story.id}
              onClick={story.onClick}
              className="group flex flex-col items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none transition-transform hover:-translate-y-1.5"
            >
              {/* Rotating / Pulsing Colorful Gradient Ring with Joyful Vivid Colors */}
              <div className={`relative p-[2.5px] rounded-full bg-gradient-to-tr ${story.color} shadow-sm group-hover:shadow-lg transition-all group-hover:scale-105`}>
                <div className="p-0.5 sm:p-1 rounded-full bg-white dark:bg-slate-900">
                  <div className="w-[52px] h-[52px] sm:w-[62px] sm:h-[62px] rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px] sm:text-[28px]">{story.icon}</span>
                  </div>
                </div>
                {story.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff3b30] text-white text-[9px] font-black shadow-xs whitespace-nowrap">
                    {story.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Hero Section with Clean Atmospheric Lighting & Apple Bento Showcase */}
      {/* 2. Hero Section with Joyful Atmospheric Glow & Cheerful Colors (بدون مشکی خالص با رنگ‌های شاد و پرانرژی) */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50/40 via-rose-50/25 via-emerald-50/20 to-white pb-8 sm:pb-16 pt-3 sm:pt-6">
        {/* Ambient Mesh Glow Orbs in Joyful Warm & Cool Tones */}
        <div className="absolute -top-36 right-1/4 w-[520px] h-[520px] bg-gradient-to-br from-rose-400/25 via-pink-400/20 to-amber-300/20 rounded-full blur-3xl pointer-events-none animate-float-gentle" />
        <div className="absolute -top-24 -left-20 w-[480px] h-[480px] bg-gradient-to-tr from-teal-400/25 via-sky-300/20 to-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[360px] h-[360px] bg-gradient-to-br from-amber-300/20 via-orange-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Trust Badge - Joyful Cheerful Capsule with Colorful Gradients (بدون مشکی خالص) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border border-rose-200/80 shadow-xs hover:shadow-md transition-all mb-3 select-none">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xs">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            </span>
            <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-700 bg-clip-text text-transparent font-black text-xs sm:text-sm tracking-tight">
              بازار آنلاین آوان • نسل نوین داد و ستد شاد، هوشمند و بدون واسطه
            </span>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Main Headline - Joyful, Vivid & Free of Harsh Black */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight max-w-3xl leading-[1.3] sm:leading-[1.25]">
            خرید و فروش بی‌واسطه،{' '}
            <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent underline decoration-wavy decoration-amber-400 decoration-2 underline-offset-8">
              شگفت‌انگیز و پرنشاط
            </span>{' '}
            در سراسر ایران
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mt-3 mb-3 leading-relaxed font-bold">
            از جدیدترین گوشی‌های آیفون و لپ‌تاپ تا خودرو، مسکن و خدمات فوری؛ سریع، امن و با بهترین قیمت معامله کنید! ✨
          </p>

          {/* Live Search Bar with Joyful Colors & Rounded Full Pill Styling */}
          <div className="relative w-full max-w-2xl my-2 sm:my-3 z-30">
            <form
              onSubmit={handleHeroSearch}
              className="relative w-full flex items-center bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-1.5 sm:p-2 shadow-xl shadow-teal-500/10 border-2 border-teal-400 hover:border-teal-500 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-400/20 transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shrink-0 shadow-sm mr-1">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                  search
                </span>
              </div>
              <input
                type="text"
                value={heroSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setHeroSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="جستجوی آیفون، مک‌بوک، خودرو، ملک یا خدمات..."
                className="w-full h-10 sm:h-11 px-3 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-bold focus:outline-none"
              />
              {heroSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHeroSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer ml-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
              <button
                type="submit"
                className="h-10 sm:h-11 px-5 sm:px-8 rounded-xl sm:rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-md shadow-teal-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <span>جستجو</span>
                <span className="material-symbols-outlined text-[18px]">arrow_left</span>
              </button>
            </form>

            {/* Live Autocomplete Suggestions Dropdown Panel (کلمات پیشنهادی و نتایج زنده) */}
            {isSearchFocused && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsSearchFocused(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 py-3 px-2 z-40 text-right animate-in fade-in zoom-in-95 max-h-[420px] overflow-y-auto">
                  {/* Case 1: When user has typed query */}
                  {heroSearchQuery.trim() ? (
                    <>
                      {/* Suggested Autocomplete Keyword Phrases (کلمات پیشنهادی هوشمند و پرجستجو) */}
                      {matchingKeywordPhrases.length > 0 && (
                        <div className="pb-2 mb-2 border-b border-slate-100">
                          <span className="text-[11px] font-black text-slate-400 px-3 mb-1 block">
                            کلمات و عبارات پیشنهادی:
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {matchingKeywordPhrases.map((phrase) => (
                              <button
                                key={phrase}
                                type="button"
                                onClick={() => {
                                  setHeroSearchQuery(phrase);
                                  setIsSearchFocused(false);
                                  if (onSearch) onSearch(phrase);
                                  else onNavigate('categories');
                                }}
                                className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-right flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-emerald-600 group-hover:scale-110 transition-transform">
                                    search
                                  </span>
                                  <span>{phrase}</span>
                                </div>
                                <span className="material-symbols-outlined text-[15px] text-slate-300 group-hover:text-emerald-600">
                                  north_west
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Categories */}
                      {matchingCategories.length > 0 && (
                        <div className="pb-2 mb-2 border-b border-slate-100">
                          <span className="text-[11px] font-black text-slate-400 px-3 mb-1.5 block">
                            دسته‌بندی‌های مرتبط:
                          </span>
                          <div className="flex flex-wrap gap-1.5 px-2">
                            {matchingCategories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setIsSearchFocused(false);
                                  onNavigate('categories', cat.title);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] text-teal-600">
                                  {cat.icon}
                                </span>
                                <span>{cat.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Listing Items */}
                      <div className="px-3 pb-1 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-black text-emerald-800">
                          کالاهای مرتبط با «{heroSearchQuery}»:
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {toPersianDigits(searchSuggestions.length)} کالا
                        </span>
                      </div>

                      {searchSuggestions.length > 0 ? (
                        <div className="divide-y divide-slate-100 mt-1">
                          {searchSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setIsSearchFocused(false);
                                onSelectListing(item);
                              }}
                              className="w-full p-2.5 rounded-xl hover:bg-emerald-50/60 flex items-center gap-3 transition-colors text-right cursor-pointer group"
                            >
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-black">
                                    {item.category}
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium text-slate-600">{item.city}، {item.neighborhood}</span>
                                </div>
                              </div>
                              <div className="shrink-0 text-left">
                                <span className="text-sm font-black text-emerald-700 font-mono">
                                  {formatToman(item.price)}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold mr-1">تومان</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500 font-medium">
                          با زدن کلید اینتر یا دکمه «جستجو»، تمام آگهی‌های مرتبط نمایش داده خواهند شد.
                        </div>
                      )}

                      <div className="pt-2 mt-2 border-t border-slate-100 px-2 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            setIsSearchFocused(false);
                            handleHeroSearch(e);
                          }}
                          className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>مشاهده همه نتایج برای «{heroSearchQuery}»</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_left</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Case 2: When input is focused with empty query - Show trending queries & popular words */
                    <div className="p-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 mb-2 px-1">
                        <span className="material-symbols-outlined text-rose-500 text-[18px]">
                          local_fire_department
                        </span>
                        <span>بیشترین جستجوهای اخیر کاربران:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3 px-1">
                        {[
                          'آیفون ۱۵ پرو مکس',
                          'مک‌بوک M3',
                          'پژو ۲۰۷ اتومات',
                          'اجاره آپارتمان',
                          'پلی‌استیشن ۵',
                          'خدمات لوله‌کشی',
                          'سوپرمارکت اکسپرس',
                          'ساعت هوشمند',
                        ].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setHeroSearchQuery(term);
                              setIsSearchFocused(false);
                              if (onSearch) onSearch(term);
                              else onNavigate('categories');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px] text-slate-400">search</span>
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 px-1">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          دسته‌بندی‌های پیشنهادی:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {mainCategories.slice(0, 4).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setIsSearchFocused(false);
                                onNavigate('categories', c.title);
                              }}
                              className="p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px] text-emerald-600">{c.icon}</span>
                              <span className="truncate">{c.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Trending Searches - Cheerful, Colorful & Joyful Tags (بدون رنگ مشکی و ظاهر تکراری) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 text-xs">
            <span className="flex items-center gap-1 text-rose-600 font-black px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-rose-500 animate-pulse">local_fire_department</span>
              پرطرفدارترین‌ها:
            </span>
            {[
              { label: 'آیفون ۱۵ پرو', color: 'bg-rose-50/90 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300' },
              { label: 'مک‌بوک M3', color: 'bg-sky-50/90 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300' },
              { label: 'آپارتمان سعادت‌آباد', color: 'bg-emerald-50/90 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' },
              { label: 'پژو ۲۰۷', color: 'bg-amber-50/90 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300' },
              { label: 'پلی‌استیشن ۵', color: 'bg-purple-50/90 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setHeroSearchQuery(item.label);
                  if (onSearch) {
                    onSearch(item.label);
                  } else {
                    onNavigate('categories');
                  }
                }}
                className={`px-3 py-1 rounded-full ${item.color} shadow-xs border transition-all hover:scale-105 font-black cursor-pointer text-[11px] sm:text-xs flex items-center gap-1`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Digikala + Apple Full-Width Interactive Hero Promotional Banner Carousel */}
          <div className="w-full max-w-5xl mt-3 sm:mt-6 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60">
            <div
              className={`relative p-5 sm:p-8 md:p-10 text-white bg-gradient-to-l ${heroBanners[activeBannerIdx].bgGradient} transition-all duration-700 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-8 min-h-[220px] sm:min-h-[270px] text-right overflow-hidden`}
            >
              {/* Subtle Ambient Background Flare */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-start z-10 max-w-lg">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black border border-white/20">
                    {heroBanners[activeBannerIdx].badge}
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-900 text-[10px] font-black animate-pulse">
                    {heroBanners[activeBannerIdx].discountBadge}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black leading-tight text-white mb-1.5 sm:mb-2">
                  {heroBanners[activeBannerIdx].title}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-medium mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {heroBanners[activeBannerIdx].subtitle}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('categories', heroBanners[activeBannerIdx].category === 'همه' ? undefined : heroBanners[activeBannerIdx].category)}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-slate-800 hover:bg-slate-50 hover:text-emerald-700 font-black text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <span>{heroBanners[activeBannerIdx].btnText}</span>
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_left</span>
                </button>
              </div>

              {/* Banner Right Image Visual */}
              <div className="relative z-10 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-52 shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all">
                  <img
                    src={heroBanners[activeBannerIdx].image}
                    alt={heroBanners[activeBannerIdx].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Slider Controls Arrows */}
              <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 flex items-center gap-1.5 sm:gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setActiveBannerIdx((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
                  title="قبلی"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_right</span>
                </button>
                <div className="flex items-center gap-1.5 px-1.5 sm:px-2">
                  {heroBanners.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveBannerIdx(dotIdx)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        activeBannerIdx === dotIdx ? 'w-5 sm:w-6 bg-white' : 'w-1.5 sm:w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBannerIdx((prev) => (prev + 1) % heroBanners.length)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
                  title="بعدی"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_left</span>
                </button>
              </div>
            </div>
          </div>

          {/* Apple-Style Interactive Bento Feature Showcase Cards (طراحی تمیز با رنگ‌های زنده و شاد بدون کاور تیره و بدون مشکی خالص) */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mt-6 sm:mt-10 text-right">
            {/* Bento Card 1: Apple & Tech Gadgets */}
            <div
              onClick={() => onNavigate('categories', 'کالای دیجیتال')}
              className="group relative p-4 sm:p-5 rounded-3xl bg-white border-2 border-sky-200 hover:border-sky-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-sky-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>📱</span>
                  <span>گجت و کالای دیجیتال</span>
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-sky-700 transition-colors">
                  آیفون و مک‌بوک‌های اصیل
                </h3>
                <p className="text-[11px] text-slate-600 font-bold mt-0.5">همراه با تست سلامت و مهلت کارشناسی</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0 mr-3">
                <span className="material-symbols-outlined text-[26px]">devices</span>
              </div>
            </div>

            {/* Bento Card 2: Safe Car & Real Estate */}
            <div
              onClick={() => onNavigate('categories', 'املاک')}
              className="group relative p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>🏡</span>
                  <span>املاک و خودرو سراسر کشور</span>
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                  معاملات مطمئن حضوری
                </h3>
                <p className="text-[11px] text-slate-600 font-bold mt-0.5">بازدید مستقیم با حضور طرفین معامله</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0 mr-3">
                <span className="material-symbols-outlined text-[26px]">verified_user</span>
              </div>
            </div>

            {/* Bento Card 3: VIP Diamond Network */}
            <div
              onClick={() => onNavigate('showcase')}
              className="group relative p-4 sm:p-5 rounded-3xl bg-white border-2 border-rose-200 hover:border-rose-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>💎</span>
                  <span>ویترین VIP و ویدیوها</span>
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-rose-700 transition-colors">
                  فروشندگان تاییدشده با ریتینگ ۵
                </h3>
                <p className="text-[11px] text-slate-600 font-bold mt-0.5">ویدیوهای واقعی تست و آنباکس کالا</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0 mr-3">
                <span className="material-symbols-outlined text-[26px]">diamond</span>
              </div>
            </div>
          </div>

          {/* Platform Trust Stats Band - Cheerful, High-Contrast & Clear Persian Fonts (بدون مشکی خالص) */}
          <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-8 sm:mt-12 text-center">
            {/* 1. آگهی فعال روزانه */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 mb-2">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight font-mono">
                +۴۸۰,۰۰۰
              </span>
              <span className="text-xs sm:text-sm text-slate-700 font-black mt-1">
                آگهی فعال روزانه
              </span>
            </div>

            {/* 2. استان‌های سراسر کشور */}
            <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/90 border-2 border-rose-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 mb-2">
                <span className="material-symbols-outlined text-[26px]">location_on</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-rose-800 tracking-tight font-mono">
                ۳۱ استان
              </span>
              <span className="text-xs sm:text-sm text-slate-700 font-black mt-1">
                سراسر کشور
              </span>
            </div>

            {/* 3. معامله مستقیم و بی‌واسطه */}
            <div className="p-4 sm:p-5 rounded-3xl bg-teal-50/90 border-2 border-teal-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 mb-2">
                <span className="material-symbols-outlined text-[26px]">handshake</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-teal-800 tracking-tight font-mono">
                ۱۰۰٪ مستقیم
              </span>
              <span className="text-xs sm:text-sm text-slate-700 font-black mt-1">
                معامله بدون کارمزد
              </span>
            </div>

            {/* 4. کاربر فعال ماهانه */}
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/90 border-2 border-blue-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 mb-2">
                <span className="material-symbols-outlined text-[26px]">group</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-blue-800 tracking-tight font-mono">
                +۲,۵۰۰,۰۰۰
              </span>
              <span className="text-xs sm:text-sm text-slate-700 font-black mt-1">
                کاربر فعال ماهانه
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Signature Incredible Offers Carousel - Centered & Balanced Layout */}
      <section id="incredible-deals-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#ba0035] via-[#e11d48] to-[#ff4757] p-4 sm:p-6 text-white shadow-digi-glow relative overflow-hidden flex flex-col items-stretch gap-4 sm:gap-6">
          {/* Subtle Ambient Red Glow Orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/20 rounded-full blur-3xl pointer-events-none" />

          {/* Centered Top Header Bar inside Incredible Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full z-10 gap-3 border-b border-white/20 pb-4 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md animate-digi-breath">
                <span className="material-symbols-outlined text-[30px] text-yellow-300">local_fire_department</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">پیشنهادهای شگفت‌انگیز ویژه</h2>
                <span className="text-xs text-rose-100 font-bold">تخفیف‌های استثنایی با مهلت تست و تضمین اصالت کالا</span>
              </div>
            </div>

            {/* Live Countdown Timer Centered */}
            <div className="flex items-center gap-2 direction-ltr bg-black/25 px-4 py-2 rounded-2xl border border-white/20">
              <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-xs font-mono font-black text-white">
                {toPersianDigits(String(timeLeft.seconds).padStart(2, '0'))}
              </div>
              <span className="text-white font-black">:</span>
              <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-xs font-mono font-black text-white">
                {toPersianDigits(String(timeLeft.minutes).padStart(2, '0'))}
              </div>
              <span className="text-white font-black">:</span>
              <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-xs font-mono font-black text-white">
                {toPersianDigits(String(timeLeft.hours).padStart(2, '0'))}
              </div>
              <span className="text-xs text-white/90 font-bold mr-1">فرصت باقی‌مانده</span>
            </div>

            <button
              onClick={() => onNavigate('categories')}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده همه کالاها</span>
              <span className="material-symbols-outlined text-[16px]">arrow_left</span>
            </button>
          </div>

          {/* Left / Middle: Horizontal Carousel of Incredible Offer Product Cards */}
          <div className="flex-1 overflow-x-auto scrollbar-none py-1 flex items-stretch gap-3 sm:gap-4 z-10">
            {incredibleDeals.map((deal) => {
              return (
                <div
                  key={deal.id}
                  onClick={() => onSelectListing(deal)}
                  className="w-48 sm:w-56 shrink-0 rounded-2xl bg-white text-slate-900 p-3 sm:p-4 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group select-none"
                >
                  <div>
                    {/* Product Image Frame */}
                    <div className="relative w-full h-36 sm:h-44 rounded-xl bg-slate-50 overflow-hidden mb-3">
                      <img
                        src={deal.images[0]}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      {/* Digikala Iconic Red Discount Percentage Badge */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#ef394a] text-white text-[11px] font-black shadow-md flex items-center">
                        {toPersianDigits(deal.discountPercent)}٪
                      </span>
                      {/* Special Digikala Express pill */}
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] text-slate-700 font-bold flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px] text-[#ef394a]">bolt</span>
                        <span>ارسال امروز</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#ef394a] transition-colors text-right">
                      {deal.title}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-right">
                    {/* Price Block */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 line-through tabular-nums font-mono">
                        {formatToman(deal.originalPrice)}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-black text-slate-950 font-mono tabular-nums">
                          {formatToman(deal.price)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">تومان</span>
                      </div>
                    </div>

                    {/* Stock Sold Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-[#ef394a] h-full rounded-full transition-all"
                        style={{ width: `${deal.stockSold}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 text-left font-medium">
                      تنها {toPersianDigits(deal.stockCount || 2)} عدد در انبار باقیست
                    </span>
                  </div>
                </div>
              );
            })}

            {/* View All Card at end of slider */}
            <div
              onClick={() => onNavigate('categories')}
              className="w-36 sm:w-44 shrink-0 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#ef394a] flex items-center justify-center shadow-lg mb-3 group-hover:-translate-x-1 transition-transform">
                <span className="material-symbols-outlined text-[24px]">arrow_left</span>
              </div>
              <span className="text-sm font-black text-white">مشاهده همه</span>
              <span className="text-[11px] text-white/80 mt-1">بیش از ۵۰۰ کالا</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Grid Colorful Promotional Cards (بنرهای رنگارنگ و شاد بازار نو) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Laptop & Tech */}
          <div
            onClick={() => onNavigate('categories', 'کالای دیجیتال')}
            className="group relative p-4 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px] text-right"
          >
            <div className="z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-white/15 px-2 py-0.5 rounded-full">
                تجهیزات دیجیتال
              </span>
              <h3 className="text-sm sm:text-base font-black mt-2 text-white group-hover:text-cyan-200 transition-colors">
                لپ‌تاپ و مک‌بوک M3
              </h3>
              <p className="text-[11px] text-white/80 mt-1">با تست و ضمانت بازگشت وجه</p>
            </div>
            <div className="flex items-center justify-between z-10 mt-3">
              <span className="text-[11px] font-bold text-cyan-200 flex items-center gap-1">
                <span>مشاهده</span>
                <span className="material-symbols-outlined text-[14px]">arrow_left</span>
              </span>
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
              </span>
            </div>
          </div>

          {/* Card 2: Apple AirPods & Gadgets */}
          <div
            onClick={() => onNavigate('categories', 'کالای دیجیتال')}
            className="group relative p-4 rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px] text-right"
          >
            <div className="z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-100 bg-white/15 px-2 py-0.5 rounded-full">
                لوازم صوتی
              </span>
              <h3 className="text-sm sm:text-base font-black mt-2 text-white group-hover:text-teal-200 transition-colors">
                ایرپاد و ساعت هوشمند
              </h3>
              <p className="text-[11px] text-white/80 mt-1">اصالت کالا با تضمین تست</p>
            </div>
            <div className="flex items-center justify-between z-10 mt-3">
              <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1">
                <span>مشاهده</span>
                <span className="material-symbols-outlined text-[14px]">arrow_left</span>
              </span>
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">headphones</span>
              </span>
            </div>
          </div>

          {/* Card 3: Home & Living */}
          <div
            onClick={() => onNavigate('categories', 'خانه و آشپزخانه')}
            className="group relative p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px] text-right"
          >
            <div className="z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 bg-white/15 px-2 py-0.5 rounded-full">
                خانه و آشپزخانه
              </span>
              <h3 className="text-sm sm:text-base font-black mt-2 text-white group-hover:text-amber-200 transition-colors">
                دکوراسیون و مبلمان
              </h3>
              <p className="text-[11px] text-white/80 mt-1">تخفیف‌های استثنایی محله</p>
            </div>
            <div className="flex items-center justify-between z-10 mt-3">
              <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                <span>مشاهده</span>
                <span className="material-symbols-outlined text-[14px]">arrow_left</span>
              </span>
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">chair</span>
              </span>
            </div>
          </div>

          {/* Card 4: Auto & Vehicles */}
          <div
            onClick={() => onNavigate('categories', 'وسایل نقلیه')}
            className="group relative p-4 rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-pink-700 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px] text-right"
          >
            <div className="z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 bg-white/15 px-2 py-0.5 rounded-full">
                خودرو و یدکی
              </span>
              <h3 className="text-sm sm:text-base font-black mt-2 text-white group-hover:text-rose-200 transition-colors">
                دنیای خودرو و اسپرت
              </h3>
              <p className="text-[11px] text-white/80 mt-1">همراه با کارشناسی رسمی</p>
            </div>
            <div className="flex items-center justify-between z-10 mt-3">
              <span className="text-[11px] font-bold text-rose-200 flex items-center gap-1">
                <span>مشاهده</span>
                <span className="material-symbols-outlined text-[14px]">arrow_left</span>
              </span>
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Supermarket Express (سوپرمارکت و خرید روزمره محله با ارسال فوری ۴۵ دقیقه) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg shrink-0">
              <span className="material-symbols-outlined text-[32px] sm:text-[38px] text-yellow-300">bolt</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black">
                  ارسال فوری زیر ۴۵ دقیقه
                </span>
                <span className="text-xs text-emerald-100 font-bold hidden sm:inline">سوپرمارکت اکسپرس محله</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">
                خرید روزمره، مکمل، مواد غذایی و پروتئینی با پیک رایگان
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                سفارش آسان از نزدیک‌ترین فروشگاه‌های تاییدشده محله با تحویل درب منزل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => onNavigate('categories', 'دارو، مکمل و سلامت')}
              className="w-full md:w-auto px-6 py-3 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>ورود به سوپرمارکت</span>
              <span className="material-symbols-outlined text-[18px]">arrow_left</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Categories Grid (iOS Widget / Apple Bento Style with Vibrant Colors) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-teal-700 mb-1">
              <span className="material-symbols-outlined text-[20px]">category</span>
              <span className="text-xs font-bold uppercase tracking-wider">دسته‌بندی‌های برگزیده</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">چه چیزی را جستجو می‌کنید؟</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
            دسترسی سریع به هزاران کالای نو و در حد نو، املاک مسکونی و تجاری، خودرو و خدمات تخصصی در محله شما.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {mainCategories.map((cat, idx) => {
            // Apple-inspired distinct vibrant themes for each category
            const colorThemes = [
              { bg: 'from-emerald-500 to-teal-600', ring: 'group-hover:border-emerald-400', badge: 'bg-emerald-50 text-emerald-700' },
              { bg: 'from-amber-500 to-orange-500', ring: 'group-hover:border-amber-400', badge: 'bg-amber-50 text-amber-700' },
              { bg: 'from-blue-600 to-cyan-500', ring: 'group-hover:border-blue-400', badge: 'bg-blue-50 text-blue-700' },
              { bg: 'from-rose-500 to-pink-500', ring: 'group-hover:border-rose-400', badge: 'bg-rose-50 text-rose-700' },
              { bg: 'from-purple-600 to-violet-500', ring: 'group-hover:border-purple-400', badge: 'bg-purple-50 text-purple-700' },
              { bg: 'from-teal-600 to-emerald-500', ring: 'group-hover:border-teal-400', badge: 'bg-teal-50 text-teal-700' },
              { bg: 'from-indigo-600 to-sky-500', ring: 'group-hover:border-indigo-400', badge: 'bg-indigo-50 text-indigo-700' },
              { bg: 'from-orange-500 to-amber-600', ring: 'group-hover:border-orange-400', badge: 'bg-orange-50 text-orange-700' },
              { bg: 'from-fuchsia-600 to-pink-600', ring: 'group-hover:border-fuchsia-400', badge: 'bg-fuchsia-50 text-fuchsia-700' },
            ];
            const theme = colorThemes[idx % colorThemes.length];

            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('categories', cat.title)}
                className={`group flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 text-right hover:-translate-y-1.5 cursor-pointer ${theme.ring}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <span className="material-symbols-outlined text-[26px]">
                      {cat.icon}
                    </span>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${theme.badge}`}>
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Urgent & Featured Listings Section (آگهی‌های ویژه و فوری - طراحی لوکس گالری) */}
      <section className="relative w-full bg-gradient-to-b from-[#fff5f6]/60 via-white to-[#f8fafc] py-12 sm:py-20 border-y border-slate-200/70 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ba0035] to-[#f43f5e] text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950">آگهی‌های ویژه و فوری</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    فروش در ۲۴ ساعت
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  تخفیف‌های استثنایی و فروشندگان مصمم به فروش فوری در محله شما
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('categories')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full apple-glass text-rose-700 hover:text-rose-800 text-xs sm:text-sm font-bold transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              <span>مشاهده همه فوری‌ها</span>
              <span className="material-symbols-outlined text-[18px]">arrow_left</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {urgentListings.slice(0, 4).map((ad) => {
              const isBookmarked = bookmarkedIds.has(ad.id);
              return (
                <article
                  key={ad.id}
                  onClick={() => onSelectListing(ad)}
                  className={`apple-card group relative flex flex-col rounded-3xl bg-white overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 ${
                    ad.vipTier === 'diamond'
                      ? 'border-2 border-purple-400/80 shadow-md ring-2 ring-purple-300/30'
                      : ad.vipTier === 'golden'
                      ? 'border-2 border-amber-400/80 shadow-sm'
                      : 'border border-slate-200/80'
                  }`}
                >
                  <div className="relative w-full h-48 sm:h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute top-2.5 right-2.5 flex flex-wrap items-center gap-1.5 z-10">
                      {ad.vipTier === 'diamond' && (
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-800 via-indigo-600 to-teal-500 text-white text-[10px] font-black shadow-lg flex items-center gap-1 border border-white/40 backdrop-blur-md">
                          <span>💎</span>
                          <span>الماس ۶ ماهه</span>
                        </span>
                      )}
                      {ad.vipTier === 'golden' && (
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1 border border-white/50">
                          <span>🌟</span>
                          <span>طلایی ۳ ماهه</span>
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ba0035] to-[#f43f5e] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">bolt</span>
                        فوری
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ad.id);
                      }}
                      className={`absolute top-2.5 left-2.5 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-all hover:scale-110 ${
                        isBookmarked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[19px]"
                        style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        bookmark
                      </span>
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                      <span>{ad.images.length} تصویر</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between text-right">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#ef394a] transition-colors line-clamp-2 leading-snug">
                        {ad.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2 font-medium">
                        <span>{ad.city}، {ad.neighborhood}</span>
                        <span>•</span>
                        <span>{ad.timeAgo}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold">قیمت معامله:</span>
                        <span className="font-black text-base sm:text-lg text-[#ef394a] font-mono tabular-nums">
                          {formatToman(ad.price)}{' '}
                          <span className="text-[11px] text-slate-500 font-bold">تومان</span>
                        </span>
                      </div>
                      <span className="w-9 h-9 rounded-2xl bg-rose-50 text-[#ef394a] flex items-center justify-center group-hover:bg-[#ef394a] group-hover:text-white transition-all shadow-2xs group-hover:scale-105">
                        <span className="material-symbols-outlined text-[19px]">chevron_left</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Recent Regional Listings (جدیدترین آگهی‌های منطقه با طراحی مدرن و شاد) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[#ef394a] mb-1">
              <span className="material-symbols-outlined text-[20px]">feed</span>
              <span className="text-xs font-bold uppercase tracking-wider">تازه‌ترین‌های محله</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              جدیدترین آگهی‌های {selectedCity}
            </h2>
          </div>

          {/* Quick Filter Buttons with Joyful Red Active State */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveRecentFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeRecentFilter === 'all'
                  ? 'bg-[#ef394a] text-white shadow-sm shadow-rose-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه آگهی‌ها
            </button>
            <button
              onClick={() => setActiveRecentFilter('with-photo')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeRecentFilter === 'with-photo'
                  ? 'bg-[#ef394a] text-white shadow-sm shadow-rose-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              عکس‌دار
            </button>
            <button
              onClick={() => setActiveRecentFilter('with-price')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeRecentFilter === 'with-price'
                  ? 'bg-[#ef394a] text-white shadow-sm shadow-rose-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              قیمت‌دار
            </button>
            <button
              onClick={() => setActiveRecentFilter('verified')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeRecentFilter === 'verified'
                  ? 'bg-[#ef394a] text-white shadow-sm shadow-rose-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              تایید هویت شده
            </button>
          </div>
        </div>


        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentListings.slice(0, 8).map((ad) => {
            const isBookmarked = bookmarkedIds.has(ad.id);
            return (
              <article
                key={ad.id}
                onClick={() => onSelectListing(ad)}
                className={`group flex flex-col rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  ad.vipTier === 'diamond'
                    ? 'border-2 border-indigo-400/80 shadow-md ring-1 ring-purple-300/40'
                    : ad.vipTier === 'golden'
                    ? 'border-2 border-amber-400/80 shadow-sm'
                    : ad.vipTier === 'standard'
                    ? 'border-2 border-teal-300'
                    : 'border border-slate-100'
                }`}
              >
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* VIP Badges */}
                  <div className="absolute top-2.5 right-2.5 flex flex-wrap items-center gap-1.5 z-10">
                    {ad.vipTier === 'diamond' && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 border border-white/40">
                        <span>💎</span>
                        <span>الماس ۶ ماهه</span>
                      </span>
                    )}
                    {ad.vipTier === 'golden' && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-900 text-[10px] font-black shadow-md flex items-center gap-1 border border-white/40">
                        <span>🌟</span>
                        <span>طلایی ۳ ماهه</span>
                      </span>
                    )}
                    {ad.vipTier === 'standard' && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 border border-white/20">
                        <span>⚡</span>
                        <span>معمولی ۱ ماهه</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(ad.id);
                    }}
                    className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs transition-colors ${
                      isBookmarked ? 'text-[#ba0035]' : 'text-slate-400 hover:text-[#ba0035]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      bookmark
                    </span>
                  </button>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                    {ad.city}، {ad.neighborhood}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between text-right">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#ef394a] transition-colors line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {ad.condition === 'like-new' ? 'در حد نو' : ad.condition === 'new' ? 'نو و آکبند' : 'کارکرده'} • {ad.timeAgo}
                    </p>

                    {/* Stock Inventory Tag */}
                    <div className="mt-2 flex items-center justify-between">
                      {ad.stockCount !== undefined && ad.stockCount > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          ad.stockCount <= 2 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ad.stockCount <= 2 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                          <span>
                            {ad.stockCount <= 2 ? `تنها ${toPersianDigits(ad.stockCount)} عدد در انبار` : `موجودی: ${toPersianDigits(ad.stockCount)} عدد`}
                          </span>
                        </span>
                      ) : ad.stockCount === 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          ناموجود
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">موجود در انبار</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100">
                    <span className="font-black text-sm text-slate-900 font-mono tabular-nums">
                      {ad.price > 0 ? `${formatToman(ad.price)} تومان` : 'توافقی'}
                    </span>
                    
                    {/* Quick Add to Cart Button */}
                    {ad.price > 0 && (ad.stockCount === undefined || ad.stockCount > 0) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) {
                            onAddToCart(ad, 1);
                          } else {
                            onShowToast(`«${ad.title}» به سبد خرید اضافه شد.`, 'success');
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-[#ef394a] text-[#ef394a] hover:text-white transition-all shadow-2xs group/btn flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="افزودن مستقیم به سبد خرید"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span className="hidden group-hover/btn:inline">افزودن</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
            <span>مشاهده همه آگهی‌ها در {selectedCity}</span>
          </button>
        </div>
      </section>

      {/* 5. Popular Local Services & Verified Businesses (Expanded Hub) */}
      <section className="w-full bg-slate-50 py-10 sm:py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-[#059669] mb-1.5">
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span className="text-xs font-bold uppercase tracking-wider">صنوف و متخصصین تاییدشده محله</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                بازار خدمات و کسب‌وکارهای برگزیده
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                دسترسی مستقیم و بدون واسطه به معتبرترین اصناف، کارشناسان فنی و ارائه‌دهندگان خدمات محلی
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterBizModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] text-white hover:bg-[#047857] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">add_business</span>
                <span>ثبت کسب‌وکار و صنف شما</span>
              </button>
            </div>
          </div>

          {/* Business Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {[
              { id: 'all', title: 'همه اصناف و خدمات', icon: 'apps' },
              { id: 'plumbing', title: '🛠️ فنی و تاسیسات', icon: 'plumbing' },
              { id: 'cargo', title: '🚚 باربری و حمل بار', icon: 'local_shipping' },
              { id: 'hvac', title: '❄️ پکیج و سرمایش', icon: 'hvac' },
              { id: 'cleaning', title: '🧹 نظافت و مهمانداری', icon: 'cleaning_services' },
              { id: 'auto', title: '🚗 امداد خودرو و مکانیک', icon: 'car_repair' },
              { id: 'realestate', title: '🏢 املاک و مشاوران', icon: 'apartment' },
            ].map((tab) => {
              const isActive = businessCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBusinessCategoryFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Business Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businessList
              .filter((b) => businessCategoryFilter === 'all' || b.category === businessCategoryFilter)
              .map((biz) => (
                <div
                  key={biz.id}
                  className="p-5 rounded-3xl bg-white shadow-xs hover:shadow-md border border-slate-100 transition-all flex flex-col justify-between text-right group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${biz.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          <span className="material-symbols-outlined text-[26px]">{biz.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#059669] transition-colors">
                              {biz.title}
                            </h3>
                            <span
                              className="material-symbols-outlined text-[#059669] text-[17px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                              title="کسب‌وکار تایید شده آوان مارکت"
                            >
                              verified
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                              ★ {biz.rating} ({biz.reviewsCount} نظر مشتری)
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">{biz.categoryTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {biz.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {biz.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Perk Banner */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                      <span className="material-symbols-outlined text-[#059669] text-base">task_alt</span>
                      <span className="truncate">{biz.perk}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedService(biz);
                          setIsRequestServiceModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        استعلام آنلاین
                      </button>
                      <button
                        type="button"
                        onClick={() => onShowToast(`تماس مستقیم با ${biz.title}: ${biz.phone}`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span>{biz.buttonAction}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Business Owner Promotion Banner */}
          <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm text-teal-300 flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-[32px]">store</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  صاحب صنف، کارگاه یا متخصص خدماتی در محله هستید؟
                </h3>
                <p className="text-xs text-teal-100 mt-1 max-w-2xl leading-relaxed">
                  کسب‌وکار خود را به بیش از ۵۰ هزار مشتری در محله‌تان معرفی کنید. بدون کمیسیون و کارمزد، با نشان تاییدیه صنف و دریافت مستقیم سفارشات.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRegisterBizModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-teal-50 font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-sm transition-all cursor-pointer"
            >
              ثبت رایگان واحد صنفی
            </button>
          </div>
        </div>
      </section>

      {/* 6. Security, Safety & Fast Deals Pillars (Bento Style) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>استاندارد‌های طلایی پلتفرم</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            چرا آوان مارکت، انتخابی لذت‌بخش و متمایز است؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            تجربه خریدی شفاف، مستقیم و کاملاً بومی با بالاترین استانداردهای امنیتی و طراحی روز دنیا
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="apple-card flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center mb-4 shadow-md shadow-teal-500/20">
              <span className="material-symbols-outlined text-[28px]">speed</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-950">ثبت آگهی در کمتر از ۱ دقیقه</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              فرآیند بسیار روان و سریع با تکمیل هوشمند مشخصات و انتشار بدون معطلی در دید صدها هزار کاربر.
            </p>
          </div>

          <div className="apple-card flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
              <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-950">ارتباط بی‌واسطه و چت امن</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              گفتگوی مستقیم با خریدار یا فروشنده بدون نیاز به اشتراک شماره تماس و امکان ارسال عکس و لوکیشن.
            </p>
          </div>

          <div className="apple-card flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-500/20">
              <span className="material-symbols-outlined text-[28px]">money_off</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-950">معاملات کاملاً رایگان</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              هیچ درصدی از ارزش معامله دریافت نمی‌شود و تمام سود خرید و فروش مستقیماً برای خود شماست.
            </p>
          </div>

          <div className="apple-card flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-[28px]">security</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-950">تایید هویت و نظارت مداوم</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              احراز هویت پیامکی و سامانه شاهکار همراه با پایش هوشمند گزارش کاربران برای خرید و فروش امن.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Interactive Map / Neighborhood Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl apple-glass p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/80 shadow-xl">
          <div className="flex flex-col max-w-xl z-10 text-right">
            <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>کاوش محله‌محور</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
              آگهی‌های اطراف خانه یا محل کار خود را بیابید
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed font-medium">
              با انتخاب دقیق محدوده شهری خود، هزینه‌های حمل‌ونقل را به صفر برسانید و قبل از خرید، کالا را حضوری در محله خودتان بررسی فرمایید.
            </p>
            <div className="flex flex-wrap gap-2">
              {['تهران بزرگ', 'کرج و البرز', 'اصفهان', 'مشهد', 'شیراز', 'تبریز'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={onOpenCityModal}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-950 hover:text-white text-slate-800 text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer border border-slate-200/60"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="w-full lg:w-1/2 h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-white/80">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZXa6uEwvCaN-53SvIiN2nUvAyMhh0TTO5ZJBjS0vscQC2XX-JMGRJ1-vKuxnbRuTHMq61Dy7P2MWU6UzEJeC9pTOZ9yydnnlVAgzYIS0g04V5hKZgXJludWnxAhzNNpIwgNNOq2WiGjxXLu77dim3ufySbbYOgylD69qcf1ckBIgS9pg30Pyja2IJqyTrdctvGCr-nA9Uojxv6ZTgMLvdrgRK-E203TY4_CNVS6JII3fS-f1AgHi0-Q')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-5 sm:p-6 text-white text-right">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-extrabold text-base sm:text-lg">نقشه تعاملی شهر تهران</p>
                  <p className="text-xs text-slate-300 font-medium">بیش از ۳۵۰ محله دارای آگهی اختصاصی</p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('نقشه تعاملی محله‌ها باز شد.')}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  باز کردن نقشه
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Mobile App CTA Banner (Apple Keynote Style) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-teal-950 to-slate-900 text-white p-7 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col max-w-xl text-center md:text-right z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md self-center md:self-start mb-4 text-xs font-bold border border-white/15 text-emerald-300">
              <span className="material-symbols-outlined text-[18px]">install_mobile</span>
              <span>نسخه جدید آوان مارکت منتشر شد</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
              خرید و فروش بی‌واسطه در جیب شما با اپلیکیشن موبایل
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 mb-8 leading-relaxed font-medium">
              با فعال‌سازی نوتیفیکیشن اختصاصی، به محض ثبت آگهی جدید مطابق با کالای دلخواهتان یا محله شما، در سریع‌ترین زمان مطلع شوید.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5">
              <button
                type="button"
                onClick={() => onShowToast('اپلیکیشن رسمی آوان مارکت به زودی در دسترس کاربران قرار می‌گیرد.', 'info')}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-xl text-right cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[28px] text-teal-800">android</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold">دریافت مستقیم</span>
                  <span className="text-xs font-black">نسخه اندروید (APK)</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onShowToast('نصب نسخه PWA وب‌اپلیکیشن آوان مارکت')}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all shadow-xl text-right cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-[28px] text-white">phone_iphone</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-teal-200 font-bold">وب‌اپلیکیشن PWA</span>
                  <span className="text-xs font-black">ویژه آیفون و iOS</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative w-48 sm:w-60 h-60 sm:h-72 shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtxoa5Gh7lwjtDNI7JXu7L9pFUpkcn_orZw9DDZK9Bysdyj4Q1a_LFz_Z49qWPyBSRmP5pNHwhBhWa8teoQrQXNQIquauH_RW7BTe8AbNjf4ZgyKT-4oqAs6ot202M2M8kE-af5A7y4K0sZVzlpfY68600qhzuWdWRJ5zb4mA7dgwjQV81fVoIbH2XQ_mJbNngUYqQs_SFzA2rRb994aO3rT_g7v3nU9FH14aylk24wjXuw7GnL0wy0A"
                alt="اپلیکیشن آوان مارکت"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. Safe Trading Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-xs border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                راهنمای معامله امن در آوان مارکت
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                پیش از بررسی کالا از نزدیک، از واریز بیعانه به حساب فروشنده خودداری کنید. قرار ملاقات در اماکن شلوغ و عمومی توصیه می‌شود.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onShowToast('راهنمای خرید امن باز شد.')}
            className="px-5 py-2 rounded-xl bg-slate-100 text-[#059669] hover:bg-[#059669] hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
          >
            مطالعه نکات امنیتی
          </button>
        </div>
      </section>

      {/* MODAL: Register Business & Service */}
      {isRegisterBizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#059669] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">ثبت واحد صنفی یا تخصص محلی</h3>
                  <p className="text-[11px] text-slate-400">معرفی رایگان خدمات شما در {selectedCity || 'محله شما'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterBizModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!bizForm.title.trim() || !bizForm.phone.trim()) {
                  onShowToast('لطفاً نام کسب‌وکار و شماره تماس را وارد کنید.');
                  return;
                }
                const newBiz = {
                  id: `biz-${Date.now()}`,
                  title: bizForm.title,
                  category: bizForm.category,
                  categoryTitle: bizForm.categoryName,
                  icon:
                    bizForm.category === 'plumbing'
                      ? 'plumbing'
                      : bizForm.category === 'cargo'
                      ? 'local_shipping'
                      : bizForm.category === 'hvac'
                      ? 'hvac'
                      : bizForm.category === 'cleaning'
                      ? 'cleaning_services'
                      : bizForm.category === 'auto'
                      ? 'car_repair'
                      : 'apartment',
                  iconBg: 'bg-teal-50 text-[#059669]',
                  phone: bizForm.phone,
                  rating: 5.0,
                  reviewsCount: 1,
                  desc: bizForm.description || 'خدمات رسمی با کادر مجرب و دارای مجوز صنفی در منطقه.',
                  perk: 'عضو جدید تاییدشده • نرخ مصوب اتحادیه',
                  buttonAction: 'تماس مستقیم',
                  tags: ['تازه تاسیس', 'صنف تایید شده', bizForm.city],
                };
                setBusinessList([newBiz, ...businessList]);
                setIsRegisterBizModalOpen(false);
                setBizForm({
                  title: '',
                  category: 'plumbing',
                  categoryName: 'فنی و لوله‌کشی',
                  ownerName: '',
                  phone: '',
                  city: selectedCity || 'تهران',
                  licenseNumber: '',
                  description: '',
                });
                onShowToast(`واحد صنفی «${newBiz.title}» با موفقیت در آوان مارکت ثبت شد!`);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">نام فروشگاه یا خدمت فنی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لوله‌کشی برادران مرادی، اتوبار ظفر..."
                  value={bizForm.title}
                  onChange={(e) => setBizForm({ ...bizForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رسته صنفی / حوزه خدمات:</label>
                  <select
                    value={bizForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catNames: Record<string, string> = {
                        plumbing: 'فنی و لوله‌کشی',
                        cargo: 'باربری و حمل بار',
                        hvac: 'تهویه و سرمایش/گرمایش',
                        cleaning: 'نظافت و مهمانداری',
                        auto: 'خدمات خودرو و یدک‌کش',
                        realestate: 'املاک و معاملات ملکی',
                      };
                      setBizForm({ ...bizForm, category: val, categoryName: catNames[val] || 'خدمات' });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  >
                    <option value="plumbing">🛠️ فنی، لوله‌کشی و تاسیسات</option>
                    <option value="cargo">🚚 باربری و اثاث‌کشی</option>
                    <option value="hvac">❄️ پکیج، کولر و گرمایش</option>
                    <option value="cleaning">🧹 نظافت منزل و راه پله</option>
                    <option value="auto">🚗 امداد خودرو و مکانیک سیار</option>
                    <option value="realestate">🏢 املاک و دپارتمان</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">شماره تماس مستقیم مشتریان:</label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲... یا ۰۲۱..."
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام و نام‌خانوادگی مدیر:</label>
                  <input
                    type="text"
                    placeholder="نام مسئول واحد صنفی"
                    value={bizForm.ownerName}
                    onChange={(e) => setBizForm({ ...bizForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">شماره پروانه / جواز کسب (اختیاری):</label>
                  <input
                    type="text"
                    placeholder="کد صنفی یا شماره پروانه اتحادیه"
                    value={bizForm.licenseNumber}
                    onChange={(e) => setBizForm({ ...bizForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیح کوتاه خدمات و مزیت رقابتی:</label>
                <textarea
                  rows={3}
                  placeholder="ساعت کاری، ضمانت کار، تخصص‌های خاص و نحوه اعزام کارشناس..."
                  value={bizForm.description}
                  onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2 text-teal-800">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>ثبت کسب‌وکار کاملاً رایگان است و اطلاعات بلافاصله در بخش متخصصین منتشر می‌شود.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterBizModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold shadow-xs"
                >
                  ثبت و انتشار کسب‌وکار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Instant Online Service / Quote Request */}
      {isRequestServiceModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-right shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-base text-slate-900">درخواست آنلاین استعلام و کارشناس</h3>
                <p className="text-[11px] text-teal-800 font-bold mt-0.5">{selectedService.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!serviceReqForm.phone.trim()) {
                  onShowToast('لطفاً شماره تماس خود را وارد فرمایید.');
                  return;
                }
                setIsRequestServiceModalOpen(false);
                onShowToast(
                  `درخواست استعلام برای ${selectedService.title} ثبت شد. کارشناس حداکثر تا ۱۰ دقیقه دیگر با شماره ${serviceReqForm.phone} تماس خواهد گرفت.`
                );
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">شماره تماس شما جهت هماهنگی:</label>
                <input
                  type="tel"
                  required
                  placeholder="۰۹۱۲..."
                  value={serviceReqForm.phone}
                  onChange={(e) => setServiceReqForm({ ...serviceReqForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">زمان موردنظر برای اعزام یا بررسی:</label>
                <select
                  value={serviceReqForm.timing}
                  onChange={(e) => setServiceReqForm({ ...serviceReqForm, timing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                >
                  <option value="فوری (کمتر از ۲۰ دقیقه)">⚡ فوری (کمتر از ۲۰ دقیقه)</option>
                  <option value="امروز عصر (ساعت ۱۷ الی ۲۰)">امروز عصر (ساعت ۱۷ الی ۲۰)</option>
                  <option value="فردا صبح (ساعت ۹ الی ۱۲)">فردا صبح (ساعت ۹ الی ۱۲)</option>
                  <option value="هماهنگی تلفنی بعداً">هماهنگی تلفنی بعداً</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">محدوده یا محله آدرس:</label>
                <input
                  type="text"
                  placeholder="مثال: سعادت‌آباد، خیابان سرو غربی..."
                  value={serviceReqForm.address}
                  onChange={(e) => setServiceReqForm({ ...serviceReqForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح مشکل یا خدمت مورد نیاز:</label>
                <textarea
                  rows={2}
                  placeholder="مثال: چکه کردن شیر آب، جابجایی یخچال ساید، سرویس سالانه کولر..."
                  value={serviceReqForm.notes}
                  onChange={(e) => setServiceReqForm({ ...serviceReqForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold shadow-xs"
                >
                  ارسال درخواست فوری
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
