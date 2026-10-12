import React, { useState, useMemo, useEffect } from 'react';
import { Listing, ScreenType } from '../types';
import { formatToman, toPersianDigits, categoryTaxonomy } from '../data/mockData';
import { allIranCities } from '../data/iranLocations';

interface CategoryFeedScreenProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onNavigate: (screen: ScreenType, category?: string) => void;
  selectedCity: string;
  selectedDistrict: string;
  onOpenCityModal: () => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onShowToast: (msg: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onAddToCart?: (listing: Listing, quantity?: number) => void;
  onOpenCart?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const CategoryFeedScreen: React.FC<CategoryFeedScreenProps> = ({
  listings,
  onSelectListing,
  onNavigate,
  selectedCity,
  selectedDistrict,
  onOpenCityModal,
  bookmarkedIds,
  onToggleBookmark,
  onShowToast,
  selectedCategory = 'همه',
  onSelectCategory,
  onAddToCart,
  onOpenCart,
  searchQuery = '',
  onSearchChange,
}) => {
  // Search query state
  const [feedSearchInput, setFeedSearchInput] = useState<string>(searchQuery);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setFeedSearchInput(searchQuery);
    }
  }, [searchQuery]);

  const handleSearchInputChange = (val: string) => {
    setFeedSearchInput(val);
    onSearchChange?.(val);
  };

  // Active Category state synced with props
  const [internalCategory, setInternalCategory] = useState<string>(selectedCategory || 'همه');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('همه زیردسته‌ها');

  useEffect(() => {
    if (selectedCategory) {
      setInternalCategory(selectedCategory);
      setSelectedSubCategory('همه زیردسته‌ها');
    }
  }, [selectedCategory]);

  const handleCategoryChange = (newCat: string) => {
    setInternalCategory(newCat);
    setSelectedSubCategory('همه زیردسته‌ها');
    onSelectCategory?.(newCat);
    onShowToast(`دسته‌بندی به «${newCat}» تغییر کرد`);
  };

  // Get active taxonomy info
  const taxonomyInfo =
    categoryTaxonomy[internalCategory] ||
    categoryTaxonomy['همه'];

  // Filters state
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(true);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'like-new'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000000000);
  const [sortBy, setSortBy] = useState<'newest' | 'cheapest' | 'expensive' | 'urgent'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>('همه');
  const [onlyThisCity, setOnlyThisCity] = useState(false);

  const currentCityData = useMemo(() => {
    return allIranCities.find((c) => c.name === selectedCity);
  }, [selectedCity]);

  const activeDistrictsList = useMemo(() => {
    if (currentCityData && currentCityData.districts && currentCityData.districts.length > 0) {
      return ['همه', ...currentCityData.districts.filter((d) => d !== 'همه محله‌ها').slice(0, 8)];
    }
    return ['همه', 'مرکز شهر'];
  }, [currentCityData]);

  // Filter logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Exclude expired listings
        if (item.status === 'expired') return false;

        // 0. Keyword text search
        if (feedSearchInput && feedSearchInput.trim()) {
          const q = feedSearchInput.trim().toLowerCase();
          const titleMatch = item.title.toLowerCase().includes(q);
          const descMatch = item.description.toLowerCase().includes(q);
          const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(q));
          const categoryMatch = item.category.toLowerCase().includes(q) || item.categoryPath?.some((p) => p.toLowerCase().includes(q));
          const sellerMatch = item.seller.name.toLowerCase().includes(q);
          const cityMatch = item.city.toLowerCase().includes(q) || item.neighborhood.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !tagMatch && !categoryMatch && !sellerMatch && !cityMatch) {
            return false;
          }
        }

        // 1. Category Filter
        if (internalCategory && internalCategory !== 'همه' && internalCategory !== 'همه دسته‌ها') {
          const cat = internalCategory.trim();
          const matchDirect = item.category === cat;
          const matchPath = item.categoryPath && item.categoryPath.some((p) => p.includes(cat));
          const matchEstate = cat.includes('املاک') && (item.category.includes('املاک') || item.categoryPath?.some((p) => p.includes('املاک')));
          const matchVehicles = (cat === 'وسایل نقلیه' || cat === 'خودرو') && (item.category.includes('وسایل نقلیه') || item.categoryPath?.some((p) => p.includes('وسایل نقلیه') || p.includes('خودرو')));
          const matchHome = (cat === 'خانه و آشپزخانه' || cat === 'لوازم خانگی') && (item.category.includes('خانه') || item.categoryPath?.some((p) => p.includes('خانه')));
          const matchDigital = (cat === 'کالای دیجیتال') && (item.category.includes('دیجیتال') || item.categoryPath?.some((p) => p.includes('دیجیتال')));
          const matchHealth = (cat.includes('دارو') || cat.includes('مکمل') || cat.includes('سلامت')) && (item.category.includes('دارو') || item.category.includes('مکمل') || item.category.includes('سلامت') || item.categoryPath?.some((p) => p.includes('دارو') || p.includes('مکمل') || p.includes('سلامت')));

          if (!matchDirect && !matchPath && !matchEstate && !matchVehicles && !matchHome && !matchDigital && !matchHealth) {
            return false;
          }
        }

        // 2. Subcategory Filter
        if (selectedSubCategory && !selectedSubCategory.startsWith('همه')) {
          const sub = selectedSubCategory.trim();
          const matchSub =
            item.title.includes(sub) ||
            item.categoryPath?.some((p) => p.includes(sub)) ||
            item.tags?.some((t) => t.includes(sub)) ||
            item.description.includes(sub);
          if (!matchSub) return false;
        }

        // 3. City Specific Filter
        if (onlyThisCity && selectedCity && selectedCity !== 'کل ایران' && selectedCity !== 'همه شهرها') {
          const matchCity =
            item.city === selectedCity ||
            item.neighborhood === selectedCity ||
            item.categoryPath?.some((p) => p.includes(selectedCity));
          if (!matchCity) return false;
        }

        // 4. Other user filters
        if (onlyWithPhoto && item.images.length === 0) return false;
        if (onlyUrgent && !item.isUrgent) return false;
        if (onlyDiscounted && !item.hasDiscount) return false;
        if (onlyVerified && !item.isVerifiedSeller) return false;
        if (conditionFilter !== 'all' && item.condition !== conditionFilter) return false;
        if (item.price < minPrice || item.price > maxPrice) return false;
        if (activeDistrictFilter !== 'همه' && item.neighborhood !== activeDistrictFilter) return false;

        return true;
      })
      .sort((a, b) => {
        // 1. VIP Subscription Priority ALWAYS first!
        const getVipWeight = (item: Listing) => {
          if (item.vipTier === 'diamond') return 3000;
          if (item.vipTier === 'golden') return 2000;
          if (item.vipTier === 'standard') return 1000;
          if (item.isLaddered) return 200;
          return 0;
        };
        const vipDiff = getVipWeight(b) - getVipWeight(a);
        if (vipDiff !== 0) return vipDiff;

        if (sortBy === 'cheapest') return a.price - b.price;
        if (sortBy === 'expensive') return b.price - a.price;
        if (sortBy === 'urgent') return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
        // Prioritize items in selectedCity when not "کل ایران"
        if (selectedCity && selectedCity !== 'کل ایران' && selectedCity !== 'همه شهرها') {
          const aMatch = a.city === selectedCity ? 1 : 0;
          const bMatch = b.city === selectedCity ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
        }
        return 0; // newest as is
      });
  }, [
    listings,
    internalCategory,
    selectedSubCategory,
    onlyWithPhoto,
    onlyUrgent,
    onlyDiscounted,
    onlyVerified,
    conditionFilter,
    minPrice,
    maxPrice,
    sortBy,
    activeDistrictFilter,
    onlyThisCity,
    selectedCity,
    feedSearchInput,
  ]);

  const resetFilters = () => {
    setFeedSearchInput('');
    onSearchChange?.('');
    setInternalCategory('همه');
    setSelectedSubCategory('همه زیردسته‌ها');
    onSelectCategory?.('همه');
    setOnlyWithPhoto(false);
    setOnlyUrgent(false);
    setOnlyDiscounted(false);
    setOnlyVerified(false);
    setConditionFilter('all');
    setMinPrice(0);
    setMaxPrice(100000000000);
    setActiveDistrictFilter('همه');
    onShowToast('تمامی فیلترها و دسته‌بندی‌ها به حالت پیش‌فرض بازگشتند.');
  };

  const majorCategoriesList = [
    { title: 'همه', label: 'همه دسته‌ها', icon: 'apps' },
    { title: 'خانه و آشپزخانه', label: 'خانه و آشپزخانه', icon: 'chair' },
    { title: 'وسایل نقلیه', label: 'وسایل نقلیه', icon: 'directions_car' },
    { title: 'کالای دیجیتال', label: 'کالای دیجیتال', icon: 'devices' },
    { title: 'املاک', label: 'املاک', icon: 'apartment' },
    { title: 'وسایل شخصی', label: 'وسایل شخصی', icon: 'checkroom' },
    { title: 'خدمات', label: 'خدمات', icon: 'home_repair_service' },
    { title: 'سرگرمی و فراغت', label: 'سرگرمی و فراغت', icon: 'sports_esports' },
    { title: 'استخدام و کاریابی', label: 'استخدام', icon: 'badge' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 text-right">
      {/* 1. Interactive Top Category Selection Carousel Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#005c55] text-[18px]">category</span>
            انتخاب سریع دسته‌بندی آگهی‌ها:
          </span>
          <span className="text-[11px] text-slate-400">
            دسته‌بندی فعال: <strong className="text-[#005c55]">{taxonomyInfo.title}</strong>
          </span>
        </div>

        {/* Scrollable Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-0.5">
          {majorCategoriesList.map((cat) => {
            const isSelected =
              internalCategory === cat.title ||
              (cat.title === 'همه' && (internalCategory === 'همه' || internalCategory === 'همه دسته‌ها')) ||
              (cat.title === 'املاک' && internalCategory === 'املاک و مستغلات') ||
              (cat.title === 'خدمات' && internalCategory === 'خدمات و تعمیرات');

            return (
              <button
                key={cat.title}
                type="button"
                onClick={() => handleCategoryChange(cat.title)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#ef394a] text-white shadow-sm ring-2 ring-rose-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Breadcrumb & Top Context Banner (Dynamically Updates) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#ef394a] transition-colors font-medium cursor-pointer"
          >
            صفحه اصلی
          </button>
          <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_left</span>
          <button
            onClick={() => handleCategoryChange('همه')}
            className="hover:text-[#ef394a] transition-colors cursor-pointer"
          >
            دسته‌بندی‌ها
          </button>
          <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_left</span>
          <span className="text-[#ef394a] font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
            {taxonomyInfo.title}
          </span>
          {selectedSubCategory && !selectedSubCategory.startsWith('همه') && (
            <>
              <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_left</span>
              <span className="text-slate-900 font-extrabold">{selectedSubCategory}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#005c55] animate-pulse" />
          <span className="text-[11px] text-slate-600 font-medium">
            {taxonomyInfo.bannerTitle} ({toPersianDigits(filteredListings.length)} آگهی)
          </span>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl shadow-xs border border-slate-100">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005c55] text-white text-xs font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>فیلترهای پیشرفته ({toPersianDigits(filteredListings.length)})</span>
        </button>
        <span className="text-xs text-slate-500">
          نمایش {toPersianDigits(filteredListings.length)} آگهی در {selectedCity}
        </span>
      </div>

      {/* Main Grid: Filters Sidebar (RTL Right) + Listings Feed (RTL Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Sidebar: Filters (col 4 or col 3) */}
        <aside
          className={`lg:col-span-4 xl:col-span-3 flex flex-col gap-4 ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center'
              : 'hidden lg:flex sticky top-24'
          }`}
        >
          <div
            className={`bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-5 text-right w-full ${
              isMobileFilterOpen ? 'max-w-md max-h-[90vh] overflow-y-auto' : ''
            }`}
          >
            {/* Filter Header & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005c55] text-[22px]">tune</span>
                <span className="font-bold text-sm text-slate-900">فیلترهای پیشرفته</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#ba0035] hover:underline font-semibold cursor-pointer"
                >
                  پاک کردن همه
                </button>
                {isMobileFilterOpen && (
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-800"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Category Tree Hierarchy */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">دسته‌بندی و زیردسته‌ها</label>
                {internalCategory !== 'همه' && (
                  <button
                    onClick={() => handleCategoryChange('همه')}
                    className="text-[11px] text-[#005c55] hover:underline"
                  >
                    تغییر دسته اصلی
                  </button>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 flex flex-col gap-1.5 border border-slate-100">
                {/* Active Category Header */}
                <div className="flex items-center justify-between text-xs text-slate-900 font-extrabold pb-2 border-b border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-[#005c55]">
                    <span className="material-symbols-outlined text-[18px]">{taxonomyInfo.icon}</span>
                    {taxonomyInfo.title}
                  </span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    فعال
                  </span>
                </div>

                {/* Subcategories */}
                <div className="flex flex-col gap-1 text-xs pt-1">
                  {taxonomyInfo.subcategories.map((sub) => {
                    const isSelected = selectedSubCategory === sub.name;
                    return (
                      <button
                        key={sub.name}
                        onClick={() => {
                          setSelectedSubCategory(sub.name);
                          onShowToast(`فیلتر روی «${sub.name}» اعمال شد`);
                        }}
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-[#005c55] font-bold shadow-xs border border-teal-100'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 mr-1">
                          {sub.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Location Selector & Popular Neighborhoods */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">محدوده مکانی</label>
                <button
                  type="button"
                  onClick={onOpenCityModal}
                  className="text-[11px] text-[#005c55] font-semibold hover:underline"
                >
                  تغییر شهر
                </button>
              </div>
              <div
                onClick={onOpenCityModal}
                className="relative flex items-center cursor-pointer"
              >
                <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[18px]">
                  location_on
                </span>
                <input
                  type="text"
                  readOnly
                  value={`${selectedCity} (${selectedDistrict})`}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeDistrictsList.map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setActiveDistrictFilter(dist)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg transition-colors cursor-pointer ${
                      activeDistrictFilter === dist
                        ? 'bg-[#005c55] text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Toggle Switches */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              {selectedCity !== 'کل ایران' && selectedCity !== 'همه شهرها' && (
                <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-800 bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                  <span className="font-bold text-[#005c55] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    فقط آگهی‌های {selectedCity}
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyThisCity}
                    onChange={(e) => {
                      setOnlyThisCity(e.target.checked);
                      if (e.target.checked) {
                        onShowToast(`فیلتر روی آگهی‌های «${selectedCity}» فعال شد.`);
                      }
                    }}
                    className="w-4 h-4 accent-[#005c55] rounded cursor-pointer"
                  />
                </label>
              )}
              <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-800">
                <span className="group-hover:text-[#005c55] transition-colors">فقط عکس‌دار</span>
                <input
                  type="checkbox"
                  checked={onlyWithPhoto}
                  onChange={(e) => setOnlyWithPhoto(e.target.checked)}
                  className="w-4 h-4 accent-[#005c55] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-800">
                <span className="flex items-center gap-1.5 group-hover:text-[#ba0035] transition-colors">
                  <span className="bg-[#ffdada] text-[#ba0035] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    فوری
                  </span>
                  فقط آگهی‌های فوری
                </span>
                <input
                  type="checkbox"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                  className="w-4 h-4 accent-[#ba0035] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-800">
                <span className="group-hover:text-[#005c55] transition-colors">دارای تخفیف ویژه</span>
                <input
                  type="checkbox"
                  checked={onlyDiscounted}
                  onChange={(e) => setOnlyDiscounted(e.target.checked)}
                  className="w-4 h-4 accent-[#005c55] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-800">
                <span className="flex items-center gap-1 group-hover:text-[#005c55] transition-colors">
                  <span
                    className="material-symbols-outlined text-[#005c55] text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  فروشنده احراز هویت شده
                </span>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="w-4 h-4 accent-[#005c55] rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Condition Filter */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">وضعیت کالا</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'all' as const, label: 'همه' },
                  { id: 'new' as const, label: 'نو و پلمپ' },
                  { id: 'like-new' as const, label: 'در حد نو' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setConditionFilter(cond.id)}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      conditionFilter === cond.id
                        ? 'bg-[#005c55] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileFilterOpen(false);
                onShowToast(`فیلترها اعمال شد (${toPersianDigits(filteredListings.length)} آگهی)`);
              }}
              className="w-full bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>اعمال فیلترها ({toPersianDigits(filteredListings.length)})</span>
            </button>
          </div>
        </aside>

        {/* Left Main Listing Feed Panel (col 8 or col 9) */}
        <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-5">
          {/* Filter Bar & Active Filter Chips */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4 text-right">
            {/* Live Feed Keyword Search Input */}
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute right-3.5 text-[#005c55] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={feedSearchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="جستجو بر اساس نام کالا، مدل، برند، محله یا توضیحات..."
                className="w-full pr-11 pl-10 py-2.5 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#005c55]/20 border border-slate-200/80 focus:border-[#005c55] transition-all shadow-inner"
              />
              {feedSearchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchInputChange('')}
                  className="absolute left-3 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  title="پاک کردن جستجو"
                >
                  <span className="material-symbols-outlined text-[17px]">close</span>
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005c55] text-[22px]">
                    {taxonomyInfo.icon}
                  </span>
                  آگهی‌های {taxonomyInfo.title}
                  {selectedSubCategory && !selectedSubCategory.startsWith('همه') && (
                    <span className="text-stone-500 font-medium text-sm">
                      ({selectedSubCategory})
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-400">
                  «نمایش {toPersianDigits(filteredListings.length)} آگهی در {selectedCity}»
                </span>
              </div>

              {/* View Switcher & Quick Sorter */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">مرتب‌سازی:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-100 text-slate-800 text-xs py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer border border-transparent focus:border-[#005c55]"
                  >
                    <option value="newest">جدیدترین‌ها</option>
                    <option value="cheapest">ارزان‌ترین به گران‌ترین</option>
                    <option value="expensive">گران‌ترین به ارزان‌ترین</option>
                    <option value="urgent">فوری‌ترین آگهی‌ها</option>
                  </select>
                </div>

                {/* Grid / List switch */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#005c55] shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-[#005c55] shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Removable Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 ml-1">فیلترهای فعال:</span>

              {/* Keyword search query chip */}
              {feedSearchInput && (
                <span
                  onClick={() => handleSearchInputChange('')}
                  className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                >
                  <span className="font-bold">عبارت جستجو: «{feedSearchInput}»</span>
                  <span className="material-symbols-outlined text-[14px] text-amber-700 hover:text-red-600">close</span>
                </span>
              )}

              {/* Category chip */}
              {internalCategory !== 'همه' && (
                <span
                  onClick={() => handleCategoryChange('همه')}
                  className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-teal-200"
                >
                  <span className="font-semibold">دسته‌بندی: {taxonomyInfo.title}</span>
                  <span className="material-symbols-outlined text-[14px] text-teal-600 hover:text-red-600">close</span>
                </span>
              )}

              {/* Subcategory chip */}
              {selectedSubCategory && !selectedSubCategory.startsWith('همه') && (
                <span
                  onClick={() => setSelectedSubCategory('همه زیردسته‌ها')}
                  className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-teal-200"
                >
                  <span className="font-semibold">{selectedSubCategory}</span>
                  <span className="material-symbols-outlined text-[14px] text-teal-600 hover:text-red-600">close</span>
                </span>
              )}

              {onlyWithPhoto && (
                <span
                  onClick={() => setOnlyWithPhoto(false)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <span>فقط عکس‌دار</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 hover:text-red-600">close</span>
                </span>
              )}
              {onlyVerified && (
                <span
                  onClick={() => setOnlyVerified(false)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <span>فروشنده تأیید شده</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 hover:text-red-600">close</span>
                </span>
              )}
              {onlyUrgent && (
                <span
                  onClick={() => setOnlyUrgent(false)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <span>فقط فوری</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 hover:text-red-600">close</span>
                </span>
              )}
              {activeDistrictFilter !== 'همه' && (
                <span
                  onClick={() => setActiveDistrictFilter('همه')}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <span>محله: {activeDistrictFilter}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 hover:text-red-600">close</span>
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#ba0035] hover:underline mr-1 font-semibold cursor-pointer"
              >
                حذف همه فیلترها
              </button>
            </div>
          </div>

          {/* Featured / Sponsored Ribbon Banner */}
          <div className="bg-gradient-to-l from-[#005c55]/10 via-[#eaedff] to-white p-4 rounded-3xl flex items-center justify-between gap-4 border border-slate-100">
            <div className="flex items-center gap-3 text-right">
              <span
                className="material-symbols-outlined text-[#005c55] text-[32px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                  خرید امن و مطمئن در دسته‌بندی {taxonomyInfo.title}
                </span>
                <span className="text-[11px] text-slate-500">
                  تمام تراکنش‌های حضوری با احراز هویت پیامکی فروشنده و بررسی فنی کالا تحت پوشش قرار دارند.
                </span>
              </div>
            </div>
            <button
              onClick={() => onShowToast('راهنمای معاملات امن آوان مارکت باز شد')}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-white text-emerald-700 text-xs font-bold shadow-xs border border-emerald-200 hover:bg-emerald-50 transition-colors shrink-0"
            >
              راهنمای خرید امن
            </button>
          </div>

          {/* Listings Feed Cards */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-slate-300 text-[64px]">search_off</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                هیچ آگهی‌ای در دسته‌بندی «{taxonomyInfo.title}» با فیلترهای انتخابی یافت نشد
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                می‌توانید فیلترها را حذف کنید یا دسته‌بندی دیگری را از نوار بالای صفحه انتخاب نمایید.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-5 py-2.5 bg-[#005c55] text-white rounded-2xl text-xs font-bold shadow-md hover:bg-[#004741] transition-all cursor-pointer"
              >
                مشاهده تمام آگهی‌های بازار
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredListings.map((item) => {
                const isBookmarked = bookmarkedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className={`group bg-white rounded-3xl p-3 sm:p-3.5 transition-all flex flex-col justify-between cursor-pointer relative ${
                      item.vipTier === 'diamond'
                        ? 'border-2 border-indigo-400/90 shadow-md ring-1 ring-purple-300/50'
                        : item.vipTier === 'golden'
                        ? 'border-2 border-amber-400/90 shadow-sm'
                        : item.vipTier === 'standard'
                        ? 'border-2 border-teal-300'
                        : 'border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200'
                    }`}
                  >
                    {/* Image & Badges */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Badges Overlay */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
                        {item.vipTier === 'diamond' && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 border border-white/40">
                            <span>💎</span>
                            <span>الماس ۶ ماهه</span>
                          </span>
                        )}
                        {item.vipTier === 'golden' && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-900 text-[10px] font-black shadow-md flex items-center gap-1 border border-white/40">
                            <span>🌟</span>
                            <span>طلایی ۳ ماهه</span>
                          </span>
                        )}
                        {item.vipTier === 'standard' && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 border border-white/20">
                            <span>⚡</span>
                            <span>معمولی ۱ ماهه</span>
                          </span>
                        )}
                        {item.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ba0035] text-white text-[10px] font-bold shadow-xs">
                            فروش فوری
                          </span>
                        )}
                        {item.hasDiscount && (
                          <span className="px-2 py-0.5 rounded-full bg-[#005c55] text-white text-[10px] font-bold shadow-xs">
                            {item.discountBadge || 'تخفیف'}
                          </span>
                        )}
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item.id);
                        }}
                        className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
                          isBookmarked
                            ? 'bg-[#ba0035] text-white'
                            : 'bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          bookmark
                        </span>
                      </button>

                      {/* Category Chip Badge on Photo */}
                      <div className="absolute bottom-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                        {item.category}
                      </div>
                    </div>

                    {/* Listing Title & Price */}
                    <div className="flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-relaxed group-hover:text-[#005c55] transition-colors">
                          {item.title}
                        </h4>

                        {/* Stock Inventory Tag */}
                        <div className="mt-1.5 flex items-center">
                          {item.stockCount !== undefined && item.stockCount > 0 ? (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              item.stockCount <= 2 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.stockCount <= 2 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                              <span>
                                {item.stockCount <= 2 ? `تنها ${toPersianDigits(item.stockCount)} عدد در انبار` : `موجودی: ${toPersianDigits(item.stockCount)} عدد`}
                              </span>
                            </span>
                          ) : item.stockCount === 0 ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              ناموجود
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">قیمت:</span>
                          <span className="font-black text-sm sm:text-base text-slate-900">
                            {item.price > 0 ? `${formatToman(item.price)} تومان` : 'توافقی'}
                          </span>
                        </div>

                        {/* Location, Time & Quick Cart Button */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="truncate">{item.neighborhood}</span>
                          
                          {item.price > 0 && (item.stockCount === undefined || item.stockCount > 0) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAddToCart) {
                                  onAddToCart(item, 1);
                                } else {
                                  onShowToast(`«${item.title}» به سبد خرید اضافه شد.`);
                                }
                              }}
                              className="p-1 px-2 rounded-lg bg-teal-50 hover:bg-[#005c55] text-[#005c55] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="افزودن سریع به سبد خرید"
                            >
                              <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                              <span>خرید</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-3">
              {filteredListings.map((item) => {
                const isBookmarked = bookmarkedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="group bg-white rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-xs hover:shadow-lg transition-all flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
                  >
                    <div className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {item.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ba0035] text-white text-[10px] font-bold">
                            فوری
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between w-full h-full py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#005c55] bg-teal-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.timeAgo}</span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#005c55] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            location_on
                          </span>
                          <span>{item.city}، {item.neighborhood}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm sm:text-base text-[#005c55]">
                            {item.price > 0 ? `${formatToman(item.price)} تومان` : 'توافقی'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(item.id);
                            }}
                            className={`p-1.5 rounded-full cursor-pointer ${
                              isBookmarked ? 'text-[#ba0035]' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
