import React, { useState } from 'react';
import { formatToman, toPersianDigits } from '../data/mockData';

export interface SuccessfulDeal {
  id: string;
  orderNumber: string;
  title: string;
  image: string;
  buyerName: string;
  buyerAvatar: string;
  buyerPhone: string;
  city: string;
  amount: number;
  date: string;
  dealMethod: 'حضوری' | 'ارسال اکسپرس' | 'تیپاکس امن' | 'پست پیشتاز';
  status: 'تسویه و واریز شده' | 'تحویل به خریدار';
  rating: number;
  satisfactionComment: string;
}

export const mockSuccessfulDeals: SuccessfulDeal[] = [
  {
    id: 'deal_1',
    orderNumber: 'TRX-94812',
    title: 'آیفون ۱۳ پرو مکس ۲۵۶ گیگابایت آبی پارت ZAA',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlnlmPihCbOBv6gfrKF_j8aPFHPqeBDWKDZdXYayc9WKbFe2qx15_IpVc5mgtQhk0f7Z4xvJOVzTRMPhNrXZ0iBAvzHW68_LsnZsKKIJiqZ3hkiA-37tnG9yfZ7wxpGCmQ56BYRpwK0ua_QbQDDJNzyZWTnvM_gcKvuoOERVnAnemiGOc2GnT_tPUuEEGDn-FlkG6rW3q4nbYwrH5eEEHN_fNUZI0_zzYzjx5uwcrkoiaIAHvC9mNB-A',
    buyerName: 'سهراب امینی',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۱۲***۸۸۴۱',
    city: 'تهران - سعادت‌آباد',
    amount: 78500000,
    date: '۲ روز پیش (۱۶ فروردین)',
    dealMethod: 'حضوری',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'گوشی کاملاً مطابق توضیحات و عکس‌ها بود. تست باتری انجام شد و مبلغ کارت به کارت شد.',
  },
  {
    id: 'deal_2',
    orderNumber: 'TRX-94811',
    title: 'مک‌بوک پرو M2 مدل ۲۰۲۳ خاکستری ۱۶ گیگ ۵۱۲ SSD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGghuE5aFaSwbUozy-rdH5T-c6IgcLulj2MCn1L427tgC4rvx5sW0kM7J2svAuoIjUbibXj5-F1gI5mGyeYyUE7NS7TsS3nn6-aY_PgJTuzQ1Nf-5_U2faTZ79nKdUDsUC0Rrt6Gjshh-QLNMZ0ZXd4tIqA3F898gj7rpEJ4Ledf3NvkxEd1ler8Er5jhFzTL3rzz8LkbV47MlKmBxuCo0DaQH69OhH7xAImS2WTbMVfUYsbfnsWWHvQ',
    buyerName: 'مهدی رضایی',
    buyerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsABC33uDIqb7LkXFvf0v_22-3pwaguUt3oQNo9pHkAIKmOHzwhPZHrHHn7ebp0YjwcgZp7qAhK0Z8l9wEGUsT_ZXBvblf8WVV01WDXCnu4QDQqMhcy9XsKjiDjiyCvnU8kY7WIJskzbVXAbzZ1QNYLqPneGCqbh8u_sD6yJnRL3LEQP4jqbIveL4TUCY7swONOe9g4WeTOCfyBdfY9wKLm5U-RGqh6R1TKki72UzkHnaKPFign-1HIg',
    buyerPhone: '۰۹۱۹***۴۵۱۲',
    city: 'تهران - شهرک غرب',
    amount: 72500000,
    date: '۵ روز پیش',
    dealMethod: 'ارسال اکسپرس',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'بسته‌بندی عالی بود، سایکل باتری زیر ۳۰ بود و دستگاه مثل آکبند رسید.',
  },
  {
    id: 'deal_3',
    orderNumber: 'TRX-94809',
    title: 'اپل واچ اولترا تیتانیومی ۴۹ میلی‌متری بند آلپاین لوپ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfneuhk7-UTM2pFcJwoAarusq9BfMdiTupJdhBY_7O2s4v94u3UxDq69S22-1zShmSDXNTVpoAHkk8L79cqyNBI3qJ4y8w_Rs6Rh4QNtrMZQi4lOnUNgYYmk2A_Miyg54ssro-pj4cji1AO_bFVaBrrPVnZoJbaFoo3ndmzf-knnK5hu8LGekksa82mMTUFAN5z-agm-atURM3gqvCQSv1oRLag38TMKXHnfIQ2tgX3hlvSKhNeJlJwA',
    buyerName: 'مریم حسینی',
    buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۳۵***۷۷۲۰',
    city: 'تهران - ونک',
    amount: 34000000,
    date: '۱ هفته پیش',
    dealMethod: 'حضوری',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'بسیار فروشنده وقت‌شناس و محترمی بودند. جعبه و شارژر اصلی تحویل شد.',
  },
  {
    id: 'deal_4',
    orderNumber: 'TRX-94805',
    title: 'کنسول پلی‌استیشن ۵ اسلیم دیسک خور ریجن اروپا ۱ ترابایت',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1FvQnUfQGk7wz1aEaQ8F4z9vJ_x8Q6G1vYm3L8xN4T7b2R5c-W9uK3z0P1o4E6r8t9y2U5i',
    buyerName: 'آرش علوی',
    buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۱۲***۶۳۰۹',
    city: 'کرج - عظیمیه',
    amount: 31200000,
    date: '۱۰ روز پیش',
    dealMethod: 'تیپاکس امن',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'دسته دوم فابریک هم برام فرستادن، دستگاه پلمپ و تمیز تحویل شد.',
  },
  {
    id: 'deal_5',
    orderNumber: 'TRX-94798',
    title: 'هدفون بی‌سیم سونی مدل WH-1000XM5 مشکی نویز کنسلینگ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wH1G7fK9s2mQ0xV5c1jZ4bN8yL3eT6oR7uI2pA5sD8fG1hJ4kL7zX0cV3bN6mQ9wE2rT5y8u',
    buyerName: 'پویا کاظمی',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۱۸***۹۰۱۲',
    city: 'اصفهان',
    amount: 19800000,
    date: '۲ هفته پیش',
    dealMethod: 'پست پیشتاز',
    status: 'تسویه و واریز شده',
    rating: 4,
    satisfactionComment: 'کیفیت صدای عالی و پدهای گوشی کاملاً سالم بود.',
  },
  {
    id: 'deal_6',
    orderNumber: 'TRX-94790',
    title: 'دوربین بدون آینه سونی Alpha A7 IV با لنز ۲۸-۷۰',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    buyerName: 'نیما یزدانی',
    buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۳۰***۵۵۱۴',
    city: 'شیراز',
    amount: 114000000,
    date: '۳ هفته پیش',
    dealMethod: 'تیپاکس امن',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'شات دوربین زیر ۵۰۰۰ تا بود، بدون پیکسل سوخته با فاکتور معتبر.',
  },
  {
    id: 'deal_7',
    orderNumber: 'TRX-94782',
    title: 'اسپرسوساز دلونگی Dedica EC685 استیل همراه با آسیاب',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9dE8fG7hJ6kL5zX4cV3bN2mQ1wE0rT9y8uI7oP6aS5dF4gH3jK2lZ1xC0vB9nM8qW7eR6tY5u',
    buyerName: 'شیدا رستمی',
    buyerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۱۲***۳۴۸۱',
    city: 'تهران - پونک',
    amount: 12800000,
    date: '۱ ماه پیش',
    dealMethod: 'حضوری',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'تست عصاره‌گیری در محل انجام شد، کرما عالی و دستگاه بسیار تمیز.',
  },
  {
    id: 'deal_8',
    orderNumber: 'TRX-94770',
    title: 'موتورسیکلت بنلی ۲۵۰ تک سیلندر مدل ۱۴۰۱ مشکی طلایی',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    buyerName: 'فرزاد نوری',
    buyerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    buyerPhone: '۰۹۳۹***۱۲۶۴',
    city: 'تهران - نارمک',
    amount: 185000000,
    date: '۱ ماه پیش',
    dealMethod: 'حضوری',
    status: 'تسویه و واریز شده',
    rating: 5,
    satisfactionComment: 'انتقال سند در دفترخانه رسمی انجام شد، انجین پلمپ و بی‌صدا.',
  },
  // remaining 20 deals to complete all 28
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `deal_${i + 9}`,
    orderNumber: `TRX-${94760 - i * 3}`,
    title: [
      'آیپد پرو ۱۲.۹ اینچ M2 حافظه ۲۵۶ گیگ وای‌فای',
      'ساعت گارمین Fenix 7 Sapphire Solar مشکی تیتانیوم',
      'لپ‌تاپ لنوو Legion 5 Pro مدل RTX 3070',
      'کارت گرافیک RTX 4080 Gaming X Trio ۱۶ گیگابایت',
      'دوچرخه کوهستان جاینت Talon 1 سایز 29 مدل 2023',
      'دستگاه قهوه ساز فیلیپس سری 5400 تمام اتوماتیک',
      'کوله‌پشتی کمپینگ دیوتر Deuter Aircontact 65+10',
      'کفش اورجینال نایکی ایر جردن 1 رترو های شیکاگو',
    ][i % 8],
    image: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    ][i % 4],
    buyerName: ['محمدرضا صابری', 'نگار کریمی', 'احسان تقوی', 'هدیه طاهری', 'علیرضا راد', 'سارا مقدسی'][i % 6],
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    buyerPhone: `۰۹۱۲***${(1000 + i * 23).toString().slice(0, 4)}`,
    city: ['تهران - سعادت‌آباد', 'مشهد', 'شیراز', 'تبریز', 'رشت', 'تهران - پاسداران'][i % 6],
    amount: (15000000 + (i * 2400000)),
    date: `${toPersianDigits(i + 2)} ماه پیش`,
    dealMethod: ['حضوری', 'ارسال اکسپرس', 'تیپاکس امن', 'پست پیشتاز'][i % 4] as any,
    status: 'تسویه و واریز شده' as const,
    rating: 5,
    satisfactionComment: 'معامله با رضایت کامل انجام شد، انتقال وجه در کمال امنیت صورت گرفت.',
  })),
];

