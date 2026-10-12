import React, { useState } from 'react';
import { toPersianDigits } from '../data/mockData';

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords?: { lat: number; lng: number };
  initialCity?: string;
  initialNeighborhood?: string;
  onConfirmLocation: (location: {
    lat: number;
    lng: number;
    city: string;
    neighborhood: string;
    address: string;
  }) => void;
}

interface CityCenter {
  name: string;
  province: string;
  lat: number;
  lng: number;
  neighborhoods: string[];
}

const famousCities: CityCenter[] = [
  { name: 'تهران', province: 'تهران', lat: 35.6892, lng: 51.3890, neighborhoods: ['سعادت‌آباد', 'شهرک غرب', 'تجریش', 'نیاوران', 'صادقیه', 'پونک', 'ونک'] },
  { name: 'ساری', province: 'مازندران', lat: 36.5659, lng: 53.0586, neighborhoods: ['قارن', 'فرهنگ', 'میدان خزر', 'پیوندی', 'طبرستان', 'بلوار پاسداران'] },
  { name: 'بابل', province: 'مازندران', lat: 36.5444, lng: 52.6789, neighborhoods: ['میدان اوقاف', 'بلوار مدرس', 'شریعتی', 'امیرکبیر', 'حمزه‌کلا'] },
  { name: 'مشهد', province: 'خراسان رضوی', lat: 36.2605, lng: 59.6168, neighborhoods: ['احمدآباد', 'سجاد', 'وکیل‌آباد', 'هاشمیه', 'تقی‌آباد'] },
  { name: 'اصفهان', province: 'اصفهان', lat: 32.6546, lng: 51.6680, neighborhoods: ['چهارباغ', 'مرداویج', 'پل رومی', 'شیخ صدوق'] },
  { name: 'شیراز', province: 'فارس', lat: 29.5918, lng: 52.5837, neighborhoods: ['معالی‌آباد', 'عفیف‌آباد', 'قصرالدشت', 'ستارخان'] },
  { name: 'تبریز', province: 'آذربایجان شرقی', lat: 38.0962, lng: 46.2738, neighborhoods: ['ولیعصر', 'آبرسان', 'شاهگلی', 'رشدیه'] },
  { name: 'رشت', province: 'گیلان', lat: 37.2808, lng: 49.5832, neighborhoods: ['گلسار', 'منظریه', 'معلم', 'میدان شهرداری'] },
  { name: 'کرج', province: 'البرز', lat: 35.8400, lng: 50.9391, neighborhoods: ['عظیمیه', 'گوهردشت', 'جهانشهر', 'مهرشهر'] },
];

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialCoords = { lat: 35.7796, lng: 51.3752 },
  initialCity = 'تهران',
  initialNeighborhood = 'سعادت‌آباد',
  onConfirmLocation,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialCoords);
  const [activeCity, setActiveCity] = useState(initialCity);
  const [activeNeighborhood, setActiveNeighborhood] = useState(initialNeighborhood);
  const [addressDetail, setAddressDetail] = useState(`محدوده ${initialNeighborhood}، نزدیک میدان اصلی`);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [zoomLevel, setZoomLevel] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleCitySelect = (cityObj: CityCenter) => {
    setActiveCity(cityObj.name);
    setCoords({ lat: cityObj.lat, lng: cityObj.lng });
    const firstNeigh = cityObj.neighborhoods[0] || 'مرکز شهر';
    setActiveNeighborhood(firstNeigh);
    setAddressDetail(`${cityObj.province}، ${cityObj.name}، محدوده ${firstNeigh}`);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized delta from center (-0.5 to 0.5)
    const deltaX = (x / rect.width) - 0.5;
    const deltaY = (y / rect.height) - 0.5;
    
    // Adjust lat/lng slightly based on click offset
    const newLat = Number((coords.lat - deltaY * (0.02 / (zoomLevel / 10))).toFixed(5));
    const newLng = Number((coords.lng + deltaX * (0.02 / (zoomLevel / 10))).toFixed(5));
    
    setCoords({ lat: newLat, lng: newLng });
    setAddressDetail(`${activeCity}، محدوده ${activeNeighborhood}، پلاک متغیر`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const matchedCity = famousCities.find(
      (c) => c.name.includes(searchQuery.trim()) || c.neighborhoods.some((n) => n.includes(searchQuery.trim()))
    );

    if (matchedCity) {
      handleCitySelect(matchedCity);
      const matchedNeigh = matchedCity.neighborhoods.find((n) => n.includes(searchQuery.trim()));
      if (matchedNeigh) {
        setActiveNeighborhood(matchedNeigh);
        setAddressDetail(`${matchedCity.name}، ${matchedNeigh}`);
      }
    } else {
      setActiveNeighborhood(searchQuery.trim());
      setAddressDetail(`${activeCity}، ${searchQuery.trim()}`);
    }
  };

  const handleConfirm = () => {
    onConfirmLocation({
      lat: coords.lat,
      lng: coords.lng,
      city: activeCity,
      neighborhood: activeNeighborhood,
      address: addressDetail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[750px] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-[#005c55] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[24px]">pin_drop</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">تعیین موقعیت دقیق آگهی روی نقشه</h3>
              <p className="text-xs text-teal-100/80">برای بازدید بهتر، نشانگر را روی محل کالا یا ملک خود قرار دهید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Top Control Bar: Search & Quick City Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی شهر، محله یا خیابان (مثلاً: سعادت‌آباد، قارن، فرهنگ، گلسار)..."
                className="w-full pr-9 pl-24 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005c55]"
              />
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#005c55] text-white rounded-lg text-xs font-bold hover:bg-[#004741]"
              >
                پیدا کن
              </button>
            </form>

            {/* Map Style Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setMapType('streets')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mapType === 'streets' ? 'bg-[#005c55] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نمای معابر
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mapType === 'satellite' ? 'bg-[#005c55] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ماهواره‌ای
              </button>
            </div>
          </div>

          {/* City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">انتخاب سریع:</span>
            {famousCities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all border ${
                  activeCity === city.name
                    ? 'bg-[#005c55] text-white border-[#005c55] font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Map Canvas */}
        <div
          onClick={handleMapClick}
          className="relative flex-1 bg-slate-200 overflow-hidden cursor-crosshair select-none"
          style={{
            backgroundImage:
              mapType === 'streets'
                ? `radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`
                : `radial-gradient(#334155 1.5px, transparent 1.5px), linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
            backgroundSize: mapType === 'streets' ? '24px 24px, 48px 48px, 48px 48px' : '32px 32px, 100% 100%',
            backgroundColor: mapType === 'streets' ? '#f1f5f9' : '#0f172a',
          }}
        >
          {/* Simulated Map Roads & Rivers Graphics */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 Q 200 150 400 350 T 900 300" stroke={mapType === 'streets' ? '#38bdf8' : '#0284c7'} strokeWidth="12" fill="none" opacity="0.6" />
            <path d="M 100 -50 L 350 300 L 700 800" stroke={mapType === 'streets' ? '#cbd5e1' : '#475569'} strokeWidth="8" fill="none" />
            <path d="M -50 400 L 800 250" stroke={mapType === 'streets' ? '#cbd5e1' : '#475569'} strokeWidth="6" fill="none" />
            <path d="M 250 0 L 250 800" stroke={mapType === 'streets' ? '#fdba74' : '#c2410c'} strokeWidth="10" fill="none" opacity="0.7" />
            <path d="M 0 320 L 900 320" stroke={mapType === 'streets' ? '#fdba74' : '#c2410c'} strokeWidth="10" fill="none" opacity="0.7" />
          </svg>

          {/* Area Label overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-800 pointer-events-none">
            📍 نقشه {activeCity} - محله {activeNeighborhood}
          </div>

          {/* Center Target Marker Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center z-20">
            <div className="relative flex flex-col items-center">
              {/* Callout Popup */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap mb-1 shadow-xl flex items-center gap-1 animate-bounce">
                <span>موقعیت انتخابی شما</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              {/* Pin Icon */}
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[#ba0035] text-[48px] drop-shadow-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  location_on
                </span>
                <span className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white"></span>
              </div>
              {/* Ground Shadow Radar Pulse */}
              <div className="w-8 h-3 bg-black/30 rounded-full blur-[2px] -mt-2"></div>
              <div className="w-12 h-5 rounded-full border-2 border-[#ba0035]/60 animate-ping -mt-4"></div>
            </div>
          </div>

          {/* Map Controls (Zoom in/out, Center) */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.min(z + 1, 20));
              }}
              className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md flex items-center justify-center font-bold text-base border border-slate-200"
              title="بزرگ‌نمایی"
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.max(z - 1, 10));
              }}
              className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md flex items-center justify-center font-bold text-base border border-slate-200"
              title="کوچک‌نمایی"
            >
              -
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const matched = famousCities.find((c) => c.name === activeCity);
                if (matched) setCoords({ lat: matched.lat, lng: matched.lng });
              }}
              className="w-9 h-9 bg-white hover:bg-slate-50 text-[#005c55] rounded-xl shadow-md flex items-center justify-center border border-slate-200"
              title="مرکز نقشه"
            >
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </button>
          </div>

          {/* Coordinates indicator banner */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white/90 text-[11px] font-mono px-3 py-1.5 rounded-xl border border-white/10 shadow-md pointer-events-none flex items-center gap-2" dir="ltr">
            <span>Lat: {toPersianDigits(coords.lat)}</span>
            <span>•</span>
            <span>Lng: {toPersianDigits(coords.lng)}</span>
            <span>•</span>
            <span>Zoom: {toPersianDigits(zoomLevel)}x</span>
          </div>
        </div>

        {/* Footer with Selected Location Details & Confirmation */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#005c55] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">apartment</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">{activeCity}، {activeNeighborhood}</span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-[#005c55] text-[10px] font-bold">موقعیت ثبت‌شده</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{addressDetail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>تأیید و ذخیره موقعیت روی نقشه</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
