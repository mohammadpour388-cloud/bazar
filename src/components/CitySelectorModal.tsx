import React, { useState, useMemo } from 'react';
import { iranProvinces, allIranCities, topPopularCities, IranCity, IranProvince } from '../data/iranLocations';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  selectedDistrict: string;
  onSelect: (city: string, district: string) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  selectedDistrict,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvince, setActiveProvince] = useState<string>('مازندران');
  const [activeCityObj, setActiveCityObj] = useState<IranCity | null>(() => {
    return allIranCities.find((c) => c.name === selectedCity) || allIranCities[0];
  });
  const [viewStep, setViewStep] = useState<'cities' | 'districts'>('cities');

  // Normalize Persian characters and remove half-spaces for robust search
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u200C\u200B\u00A0_-]/g, '')
      .replace(/\s+/g, '');
  };

  // Filtered cities based on search query
  const searchResults = useMemo(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ) return [];
    const cleanQ = normalizeText(rawQ);

    return allIranCities.filter((city) => {
      const normCity = normalizeText(city.name);
      const normProvince = normalizeText(city.province);
      const matchCity = normCity.includes(cleanQ) || city.name.includes(rawQ);
      const matchProvince = normProvince.includes(cleanQ) || city.province.includes(rawQ);
      const matchDistricts = city.districts.some(
        (d) => normalizeText(d).includes(cleanQ) || d.includes(rawQ)
      );
      return matchCity || matchProvince || matchDistricts;
    });
  }, [searchQuery]);

  // Cities belonging to the active province
  const currentProvinceCities = useMemo(() => {
    const prov = iranProvinces.find((p) => p.name === activeProvince);
    return prov ? prov.cities : [];
  }, [activeProvince]);

  if (!isOpen) return null;

  const handleCityClick = (city: IranCity) => {
    setActiveCityObj(city);
    // If the city has multiple distinct neighborhoods, show them or select directly
    if (city.districts && city.districts.length > 2) {
      setViewStep('districts');
    } else {
      onSelect(city.name, 'همه محله‌ها');
      onClose();
    }
  };

  const handleDistrictSelect = (district: string) => {
    if (activeCityObj) {
      onSelect(activeCityObj.name, district);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity text-right">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#005c55]/10 text-[#005c55] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">location_on</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {viewStep === 'districts' && activeCityObj
                  ? `انتخاب محله در ${activeCityObj.name} (${activeCityObj.province})`
                  : 'انتخاب شهر و استان'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewStep === 'districts'
                  ? 'محله مورد نظر خود را مشخص کنید یا تمام شهر را انتخاب نمایید'
                  : 'تمامی استان‌ها و شهرهای ایران (مازندران، تهران، گیلان و...)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewStep === 'districts' && (
              <button
                type="button"
                onClick={() => setViewStep('cities')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                <span>تغییر شهر</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute right-3.5 text-slate-400 text-[22px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (viewStep === 'districts') setViewStep('cities');
              }}
              placeholder="جستجوی شهر یا استان (مثال: ساری، بابل، چالوس، رامسر، مازندران، شیراز، تهران...)"
              className="w-full pr-11 pl-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/15 transition-all shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        {viewStep === 'districts' && activeCityObj ? (
          /* Districts Step */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between bg-teal-50/70 border border-teal-100 p-3 rounded-2xl">
              <span className="text-xs text-teal-900 font-semibold">
                شهر انتخاب شده: <strong>{activeCityObj.name}</strong> ({activeCityObj.province})
              </span>
              <button
                type="button"
                onClick={() => handleDistrictSelect('همه محله‌ها')}
                className="px-3 py-1 bg-[#005c55] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#004741] transition-colors"
              >
                انتخاب کل شهر {activeCityObj.name}
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-2.5">
                محله‌های {activeCityObj.name}:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeCityObj.districts.map((dist) => {
                  const isSelected = selectedCity === activeCityObj.name && selectedDistrict === dist;
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => handleDistrictSelect(dist)}
                      className={`p-3 rounded-2xl text-xs font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#005c55] text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'
                      }`}
                    >
                      <span className="truncate">{dist}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : searchQuery.trim() ? (
          /* Search Results */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-xs text-slate-500 font-semibold mb-3 flex items-center justify-between">
              <span>نتایج جستجو برای «{searchQuery}»:</span>
              <span className="text-slate-400">{searchResults.length} شهر پیدا شد</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl">location_off</span>
                <p className="text-sm font-semibold">شهری با نام «{searchQuery}» پیدا نشد.</p>
                <p className="text-xs">لطفاً املای کلمه را بررسی کنید یا نام استان را جستجو فرمایید.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {searchResults.map((city) => {
                  const isCurrent = selectedCity === city.name;
                  return (
                    <button
                      key={`${city.province}-${city.name}`}
                      type="button"
                      onClick={() => handleCityClick(city)}
                      className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-[#005c55] text-white shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-extrabold text-sm">{city.name}</span>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        )}
                      </div>
                      <span className={`text-[11px] ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                        استان {city.province}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Normal State: Popular Cities + Province Tabs */
          <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-slate-100">
            {/* Top Popular Cities Chips */}
            <div className="p-3.5 sm:p-4 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
                <span className="material-symbols-outlined text-[#ba0035] text-[18px]">local_fire_department</span>
                <span>شهرهای پرطرفدار و پرتردد:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topPopularCities.map((cityName) => {
                  const city = allIranCities.find((c) => c.name === cityName);
                  const isCurrent = selectedCity === cityName;
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => {
                        if (city) handleCityClick(city);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#005c55] text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {cityName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split View: Provinces List on Right + Cities of Province on Left */}
            <div className="flex-1 grid grid-cols-12 min-h-[340px]">
              {/* Provinces Column (RTL right) */}
              <div className="col-span-5 sm:col-span-4 border-l border-slate-100 overflow-y-auto max-h-[380px] p-2 space-y-1 bg-slate-50/50">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1">استان‌های ایران:</div>
                {iranProvinces.map((prov) => {
                  const isActive = activeProvince === prov.name;
                  return (
                    <button
                      key={prov.name}
                      type="button"
                      onClick={() => setActiveProvince(prov.name)}
                      className={`w-full px-3 py-2 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#005c55] shadow-xs border-r-4 border-r-[#005c55]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{prov.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {prov.cities.length} شهر
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cities of Active Province Column (RTL left) */}
              <div className="col-span-7 sm:col-span-8 overflow-y-auto max-h-[380px] p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#005c55] text-[18px]">location_city</span>
                    شهرهای استان {activeProvince}:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentProvinceCities.length} شهر ثبت شده
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentProvinceCities.map((city) => {
                    const isSelected = selectedCity === city.name;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleCityClick(city)}
                        className={`p-2.5 rounded-2xl text-right transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#005c55] text-white shadow-sm font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">{city.name}</span>
                        <div className="flex items-center gap-1">
                          {city.districts && city.districts.length > 2 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-200/70 text-slate-500'}`}>
                              محله‌ها
                            </span>
                          )}
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="material-symbols-outlined text-[#005c55] text-[18px]">verified</span>
            <span>
              موقعیت انتخابی فعلی: <strong className="text-slate-900">{selectedCity}</strong>
              {selectedDistrict && selectedDistrict !== 'همه محله‌ها' && (
                <span className="text-slate-500"> ({selectedDistrict})</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelect('کل ایران', 'همه شهرها');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              🇮🇷 سراسر ایران
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect(activeCityObj?.name || 'ساری', 'همه محله‌ها');
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-[#005c55] text-white hover:bg-[#004741] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              تأیید و اعمال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