interface SuccessfulDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals?: SuccessfulDeal[];
  onOpenListingChat?: (deal: SuccessfulDeal) => void;
}

export const SuccessfulDealsModal: React.FC<SuccessfulDealsModalProps> = ({
  isOpen,
  onClose,
  deals = mockSuccessfulDeals,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'حضوری' | 'ارسال اکسپرس' | 'تیپاکس امن'>('all');

  if (!isOpen) return null;

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.includes(filterQuery) ||
      deal.buyerName.includes(filterQuery) ||
      deal.orderNumber.includes(filterQuery) ||
      deal.city.includes(filterQuery);
    const matchesMethod = selectedMethod === 'all' || deal.dealMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs text-right">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
              <span className="material-symbols-outlined text-[28px]">handshake</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl">
                  ۲۸ معامله موفق و تسویه‌شده با خریداران
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black">
                  ۱۰۰٪ رضایت
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                جزئیات کامل معاملات موفق، نام خریداران، مبالغ تسویه‌شده و نحوه تحویل کالا
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="p-4 bg-amber-50/60 dark:bg-slate-800/50 border-b border-amber-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">مجموع ۲۸ معامله:</span>
              <strong className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-300">
                {formatToman(totalRevenue)} تومان
              </strong>
            </div>
            <div className="h-7 w-px bg-amber-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">امتیاز میانگین خریداران:</span>
              <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>۵.۰ از ۵.۰</span>
                <span className="material-symbols-outlined text-amber-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </strong>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="جستجو در نام خریدار یا کالا..."
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Scrollable Deals List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredDeals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl">search_off</span>
              <p className="text-xs font-semibold">موردی با این مشخصات یافت نشد.</p>
            </div>
          ) : (
            filteredDeals.map((deal, idx) => (
              <div
                key={deal.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 hover:border-amber-400 transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product & Buyer Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200">
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded-tl">
                      #{toPersianDigits(idx + 1)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                        {deal.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {deal.date}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 truncate">
                      {deal.title}
                    </h4>

                    {/* Buyer profile preview */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <img src={deal.buyerAvatar} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{deal.buyerName}</span>
                      <span className="text-[11px] text-slate-400">({deal.city})</span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold rounded">
                        {deal.dealMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 gap-1.5">
                  <div className="flex items-baseline gap-1 text-emerald-800 dark:text-emerald-400">
                    <span className="text-base sm:text-lg font-black">{formatToman(deal.amount)}</span>
                    <span className="text-[10px] font-bold">تومان</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>{deal.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            نمایش کامل {toPersianDigits(filteredDeals.length)} از ۲۸ معامله موفق ثبت‌شده
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
