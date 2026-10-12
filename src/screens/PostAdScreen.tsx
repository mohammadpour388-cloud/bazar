import React, { useState, useRef } from 'react';
import { Listing, ScreenType, UserProfile } from '../types';
import { formatToman, numberToPersianWords, toPersianDigits, toEnglishDigits } from '../data/mockData';
import { iranProvinces, allIranCities, IranProvince, IranCity } from '../data/iranLocations';
import { MapLocationPickerModal } from '../components/MapLocationPickerModal';

// Pre-configured high-quality default images for quick ad creation
const presetImageGalleries = {
  digital: {
    title: '💻 کالای دیجیتال و لپ‌تاپ',
    images: [
      { id: 'dig_1', title: 'مک‌بوک پرو اپل M3', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
      { id: 'dig_2', title: 'لپ‌تاپ گیمینگ ایسوس ROG', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80' },
      { id: 'dig_3', title: 'اولترابوک تینک‌پد لنوو', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
      { id: 'dig_4', title: 'آیفون ۱۳ پرومکس رنگ آبی', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80' },
      { id: 'dig_5', title: 'آیپد پرو اپل با قلم', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
      { id: 'dig_6', title: 'کنسول پلی‌استیشن ۵', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  realEstate: {
    title: '🏡 املاک و خانه‌های زیبا',
    images: [
      { id: 're_1', title: 'ویلای مدرن استخردار لوکس', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80' },
      { id: 're_2', title: 'پنت‌هاوس دوبلکس مدرن', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
      { id: 're_3', title: 'آپارتمان نوساز نورگیر', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
      { id: 're_4', title: 'ویلای سرسبز شمال', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' },
      { id: 're_5', title: 'سالن پذیرایی و نشیمن شیک', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
      { id: 're_6', title: 'آشپزخانه جزیره مدرن', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  vehicles: {
    title: '🚗 خودرو و انواع ماشین',
    images: [
      { id: 'veh_1', title: 'پژو ۲۰۷ سفید اسپرت', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
      { id: 'veh_2', title: 'هاچ‌بک جوان‌پسند', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80' },
      { id: 'veh_3', title: 'سدان دنا پلاس و تارا', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
      { id: 'veh_4', title: 'شاسی‌بلند کراس‌اوور هایما', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
      { id: 'veh_5', title: 'خودرو سواری متالیک', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
      { id: 'veh_6', title: 'کابین و داشبورد خودرو', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  supplements: {
    title: '💊 مکمل غذایی، دارویی و ورزشی',
    images: [
      { id: 'sup_1', title: 'پروتئین وی ایزوله بدنسازی', url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=800&q=80' },
      { id: 'sup_2', title: 'مکمل کراتین و آمینواسید', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
      { id: 'sup_3', title: 'کپسول و قرص مولتی‌ویتامین', url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80' },
      { id: 'sup_4', title: 'شیکر و بطری مکمل ورزشی', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80' },
      { id: 'sup_5', title: 'قرص‌های سلامت مفاصل و کلاژن', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' },
      { id: 'sup_6', title: 'قوطی مکمل استاندارد پودری', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  personal: {
    title: '⌚ مسائل شخصی، پوشاک و ساعت',
    images: [
      { id: 'per_1', title: 'ساعت مچی کلاسیک لوکس', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80' },
      { id: 'per_2', title: 'کیف و ست چرم طبیعی اعلا', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
      { id: 'per_3', title: 'کفش کتانی نایک اورجینال', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
      { id: 'per_4', title: 'عینک آفتابی و اکسسوری مد', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
      { id: 'per_5', title: 'ادکلن و عطر فرانسوی اصل', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80' },
      { id: 'per_6', title: 'کت و پالتوی شیک پاییزه', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  home: {
    title: '🛋️ لوازم خانگی و آشپزخانه',
    images: [
      { id: 'hm_1', title: 'اسپرسوساز تمام اتوماتیک', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80' },
      { id: 'hm_2', title: 'یخچال ساید بای ساید ۳۰ فوت', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
      { id: 'hm_3', title: 'تلویزیون اولد هوشمند سالن', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80' },
      { id: 'hm_4', title: 'مبل راحتی ال مدرن ترک', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
    ]
  }
};

interface PostAdScreenProps {
  onAdCreated: (newAd: Listing) => void;
  onNavigate: (screen: ScreenType) => void;
  user: UserProfile | null;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PostAdScreen: React.FC<PostAdScreenProps> = ({
  onAdCreated,
  onNavigate,
  user,
  onShowToast,
}) => {
  // Category State
  const [adCategory, setAdCategory] = useState('کالای دیجیتال');
  const [adSubCategory, setAdSubCategory] = useState('موبایل و تبلت');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Location State
  const [adProvince, setAdProvince] = useState<string>('تهران');
  const [adCity, setAdCity] = useState<string>('تهران');
  const [neighborhood, setNeighborhood] = useState('سعادت‌آباد');
  const [coords, setCoords] = useState({ lat: 35.7796, lng: 51.3752 });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // File Input Ref for native gallery/camera picker
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('گوشی آیفون ۱۳ پرومکس ۲۵۶ گیگابایت آبی با سلامت باتری ۹۱٪');
  const [condition, setCondition] = useState<'new' | 'like-new' | 'used'>('like-new');

  // Dynamic Category Specs:
  // 1. Mobile & Tablet
  const [storage, setStorage] = useState('۲۵۶ گیگابایت');
  const [registryStatus, setRegistryStatus] = useState('دارای رجیستری با انتقال مالکیت');
  const [batteryHealth, setBatteryHealth] = useState('۹۱');

  // 2. Laptop & Computers (طبق خواسته کاربر: بدون ریجستری، دارای CPU, RAM, SSD, GPU, سلامت)
  const [laptopCpu, setLaptopCpu] = useState('Intel Core i7 13700H');
  const [laptopRam, setLaptopRam] = useState('۱۶ گیگابایت DDR5');
  const [laptopStorage, setLaptopStorage] = useState('۵۱۲ گیگابایت SSD NVMe');
  const [laptopGpu, setLaptopGpu] = useState('NVIDIA GeForce RTX 4060');
  const [laptopHealth, setLaptopHealth] = useState('کاملاً سالم و در حد نو (سیکل باتری پایین)');

  // 3. Vehicles (وسایل نقلیه)
  const [vehicleYear, setVehicleYear] = useState('۱۴۰۲');
  const [vehicleMileage, setVehicleMileage] = useState('۱۸,۰۰۰ کیلومتر');
  const [vehicleBody, setVehicleBody] = useState('یک لکه رنگ روی گلگیر عقب، شاسی پلمپ');
  const [vehicleInsurance, setVehicleInsurance] = useState('۱۰ ماه بیمه شخص ثالث');
  const [vehiclePaintStatus, setVehiclePaintStatus] = useState('یک لکه رنگ (گلگیر)');

  // 3.1 Motorcycle & Parts (موتورسیکلت و لوازم یدکی)
  const [motoEngineStatus, setMotoEngineStatus] = useState('موتور پلمپ و کاملاً سالم بدون روغن‌سوزی');
  const [motoBodyStatus, setMotoBodyStatus] = useState('بدنه کاملاً سالم و بدون زمین‌خوردگی');
  const [motoPartCondition, setMotoPartCondition] = useState('سالم و آماده نصب');

  // 3.2 Real Estate (املاک، آپارتمان، زمین و ویلا)
  const [estateArea, setEstateArea] = useState('۱۴۰ متر مربع');
  const [estateRooms, setEstateRooms] = useState('۳ خوابه');
  const [estateBathrooms, setEstateBathrooms] = useState('۲ سرویس بهداشتی و حمام (مستر + ایرانی/فرنگی)');
  const [estateLandArea, setEstateLandArea] = useState('۳۵۰ متر زمین / ویلا');
  const [estateDocument, setEstateDocument] = useState('سند تک‌برگ ۶ دانگ');

  // 3.3 Bags, Shoes & Personal (کیف و کفش و پوشاک)
  const [personalSize, setPersonalSize] = useState('سایز ۴۲ (L)');
  const [personalMaterial, setPersonalMaterial] = useState('چرم طبیعی درجه یک');
  const [personalOriginality, setPersonalOriginality] = useState('اورجینال ۱۰۰٪ تضمینی');

  // 3.4 Sports & Camping (تجهیزات ورزشی و کمپینگ)
  const [campingType, setCampingType] = useState('چادر ۴ نفره ضدآب دوپوش و کیسه خواب');
  const [campingCapacity, setCampingCapacity] = useState('۴ نفره استاندارد');
  const [campingWarranty, setCampingWarranty] = useState('سالم، بدون پارگی با تمام اتصالات و تیرک‌ها');

  // 3.5 Mobile & Tablet Brand details
  const [deviceBrand, setDeviceBrand] = useState('اپل (Apple)');
  const [deviceModel, setDeviceModel] = useState('آیفون ۱۳ پرومکس');

  // Validation Warning Error State
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 4. Home & Kitchen (لوازم خانگی)
  const [homeBrand, setHomeBrand] = useState('ال‌جی (LG)');
  const [homeType, setHomeType] = useState('ساید بای ساید');
  const [homeWarranty, setHomeWarranty] = useState('دارای ضمانت‌نامه شرکتی معتبر');

  // 5. Jobs & Recruitment (استخدام و کاریابی)
  const [jobType, setJobType] = useState('تمام‌وقت (شنبه تا چهارشنبه)');
  const [jobSalary, setJobSalary] = useState('۲۵ تا ۳۰ میلیون تومان');
  const [jobInsurance, setJobInsurance] = useState('دارای بیمه تامین اجتماعی و پاداش');

  // 6. Manual Custom Specifications (مشخصات فنی دستی دلخواه توسط کاربر)
  const [customSpecs, setCustomSpecs] = useState<{ id: string; key: string; value: string }[]>([
    { id: 'cs_1', key: 'رنگ دستگاه', value: 'آبی تیتانیوم' },
  ]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [isExchangeable, setIsExchangeable] = useState(false);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [price, setPrice] = useState<number>(55000000);
  const [priceInputStr, setPriceInputStr] = useState<string>('۵۵,۰۰۰,۰۰۰');
  const [description, setDescription] = useState(
    `گوشی بسیار تمیز و بدون کوچک‌ترین خط‌وخش روی بدنه یا لنز.
پارت‌نامبر سنگاپور (ZA/A) دو سیم کارت فیزیکی.
سلامت باتری ۹۱ درصد، شارژر اورجینال به همراه ۳ عدد قاب مرغوب تقدیم خریدار می‌شود.
مهلت تست ۴۸ ساعته با فاکتور معتبر داده می‌شود.`
  );
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isNightQuietEnabled, setIsNightQuietEnabled] = useState(true);
  const [promotionPackage, setPromotionPackage] = useState<'standard' | 'urgent' | 'ladder'>('standard');
  const [images, setImages] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBKuz0vzsRH1V9KBCZcjCbEpplqM5vaSkM4-T798lTc2WFY2zOUj7YGv3omErxneMZh3Ozbyis1fSczZsf-Ri9Zp_Wr7KUT6rbOOyOJ4lhJR3kjtu2j5YRlfzzIaAJnWLQ2ANno7wsUbM2uM6Z34iSShj05_dyiXAfoiYVxRisA8XhZkjLBJUQttJY8D6Qpr-SgjvPnWvV0mrsGc0LsoADGfFFkXQZCNmrcp9LaKbiyja7V4yuRLmidrg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCcyCqDBK4g63RcE-ygaxsiomq0ecfyTP-7vU_7nD3YyhlblMMwzovEFY9E0gesZNXyrtxRVFo9HfT0aXjOBM5YOwZ0ZPZ47EvMthc7SLcoXPfsYSzU3nF4hfAZCmTZH1N_Zmp-EhtSzGHgiaNj4xmbj74cRTFHXc9moYImbbGGRExdTi7hJ7fhMYzFvJP70OZPpgkdxVkhlFaiR76LbQ06-EcRb0ALEQo-QCDG2M3-n7zQpO4GjlYQYw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9sVjZfovKeYJS-UCW13ix_lL77Mk0o1fROAF5H5xDyZoAU0gFFjbCJ-PmNH8yeel5r3QDmNOlmciWROhJIiz6i7Y225emm-OhX0fM6_alD1CvOk42OjTY9Zn2OQdIS9fD2c43EORjaFulUbbA95zknHYgrflahB3M_RJO4vxnAbXXx8sMsu2bi214cH0bHs2Z_DESMFX31gAAk83Fhc70MpQUOLirBlhz9gY66YNzZyHDowaWK3IFlg',
  ]);

  const handleSelectCategory = (cat: string, sub: string) => {
    setAdCategory(cat);
    setAdSubCategory(sub);
    setIsCategoryModalOpen(false);

    // Adjust defaults based on category
    if (sub.includes('لپ‌تاپ') || cat === 'کالای دیجیتال' && sub.includes('کامپیوتر')) {
      setTitle('لپ‌تاپ ایسوس ROG Zephyrus Core i7 رم ۱۶ گرافیک RTX 4060');
      setDescription(
        `• لپ‌تاپ بسیار تمیز و بدون خط‌وخش مناسب کارهای سنگین و گیمینگ
• باتری کاملاً سالم و شارژدهی نرمال همراه با آداپتور اصلی
• صفحه نمایش ۱۶ اینچ ۱۶۵ هرتز فوق‌العاده باکیفیت
• مهلت تست سخت‌افزاری ۴۸ ساعته`
      );
    } else if (cat === 'خانه و آشپزخانه') {
      setTitle('یخچال ساید بای ساید ۳۰ فوت اینستاویو بسیار تمیز');
      setDescription(
        `• دستگاه بسیار کم‌کارکرد و در حد نو
• بدون خط و خش و با قطعات کاملاً فابریک
• اتصال به آب شهری و یخساز اتوماتیک فعال
• تحویل و بررسی حضوری در منزل`
      );
    } else if (cat === 'وسایل نقلیه') {
      if (sub.includes('موتورسیکلت')) {
        setTitle('موتورسیکلت کلیک ۱۵۰ سی‌سی اتوماتیک سفید مشکی بدون خط و خش');
        setDescription(
          `• وضعیت انجین و موتور: کاملاً سالم، پلمپ و پرشتاب بدون روغن‌ریزی یا روغن‌سوزی
• وضعیت بدنه و فلاپ‌ها: بدون زمین‌خوردگی، شکستگی یا رنگ‌شدگی
• کارکرد واقعی: ۹,۰۰۰ کیلومتر
• همراه با بیمه شخص ثالث، کلاه ایمنی و مدارک آماده انتقال قطعی`
        );
      } else if (sub.includes('قطعات') || sub.includes('لوازم یدکی')) {
        setTitle('لوازم یدکی و قطعات مصرفی فابریک خودرو و موتورسیکلت (نو و پلمپ)');
        setDescription(
          `• قطعه کاملاً فابریک و اورجینال دارای هولوگرام شرکتی
• وضعیت فنی: سالم، تست‌شده و آماده نصب روی خودرو یا موتور
• مهلت تست و ضمانت اصالت کالا`
        );
      } else {
        setTitle('پژو ۲۰۷ اتوماتیک مدل ۱۴۰۲ سفید یک لکه رنگ شاسی سالم');
        setDescription(
          `• کارکرد واقعی: ۱۸,۰۰۰ کیلومتر به شرط کارشناسی عبادی
• بدنه: یک لکه رنگ روی گلگیر عقب به دلیل مالیدگی، مابقی بدنه بدون رنگ
• وضعیت شاسی‌ها و سقف و ستون: کاملاً پلمپ و سالم
• بیمه شخص ثالث کامل + کارت طلایی فعال`
        );
      }
    } else if (cat === 'املاک') {
      if (sub.includes('زمین') || sub.includes('ویلا')) {
        setTitle('ویلا دوبلکس ۳۵۰ متری ۳ خوابه استخردار با سند تک‌برگ');
        setDescription(
          `• متراژ زمین: ۳۵۰ متر مربع | متراژ بنا: ۲۰۰ متر دوبلکس
• ۳ خواب با مستر و کمد دیواری
• ۲ سرویس بهداشتی و حمام مجزا
• حیاط محوطه‌سازی شده، استخر چهارفصل و انشعابات آب، برق، گاز وصل`
        );
      } else {
        setTitle('آپارتمان ۱۴۰ متری ۳ خوابه با ۲ سرویس حمام مستر سعادت‌آباد');
        setDescription(
          `• متراژ: ۱۴۰ متر مربع | ۳ خواب استاندارد
• ۲ سرویس بهداشتی و حمام (مستر اختصاصی + ایرانی/فرنگی مهمان)
• پارکینگ سندی، انباری بزرگ و آسانسور
• متریال لوکس، نورگیر عالی شمال و جنوب، سند تک‌برگ آماده انتقال`
        );
      }
    } else if (cat === 'وسایل شخصی') {
      setTitle('کیف چرم طبیعی دستی مردانه و کفش چرم مجلسی دست‌دوز تبریز');
      setDescription(
        `• جنس و متریال: چرم طبیعی گاوی درجه یک با دوخت ظریف و مقاوم
• سایز کفش: ۴۲ استاندارد | رنگ: مشکی و عسلی
• وضعیت: کاملاً نو و استفاده‌نشده با ضمانت اصالت چرم
• مناسب کادو و استفاده اداری و رسمی`
      );
    } else if (cat === 'سرگرمی و فراغت' && sub.includes('کمپینگ')) {
      setTitle('تجهیزات کامل کوهنوردی، چادر ۴ نفره ضدآب و کیسه خواب کمپینگ');
      setDescription(
        `• چادر ۴ نفره دوپوش ضدآب با تیرک‌های آلومینیومی مستحکم
• کیسه خواب پر و زیرانداز بادی سبک
• بدون پارگی، کاملاً سالم و تست‌شده در طبیعت
• همراه با کیف حمل اختصاصی و تمام بست‌ها`
      );
    } else if (cat === 'استخدام و کاریابی') {
      setTitle('استخدام ادمین اینستاگرام و تولید محتوای دیجیتال');
      setDescription(
        `• حقوق ثابت مکفی + پاداش پورسانتی رشد ماهانه
• بیمه تامین اجتماعی از ماه اول
• محیط پویا، جوان و حرفه‌ای
• امکان همکاری به صورت حضوری یا دورکاری`
      );
    }

    onShowToast(`دسته‌بندی آگهی به «${cat} ← ${sub}» تغییر یافت.`);
  };

  // Preset default images tab selector
  const [presetTab, setPresetTab] = useState<'digital' | 'realEstate' | 'vehicles' | 'supplements' | 'personal' | 'home'>('digital');

  const handleTogglePresetImage = (url: string, name: string) => {
    if (images.includes(url)) {
      setImages(images.filter((img) => img !== url));
      onShowToast(`تصویر «${name}» از لیست آگهی حذف شد.`);
    } else {
      if (images.length >= 10) {
        onShowToast('حداکثر می‌توانید ۱۰ تصویر برای هر آگهی انتخاب کنید.', 'warning');
        return;
      }
      setImages([...images, url]);
      onShowToast(`تصویر آماده «${name}» به آگهی اضافه شد.`, 'success');
    }
  };

  // Full price input handling supporting Persian/English digits and high figures (millions & billions)
  const handlePriceChange = (valStr: string) => {
    const englishDigitsStr = toEnglishDigits(valStr);
    const rawNumber = englishDigitsStr.replace(/[^\d]/g, '');
    const num = parseInt(rawNumber, 10) || 0;
    setPrice(num);
    setPriceInputStr(rawNumber ? formatToman(num) : '');
  };

  const handleSetPresetPrice = (amount: number) => {
    setPrice(amount);
    setPriceInputStr(amount > 0 ? formatToman(amount) : '');
    setIsNegotiable(false);
    onShowToast(`مبلغ روی ${formatToman(amount)} تومان (${numberToPersianWords(amount)}) تنظیم شد.`);
  };

  const handleAddPriceDelta = (delta: number) => {
    const newPrice = Math.max(0, price + delta);
    setPrice(newPrice);
    setPriceInputStr(newPrice > 0 ? formatToman(newPrice) : '');
    setIsNegotiable(false);
    onShowToast(`مبلغ به روز شد: ${formatToman(newPrice)} تومان`);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    onShowToast('تصویر حذف شد.');
  };

  // Direct Gallery / File Picker Handler
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

    Promise.all(readers).then((newImages) => {
      setImages((prev) => [...prev, ...newImages].slice(0, 10));
      onShowToast(`${toPersianDigits(newImages.length)} تصویر از گالری/دستگاه با موفقیت افزوده شد.`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleAddCustomSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      onShowToast('لطفاً عنوان و مقدار مشخصه را وارد کنید.', 'warning');
      return;
    }
    setCustomSpecs((prev) => [
      ...prev,
      { id: `spec_${Date.now()}`, key: newSpecKey.trim(), value: newSpecValue.trim() },
    ]);
    setNewSpecKey('');
    setNewSpecValue('');
    onShowToast('مشخصه فنی دستی با موفقیت اضافه شد.', 'success');
  };

  // Real-time Dynamic Step Completion (پُر شدن خودکار مراحل ۱ تا ۵ وقتی اطلاعات ثبت شد)
  const isStep1Done = Boolean(adCategory && adSubCategory && title.trim().length >= 3);
  const isStep2Done = Boolean(description.trim().length >= 10);
  const isStep3Done = Boolean(isNegotiable || price > 0);
  const isStep4Done = Boolean(images.length > 0);
  const isStep5Done = Boolean(adProvince && adCity && neighborhood.trim().length > 0);

  const completedStepsCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 5) * 100);

  const handleRemoveCustomSpec = (id: string) => {
    setCustomSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleInsertTemplate = () => {
    setDescription(
      `• مدل و نسخه دقیق: iPhone 13 Pro Max Singapore (ZA/A)
• سلامت باتری: ۹۱٪ اصل کارخانه بدون تعویض
• رجیستری: دارای انتقال مالکیت در سامانه همتا
• اقلام همراه: کارتن اورجینال، کابل شارژ اصلی و ۳ عدد گارد محافظ
• وضعیت ظاهری: کاملاً سالم و بدون حتی یک نقطه یا ضربه
• مهلت تست: ۴۸ ساعت تست سخت‌افزاری تضمینی`
    );
    onShowToast('متن پیشنهادی با موفقیت درج شد.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors: string[] = [];

    // 1. Title validation
    if (!title.trim() || title.trim().length < 5) {
      errors.push('عنوان آگهی (حداقل ۵ حرف)');
    }

    // 2. Specifications & Details validation
    if (!description.trim() || description.trim().length < 15) {
      errors.push('توضیحات تکمیلی کالا (حداقل ۱۵ حرف)');
    }

    // 3. Pricing validation
    if (!isNegotiable && price <= 0) {
      errors.push('مبلغ آگهی به تومان یا انتخاب گزینه «قیمت توافقی»');
    }

    // 4. Image validation
    if (images.length === 0) {
      errors.push('حداقل یک تصویر برای آگهی (آپلود عکس یا انتخاب از گالری پیش‌فرض)');
    }

    // 5. Free ad quota check
    const freeRemaining = user?.freeAdsRemaining !== undefined ? user.freeAdsRemaining : 5;
    if (promotionPackage === 'standard' && freeRemaining <= 0) {
      onShowToast('اشتراک رایگان ۵ آگهی شما تمام شده است و باید اشتراک جدید بخرید.', 'warning');
      setValidationErrors(['سهمیه آگهی رایگان شما به پایان رسیده است. لطفاً اشتراک جدید یا نشان فوری/نردبان تهیه فرمایید.']);
      return;
    }

    // If any critical field is not filled
    if (errors.length > 0) {
      setValidationErrors(errors);
      onShowToast(`لطفاً فرم‌های تکمیلی آگهی را کامل کنید: ${errors.join('، ')}`, 'warning');
      return;
    }

    setValidationErrors([]);

    // Build Category-Specific Specifications
    let finalSpecs: Record<string, string> = {};
    const isLaptop = adSubCategory.includes('لپ‌تاپ') || title.includes('لپ‌تاپ') || adSubCategory.includes('کامپیوتر');
    const isMobile = adSubCategory.includes('موبایل') || title.includes('آیفون') || title.includes('گوشی') || adSubCategory.includes('تبلت');
    const isMotorcycle = adSubCategory.includes('موتورسیکلت') || title.includes('موتور');
    const isVehicleParts = adSubCategory.includes('قطعات') || adSubCategory.includes('لوازم یدکی');
    const isRealEstate = adCategory === 'املاک';
    const isPersonalGoods = adCategory === 'وسایل شخصی';
    const isSportsCamping = adCategory === 'سرگرمی و فراغت' || adSubCategory.includes('کمپینگ');

    if (isLaptop) {
      finalSpecs = {
        'پردازنده (CPU)': laptopCpu,
        'حافظه رم (RAM)': laptopRam,
        'حافظه ذخیره‌سازی': laptopStorage,
        'کارت گرافیک (GPU)': laptopGpu,
        'وضعیت سلامت دستگاه و باتری': laptopHealth,
      };
    } else if (isMobile) {
      finalSpecs = {
        'برند و مدل': `${deviceBrand} - ${deviceModel}`,
        'حافظه داخلی': storage,
        'وضعیت رجیستری': registryStatus,
        'سلامت باتری': `${batteryHealth} درصد`,
      };
    } else if (isMotorcycle) {
      finalSpecs = {
        'نوع وسیله': 'موتورسیکلت',
        'وضعیت انجین و موتور': motoEngineStatus,
        'وضعیت بدنه و فلاپ‌ها': motoBodyStatus,
        'سال ساخت / مدل': vehicleYear,
        'کارکرد': vehicleMileage,
        'بیمه شخص ثالث': vehicleInsurance,
      };
    } else if (isVehicleParts) {
      finalSpecs = {
        'نوع کالا': 'قطعات و لوازم یدکی خودرو / موتورسیکلت',
        'وضعیت فیزیکی و کارکرد': motoPartCondition,
        'ضمانت اصالت و سلامت': 'فابریک و آماده نصب',
      };
    } else if (adCategory === 'وسایل نقلیه') {
      finalSpecs = {
        'سال تولید / مدل': vehicleYear,
        'کارکرد': vehicleMileage,
        'وضعیت رنگ و لکه رنگ بدنه': vehiclePaintStatus,
        'وضعیت کلی بدنه و شاسی': vehicleBody,
        'بیمه شخص ثالث': vehicleInsurance,
      };
    } else if (isRealEstate) {
      finalSpecs = {
        'متراژ آپارتمان / بنا': estateArea,
        'تعداد خواب': estateRooms,
        'سرویس بهداشتی و حمام': estateBathrooms,
        'متراژ زمین و ویلا': estateLandArea,
        'نوع سند و مدارک': estateDocument,
      };
    } else if (isPersonalGoods) {
      finalSpecs = {
        'سایز کیف / کفش / لباس': personalSize,
        'جنس و متریال': personalMaterial,
        'اصالت کالا': personalOriginality,
      };
    } else if (isSportsCamping) {
      finalSpecs = {
        'نوع تجهیزات کمپینگ': campingType,
        'ظرفیت و مشخصات': campingCapacity,
        'وضعیت فنی و سلامت': campingWarranty,
      };
    } else if (adCategory === 'خانه و آشپزخانه') {
      finalSpecs = {
        'برند دستگاه': homeBrand,
        'نوع کالا': homeType,
        'گارانتی و سلامت': homeWarranty,
      };
    } else if (adCategory === 'استخدام و کاریابی') {
      finalSpecs = {
        'نوع همکاری': jobType,
        'حقوق پیشنهادی': jobSalary,
        'بیمه و مزایا': jobInsurance,
      };
    } else {
      finalSpecs = {
        'وضعیت فیزیکی': condition === 'new' ? 'کاملاً نو' : condition === 'like-new' ? 'در حد نو' : 'کارکرده',
      };
    }

    // Merge manual custom key-value specifications
    customSpecs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        finalSpecs[spec.key.trim()] = spec.value.trim();
      }
    });

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newListing: Listing = {
      id: `ad_${Date.now()}`,
      code: randomCode,
      title: title.trim(),
      price: isNegotiable ? 0 : price,
      isNegotiable,
      isExchangeable,
      category: adCategory,
      categoryPath: ['صفحه اصلی', adCategory, adSubCategory, adProvince, adCity],
      city: adCity,
      neighborhood,
      timeAgo: 'لحظاتی پیش',
      views: 1,
      chatsCount: 0,
      callsCount: 0,
      condition,
      isUrgent: promotionPackage === 'urgent',
      isLaddered: promotionPackage === 'ladder',
      isVerifiedSeller: true,
      seller: {
        id: user?.id || 'user_kamran',
        name: user?.name || 'کامران رضوانی',
        avatar: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDhpw_OzJWpDG4HJr8LniUJ_BA49LCgQz3j2sVBKDaGNX5w3nzC4RwO5XdZbbJxBiItPKyBYInBXVo7jkdaJdaSTdyomRicNQGE56xmgCYC40ij4xZzAJD4l0qgckIDYkfZALHFWml02Fqo5PXBBWfEFTmf81jrltLvqjqhc5EU4OaC_SyG0AmaVaU4ZeWAsi-B47OWTj6YJrh-ALxGVRgItMLMzvseD7gGnJYsg5U4xw_r0_dRFDF6Q',
        phone: user?.phone || '۰۹۱۲۳۴۵۶۷۸۹',
        rating: 5.0,
        dealsCount: 29,
        memberYears: 2,
        isVerified: true,
        online: true,
        responseHours: '۱۰ تا ۲۲',
      },
      images: images.length > 0 ? images : [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBKuz0vzsRH1V9KBCZcjCbEpplqM5vaSkM4-T798lTc2WFY2zOUj7YGv3omErxneMZh3Ozbyis1fSczZsf-Ri9Zp_Wr7KUT6rbOOyOJ4lhJR3kjtu2j5YRlfzzIaAJnWLQ2ANno7wsUbM2uM6Z34iSShj05_dyiXAfoiYVxRisA8XhZkjLBJUQttJY8D6Qpr-SgjvPnWvV0mrsGc0LsoADGfFFkXQZCNmrcp9LaKbiyja7V4yuRLmidrg'
      ],
      specs: finalSpecs,
      description,
      tags: ['#' + adCategory.replace(/\s+/g, '_'), '#' + adSubCategory.replace(/\s+/g, '_')],
      status: 'active',
    };

    onAdCreated(newListing);
    onShowToast('آگهی شما با موفقیت ثبت و منتشر گردید!', 'success');
    onNavigate('dashboard');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-right">
      {/* 1. Top Stepper Header (Dynamically tracks steps 1 to 5 as user inputs data) */}
      <div className="w-full bg-white rounded-3xl shadow-xs p-5 sm:p-6 mb-6 sm:mb-8 border border-slate-100">
        {/* Progress Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#059669] text-[22px]">assignment_turned_in</span>
            <span className="text-xs sm:text-sm font-black text-slate-900">مراحل ثبت اطلاعات آگهی</span>
            <span className="text-xs text-slate-500">
              ({toPersianDigits(completedStepsCount)} از ۵ بخش تکمیل شده)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#059669] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-[#059669]">
              {toPersianDigits(progressPercent)}٪
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pb-1">
          {/* Step 1: Category & Title */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2.5 shrink-0 hover:opacity-85 transition-opacity text-right cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
              isStep1Done ? 'bg-[#059669] text-white ring-2 ring-[#059669]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {isStep1Done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span>۱</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isStep1Done ? 'text-[#059669]' : 'text-slate-800'}`}>
                ۱. دسته‌بندی و عنوان
              </span>
              <span className={`text-[10px] font-semibold ${isStep1Done ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isStep1Done ? 'تکمیل شده ✓' : 'در انتظار تکمیل'}
              </span>
            </div>
          </button>
          <div className={`h-0.5 flex-1 min-w-[15px] rounded-full mx-1 hidden sm:block ${isStep1Done ? 'bg-[#059669]' : 'bg-slate-200'}`} />

          {/* Step 2: Main Specs & Description */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
              isStep2Done ? 'bg-[#059669] text-white ring-2 ring-[#059669]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {isStep2Done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span>۲</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isStep2Done ? 'text-[#059669]' : 'text-slate-800'}`}>
                ۲. مشخصات و توضیحات
              </span>
              <span className={`text-[10px] font-semibold ${isStep2Done ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isStep2Done ? 'تکمیل شده ✓' : 'در انتظار تکمیل'}
              </span>
            </div>
          </div>
          <div className={`h-0.5 flex-1 min-w-[15px] rounded-full mx-1 hidden sm:block ${isStep2Done ? 'bg-[#059669]' : 'bg-slate-200'}`} />

          {/* Step 3: Pricing & Negotiation */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
              isStep3Done ? 'bg-[#059669] text-white ring-2 ring-[#059669]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {isStep3Done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span>۳</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isStep3Done ? 'text-[#059669]' : 'text-slate-800'}`}>
                ۳. قیمت‌گذاری
              </span>
              <span className={`text-[10px] font-semibold ${isStep3Done ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isStep3Done ? 'تکمیل شده ✓' : 'در انتظار تکمیل'}
              </span>
            </div>
          </div>
          <div className={`h-0.5 flex-1 min-w-[15px] rounded-full mx-1 hidden md:block ${isStep3Done ? 'bg-[#059669]' : 'bg-slate-200'}`} />

          {/* Step 4: Images */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
              isStep4Done ? 'bg-[#059669] text-white ring-2 ring-[#059669]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {isStep4Done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span>۴</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isStep4Done ? 'text-[#059669]' : 'text-slate-800'}`}>
                ۴. تصاویر کالا
              </span>
              <span className={`text-[10px] font-semibold ${isStep4Done ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isStep4Done ? `${toPersianDigits(images.length)} عکس ثبت شد ✓` : 'در انتظار بارگذاری'}
              </span>
            </div>
          </div>
          <div className={`h-0.5 flex-1 min-w-[15px] rounded-full mx-1 hidden lg:block ${isStep4Done ? 'bg-[#059669]' : 'bg-slate-200'}`} />

          {/* Step 5: Location & Contact */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
              isStep5Done ? 'bg-[#059669] text-white ring-2 ring-[#059669]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {isStep5Done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                <span>۵</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isStep5Done ? 'text-[#059669]' : 'text-slate-800'}`}>
                ۵. موقعیت و تماس
              </span>
              <span className={`text-[10px] font-semibold ${isStep5Done ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isStep5Done ? 'تکمیل شده ✓' : 'در انتظار تکمیل'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form Grid Layout (Col 8 Form + Col 4 Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Primary Form Stream (Col 8) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Category Details & Selector */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#059669] text-[28px]">category</span>
                <div>
                  <span className="font-bold text-sm sm:text-base text-slate-900 block">دسته‌بندی آگهی</span>
                  <span className="text-xs text-slate-500">
                    دسته‌بندی دقیق به دیده شدن بهتر کالا توسط خریداران کمک می‌کند
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#059669]/10 hover:bg-[#059669]/20 text-[#059669] text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>تغییر دسته‌بندی ({adCategory})</span>
              </button>
            </div>

            {/* Active Category Path */}
            <div className="flex flex-wrap items-center gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">مسیر انتخاب شده:</span>
              <span className="px-3 py-1 rounded-full bg-white text-slate-800 font-semibold shadow-xs">
                {adCategory}
              </span>
              <span className="text-slate-400">←</span>
              <span className="px-3 py-1 rounded-full bg-[#9cf2e8]/40 text-[#059669] font-bold">
                {adSubCategory}
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="mr-auto text-[11px] text-[#059669] hover:underline font-bold cursor-pointer"
              >
                تغییر به دسته دیگر (خانه و آشپزخانه، وسایل نقلیه و...)
              </button>
            </div>
          </div>

          {/* Section 2: Core Details (Title, Condition, Specifications) */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#059669] text-[28px]">edit_document</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">مشخصات اصلی کالا</span>
                <span className="text-xs text-slate-500">
                  عنوان واضح و اطلاعات دقیق به شفافیت معامله منجر می‌شود
                </span>
              </div>
            </div>

            {/* Title Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  عنوان آگهی <span className="text-[#ba0035]">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {toPersianDigits(title.length)} / ۶۵ حرف
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 65))}
                placeholder="مثال: گوشی آیفون ۱۳ پرومکس ۲۵۶ گیگابایت آبی با سلامت باتری ۹۱٪"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
              />
              <p className="text-[11px] text-slate-400">
                در عنوان آگهی از ویژگی‌های کلیدی مثل مدل، رنگ، ظرفیت و وضعیت شاخص کالا استفاده کنید.
              </p>
            </div>

            {/* Item Condition */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-800">
                وضعیت کالا <span className="text-[#ba0035]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'new' as const, title: 'کاملاً نو / پلمپ', desc: 'جعبه باز نشده و بدون استفاده', icon: 'verified' },
                  { id: 'like-new' as const, title: 'در حد نو', desc: 'بدون خط‌وخش و با عملکرد کامل', icon: 'auto_awesome' },
                  { id: 'used' as const, title: 'کارکرده', desc: 'دارای کارکرد معمول و سلامت فنی', icon: 'recycling' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCondition(item.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all border ${
                      condition === item.id
                        ? 'bg-[#059669] text-white border-[#059669] shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    <span className="text-xs font-bold">{item.title}</span>
                    <span className={`text-[10px] ${condition === item.id ? 'opacity-90' : 'text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic & Category-Smart Specifications */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  مشخصات فنی دستگاه ({adSubCategory.includes('لپ‌تاپ') || title.includes('لپ‌تاپ') ? 'ویژه لپ‌تاپ و رایانه' : adSubCategory.includes('موبایل') ? 'ویژه موبایل و گجت' : adCategory})
                </span>
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">
                  هوشمند بر اساس دسته‌بندی
                </span>
              </div>

              {/* 1. If Laptop / Computer */}
              {(adSubCategory.includes('لپ‌تاپ') || title.includes('لپ‌تاپ') || adSubCategory.includes('کامپیوتر')) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">پردازنده (CPU)</label>
                    <input
                      type="text"
                      value={laptopCpu}
                      onChange={(e) => setLaptopCpu(e.target.value)}
                      placeholder="مثال: Intel Core i7 13700H"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">حافظه رم (RAM)</label>
                    <select
                      value={laptopRam}
                      onChange={(e) => setLaptopRam(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>۸ گیگابایت</option>
                      <option>۱۶ گیگابایت DDR5</option>
                      <option>۳۲ گیگابایت DDR5</option>
                      <option>۶۴ گیگابایت</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">حافظه ذخیره‌سازی</label>
                    <select
                      value={laptopStorage}
                      onChange={(e) => setLaptopStorage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>۲۵۶ گیگابایت SSD</option>
                      <option>۵۱۲ گیگابایت SSD NVMe</option>
                      <option>۱ ترابایت SSD NVMe M.2</option>
                      <option>۲ ترابایت SSD</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">پردازنده گرافیکی (GPU)</label>
                    <input
                      type="text"
                      value={laptopGpu}
                      onChange={(e) => setLaptopGpu(e.target.value)}
                      placeholder="مثال: NVIDIA RTX 4060 یا Intel Iris"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت سلامت دستگاه و باتری</label>
                    <select
                      value={laptopHealth}
                      onChange={(e) => setLaptopHealth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>کاملاً سالم و در حد نو (سیکل باتری پایین)</option>
                      <option>نرمال و بدون نقص فنی همراه با شارژر اصلی</option>
                      <option>سلامت فنی کامل - باتری نیازمند سرویس یا تعویض</option>
                    </select>
                  </div>
                </div>
              ) : (adSubCategory.includes('موتورسیکلت') || title.includes('موتور')) ? (
                /* 2. Motorcycles (موتورسیکلت: انجین، بدنه، سلامت، کارکرد) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت انجین و موتور</label>
                    <input
                      type="text"
                      value={motoEngineStatus}
                      onChange={(e) => setMotoEngineStatus(e.target.value)}
                      placeholder="مثال: پلمپ، سالم بدون روغن‌سوزی"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت بدنه و فلاپ‌ها</label>
                    <input
                      type="text"
                      value={motoBodyStatus}
                      onChange={(e) => setMotoBodyStatus(e.target.value)}
                      placeholder="مثال: بدون شکستگی و بدون زمین‌خوردگی"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">سال ساخت / مدل</label>
                    <input
                      type="text"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="مثال: ۱۴۰۱"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">کارکرد (کیلومتر)</label>
                    <input
                      type="text"
                      value={vehicleMileage}
                      onChange={(e) => setVehicleMileage(e.target.value)}
                      placeholder="مثال: ۹,۰۰۰ کیلومتر"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-600 font-medium">بیمه شخص ثالث و مدارک</label>
                    <input
                      type="text"
                      value={vehicleInsurance}
                      onChange={(e) => setVehicleInsurance(e.target.value)}
                      placeholder="مثال: ۸ ماه بیمه شخص ثالث، سند و پلاک آماده انتقال"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (adSubCategory.includes('قطعات') || adSubCategory.includes('لوازم یدکی')) ? (
                /* 3. Vehicle Parts (لوازم یدکی و قطعات) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت قطعه و سلامت کارکرد</label>
                    <input
                      type="text"
                      value={motoPartCondition}
                      onChange={(e) => setMotoPartCondition(e.target.value)}
                      placeholder="مثال: فابریک، بدون خط و شکستگی، تست‌شده در حضور خریدار"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">نوع و برند قطعه</label>
                    <input
                      type="text"
                      defaultValue="اصلی شرکتی"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : adCategory === 'وسایل نقلیه' ? (
                /* 4. Cars (خودرو سواری: لکه رنگ، بدنه، شاسی، کارکرد) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت رنگ و لکه رنگ بدنه</label>
                    <input
                      type="text"
                      value={vehiclePaintStatus}
                      onChange={(e) => setVehiclePaintStatus(e.target.value)}
                      placeholder="مثال: یک لکه رنگ گلگیر، بدون رنگ، دور رنگ"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت شاسی و بدنه</label>
                    <input
                      type="text"
                      value={vehicleBody}
                      onChange={(e) => setVehicleBody(e.target.value)}
                      placeholder="مثال: شاسی جلو و عقب کاملاً پلمپ"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">سال ساخت / مدل</label>
                    <input
                      type="text"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="مثال: ۱۴۰۲"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">کارکرد (کیلومتر)</label>
                    <input
                      type="text"
                      value={vehicleMileage}
                      onChange={(e) => setVehicleMileage(e.target.value)}
                      placeholder="مثال: ۲۰,۰۰۰ کیلومتر"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : adCategory === 'املاک' ? (
                /* 5. Real Estate (املاک: متراژ، خواب، حمام و سرویس، زمین/ویلا چند متری) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">متراژ آپارتمان / بنا (متر مربع)</label>
                    <input
                      type="text"
                      value={estateArea}
                      onChange={(e) => setEstateArea(e.target.value)}
                      placeholder="مثال: ۱۴۰ متر مربع"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">تعداد اتاق خواب</label>
                    <select
                      value={estateRooms}
                      onChange={(e) => setEstateRooms(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>تک خوابه (۱)</option>
                      <option>دو خوابه (۲)</option>
                      <option>سه خوابه (۳)</option>
                      <option>چهار خوابه (۴)</option>
                      <option>پنج خوابه و بیشتر</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">سرویس بهداشتی و حمام</label>
                    <select
                      value={estateBathrooms}
                      onChange={(e) => setEstateBathrooms(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>یک سرویس و یک حمام (۱)</option>
                      <option>۲ سرویس بهداشتی و حمام (مستر + ایرانی/فرنگی)</option>
                      <option>۳ سرویس بهداشتی و حمام و بیشتر</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">متراژ زمین / ویلا (چند متری / چند صد متری)</label>
                    <input
                      type="text"
                      value={estateLandArea}
                      onChange={(e) => setEstateLandArea(e.target.value)}
                      placeholder="مثال: ۳۵۰ متر زمین / ۱۰۰۰ متر باغ ویلا"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-600 font-medium">نوع سند و وضعیت مالکیت</label>
                    <input
                      type="text"
                      value={estateDocument}
                      onChange={(e) => setEstateDocument(e.target.value)}
                      placeholder="مثال: سند تک‌برگ ۶ دانگ با پایان‌کار رسمی"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (adCategory === 'وسایل شخصی' || adSubCategory.includes('کیف') || adSubCategory.includes('کفش')) ? (
                /* 6. Bags, Shoes & Personal (کیف، کفش و پوشاک) */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">سایز و اندازه</label>
                    <input
                      type="text"
                      value={personalSize}
                      onChange={(e) => setPersonalSize(e.target.value)}
                      placeholder="مثال: سایز ۴۲ (L) / ابعاد ۳۵×۲۵"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">جنس و متریال</label>
                    <input
                      type="text"
                      value={personalMaterial}
                      onChange={(e) => setPersonalMaterial(e.target.value)}
                      placeholder="مثال: چرم طبیعی تبریز، کتان، ضدآب"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">اصالت و سلامت</label>
                    <input
                      type="text"
                      value={personalOriginality}
                      onChange={(e) => setPersonalOriginality(e.target.value)}
                      placeholder="مثال: ۱۰۰٪ اورجینال، نو استفاده نشده"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (adCategory === 'سرگرمی و فراغت' || adSubCategory.includes('کمپینگ') || adSubCategory.includes('ورزشی')) ? (
                /* 7. Sports & Camping (تجهیزات ورزشی و کمپینگ) */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">نوع تجهیزات</label>
                    <input
                      type="text"
                      value={campingType}
                      onChange={(e) => setCampingType(e.target.value)}
                      placeholder="مثال: چادر کمپینگ ضدآب، کیسه خواب، کوله‌پشتی"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">ظرفیت و ابعاد</label>
                    <input
                      type="text"
                      value={campingCapacity}
                      onChange={(e) => setCampingCapacity(e.target.value)}
                      placeholder="مثال: ۴ نفره استاندارد دوپوش"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت فنی و پارگی</label>
                    <input
                      type="text"
                      value={campingWarranty}
                      onChange={(e) => setCampingWarranty(e.target.value)}
                      placeholder="مثال: کاملاً سالم بدون پارگی با تیرک‌های فابریک"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : adCategory === 'استخدام و کاریابی' ? (
                /* 8. If Jobs & Recruitment */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">نوع همکاری</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>تمام‌وقت (شنبه تا چهارشنبه)</option>
                      <option>پاره‌وقت / شیفتی</option>
                      <option>دورکاری و پروژه‌ای</option>
                      <option>کارآموزی و استخدام</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">میزان حقوق پرداختی</label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="مثال: ۲۰ تا ۲۵ میلیون تومان"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">بیمه و مزایا</label>
                    <input
                      type="text"
                      value={jobInsurance}
                      onChange={(e) => setJobInsurance(e.target.value)}
                      placeholder="مثال: بیمه تامین اجتماعی + پاداش"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* 9. Default: Mobile & Tablet with Brand Selection */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">برند و سازنده</label>
                    <select
                      value={deviceBrand}
                      onChange={(e) => setDeviceBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>اپل (Apple)</option>
                      <option>سامسونگ (Samsung)</option>
                      <option>شیائومی (Xiaomi)</option>
                      <option>لنوو (Lenovo)</option>
                      <option>هواوی (Huawei)</option>
                      <option>سایر برندها</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">مدل دستگاه</label>
                    <input
                      type="text"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="مثال: iPhone 13 Pro Max یا Tab P11"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">حافظه داخلی</label>
                    <select
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>۱۲۸ گیگابایت</option>
                      <option>۲۵۶ گیگابایت</option>
                      <option>۵۱۲ گیگابایت</option>
                      <option>۱ ترابایت</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">وضعیت رجیستری</label>
                    <select
                      value={registryStatus}
                      onChange={(e) => setRegistryStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option>دارای رجیستری با انتقال مالکیت</option>
                      <option>بدون رجیستری / مسافری</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-600 font-medium">سلامت باتری (درصد)</label>
                    <input
                      type="number"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                      placeholder="مثال: ۹۱"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Manual Custom Specifications (افزودن مشخصات فنی دستی و دلخواه توسط کاربر) */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-[#059669]">tune</span>
                    <span>مشخصات فنی دستی و دلخواه شما:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    می‌توانید هر مشخصه یا ویژگی اضافی را دستی درج کنید
                  </span>
                </div>

                {/* Existing Custom Specs Chips */}
                {customSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customSpecs.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                      >
                        <span className="font-bold text-slate-600">{spec.key}:</span>
                        <span>{spec.value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSpec(spec.id)}
                          className="w-4 h-4 rounded-full text-slate-400 hover:text-rose-600 flex items-center justify-center mr-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Custom Spec Row */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="عنوان مشخصه (مثلاً: کارت گرافیک، رنگ، سایز صفحه)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="مقدار (مثلاً: RTX 3070، تیتانیوم، ۱۶ اینچ)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpec}
                    className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>افزودن</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#059669] text-[28px]">payments</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">قیمت‌گذاری و شرایط پرداخت</span>
                <span className="text-xs text-slate-500">
                  امکان درج کامل مبالغ از هزار تومان تا میلیاردها تومان، یا انتخاب قیمت توافقی و معاوضه
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isExchangeable}
                  onChange={(e) => setIsExchangeable(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] rounded"
                />
                <span>مایل به معاوضه هستم</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] rounded"
                />
                <span>قیمت توافقی</span>
              </label>
            </div>

            {!isNegotiable && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    مبلغ به تومان <span className="text-[#ba0035]">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (پشتیبانی کامل از ارقام میلیونی و میلیاردی به فارسی یا انگلیسی)
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={priceInputStr}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="۵۵,۰۰۰,۰۰۰"
                    className="w-full pr-4 pl-16 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-lg sm:text-2xl font-black text-[#059669] focus:outline-none focus:bg-white focus:border-[#059669] tracking-wide"
                  />
                  <span className="absolute left-4 text-xs font-extrabold text-slate-500">تومان</span>
                </div>

                {/* Persian Words Readout */}
                <div className="px-4 py-2.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs sm:text-sm text-[#059669] font-extrabold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-700 shrink-0">spellcheck</span>
                  <span>معادل به حروف: {numberToPersianWords(price)}</span>
                </div>

                {/* Quick Presets Requested by User: 50m, 100k, 500k, 1b, 8b, 10b */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    انتخاب سریع مبالغ پرکاربرد (میلیونی و میلیاردی):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '۱۰۰ هزار تومان', value: 100000 },
                      { label: '۵۰۰ هزار تومان', value: 500000 },
                      { label: '۵۰ میلیون تومان', value: 50000000 },
                      { label: '۱ میلیارد تومان', value: 1000000000 },
                      { label: '۸ میلیارد تومان', value: 8000000000 },
                      { label: '۱۰ میلیارد تومان', value: 10000000000 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleSetPresetPrice(preset.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          price === preset.value
                            ? 'bg-[#059669] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Fast Delta Step Adjusters */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold ml-1">افزایش پله‌ای:</span>
                    <button
                      type="button"
                      onClick={() => handleAddPriceDelta(100000)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      + ۱۰۰ هزار ت
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPriceDelta(1000000)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      + ۱ میلیون ت
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPriceDelta(10000000)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      + ۱۰ میلیون ت
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPriceDelta(1000000000)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      + ۱ میلیارد ت
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrice(0);
                        setPriceInputStr('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Photo Uploader & Curated Default Ready-Made Image Gallery */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#059669] text-[28px]">add_a_photo</span>
                <div>
                  <span className="font-bold text-sm sm:text-base text-slate-900 block">تصاویر آگهی</span>
                  <span className="text-xs text-slate-500">
                    امکان بارگذاری از گالری دستگاه و انتخاب از تصاویر پیش‌فرض آماده
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                images.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {toPersianDigits(images.length)} از ۱۰ عکس
              </span>
            </div>

            {/* Hidden Native File Input (مستقیم گالری و فایل منیجر سیستم/گوشی را باز می‌کند) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />

            {/* Drag Drop Zone / Direct Gallery Launcher */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-teal-300/80 hover:border-[#059669] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50/40 transition-all group shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#059669] text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                کلیک کنید تا گالری عکس یا فایل‌منیجر دستگاه شما باز شود
              </span>
              <span className="text-[11px] text-teal-700 font-bold mt-1">
                انتخاب مستقیم عکس از گالری گوشی یا سیستم (تا سقف ۱۰ تصویر)
              </span>
            </div>

            {/* Current Selected Thumbnail Gallery */}
            {images.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-800">تصاویر انتخاب شده برای این آگهی:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 shadow-xs border border-slate-200"
                    >
                      <img src={img} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 right-2 bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          عکس اصلی
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#ba0035] text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف تصویر"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl bg-teal-50/50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center aspect-square text-teal-700 hover:text-[#059669] hover:bg-teal-100/60 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
                      <span className="text-[11px] font-bold mt-1">افزودن عکس دیگر</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* Curated Ready-Made Default Images Gallery (طبق خواسته دقیق کاربر) */}
            {/* ============================================================== */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/80 border border-slate-200 flex flex-col gap-3.5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[22px]">auto_awesome</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    گالری تصاویر پیش‌فرض و آماده (بدون نیاز به آپلود):
                  </span>
                </div>
                <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 self-start sm:self-auto">
                  روی هر عکس کلیک کنید تا به آگهی اضافه شود
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                ⭐ <strong>نکته مهم:</strong> اولویت آوان مارکت همواره با عکس واقعی کالای شماست؛ اما در صورتی که تصویری در دسترس ندارید، می‌توانید از بین تصاویر استاندارد و زیبای زیر (املاک، خودرو، لپ‌تاپ، مکمل و مسائل شخصی) به صورت پیش‌فرض انتخاب نمایید.
              </p>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {(Object.keys(presetImageGalleries) as (keyof typeof presetImageGalleries)[]).map((tabKey) => {
                  const tabData = presetImageGalleries[tabKey];
                  const isActive = presetTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setPresetTab(tabKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#059669] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {tabData.title}
                    </button>
                  );
                })}
              </div>

              {/* Ready Preset Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {presetImageGalleries[presetTab].images.map((item) => {
                  const isSelected = images.includes(item.url);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTogglePresetImage(item.url, item.title)}
                      className={`group relative rounded-2xl overflow-hidden aspect-square bg-slate-200 border-2 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] ${
                        isSelected ? 'border-[#059669] ring-2 ring-[#059669]/30' : 'border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-between text-white">
                        <div className="self-end">
                          {isSelected ? (
                            <span className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center text-xs shadow-md">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold leading-tight line-clamp-2">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Description */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#059669] text-[28px]">notes</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">توضیحات تکمیلی</span>
                <span className="text-xs text-slate-500">
                  جزئیاتی مانند مهلت تست، گارانتی و دلیل فروش را بنویسید
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">قالب آماده:</span>
                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className="px-3 py-1 rounded-full bg-white text-[#059669] hover:bg-[#059669] hover:text-white text-xs font-semibold shadow-xs border border-slate-200 transition-colors"
                >
                  درج متن پیشنهادی گوشی
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#059669] focus:outline-none leading-relaxed"
                placeholder="توضیحات کامل درباره شرایط فیزیکی، باتری، اقلام همراه و زمان مناسب تماس..."
              />
            </div>
          </div>

          {/* Section 6: Location & Map Marker */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#059669] text-[28px]">pin_drop</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">موقعیت مکانی کالا</span>
                <span className="text-xs text-slate-500">
                  مشخص کردن محدوده تقریبی اعتماد خریداران محلی را جلب می‌کند
                </span>
              </div>
            </div>

            {/* Popular City Quick-Select Chips */}
            <div>
              <label className="text-xs text-slate-700 font-semibold mb-1.5 block">
                انتخاب سریع شهرهای پرتردد:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { city: 'ساری', prov: 'مازندران' },
                  { city: 'بابل', prov: 'مازندران' },
                  { city: 'آمل', prov: 'مازندران' },
                  { city: 'سلمان‌شهر (متل قو)', prov: 'مازندران' },
                  { city: 'تهران', prov: 'تهران' },
                  { city: 'مشهد', prov: 'خراسان رضوی' },
                  { city: 'اصفهان', prov: 'اصفهان' },
                  { city: 'شیراز', prov: 'فارس' },
                  { city: 'رشت', prov: 'گیلان' },
                  { city: 'تبریز', prov: 'آذربایجان شرقی' },
                  { city: 'کرج', prov: 'البرز' },
                ].map((item) => {
                  const isSelected = adCity === item.city;
                  return (
                    <button
                      key={item.city}
                      type="button"
                      onClick={() => {
                        setAdProvince(item.prov);
                        setAdCity(item.city);
                        const cityObj = allIranCities.find((c) => c.name === item.city);
                        if (cityObj && cityObj.districts.length > 1) {
                          setNeighborhood(cityObj.districts[1]);
                        } else {
                          setNeighborhood('مرکز شهر');
                        }
                        onShowToast(`شهر به «${item.city}» (${item.prov}) تغییر یافت`);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#059669] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Province Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-700 font-semibold">استان <span className="text-[#ba0035]">*</span></label>
                <select
                  value={adProvince}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    setAdProvince(newProv);
                    const provObj = iranProvinces.find((p) => p.name === newProv);
                    if (provObj && provObj.cities.length > 0) {
                      const firstCity = provObj.cities[0];
                      setAdCity(firstCity.name);
                      setNeighborhood(firstCity.districts[1] || 'مرکز شهر');
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#059669] focus:bg-white"
                >
                  {iranProvinces.map((prov) => (
                    <option key={prov.name} value={prov.name}>
                      {prov.name} ({prov.cities.length} شهر)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. City Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-700 font-semibold">شهر <span className="text-[#ba0035]">*</span></label>
                <select
                  value={adCity}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setAdCity(newCity);
                    const cityObj = allIranCities.find((c) => c.name === newCity);
                    if (cityObj && cityObj.districts.length > 1) {
                      setNeighborhood(cityObj.districts[1]);
                    } else {
                      setNeighborhood('مرکز شهر');
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#059669] focus:bg-white"
                >
                  {(() => {
                    const prov = iranProvinces.find((p) => p.name === adProvince);
                    const cities = prov ? prov.cities : allIranCities;
                    return cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              {/* 3. Neighborhood Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-700 font-semibold">محله یا محدوده</label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#059669] focus:bg-white"
                >
                  {(() => {
                    const cityObj = allIranCities.find((c) => c.name === adCity);
                    const districts = cityObj?.districts || ['همه محله‌ها', 'مرکز شهر'];
                    return districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>

            {/* Interactive Map Pin Box & Button */}
            <div
              onClick={() => setIsMapModalOpen(true)}
              className="relative w-full h-44 rounded-2xl overflow-hidden shadow-inner border border-slate-200 cursor-pointer group"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLp5zh4vlwKYgUANXUnMPm9_nSxbmlS9QHkUjoRkra7HZDcUGbL_GEn_2uMLVSbB6ETn_cDlKWihNnjhu8_v_Sa0AYPPO6t-Dlo4zquB02-s2aJc_5RuCNqBDWrn9nkt5KnEXWLXeJaHP_LNSFlDPQiKMNwZJ9Vq2cLtByWbPu9HIBuWHm35_BVAnAMqaYGj8Yx_w4m2085XKhtOmq4NpkEgR_e4hL_vGSgOJM0G5HN1BumIluqdjgYw')`,
                }}
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-[#ba0035] text-white flex items-center justify-center shadow-xl animate-bounce">
                    <span className="material-symbols-outlined text-[24px]">location_on</span>
                  </div>
                  <div className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 shadow-lg mt-1.5 border border-slate-100 flex items-center gap-1.5">
                    <span>موقعیت: استان {adProvince}، شهر {adCity} ({neighborhood})</span>
                    <span className="text-[#059669] font-extrabold">• کلیک برای تعیین دقیق روی نقشه</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Privacy & Contact */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#059669] text-[28px]">security</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">حریم خصوصی و ارتباط</span>
                <span className="text-xs text-slate-500">انتخاب نحوه ارتباط خریدار با شما</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#059669]/15 text-[#059669] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">چت آوان مارکت فعال باشد</span>
                    <span className="text-[11px] text-slate-500">خریداران می‌توانند درون سامانه پیام بفرستند</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isChatEnabled}
                  onChange={(e) => setIsChatEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#059669] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">bedtime</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">عدم نمایش شماره در ساعات پایانی شب</span>
                    <span className="text-[11px] text-slate-500">از ساعت ۲۳:۰۰ تا ۰۸:۰۰ صبح فقط چت پاسخ داده شود</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isNightQuietEnabled}
                  onChange={(e) => setIsNightQuietEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#059669] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#9cf2e8]/40 text-[#059669] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">شماره تماس تایید شده: ۰۹۱۲***۴۵۶۷</span>
                    <span className="text-[11px] text-[#059669] font-semibold">هویت شما تایید شده است</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('ویرایش شماره تماس')}
                  className="text-xs text-slate-600 hover:text-[#059669] font-semibold"
                >
                  تغییر شماره
                </button>
              </div>
            </div>
          </div>

          {/* Section 8: Promotion Packages */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#ba0035] text-[28px]">rocket_launch</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 block">ارتقا و دیده‌شدن بیشتر</span>
                <span className="text-xs text-slate-500">افزایش بازدید تا ۵ برابر با بسته‌های ویژه آوان مارکت</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'standard' as const,
                  title: 'آگهی استاندارد',
                  badge: 'رایگان (تا ۵ آگهی)',
                  desc: 'انتشار رایگان در دسته‌بندی و نتایج جستجوی معمولی (تا ۵ آگهی فعال)',
                  icon: 'check_circle',
                },
                {
                  id: 'urgent' as const,
                  title: 'نشان فوری',
                  badge: '۲۵۰,۰۰۰ تومان',
                  desc: 'برچسب قرمز فوری و متمایز شدن در میان همه آگهی‌ها',
                  icon: 'bolt',
                  highlight: 'فروش سریع',
                },
                {
                  id: 'ladder' as const,
                  title: 'نردبان + ویژه',
                  badge: '۹۸۰,۰۰۰ تومان',
                  desc: 'نمایش در صدر لیست دسته‌بندی و پیشنهاد به خریداران فعال',
                  icon: 'trending_up',
                  highlight: 'بیشترین بازدید',
                },
              ].map((pkg) => {
                const isSelected = promotionPackage === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setPromotionPackage(pkg.id)}
                    className={`p-4 rounded-2xl flex flex-col justify-between text-right border transition-all ${
                      isSelected
                        ? 'bg-[#059669] text-white border-[#059669] shadow-md'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{pkg.title}</span>
                        {pkg.highlight && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-[#ba0035]'
                          }`}>
                            {pkg.highlight}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-1 ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                        {pkg.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-current/20 flex items-center justify-between">
                      <span className="text-xs font-bold">{pkg.badge}</span>
                      <span className="material-symbols-outlined text-[18px]">{pkg.icon}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 9: Final Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 bg-white rounded-3xl shadow-xs border border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">check</span>
              <span>ثبت آگهی و ارسال برای بررسی</span>
            </button>
          </div>
        </form>

        {/* Sidebar / Guidelines & Real-Time Card Preview (Col 4) */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          {/* Live Preview Card */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs sm:text-sm text-slate-900">پیش‌نمایش زنده در نتایج</span>
              <span className="material-symbols-outlined text-[#059669] text-[20px]">smartphone</span>
            </div>

            {/* Simulated Result Card */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col">
              <div className="relative w-full aspect-[4/3] bg-slate-200">
                <img
                  src={images[0]}
                  alt="پیش‌نمایش"
                  className="w-full h-full object-cover"
                />
                {promotionPackage === 'urgent' && (
                  <span className="absolute top-2 right-2 bg-[#ba0035] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    فوری
                  </span>
                )}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                </div>
              </div>
              <div className="p-3.5 flex flex-col gap-2">
                <span className="font-bold text-xs text-slate-900 line-clamp-2 leading-relaxed">
                  {title || 'عنوان آگهی شما در اینجا نمایش داده می‌شود'}
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>لحظاتی پیش در {adCity}، {neighborhood}</span>
                  <span className="px-2 py-0.5 bg-slate-200/70 rounded text-slate-700 font-medium">
                    {condition === 'like-new' ? 'در حد نو' : condition === 'new' ? 'نو' : 'کارکرده'}
                  </span>
                </div>
                <div className="mt-1 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">قیمت نهایی:</span>
                  <span className="font-extrabold text-xs sm:text-sm text-[#059669]">
                    {isNegotiable ? 'توافقی' : `${formatToman(price)} تومان`}
                  </span>
                </div>
              </div>
            </div>

            {/* Posting tips */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                <span>توصیه‌های آوان مارکت برای انتشار سریع</span>
              </div>
              <ul className="text-slate-500 text-[11px] space-y-1.5 list-disc list-inside leading-relaxed">
                <li>عکس‌های واضح در نور روز بارگذاری کنید.</li>
                <li>قیمت واقعی و بر مبنای بازار ثبت کنید.</li>
                <li>از نوشتن عبارات تبلیغاتی مکرر خودداری فرمایید.</li>
                <li>معاملات حضوری در اماکن عمومی همواره امن‌تر هستند.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Category Selection Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#059669] text-[26px]">category</span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">انتخاب دسته‌بندی آگهی</h3>
                  <p className="text-xs text-slate-400">دسته‌بندی مورد نظر خود را برای آگهی انتخاب کنید</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Categories & Subcategories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  cat: 'خانه و آشپزخانه',
                  icon: 'chair',
                  subs: ['لوازم برقی و آشپزخانه', 'مبلمان و دکوراسیون', 'ظروف و پخت‌وپز', 'فرش و گلیم', 'سرمایش و گرمایش'],
                },
                {
                  cat: 'وسایل نقلیه',
                  icon: 'directions_car',
                  subs: ['خودرو سواری', 'موتورسیکلت', 'قطعات و لوازم یدکی'],
                },
                {
                  cat: 'کالای دیجیتال',
                  icon: 'devices',
                  subs: ['موبایل و تبلت', 'لپ‌تاپ و کامپیوتر', 'ساعت هوشمند و گجت', 'کنسول بازی'],
                },
                {
                  cat: 'املاک',
                  icon: 'apartment',
                  subs: ['فروش آپارتمان', 'رهن و اجاره مسکونی', 'زمین و ویلا', 'دفتر کار و تجاری'],
                },
                {
                  cat: 'وسایل شخصی',
                  icon: 'checkroom',
                  subs: ['کیف و کفش و پوشاک', 'ساعت و اکسسوری', 'زیورآلات و طلا'],
                },
                {
                  cat: 'دارو، مکمل و سلامت',
                  icon: 'medication',
                  subs: ['مکمل‌های ورزشی و بدنسازی', 'ویتامین‌ها و تقویت‌کننده‌ها', 'داروهای گیاهی و سنتی', 'تجهیزات ارتوپدی و پزشکی'],
                },
                {
                  cat: 'خدمات',
                  icon: 'home_repair_service',
                  subs: ['تعمیرات لوازم خانگی', 'خدمات نظافت و تاسیسات', 'آموزش'],
                },
                {
                  cat: 'سرگرمی و فراغت',
                  icon: 'sports_esports',
                  subs: ['دوچرخه و اسکیت', 'تجهیزات ورزشی و کمپینگ', 'آلات موسیقی'],
                },
                {
                  cat: 'استخدام و کاریابی',
                  icon: 'badge',
                  subs: ['برنامه‌نویسی و IT', 'فروش و بازاریابی', 'اداری و پشتیبانی'],
                },
              ].map((item) => {
                const isCurrentCat = adCategory === item.cat;
                return (
                  <div
                    key={item.cat}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrentCat
                        ? 'border-[#059669] bg-teal-50/50 shadow-xs'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm text-slate-900">
                      <span className="material-symbols-outlined text-[#059669] text-[20px]">{item.icon}</span>
                      <span>{item.cat}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.subs.map((sub) => {
                        const isSubActive = isCurrentCat && adSubCategory === sub;
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleSelectCategory(item.cat, sub)}
                            className={`px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-[#059669] text-white font-bold shadow-xs'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialCoords={coords}
        initialCity={adCity}
        initialNeighborhood={neighborhood}
        onConfirmLocation={(loc) => {
          setCoords({ lat: loc.lat, lng: loc.lng });
          setAdCity(loc.city);
          setNeighborhood(loc.neighborhood);
          onShowToast(`موقعیت مکانی آگهی روی «${loc.city}، ${loc.neighborhood}» تنظیم شد.`);
        }}
      />
    </div>
  );
};
