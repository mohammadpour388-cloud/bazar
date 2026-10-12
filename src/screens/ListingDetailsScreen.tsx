import React, { useState } from 'react';
import { Listing, ScreenType, UserProfile, SellerReview } from '../types';
import { formatToman, toPersianDigits, calculateMarketplaceCommission } from '../data/mockData';
import { SellerProfileModal } from '../components/SellerProfileModal';
import { MapLocationPickerModal } from '../components/MapLocationPickerModal';

interface ListingDetailsScreenProps {
  listing: Listing;
  allListings: Listing[];
  currentUser?: UserProfile;
  reviews?: SellerReview[];
  onAddReview?: (review: SellerReview) => void;
  onSelectListing: (listing: Listing) => void;
  onNavigate: (screen: ScreenType) => void;
  onStartChat: (listing: Listing) => void;
  onAddToCart?: (listing: Listing, quantity: number) => void;
  onBuyNow?: (listing: Listing, quantity: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ListingDetailsScreen: React.FC<ListingDetailsScreenProps> = ({
  listing,
  allListings,
  currentUser = {
    id: 'user_kamran',
    name: 'کامران رضوانی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDhpw_OzJWpDG4HJr8LniUJ_BA49LCgQz3j2sVBKDaGNX5w3nzC4RwO5XdZbbJxBiItPKyBYInBXVo7jkdaJdaSTdyomRicNQGE56xmgCYC40ij4xZzAJD4l0qgckIDYkfZALHFWml02Fqo5PXBBWfEFTmf81jrltLvqjqhc5EU4OaC_SyG0AmaVaU4ZeWAsi-B47OWTj6YJrh-ALxGVRgItMLMzvseD7gGnJYsg5U4xw_r0_dRFDF6Q',
    walletBalance: 250000,
    rating: 4.9,
    reviewsCount: 38,
    memberSince: '۲ سال سابقه',
    isVerified: true,
  },
  reviews = [],
  onAddReview,
  onSelectListing,
  onNavigate,
  onStartChat,
  onAddToCart,
  onBuyNow,
  isBookmarked,
  onToggleBookmark,
  onShowToast,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Check if current listing is a job opening / recruitment
  const isJobListing =
    listing.category === 'استخدام و کاریابی' ||
    listing.categoryPath?.some((c) => c.includes('استخدام') || c.includes('کاریابی')) ||
    listing.title.includes('استخدام');

  const availableStock = listing.stockCount ?? 5;
  const isLowStock = availableStock <= 2 && availableStock > 0;

  const images = listing.images.length > 0 ? listing.images : [''];
  const totalImages = images.length;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('لینک آگهی با موفقیت در کلیپ‌بورد کپی شد.');
    } else {
      onShowToast('لینک آگهی کپی شد.');
    }
  };

  const handleReport = () => {
    onShowToast('گزارش تخلف برای تیم بازرسی آوان مارکت ارسال شد.');
  };

  // Related listings
  const relatedListings = allListings.filter((l) => l.id !== listing.id).slice(0, 4);

  // Filter seller's other ads
  const otherSellerAds = allListings.filter(
    (l) => l.seller.id === listing.seller.id && l.id !== listing.id
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-right">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="مسیر راهنما"
        className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none"
      >
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-[#005c55] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>صفحه اصلی</span>
        </button>
        <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_left</span>
        <button
          onClick={() => onNavigate('categories')}
          className="hover:text-[#005c55] transition-colors cursor-pointer"
        >
          {listing.category}
        </button>
        <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_left</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Right Main Column (8 cols): Title, Gallery, Specs, Description, Map, Reviews */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Title and Top Actions Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {listing.isUrgent && (
                  <span className="bg-[#ffdada] text-[#ba0035] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    <span>فوری و ویژه</span>
                  </span>
                )}
                {listing.hasDiscount && (
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">sell</span>
                    <span>{listing.discountBadge || 'تخفیف ویژه'}</span>
                  </span>
                )}
                {listing.seller.isVerified && (
                  <span className="bg-[#005c55]/10 text-[#005c55] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span>فروشنده احراز هویت شده</span>
                  </span>
                )}
                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-medium">
                  کد آگهی: {listing.code}
                </span>
              </div>

              {/* Action Buttons: Bookmark, Share, Flag */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleBookmark(listing.id)}
                  title="نشان کردن آگهی"
                  className={`flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer ${
                    isBookmarked ? 'text-[#ba0035] bg-red-50' : 'text-slate-600'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    bookmark
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  title="اشتراک‌گذاری"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-[#005c55] hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  title="گزارش تخلف"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {listing.title}
              </h1>
              <div className="flex items-center gap-3 text-slate-500 mt-2 text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                  <span>{listing.timeAgo}</span>
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  <span>{listing.city}، {listing.neighborhood}</span>
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">visibility</span>
                  <span>{toPersianDigits(listing.views)} بازدید</span>
                </span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Card */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden group">
              <img
                src={images[selectedImageIndex]}
                alt="تصویر اصلی آگهی"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Status and Counter Badges */}
              <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>{toPersianDigits(selectedImageIndex + 1)} از {toPersianDigits(totalImages)}</span>
              </div>

              {/* Prev / Next buttons */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {totalImages > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#005c55] scale-105 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs Table */}
          {Object.keys(listing.specs || {}).length > 0 && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005c55]">
                  {isJobListing ? 'badge' : 'checklist'}
                </span>
                <span>
                  {isJobListing ? 'شرایط استخدام، حقوق و مزایای شغلی' : 'مشخصات فنی و جزئیات کالا'}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(listing.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500 font-semibold">{k}:</span>
                    <span className="text-slate-900 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005c55]">description</span>
              <span>
                {isJobListing ? 'شرح موقعیت شغلی و وظایف' : 'توضیحات و یادداشت‌های فروشنده'}
              </span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-loose whitespace-pre-line">
              {listing.description}
            </div>

            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                {listing.tags.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map Location Card (Click opens full map modal) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005c55]">pin_drop</span>
                <span>موقعیت مکانی و نقشه دقیق</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="text-xs text-[#005c55] font-bold hover:underline flex items-center gap-1"
              >
                <span>مشاهده در نقشه بزرگ</span>
                <span className="material-symbols-outlined text-[16px]">open_in_full</span>
              </button>
            </div>

            <div
              onClick={() => setIsMapModalOpen(true)}
              className="w-full h-56 rounded-2xl bg-cover bg-center relative overflow-hidden shadow-inner border border-slate-200 cursor-pointer group"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkJGxUryD0FL5SsmWalNwE8PTwNWpotP3jiBbqQIT82b6-Xsz6AUvwjeIDHYsE-QKzBJ44t4nabz_18BgaWiKk0_psAQk1-wDs2uem4DK3wHU5Ge33DlDpFtdYsfmel99khjmuWQ_1XnXvDb5oa9GSwJAjo0lK1ZL_Vb9C_e1GoYsnTJZ0d5-yJJfJNsiNBpGqkZaUDWU_D6cmauZknixE29XZrawa6SvDpRmZ7ZvDcEA1BgcPwYWIEA')`,
              }}
            >
              <div className="absolute inset-0 bg-[#005c55]/10 group-hover:bg-[#005c55]/20 transition-colors flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-slate-200 group-hover:scale-105 transition-transform">
                  <span className="w-3 h-3 rounded-full bg-[#ba0035] animate-ping" />
                  <span className="text-xs font-bold text-slate-900">
                    محدوده {listing.city}، {listing.neighborhood}
                  </span>
                  <span className="text-[10px] text-[#005c55] font-bold mr-1">(کلیک جهت باز شدن نقشه)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Sticky Sidebar (4 cols): Price, Seller info, Contact CTA */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          {/* Price & Action Card */}
          <div className="bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">
                {isJobListing ? 'حقوق ماهیانه پیشنهادی:' : 'قیمت کالا:'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#005c55]">
                  {listing.price === 0 || listing.isNegotiable
                    ? (isJobListing ? 'توافقی / بسته به سابقه' : 'توافقی')
                    : formatToman(listing.price)}
                </span>
                {!listing.isNegotiable && listing.price > 0 && (
                  <span className="text-xs text-slate-500 font-semibold">
                    {isJobListing ? 'تومان / ماهانه' : 'تومان'}
                  </span>
                )}
              </div>
              {!isJobListing && !listing.isNegotiable && listing.price > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-50">
                  <span className="flex items-center gap-1">
                    <span>کارمزد معامله امن بازار:</span>
                    <span className="text-[10px] text-teal-600 font-bold">(پلکانی)</span>
                  </span>
                  <span className="font-mono font-bold text-teal-700">
                    {formatToman(calculateMarketplaceCommission(listing.price))} تومان
                  </span>
                </div>
              )}
              {isJobListing && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl mt-1.5 border border-emerald-100">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
                  <span>پرداخت ماهیانه منظم + امکان بیمه و پاداش عملکرد</span>
                </div>
              )}
            </div>

            {/* Warehouse Stock & Inventory Status - ONLY FOR GOODS / PRODUCTS, NEVER FOR JOB RECRUITMENT */}
            {!isJobListing && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/50 border border-teal-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#005c55]">inventory_2</span>
                    <span>وضعیت موجودی در انبار:</span>
                  </span>
                  {availableStock > 0 ? (
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 ${
                      isLowStock 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{toPersianDigits(availableStock)} عدد موجود در انبار</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                      ناموجود در انبار
                    </span>
                  )}
                </div>

                {isLowStock && (
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    🔥 موجودی این کالا رو به اتمام است! تنها {toPersianDigits(availableStock)} عدد در انبار باقی مانده است.
                  </p>
                )}

                {/* Quantity Selector if In Stock */}
                {availableStock > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-teal-100/60 mt-1">
                    <span className="text-xs text-slate-600 font-bold">تعداد درخواستی:</span>
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        disabled={orderQuantity >= availableStock}
                        onClick={() => setOrderQuantity((q) => Math.min(availableStock, q + 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-slate-800 text-sm transition-colors cursor-pointer"
                      >
                        +
                      </button>
                      <span className="w-8 text-center text-sm font-black font-mono">
                        {toPersianDigits(orderQuantity)}
                      </span>
                      <button
                        type="button"
                        disabled={orderQuantity <= 1}
                        onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-slate-800 text-sm transition-colors cursor-pointer"
                      >
                        -
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart & Instant Buy Buttons - ONLY FOR PRODUCTS, NEVER FOR JOB RECRUITMENT */}
            {!isJobListing && availableStock > 0 && listing.price > 0 && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onAddToCart) {
                      onAddToCart(listing, orderQuantity);
                    } else {
                      onShowToast(`${toPersianDigits(orderQuantity)} عدد «${listing.title}» به سبد خرید اضافه شد.`, 'success');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-[#005c55] to-teal-700 hover:from-[#004741] hover:to-teal-800 text-white py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  <span>افزودن به سبد خرید ({toPersianDigits(orderQuantity)} عدد)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onBuyNow) {
                      onBuyNow(listing, orderQuantity);
                    } else if (onAddToCart) {
                      onAddToCart(listing, orderQuantity);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <span>تکمیل فوری خرید و تسویه حساب</span>
                </button>
              </div>
            )}

            {/* Special Job Recruitment Guidelines Banner */}
            {isJobListing && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1.5 text-xs text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>فرصت شغلی تاییدشده کارفرما</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  جهت ارسال رزومه، تعیین وقت مصاحبه حضوری یا آنلاین، از طریق تماس مستقیم یا چت آنلاین در بازار با کارفرما در ارتباط باشید.
                </p>
              </div>
            )}

            {/* Seller profile snippet (Click opens SellerProfileModal) */}
            <div
              onClick={() => setIsSellerModalOpen(true)}
              className="flex items-center gap-3 py-1 cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-full h-full object-cover"
                />
                {listing.seller.online && (
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"
                    title="آنلاین"
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {listing.seller.name}
                  </span>
                  {listing.seller.isVerified && (
                    <span
                      className="material-symbols-outlined text-[#005c55] text-[18px]"
                      title="هویت تأیید شده"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  عضو بازار از {toPersianDigits(listing.seller.memberYears)} سال پیش
                </span>
                <div className="flex items-center gap-1 mt-1 text-amber-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>
                    {toPersianDigits(listing.seller.rating)} ({toPersianDigits(listing.seller.dealsCount)} معامله)
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsPhoneRevealed(!isPhoneRevealed)}
                className="w-full bg-[#ba0035] text-white hover:bg-[#9e002d] py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span>{isPhoneRevealed ? 'بستن شماره تلفن' : 'اطلاعات تماس و تماس مستقیم'}</span>
              </button>

              {/* Revealed Phone Box */}
              {isPhoneRevealed && (
                <div className="bg-slate-50 p-4 rounded-2xl text-center flex flex-col gap-1 border border-slate-200 animate-in fade-in duration-200">
                  <span className="text-[11px] text-slate-500">شماره تماس مستقیم فروشنده:</span>
                  <a
                    href={`tel:${listing.seller.phone.replace(/\s+/g, '')}`}
                    className="text-lg font-bold text-[#005c55] tracking-wider font-mono hover:underline my-1"
                    dir="ltr"
                  >
                    {listing.seller.phone}
                  </a>
                  <span className="text-[11px] text-slate-400">
                    ساعات پاسخگویی: {listing.seller.responseHours}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onStartChat(listing)}
                className="w-full bg-[#005c55]/10 text-[#005c55] hover:bg-[#005c55]/20 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>ارسال پیام و چت در بازار</span>
              </button>
            </div>

            {/* VIEW OTHER ADS BY THIS SELLER (مشاهده سایر آگهی‌های این فروشنده) */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSellerModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-[#005c55] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>مشاهده سایر آگهی‌های این فروشنده ({toPersianDigits(otherSellerAds.length + 1)} کالا)</span>
              </button>
            </div>
          </div>

          {/* Security & Safe Trading Guidelines Card */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <span className="material-symbols-outlined text-amber-700 text-[22px]">security</span>
              <span>راهنمای معامله امن</span>
            </div>

            <ul className="flex flex-col gap-2 text-slate-600 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#ba0035] text-[18px] shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  <strong>هرگز پیش از رؤیت حضوری کالا بیعانه پرداخت نکنید!</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#005c55] text-[18px] shrink-0 mt-0.5">
                  verified_user
                </span>
                <span>معامله را در اماکن عمومی و شلوغ انجام داده و اصالت دستگاه را چک کنید.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Related & Recommended Listings */}
      <div className="mt-12 sm:mt-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              آگهی‌های مرتبط و پیشنهادی
            </h2>
            <p className="text-xs text-slate-500 mt-1">سایر کالاهای مشابه در نزدیکی شما</p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs sm:text-sm text-[#005c55] hover:underline flex items-center gap-1 font-bold"
          >
            <span>نمایش همه</span>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedListings.map((rel) => (
            <article
              key={rel.id}
              onClick={() => {
                onSelectListing(rel);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all border border-slate-100 flex flex-col cursor-pointer group"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={rel.images[0]}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {rel.isUrgent && (
                  <span className="absolute top-2 right-2 bg-[#ba0035] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    فوری
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-right">
                <h3 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-[#005c55] transition-colors leading-relaxed">
                  {rel.title}
                </h3>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-sm text-[#005c55]">
                    {formatToman(rel.price)} تومان
                  </span>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>{rel.timeAgo}</span>
                    <span>{rel.city}، {rel.neighborhood}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Seller Profile & Reviews Modal */}
      <SellerProfileModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        seller={listing.seller}
        allListings={allListings}
        currentUser={currentUser}
        onSelectListing={(ad) => {
          setIsSellerModalOpen(false);
          onSelectListing(ad);
        }}
        onShowToast={onShowToast}
        reviews={reviews}
        onAddReview={onAddReview}
      />

      {/* Map Location Modal */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialCoords={listing.mapCoords || { lat: 35.7796, lng: 51.3752 }}
        initialCity={listing.city}
        initialNeighborhood={listing.neighborhood}
        onConfirmLocation={(loc) => {
          onShowToast(`موقعیت «${loc.city}، ${loc.neighborhood}» مشاهده شد.`);
        }}
      />
    </div>
  );
};
