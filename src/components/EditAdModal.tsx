import React, { useState, useRef } from 'react';
import { Listing } from '../types';
import { formatToman, numberToPersianWords, toPersianDigits } from '../data/mockData';
import { iranProvinces, allIranCities } from '../data/iranLocations';
import { MapLocationPickerModal } from './MapLocationPickerModal';

interface EditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSave: (updatedAd: Listing) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const EditAdModal: React.FC<EditAdModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSave,
  onShowToast,
}) => {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(listing.price);
  const [priceInputStr, setPriceInputStr] = useState(formatToman(listing.price));
  const [isNegotiable, setIsNegotiable] = useState(listing.isNegotiable || listing.price === 0);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState<'new' | 'like-new' | 'used'>(listing.condition);
  const [isUrgent, setIsUrgent] = useState(!!listing.isUrgent);
  const [hasDiscount, setHasDiscount] = useState(!!listing.hasDiscount);
  const [discountBadge, setDiscountBadge] = useState(listing.discountBadge || 'تخفیف ویژه');
  const [status, setStatus] = useState<'active' | 'pending' | 'expired'>(listing.status);
  
  // Location states
  const [province, setProvince] = useState(() => {
    const matchedCity = allIranCities.find((c) => c.name === listing.city);
    return matchedCity ? matchedCity.province : 'تهران';
  });
  const [city, setCity] = useState(listing.city);
  const [neighborhood, setNeighborhood] = useState(listing.neighborhood);
  const [coords, setCoords] = useState(listing.mapCoords || { lat: 35.7796, lng: 51.3752 });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Images state
  const [images, setImages] = useState<string[]>(listing.images.length > 0 ? [...listing.images] : []);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Specs state
  const [specs, setSpecs] = useState<Record<string, string>>({ ...listing.specs });
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = parseInt(raw, 10) || 0;
    setPrice(num);
    setPriceInputStr(raw ? formatToman(num) : '');
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImgs) => {
      setImages((prev) => [...prev, ...newImgs]);
      onShowToast(`${toPersianDigits(newImgs.length)} تصویر از گالری/دستگاه اضافه شد.`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    onShowToast('تصویر به گالری آگهی اضافه شد.');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecs((prev) => ({
      ...prev,
      [newSpecKey.trim()]: newSpecVal.trim(),
    }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('لطفاً عنوان آگهی را وارد کنید.', 'warning');
      return;
    }

    const updatedListing: Listing = {
      ...listing,
      title: title.trim(),
      price: isNegotiable ? 0 : price,
      isNegotiable,
      description: description.trim(),
      category,
      condition,
      isUrgent,
      hasDiscount,
      discountBadge: hasDiscount ? discountBadge : undefined,
      status,
      city,
      neighborhood,
      mapCoords: coords,
      images: images.length > 0 ? images : listing.images,
      specs,
      categoryPath: ['صفحه اصلی', category, city],
    };

    onSave(updatedListing);
    onShowToast('مشخصات آگهی با موفقیت به‌روزرسانی شد.', 'success');
    onClose();
  };

  const currentProvinceObj = iranProvinces.find((p) => p.name === province) || iranProvinces[0];
  const citiesInProvince = currentProvinceObj.cities;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-[#005c55] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <span className="material-symbols-outlined text-[24px]">edit_note</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">ویرایش کامل مشخصات آگهی</h3>
                <p className="text-xs text-teal-100/80">کد آگهی: {listing.code} • دسته‌بندی: {listing.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
            
            {/* 1. Title & Category */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">title</span>
                <span>عنوان آگهی</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان دقیق کالا یا خدمات..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#005c55]"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">دسته‌بندی اصلی</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  >
                    <option value="کالای دیجیتال">کالای دیجیتال</option>
                    <option value="خانه و آشپزخانه">خانه و آشپزخانه</option>
                    <option value="وسایل نقلیه">وسایل نقلیه</option>
                    <option value="املاک">املاک</option>
                    <option value="وسایل شخصی">وسایل شخصی</option>
                    <option value="خدمات">خدمات</option>
                    <option value="سرگرمی و فراغت">سرگرمی و فراغت</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">وضعیت ظاهری / فیزیکی</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  >
                    <option value="new">نو (پلمپ یا دست نخورده)</option>
                    <option value="like-new">در حد نو (بسیار تمیز)</option>
                    <option value="used">کارکرده (سالم)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Price & Negotiation */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005c55] text-[18px]">payments</span>
                  <span>قیمت‌گذاری و شرایط پرداخت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded text-[#005c55] focus:ring-[#005c55] w-4 h-4"
                  />
                  <span>قیمت توافقی / تماس بگیرید</span>
                </label>
              </div>

              {!isNegotiable && (
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={priceInputStr}
                      onChange={handlePriceChange}
                      placeholder="مثال: ۷۵,۰۰۰,۰۰۰"
                      className="w-full pr-4 pl-14 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-[#005c55] text-left"
                      dir="ltr"
                    />
                    <span className="absolute left-3 text-xs font-semibold text-slate-400">تومان</span>
                  </div>
                  <div className="text-[11px] text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-teal-600">info</span>
                    <span>معادل حروف: <strong>{numberToPersianWords(price)}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Location & Interactive Map */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005c55] text-[18px]">location_on</span>
                  <span>موقعیت مکانی و آدرس دقیق</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#005c55]/10 hover:bg-[#005c55]/20 text-[#005c55] rounded-xl text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                  <span>انتخاب روی نقشه هوشمند</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">استان</label>
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvince(newProv);
                      const pObj = iranProvinces.find((p) => p.name === newProv);
                      if (pObj && pObj.cities.length > 0) {
                        setCity(pObj.cities[0].name);
                        setNeighborhood(pObj.cities[0].districts[0] || 'مرکز شهر');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  >
                    {iranProvinces.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">شهر</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      const cObj = citiesInProvince.find((c) => c.name === newCity);
                      if (cObj && cObj.districts.length > 0) {
                        setNeighborhood(cObj.districts[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  >
                    {citiesInProvince.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">محله یا منطقه</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="مثلاً: سعادت‌آباد، خیابان قارن..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  />
                </div>
              </div>

              {/* Coordinates Preview badge */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">
                  مختصات نقشه: <span className="font-mono text-slate-800" dir="ltr">{toPersianDigits(coords.lat.toFixed(4))}, {toPersianDigits(coords.lng.toFixed(4))}</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>موقعیت ثبت‌شده در {city}</span>
                </span>
              </div>
            </div>

            {/* 4. Description */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">description</span>
                <span>توضیحات تکمیلی آگهی</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="توضیحات کامل در مورد مشخصات فنی، خط و خش، مهلت تست و نحوه تحویل کالا..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#005c55] leading-relaxed"
              />
            </div>

            {/* 5. Images Management */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">photo_library</span>
                <span>مدیریت عکس‌های آگهی ({toPersianDigits(images.length)} عکس)</span>
              </label>
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-200 border border-slate-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 right-1 bg-[#005c55] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        تصویر اصلی
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute bottom-1 left-1 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity shadow"
                      title="حذف عکس"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Hidden File Picker Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />

              {/* Add New Image Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#005c55] border border-teal-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                  <span>انتخاب عکس از گالری / دستگاه</span>
                </button>
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="یا درج لینک تصویر (URL)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-[#005c55] text-white text-xs font-bold rounded-xl hover:bg-[#004741] transition-colors shrink-0 cursor-pointer"
                  >
                    افزودن
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Badges & Promos (فوری، تخفیف، وضعیت) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-[#ba0035] focus:ring-[#ba0035] w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">نشان فوری</span>
                  <span className="text-[10px] text-slate-500">نمایش برچسب فوری قرمز</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => setHasDiscount(e.target.checked)}
                  className="rounded text-[#005c55] focus:ring-[#005c55] w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">برچسب تخفیف</span>
                  <span className="text-[10px] text-slate-500">نشان سبز تخفیف ویژه</span>
                </div>
              </label>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-800 mb-1">وضعیت انتشار</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
                >
                  <option value="active">فعال و در حال نمایش</option>
                  <option value="pending">در انتظار بررسی</option>
                  <option value="expired">منقضی شده</option>
                </select>
              </div>
            </div>

            {/* 7. Specs Key-Values */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005c55] text-[18px]">checklist</span>
                <span>مشخصات فنی و جدول ویژگی‌ها</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold">{k}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(k)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Spec Pair */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="عنوان ویژگی (مثلاً حافظه)..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                />
                <input
                  type="text"
                  value={newSpecVal}
                  onChange={(e) => setNewSpecVal(e.target.value)}
                  placeholder="مقدار (مثلاً ۲۵۶ گیگابایت)..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55]"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors shrink-0"
                >
                  افزودن ویژگی
                </button>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>ذخیره و اعمال تغییرات آگهی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Map Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialCoords={coords}
        initialCity={city}
        initialNeighborhood={neighborhood}
        onConfirmLocation={(loc) => {
          setCoords({ lat: loc.lat, lng: loc.lng });
          setCity(loc.city);
          setNeighborhood(loc.neighborhood);
          onShowToast(`موقعیت مکانی روی «${loc.city}، ${loc.neighborhood}» تنظیم گردید.`);
        }}
      />
    </>
  );
};
