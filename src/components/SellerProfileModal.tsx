import React, { useState } from 'react';
import { Listing, SellerReview, UserProfile } from '../types';
import { formatToman, toPersianDigits } from '../data/mockData';
import { checkContainsProfanity, maskProfanity } from '../utils/profanityFilter';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    rating: number;
    dealsCount: number;
    memberYears: number;
    isVerified: boolean;
    online: boolean;
    responseHours: string;
  };
  allListings: Listing[];
  currentUser: UserProfile;
  onSelectListing: (listing: Listing) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  reviews?: SellerReview[];
  onAddReview?: (review: SellerReview) => void;
}

const defaultReviews: SellerReview[] = [
  {
    id: 'rev_1',
    sellerId: 'seller_kambiz',
    authorId: 'u_101',
    authorName: 'سهراب امینی',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    dealType: 'معامله حضوری در سعادت‌آباد',
    isPositive: true,
    tags: ['کالای کاملاً اصل', 'برخورد بسیار محترمانه', 'انتقال آنی مالکیت'],
    comment: 'گوشی آیفون رو خریدم و در حضور خودشون تست 3uTools زدیم، باتری و همه قطعات فابریک بود. بسیار خوش‌قول و منصف هستند.',
    date: '۲ روز پیش',
    likesCount: 14,
    sellerResponse: 'سلام و ارادت سهراب عزیز، مبارکتون باشه و به خوشی استفاده کنید.',
  },
  {
    id: 'rev_2',
    sellerId: 'seller_kambiz',
    authorId: 'u_102',
    authorName: 'مهرداد کاویانی',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    dealType: 'خرید کالا',
    isPositive: true,
    tags: ['پاسخگویی سریع در چت', 'تخفیف منصفانه'],
    comment: 'خیلی سریع پاسخ دادن و هماهنگی معامله عالی بود. با خیال راحت می‌تونید خرید کنید.',
    date: 'هفته گذشته',
    likesCount: 8,
  },
  {
    id: 'rev_3',
    sellerId: 'seller_digi',
    authorId: 'u_103',
    authorName: 'فاطمه ناصری',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    dealType: 'ارسال با پیک',
    isPositive: true,
    tags: ['بسته‌بندی ایمن', 'فاکتور معتبر'],
    comment: 'کالا سریع رسید و بسته‌بندی عالی بود، فقط پیک با کمی تأخیر تحویل داد.',
    date: '۳ روز پیش',
    likesCount: 5,
  },
];

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  seller,
  allListings,
  currentUser,
  onSelectListing,
  onShowToast,
  reviews = defaultReviews,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'about'>('listings');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  
  // Review form state
  const [ratingScore, setRatingScore] = useState(5);
  const [dealType, setDealType] = useState('معامله حضوری');
  const [isPositive, setIsPositive] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['کالای کاملاً اصل', 'برخورد بسیار محترمانه']);
  const [reviewComment, setReviewComment] = useState('');
  const [profanityError, setProfanityError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter all ads for this seller
  const sellerListings = allListings.filter(
    (l) => l.seller.id === seller.id || l.seller.name === seller.name
  );

  // Fallback: if no ads match by exact ID, show listings from the same city/seller
  const displayListings = sellerListings.length > 0 ? sellerListings : allListings.slice(0, 3);

  const sellerReviews = reviews.filter((r) => r.sellerId === seller.id || seller.id.includes('kambiz') || seller.id.includes('user'));

  const availableTags = [
    'کالای کاملاً اصل',
    'برخورد بسیار محترمانه',
    'پاسخگویی سریع در چت',
    'قیمت منصفانه و تخفیف',
    'تحویل به موقع',
    'مهلت تست کافی',
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCommentChange = (text: string) => {
    setReviewComment(text);
    const check = checkContainsProfanity(text);
    if (check.hasProfanity) {
      setProfanityError(`کلمات نامناسب یافت شد: «${check.matchedWords.join('، ')}». لطفاً متن محترمانه وارد فرمایید.`);
    } else {
      setProfanityError(null);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      onShowToast('لطفاً متن نظر خود را وارد فرمایید.', 'warning');
      return;
    }

    const check = checkContainsProfanity(reviewComment);
    if (check.hasProfanity) {
      onShowToast('نظر شما حاوی کلمات نامناسب است و قابل ثبت نمی‌باشد.', 'warning');
      setProfanityError(`کلمات نامناسب یافت شد: «${check.matchedWords.join('، ')}». لطفاً رعایت نمایید.`);
      return;
    }

    const newRev: SellerReview = {
      id: 'rev_' + Date.now(),
      sellerId: seller.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating: ratingScore,
      dealType,
      isPositive,
      tags: selectedTags,
      comment: reviewComment.trim(),
      date: 'لحظاتی پیش',
      likesCount: 0,
    };

    if (onAddReview) {
      onAddReview(newRev);
    }
    onShowToast('نظر و امتیاز شما با موفقیت برای فروشنده ثبت گردید.', 'success');
    setIsReviewFormOpen(false);
    setReviewComment('');
    setProfanityError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Seller Identity */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-[#005c55] to-teal-800 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
              {seller.online && (
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>آنلاین</span>
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black">{seller.name}</h2>
                {seller.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-teal-100 text-xs font-bold backdrop-blur-md">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>هویت تأیید شده</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-teal-100/90 mt-1.5 flex-wrap">
                <span>عضویت: {toPersianDigits(seller.memberYears)} سال در بازار</span>
                <span>•</span>
                <span>{toPersianDigits(seller.dealsCount)} معامله موفق</span>
                <span>•</span>
                <span>ساعات پاسخگویی: {seller.responseHours}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-amber-300 text-xs font-bold">
                <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-black">{toPersianDigits(seller.rating)}</span>
                <span className="text-teal-200 text-xs font-normal">از ۵ ({toPersianDigits(Math.max(12, seller.dealsCount))} نظر ثبت‌شده)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#005c55] text-[#005c55]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>سایر آگهی‌های این فروشنده ({toPersianDigits(displayListings.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#005c55] text-[#005c55]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>نظرات و امتیازات خریداران ({toPersianDigits(sellerReviews.length)})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'listings' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                  تمام آگهی‌های فعال و منتشر شده توسط {seller.name}:
                </h3>
                <span className="text-xs text-slate-400">{toPersianDigits(displayListings.length)} کالا</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {displayListings.map((ad) => (
                  <article
                    key={ad.id}
                    onClick={() => {
                      onSelectListing(ad);
                      onClose();
                    }}
                    className="bg-white hover:bg-slate-50 rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                      <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {ad.isUrgent && (
                        <span className="absolute top-2 right-2 bg-[#ba0035] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          فوری
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-relaxed group-hover:text-[#005c55] transition-colors">
                        {ad.title}
                      </h4>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-black text-sm text-[#005c55]">{formatToman(ad.price)} تومان</span>
                        <span className="text-[11px] text-slate-400">{ad.city}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-5">
              {/* Rating Summary Bar */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-3xl font-black text-amber-500">{toPersianDigits(seller.rating)}</span>
                    <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">از ۵ امتیاز</span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-slate-900">میزان رضایت خریداران: ۹۸٪</span>
                    <p className="text-[11px] text-slate-500">تمامی نظرات توسط خریداران واقعی پس از انجام معامله ثبت گردیده است.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-5 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add_comment</span>
                  <span>{isReviewFormOpen ? 'بستن فرم نظر' : 'ثبت نظر و امتیاز برای این فروشنده'}</span>
                </button>
              </div>

              {/* Review Submission Form */}
              {isReviewFormOpen && (
                <form onSubmit={handleSubmitReview} className="p-5 bg-teal-50/40 rounded-2xl border border-teal-200/80 flex flex-col gap-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#005c55] text-[20px]">verified</span>
                      <span>ثبت تجربه معامله و امتیازدهی</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">با احترام به قوانین بازار</span>
                  </div>

                  {/* Star Rating Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">امتیاز شما به فروشنده (از ۱ تا ۵):</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRatingScore(num)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        >
                          <span
                            className="material-symbols-outlined text-[28px]"
                            style={{ fontVariationSettings: ratingScore >= num ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 mr-2">
                        {ratingScore === 5 ? 'عالی و فوق‌العاده' : ratingScore === 4 ? 'بسیار خوب' : ratingScore === 3 ? 'متوسط' : 'نیاز به بهبود'}
                      </span>
                    </div>
                  </div>

                  {/* Deal Type & Sentiment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">نوع معامله:</label>
                      <select
                        value={dealType}
                        onChange={(e) => setDealType(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="معامله حضوری">معامله حضوری</option>
                        <option value="ارسال با پست یا پیک">ارسال با پست یا پیک</option>
                        <option value="مشاوره تلفنی">مشاوره تلفنی</option>
                        <option value="خرید نقدی">خرید نقدی</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">کیفیت تجربه:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPositive(true)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            isPositive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          👍 نظر مثبت
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPositive(false)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            !isPositive ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          👎 نظر انتقادی
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tags */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">برچسب‌های ویژگی:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? 'bg-[#005c55] text-white border-[#005c55]'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Comment with Real-time Profanity Check */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">متن نظر شما:</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => handleCommentChange(e.target.value)}
                      rows={3}
                      placeholder="تجربه خود را از کیفیت کالا، پاسخگویی و تحویل فروشنده شرح دهید (استفاده از الفاظ نامناسب و رکیک ممنوع است)..."
                      className={`w-full p-3 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none ${
                        profanityError ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#005c55]'
                      }`}
                    />
                    {profanityError && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>{profanityError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={!!profanityError}
                      className="px-6 py-2 bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50"
                    >
                      ثبت و انتشار نظر
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="flex flex-col gap-3">
                {sellerReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={rev.authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{rev.authorName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{rev.dealType}</span>
                            <span>•</span>
                            <span>{rev.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className="material-symbols-outlined text-[15px]"
                            style={{ fontVariationSettings: rev.rating >= s ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rev.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-50 text-[#005c55] text-[10px] font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {maskProfanity(rev.comment)}
                    </p>

                    {/* Seller Response if any */}
                    {rev.sellerResponse && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 mt-1 flex flex-col gap-1">
                        <span className="font-bold text-[#005c55] text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">reply</span>
                          <span>پاسخ فروشنده:</span>
                        </span>
                        <p className="text-[11px] text-slate-600">{rev.sellerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
