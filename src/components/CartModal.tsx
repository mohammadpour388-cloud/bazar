import React, { useState } from 'react';
import { CartItem, Order, OrderCheckoutInfo, UserProfile, OrderDeliveryStage } from '../types';
import { formatToman, toPersianDigits, numberToPersianWords, calculateMarketplaceCommission } from '../data/mockData';
import { BankPaymentGatewayModal } from './BankPaymentGatewayModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  user: UserProfile;
  orders: Order[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  onDeposit: (amount: number, desc?: string) => void;
  onUpdateUser?: (user: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToCategories?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  user,
  orders = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onDeposit,
  onUpdateUser,
  onShowToast,
  onNavigateToCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'tracking'>('cart');
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [searchTrackingInput, setSearchTrackingInput] = useState('');

  // Payment Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);

  // Checkout Form State
  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || 'تهران');
  const [district, setDistrict] = useState(user.district || 'سعادت‌آباد');
  const [address, setAddress] = useState('خیابان سرو غربی، پلاک ۲۴، واحد ۳');
  const [postalCode, setPostalCode] = useState('۱۹۹۸۷۶۵۴۳۲');
  const [deliveryOption, setDeliveryOption] = useState<'express_today' | 'courier_instant' | 'regular_post' | 'tipax_safe'>('express_today');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'shaparak_gateway' | 'cod'>('wallet');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Real-time Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Realistic Graded Shipping Fees (درجه‌بندی هزینه‌های واقعی ارسال)
  const deliveryOptionsList = [
    {
      id: 'express_today' as const,
      title: 'ارسال اکسپرس بازار (تحویل ۲ تا ۳ ساعته)',
      description: 'پیک موتوری مجهز با باکس عایق ضدضربه درون‌شهری',
      fee: 65000,
      icon: 'bolt',
      badge: 'محبوب‌ترین',
    },
    {
      id: 'courier_instant' as const,
      title: 'پیک فوق‌سریع VIP (کمتر از ۴۵ دقیقه)',
      description: 'اعزام آنی اختصاصی‌ترین سفیر بازار با پیگیری لحظه‌ای روی نقشه',
      fee: 85000,
      icon: 'two_wheeler',
      badge: 'فوری‌ترین',
    },
    {
      id: 'regular_post' as const,
      title: 'پست پیشتاز هوایی سراسری (تحویل ۲۴ تا ۴۸ ساعته)',
      description: 'ارسال شرکت ملی پست با کد رهگیری ۲۴ رقمی و بیمه دولتی',
      fee: 48000,
      icon: 'markunread_mailbox',
      badge: 'سراسر کشور',
    },
    {
      id: 'tipax_safe' as const,
      title: 'تیپاکس و باربری ویژه امن (کالاهای گران‌قیمت و سنگین)',
      description: 'بسته‌بندی حبابی چندلایه و کارتن ضخیم همراه با پلمپ امنیتی',
      fee: 95000,
      icon: 'inventory',
      badge: 'ایمن‌ترین',
    },
  ];

  const activeDelivery = deliveryOptionsList.find((d) => d.id === deliveryOption) || deliveryOptionsList[0];
  const shippingFee = subtotal === 0 ? 0 : activeDelivery.fee;
  const calculatedDiscount = Math.round((subtotal * couponDiscount) / 100);
  // Dynamic Marketplace Escrow & Service Fee (کارمزد پلکانی خدمات و معامله امن بازار)
  const serviceCommission = cartItems.reduce((sum, item) => sum + calculateMarketplaceCommission(item.listing.price) * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - calculatedDiscount + shippingFee + serviceCommission);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'BAZAR10' || code === 'OFF10') {
      setCouponDiscount(10);
      onShowToast('کد تخفیف ۱۰٪ با موفقیت روی سبد خرید اعمال شد.', 'success');
    } else if (code === 'BAZAR20' || code === 'VIP20') {
      setCouponDiscount(20);
      onShowToast('کد تخفیف ویژه ۲۰٪ با موفقیت فعال گردید.', 'success');
    } else if (code === 'NOROOZ' || code === 'BAZAR50') {
      setCouponDiscount(50);
      onShowToast('کد تخفیف شگفت‌انگیز ۵۰٪ اعمال شد!', 'success');
    } else {
      setCouponDiscount(0);
      onShowToast('کد تخفیف وارد شده معتبر نمی‌باشد.', 'warning');
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      onShowToast('سبد خرید شما خالی است.', 'warning');
      return;
    }
    setStep('checkout');
  };

  const createOrderObject = (): Order => {
    const randomOrderNum = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingCode = `BAZAR-${Date.now().toString().slice(-6)}`;

    return {
      id: `ord_${Date.now()}`,
      orderNumber: randomOrderNum,
      items: [...cartItems],
      subtotal,
      discount: calculatedDiscount,
      shippingFee,
      total: finalTotal,
      status: 'shipped',
      deliveryStage: 'on_the_way',
      courier: {
        name: 'محمد صالحی (سفیر ارشد بازار اکسپرس)',
        phone: '۰۹۱۲۹۸۷۶۵۴۳',
        vehicle: 'موتورسیکلت آپاچی ۲۰۰ مشکی',
        plateNumber: 'ایران ۷۷ - ۴۲۱ ج ۸۹',
        estimatedArrivalMinutes: 30,
        currentLocationName: 'بزرگراه یادگار امام، تقاطع بلوار دادمان',
      },
      createdAt: 'هم‌اکنون',
      estimatedDeliveryDate: 'امروز، حدود ساعت ۱۷:۰۰',
      checkoutInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        province: 'تهران',
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        postalCode: postalCode.trim(),
        deliveryOption,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      trackingCode,
    };
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      onShowToast('لطفاً کلیه فیلدهای الزامی آدرس و مشخصات تحویل‌گیرنده را تکمیل فرمایید.', 'warning');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (user.walletBalance < finalTotal) {
        onShowToast(`موجودی کیف پول شما (${formatToman(user.walletBalance)} ت) کافی نیست! لطفاً درگاه بانکی را انتخاب کنید.`, 'warning');
        return;
      }

      setIsProcessing(true);

      try {
        // Pay from Wallet via Backend DB
        const res = await fetch('/api/payments/pay-from-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: finalTotal,
            description: `پرداخت فاکتور سفارش خرید از آوان مارکت`,
          }),
        });

        const data = await res.json();
        setIsProcessing(false);

        if (data.success) {
          if (data.user && onUpdateUser) {
            onUpdateUser(data.user);
          } else {
            onDeposit(-finalTotal, `پرداخت سفارش خرید`);
          }

          const newOrder = createOrderObject();
          onPlaceOrder(newOrder);
          setCompletedOrder(newOrder);
          setSelectedTrackingOrder(newOrder);
          onClearCart();
          setStep('success');
          onShowToast(`✅ پرداخت از کیف پول موفق بود. سفارش با کد رهگیری ${newOrder.trackingCode} ثبت شد!`, 'success');
        } else {
          onShowToast(data.message || 'پرداخت از کیف پول انجام نشد.', 'warning');
        }
      } catch (err) {
        console.error('Wallet payment error:', err);
        setIsProcessing(false);
        onShowToast('خطا در پرداخت از کیف پول.', 'warning');
      }
    } else if (paymentMethod === 'shaparak_gateway') {
      setIsProcessing(true);

      try {
        // 1. Create Transaction on Backend DB with status = 'pending'
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: finalTotal,
            type: 'cart_purchase',
            description: `پرداخت آنلاین فاکتور سفارش خرید از آوان مارکت`,
            gateway: 'shaparak',
          }),
        });

        const data = await res.json();
        setIsProcessing(false);

        if (data.success && data.transactionId) {
          setActiveTransactionId(data.transactionId);
          setIsGatewayOpen(true);
        } else {
          onShowToast(data.error || 'خطا در ایجاد تراکنش پرداخت.', 'warning');
        }
      } catch (err) {
        console.error('Error creating cart payment transaction:', err);
        setIsProcessing(false);
        setIsGatewayOpen(true);
      }
    } else {
      // Cash on delivery
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const newOrder = createOrderObject();
        onPlaceOrder(newOrder);
        setCompletedOrder(newOrder);
        setSelectedTrackingOrder(newOrder);
        onClearCart();
        setStep('success');
        onShowToast(`سفارش پرداخت در محل با کد رهگیری ${newOrder.trackingCode} ثبت شد!`, 'success');
      }, 800);
    }
  };

  const handleCartGatewaySuccess = (trackingNumber: string, updatedUser?: any) => {
    setIsGatewayOpen(false);
    if (updatedUser && onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    const newOrder = createOrderObject();
    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
    setSelectedTrackingOrder(newOrder);
    onClearCart();
    setStep('success');
    onShowToast(`✅ پرداخت موفق آنلاین! سفارش شما با کد رهگیری ${newOrder.trackingCode} ثبت شد.`, 'success');
  };

  const handleCartGatewayFailure = (errorMsg: string) => {
    setIsGatewayOpen(false);
    onShowToast(errorMsg || '❌ پرداخت تأیید نشد. سفارش ثبت نگردید.', 'warning');
  };

  // Delivery Stages Definition
  const deliveryStagesList: { stage: OrderDeliveryStage; label: string; desc: string; icon: string }[] = [
    { stage: 'order_confirmed', label: 'تایید و ثبت فاکتور', desc: 'پرداخت موفق و صدور فاکتور رسمی', icon: 'receipt_long' },
    { stage: 'packaging', label: 'بسته‌بندی در انبار مرکزی', desc: 'کنترل سلامت و بسته‌بندی ضدضربه', icon: 'inventory_2' },
    { stage: 'handed_to_courier', label: 'تحویل به سفیر توزیع', desc: 'دریافت مرسوله توسط پیک اختصاصی', icon: 'badge' },
    { stage: 'on_the_way', label: 'در حال آمدن به سمت شما', desc: 'سفیر در مسیر رسیدن به آدرس ثبت شده', icon: 'local_shipping' },
    { stage: 'delivered', label: 'تحویل نهایی به خریدار', desc: 'تحویل موفق کالا و ثبت امضای دیجیتال', icon: 'task_alt' },
  ];

  const getStageIndex = (stage?: OrderDeliveryStage) => {
    switch (stage) {
      case 'order_confirmed': return 0;
      case 'packaging': return 1;
      case 'handed_to_courier': return 2;
      case 'on_the_way': return 3;
      case 'delivered': return 4;
      default: return 3;
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((ord) => {
    if (!searchTrackingInput.trim()) return true;
    const q = searchTrackingInput.trim().toLowerCase();
    return (
      ord.trackingCode.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.checkoutInfo.fullName.toLowerCase().includes(q) ||
      ord.items.some((it) => it.listing.title.toLowerCase().includes(q))
    );
  });

  const activeTracking = selectedTrackingOrder || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 text-right">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl sm:rounded-[32px] overflow-hidden bg-white/98 backdrop-blur-2xl border border-emerald-100 shadow-[0_25px_60px_-15px_rgba(0,92,85,0.2)] text-slate-900 transition-all">
        
        {/* Site-Branded Header & Top Tab Switcher */}
        <div className="p-4 sm:p-5 border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/50 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#005c55] via-teal-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
              <span className="material-symbols-outlined text-[24px]">
                {activeTab === 'cart' ? 'shopping_bag' : 'local_shipping'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  {activeTab === 'tracking'
                    ? 'پیگیری زنده سفارشات و وضعیت مرسوله'
                    : step === 'cart'
                    ? 'سبد خرید و محاسبه هزینه سفارش'
                    : step === 'checkout'
                    ? 'تکمیل آدرس و نهایی‌سازی سفارش'
                    : 'سفارش با موفقیت ثبت شد'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#005c55] border border-emerald-200/80 text-[10px] font-extrabold shadow-2xs">
                  {activeTab === 'tracking' ? '🚚 رصد لحظه‌ای' : 'سبد خرید امن'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {activeTab === 'tracking'
                  ? 'مشاهده وضعیت بسته در راه، سفیر پیک و زمان تقریبی رسیدن کالا'
                  : step === 'cart'
                  ? `${toPersianDigits(totalItemsCount)} کالا در سبد شما با درجه‌بندی دقیق هزینه‌های ارسال`
                  : step === 'checkout'
                  ? 'اطلاعات گیرنده، شیوه ارسال و درگاه پرداخت را مشخص نمایید'
                  : 'فاکتور الکترونیک و اطلاعات پیگیری مرسوله'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tab switch buttons */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('cart');
                  if (step === 'success') setStep('cart');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cart'
                    ? 'bg-white text-[#005c55] border border-emerald-200/70 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                <span>سبد خرید ({toPersianDigits(totalItemsCount)})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tracking')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tracking'
                    ? 'bg-gradient-to-r from-[#005c55] via-teal-600 to-emerald-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">route</span>
                <span>پیگیری سفارشات ({toPersianDigits(orders.length)})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="بستن"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ===================== TAB 1: CART & CHECKOUT ===================== */}
        {activeTab === 'cart' && (
          <>
            {/* STEP 1: CART ITEMS & SUMMARY */}
            {step === 'cart' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50/40">
                {cartItems.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[48px]">shopping_cart</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800">سبد خرید شما خالی است!</h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                      می‌توانید با جستجو در آگهی‌های بازار و ویترین ویدیوها، کالاهای مورد نظر خود را به سبد خرید اضافه کنید.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToCategories?.();
                        }}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#005c55] via-teal-600 to-emerald-600 hover:opacity-95 text-white text-xs font-black shadow-md cursor-pointer transition-all"
                      >
                        مشاهده کالاهای بازار
                      </button>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('tracking')}
                          className="px-5 py-2.5 rounded-2xl bg-teal-50 text-[#005c55] border border-teal-200 hover:bg-teal-100 text-xs font-black cursor-pointer transition-all"
                        >
                          🚚 پیگیری سفارشات ثبت شده ({toPersianDigits(orders.length)})
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Cart Items List (Col 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-slate-800">
                          اقلام سفارش ({toPersianDigits(cartItems.length)} کالا)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('آیا از خالی کردن کل سبد خرید اطمینان دارید؟')) {
                              onClearCart();
                              onShowToast('سبد خرید خالی شد.');
                            }
                          }}
                          className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline font-bold cursor-pointer"
                        >
                          خالی کردن سبد
                        </button>
                      </div>

                      {cartItems.map((item) => {
                        const availableStock = item.listing.stockCount ?? 5;
                        const isLowStock = availableStock <= 2 && availableStock > 0;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-emerald-100/80 shadow-2xs hover:border-emerald-300 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={item.listing.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                                alt={item.listing.title}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                  {item.listing.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span>فروشنده: {item.listing.seller.name}</span>
                                  <span>•</span>
                                  <span className="text-[#005c55] font-bold">{item.listing.city}</span>
                                </div>

                                {/* Stock availability indicator */}
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  {availableStock > 0 ? (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                                      isLowStock
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                    }`}>
                                      <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                      <span>
                                        {isLowStock
                                          ? `تنها ${toPersianDigits(availableStock)} عدد در انبار باقی‌مانده`
                                          : `موجود در انبار: ${toPersianDigits(availableStock)} عدد`}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                                      ناموجود در انبار
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price & Quantity Stepper */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-none border-slate-100 shrink-0">
                              <div className="flex items-baseline gap-1 text-[#005c55] font-black text-sm">
                                <span>{formatToman(item.listing.price * item.quantity)}</span>
                                <span className="text-[10px] font-normal text-slate-400">ت</span>
                              </div>

                              {/* Stepper (+ / -) */}
                              <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/70 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity < availableStock) {
                                      onUpdateQuantity(item.id, item.quantity + 1);
                                    } else {
                                      onShowToast(`حداکثر موجودی این کالا در انبار ${toPersianDigits(availableStock)} عدد می‌باشد.`, 'warning');
                                    }
                                  }}
                                  disabled={item.quantity >= availableStock}
                                  className="w-7 h-7 rounded-lg bg-white text-slate-800 hover:text-[#005c55] hover:bg-emerald-50 flex items-center justify-center font-black shadow-2xs disabled:opacity-40 cursor-pointer transition-colors"
                                  title="افزایش تعداد"
                                >
                                  +
                                </button>
                                <span className="w-7 text-center font-mono font-black text-xs text-slate-800">
                                  {toPersianDigits(item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      onUpdateQuantity(item.id, item.quantity - 1);
                                    } else {
                                      onRemoveItem(item.id);
                                      onShowToast('کالا از سبد خرید حذف شد.');
                                    }
                                  }}
                                  className="w-7 h-7 rounded-lg bg-white text-slate-800 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-black shadow-2xs cursor-pointer transition-colors"
                                  title={item.quantity === 1 ? 'حذف کالا' : 'کاهش تعداد'}
                                >
                                  {item.quantity === 1 ? (
                                    <span className="material-symbols-outlined text-[14px] text-rose-500">delete</span>
                                  ) : (
                                    '-'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Graded Shipping Method Selection in Cart View */}
                      <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-50/50 to-teal-50/30 border border-emerald-100/90 flex flex-col gap-2.5 mt-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#005c55] text-[18px]">local_shipping</span>
                            <span>تعیین شیوه و هزینه واقعی ارسال:</span>
                          </span>
                          <span className="text-[11px] text-[#005c55] font-bold">تعرفه مصوب آوان مارکت</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {deliveryOptionsList.map((opt) => {
                            const isSelected = deliveryOption === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setDeliveryOption(opt.id)}
                                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                  isSelected
                                    ? 'border-[#005c55] bg-white text-[#005c55] ring-2 ring-[#005c55]/20 shadow-xs'
                                    : 'border-slate-200/90 hover:border-emerald-200 bg-white/90 hover:bg-white text-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[17px] text-[#005c55]">{opt.icon}</span>
                                    <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                                    {opt.badge}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                  <span className="text-slate-500 text-[10px] truncate max-w-[140px]">{opt.description}</span>
                                  <span className="font-mono font-black text-slate-900">{formatToman(opt.fee)} ت</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Real-Time Price Calculation & Action Card (Col 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Coupon Form */}
                      <form onSubmit={handleApplyCoupon} className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex items-center gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="کد تخفیف (مثال: BAZAR20)"
                          className="flex-1 px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer transition-all"
                        >
                          اعمال
                        </button>
                      </form>

                      {/* Telegram Bot Assistance & Live Tracking Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50/40 to-blue-50 border border-sky-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs">ربات تلگرام آوان مارکت</span>
                              <span className="px-2 py-0.5 rounded-full bg-white text-sky-800 text-[10px] font-mono font-bold dir-ltr border border-sky-200">@avan_market_bot</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                              پیگیری آنلاین سفارش، هشدارهای سفیر و پشتیبانی خرید
                            </p>
                          </div>
                        </div>
                        <a
                          href="https://t.me/avan_market_bot?start=cart_track"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs group"
                        >
                          <span>ورود به ربات</span>
                          <span className="material-symbols-outlined text-[15px] group-hover:scale-110 transition-transform">send</span>
                        </a>
                      </div>

                      {/* Summary Box */}
                      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm flex flex-col gap-3.5 text-xs">
                        <h4 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-900">
                            <span className="material-symbols-outlined text-[#005c55] text-[18px]">receipt_long</span>
                            <span>خلاصه فاکتور سفارش</span>
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">محاسبه آنی</span>
                        </h4>

                        <div className="flex items-center justify-between text-slate-600">
                          <span>جمع اقلام سبد خرید ({toPersianDigits(totalItemsCount)} عدد):</span>
                          <span className="font-mono font-bold text-slate-900">{formatToman(subtotal)} ت</span>
                        </div>

                        {calculatedDiscount > 0 && (
                          <div className="flex items-center justify-between text-rose-600 font-bold">
                            <span>تخفیف کد پروموشن ({toPersianDigits(couponDiscount)}٪):</span>
                            <span className="font-mono">- {formatToman(calculatedDiscount)} ت</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-slate-600">
                          <span>هزینه واقعی ارسال ({activeDelivery.title.split('(')[0]}):</span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatToman(shippingFee)} تومان
                          </span>
                        </div>

                        {/* Marketplace Escrow Service Commission */}
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <span>کارمزد خدمات و معامله امن بازار:</span>
                            <span className="text-[10px] text-emerald-700 font-bold">(پلکانی)</span>
                          </span>
                          <span className="font-mono font-bold text-[#005c55]">
                            {formatToman(serviceCommission)} تومان
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span>بیمه اصالت و سلامت فیزیکی:</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                            <span>تضمین ۱۰۰٪ آوان مارکت</span>
                          </span>
                        </div>

                        {/* Total Highlight */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 bg-gradient-to-b from-transparent to-emerald-50/40 p-2 rounded-2xl">
                          <div className="flex items-baseline justify-between">
                            <span className="font-black text-sm text-slate-900">مبلغ نهایی قابل پرداخت:</span>
                            <div className="flex items-baseline gap-1 text-xl font-black text-[#005c55]">
                              <span>{formatToman(finalTotal)}</span>
                              <span className="text-xs font-bold text-slate-500">تومان</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            معادل حروف: {numberToPersianWords(finalTotal)} تومان
                          </span>
                        </div>

                        {/* Checkout Button */}
                        <button
                          type="button"
                          onClick={handleProceedToCheckout}
                          className="mt-2 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#ba0035] via-rose-600 to-rose-700 hover:from-[#9e002d] hover:to-rose-800 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-900/20 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span>تکمیل آدرس و ثبت سفارش ({formatToman(finalTotal)} ت)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CHECKOUT & ADDRESS FORM */}
            {step === 'checkout' && (
              <form onSubmit={handleConfirmOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Recipient Details */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-3.5">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#005c55] text-[20px]">person_pin_circle</span>
                      <span>اطلاعات گیرنده و آدرس ارسال</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">نام و نام خانوادگی:</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">شماره همراه گیرنده:</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">شهر:</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">محله:</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">آدرس دقیق پستی:</label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="خیابان، کوچه، پلاک، واحد..."
                        className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005c55] focus:bg-white resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">کد پستی ۱۰ رقمی:</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#005c55] focus:bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">توضیحات تحویل (اختیاری):</label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="مثلاً قبل از رسیدن زنگ بزنید"
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005c55] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Payment Selection */}
                  <div className="flex flex-col gap-4">
                    {/* Delivery Option */}
                    <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-2.5">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#005c55] text-[18px]">local_shipping</span>
                        <span>تعرفه و روش ارسال مرسوله:</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2">
                        {deliveryOptionsList.map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => setDeliveryOption(opt.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                              deliveryOption === opt.id
                                ? 'border-[#005c55] bg-emerald-50/70 text-[#005c55] ring-2 ring-[#005c55]/20 shadow-xs'
                                : 'border-slate-200 hover:border-emerald-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-[#005c55]">{opt.icon}</span>
                              <div>
                                <span className="font-bold block text-slate-900">{opt.title}</span>
                                <span className="text-[10px] text-slate-400">{opt.description}</span>
                              </div>
                            </div>
                            <span className="font-black font-mono text-slate-900">
                              {formatToman(opt.fee)} ت
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-2.5">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#005c55] text-[18px]">payments</span>
                        <span>روش پرداخت وجه سفارش:</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2">
                        {/* Wallet */}
                        <div
                          onClick={() => setPaymentMethod('wallet')}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            paymentMethod === 'wallet'
                              ? 'border-[#005c55] bg-emerald-50/70 text-[#005c55] ring-2 ring-[#005c55]/20 shadow-xs'
                              : 'border-slate-200 hover:border-emerald-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-emerald-700">account_balance_wallet</span>
                            <div>
                              <span className="font-extrabold block text-slate-900">پرداخت مستقیم از کیف پول بازار</span>
                              <span className="text-[10px] text-slate-500">موجودی فعلی: {formatToman(user.walletBalance)} تومان</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            تسویه آنی
                          </span>
                        </div>

                        {/* Shaparak */}
                        <div
                          onClick={() => setPaymentMethod('shaparak_gateway')}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            paymentMethod === 'shaparak_gateway'
                              ? 'border-[#005c55] bg-emerald-50/70 text-[#005c55] ring-2 ring-[#005c55]/20 shadow-xs'
                              : 'border-slate-200 hover:border-emerald-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-teal-700">credit_card</span>
                            <div>
                              <span className="font-extrabold block text-slate-900">درگاه پرداخت اینترنتی شاپرک</span>
                              <span className="text-[10px] text-slate-500">پرداخت امن با کلیه کارت‌های بانکی عضو شتاب</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 font-bold">شاپرک</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Final Pay Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/50 border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-600 font-bold">مبلغ نهایی با احتساب هزینه ارسال:</span>
                    <span className="text-xl font-black text-[#005c55]">{formatToman(finalTotal)} تومان</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setStep('cart')}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      ویرایش سبد
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 sm:flex-initial px-8 py-3 rounded-2xl bg-gradient-to-r from-[#005c55] via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>در حال ثبت سفارش و انتقال...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                          <span>تأیید و پرداخت نهایی ({formatToman(finalTotal)} ت)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER CONFIRMATION & SUCCESS INVOICE */}
            {step === 'success' && completedOrder && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col items-center justify-center gap-5 text-center bg-slate-50/30">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900">
                    سفارش شما با موفقیت ثبت شد و در حال آماده‌سازی است!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    پیامک تایید سفارش و کد رهگیری مرسوله به شماره <strong className="font-mono text-slate-800">{completedOrder.checkoutInfo.phone}</strong> ارسال گردید.
                  </p>
                </div>

                {/* Invoice Card */}
                <div className="w-full max-w-md p-5 rounded-3xl bg-gradient-to-b from-white to-emerald-50/40 border border-emerald-200/90 flex flex-col gap-2.5 text-xs text-right shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="text-slate-500">شماره فاکتور:</span>
                    <span className="font-mono font-black text-slate-900">#{completedOrder.orderNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">کد رهگیری پست/پیک:</span>
                    <span className="font-mono font-black text-[#005c55]">{completedOrder.trackingCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">هزینه ارسال:</span>
                    <span className="font-mono font-bold text-slate-800">{formatToman(completedOrder.shippingFee)} تومان</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">آدرس تحویل:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[220px]">
                      {completedOrder.checkoutInfo.city}، {completedOrder.checkoutInfo.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                    <span className="font-black text-slate-900">مبلغ نهایی پرداخت شده:</span>
                    <span className="font-black text-sm text-[#005c55] font-mono">
                      {formatToman(completedOrder.total)} تومان
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrackingOrder(completedOrder);
                      setActiveTab('tracking');
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#005c55] via-teal-600 to-emerald-600 hover:opacity-95 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">route</span>
                    <span>🚚 پیگیری زنده وضعیت مرسوله</span>
                  </button>

                  <a
                    href={`https://t.me/bazar_mahali_bot?start=track_${completedOrder.trackingCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 transition-all group"
                  >
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    <span>دریافت فاکتور در ربات تلگرام (@bazar_mahali_bot)</span>
                    <span className="material-symbols-outlined text-[15px] group-hover:scale-110 transition-transform">send</span>
                  </a>

                  <a
                    href="https://t.me/bazar_mahali_support"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-teal-600">support_agent</span>
                    <span>پیام به ادمین ساپورت (پیگیری سفارش)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>چاپ فاکتور</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== TAB 2: LIVE ORDER TRACKING (پیگیری سفارشات و وضعیت مرسوله) ===================== */}
        {activeTab === 'tracking' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50/30">
            {/* Tracking Search & Selector Bar - Modern & Site-Branded */}
            <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#005c55] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTrackingInput}
                    onChange={(e) => setSearchTrackingInput(e.target.value)}
                    placeholder="جستجوی کد رهگیری، شماره فاکتور یا نام گیرنده..."
                    className="w-full pr-11 pl-10 py-2.5 rounded-2xl bg-slate-50/80 border-2 border-slate-200 focus:border-[#005c55] focus:bg-white text-xs font-mono font-black text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none transition-all shadow-2xs"
                  />
                  {searchTrackingInput && (
                    <button
                      type="button"
                      onClick={() => setSearchTrackingInput('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="پاک کردن جستجو"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>

                {/* Telegram Bot Live Tracking Card */}
                <a
                  href={`https://t.me/bazar_mahali_bot?start=${activeTracking?.trackingCode ? `track_${activeTracking.trackingCode}` : 'live_tracking'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer group shrink-0"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    <span>پیگیری در ربات تلگرام (@bazar_mahali_bot)</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">send</span>
                </a>
              </div>

              {orders.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 scrollbar-none border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">فهرست سفارشات شما:</span>
                  {orders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setSelectedTrackingOrder(ord)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeTracking?.id === ord.id
                          ? 'bg-gradient-to-r from-[#005c55] to-teal-600 text-white shadow-xs font-extrabold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>#{ord.orderNumber}</span>
                      <span className="text-[10px] opacity-75">({ord.trackingCode})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* If no orders at all */}
            {filteredOrders.length === 0 && !activeTracking ? (
              <div className="py-14 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <span className="material-symbols-outlined text-3xl">local_shipping</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">سفارشی با این مشخصات یافت نشد!</h3>
                <p className="text-xs text-slate-500">
                  کد رهگیری را مجدداً بررسی فرمایید یا از سبد خرید اقدام به ثبت سفارش نمایید.
                </p>
              </div>
            ) : activeTracking ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Side: Live Shipment Stepper & Courier Info (Col 7) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Status Banner Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#005c55] via-teal-600 to-emerald-600 text-white shadow-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-300 text-[24px] animate-pulse">
                          two_wheeler
                        </span>
                        <div>
                          <span className="text-[10px] text-teal-100 font-bold block">وضعیت فعلی مرسوله:</span>
                          <h3 className="font-black text-sm sm:text-base text-white">
                            {activeTracking.deliveryStage === 'on_the_way'
                              ? 'مرسوله در راه است و سفیر به سمت شما حرکت می‌کند'
                              : activeTracking.deliveryStage === 'delivered'
                              ? 'مرسوله با موفقیت تحویل داده شد'
                              : activeTracking.deliveryStage === 'handed_to_courier'
                              ? 'بسته تحویل سفیر پیک گردید'
                              : 'در حال بسته‌بندی در انبار مرکزی'}
                          </h3>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold backdrop-blur-md">
                        {activeTracking.trackingCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-teal-100">
                      <span>تخمین زمان رسیدن: <strong>{activeTracking.courier?.estimatedArrivalMinutes ? `${toPersianDigits(activeTracking.courier.estimatedArrivalMinutes)} دقیقه دیگر` : 'امروز تا ساعت ۱۷:۳۰'}</strong></span>
                      <span>هزینه ارسال: <strong>{formatToman(activeTracking.shippingFee)} ت</strong></span>
                    </div>
                  </div>

                  {/* 5-Stage Live Timeline Stepper */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-4">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#005c55] text-[18px]">timeline</span>
                      <span>مراحل گام به گام پردازش و ارسال مرسوله:</span>
                    </h4>

                    <div className="flex flex-col gap-3.5 relative pr-4">
                      {/* Vertical line connector */}
                      <div className="absolute top-3 bottom-3 right-7 w-0.5 bg-slate-200" />

                      {deliveryStagesList.map((st, idx) => {
                        const currentIdx = getStageIndex(activeTracking.deliveryStage);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={st.stage} className="relative flex items-start gap-3.5 z-10">
                            {/* Step Icon Badge */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-tr from-[#005c55] to-emerald-500 text-white ring-4 ring-emerald-100 scale-110 animate-pulse'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              <span className="material-symbols-outlined text-[15px]">
                                {isDone ? 'check' : st.icon}
                              </span>
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black ${
                                  isCurrent
                                    ? 'text-[#005c55]'
                                    : isDone
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}>
                                  {st.label}
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black animate-pulse">
                                    در حال انجام
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {st.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Courier Driver Card (سفیر پیک اختصاصی) */}
                  {activeTracking.courier && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white border border-emerald-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#005c55] flex items-center justify-center shrink-0 shadow-2xs">
                          <span className="material-symbols-outlined text-[28px]">sports_motorsports</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">سفیر تحویل بسته شما:</span>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">
                            {activeTracking.courier.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>وسیله: {activeTracking.courier.vehicle}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-slate-700">{activeTracking.courier.plateNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <a
                          href={`tel:${activeTracking.courier.phone}`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                          <span>تماس با سفیر ({activeTracking.courier.phone})</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Route Card & Order Summary (Col 5) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Simulated Live Route Map Box */}
                  <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#005c55] text-[18px]">map</span>
                        <span>موقعیت لحظه‌ای روی نقشه:</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold animate-pulse">● زنده (GPS فعال)</span>
                    </div>

                    {/* Simulated Map View */}
                    <div className="relative h-44 rounded-2xl bg-gradient-to-br from-emerald-50/40 to-slate-100 overflow-hidden border border-emerald-100/90 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#005c55_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Origin Pin */}
                      <div className="absolute right-6 top-8 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-[12px] shadow-md">
                          🏭
                        </div>
                        <span className="text-[9px] font-bold bg-white/95 px-1.5 py-0.5 rounded-md text-slate-800 shadow-2xs mt-1 border border-slate-200">انبار بازار</span>
                      </div>

                      {/* Moving Courier Pin */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                        <div className="w-9 h-9 rounded-full bg-[#005c55] text-white flex items-center justify-center text-[15px] shadow-lg ring-4 ring-emerald-300/60">
                          🏍️
                        </div>
                        <span className="text-[10px] font-black bg-[#005c55] text-white px-2 py-0.5 rounded-full shadow-sm mt-1 whitespace-nowrap">
                          {activeTracking.courier?.currentLocationName || 'در مسیر تحویل'}
                        </span>
                      </div>

                      {/* Destination Pin */}
                      <div className="absolute left-6 bottom-6 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-[12px] shadow-md">
                          📍
                        </div>
                        <span className="text-[9px] font-bold bg-white/95 px-1.5 py-0.5 rounded-md text-slate-800 shadow-2xs mt-1 border border-slate-200">
                          {activeTracking.checkoutInfo.district}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-emerald-50/50 border border-emerald-100/80 p-2.5 rounded-xl flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#005c55] shrink-0">location_on</span>
                      <span>آدرس مقصد: {activeTracking.checkoutInfo.city}، {activeTracking.checkoutInfo.district}، {activeTracking.checkoutInfo.address}</span>
                    </div>
                  </div>

                  {/* Order Items & Breakdown */}
                  <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 shadow-2xs flex flex-col gap-3 text-xs">
                    <h5 className="font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#005c55] text-[16px]">inventory_2</span>
                        <span>اقلام این سفارش ({toPersianDigits(activeTracking.items.length)} قلم)</span>
                      </span>
                      <span className="font-mono text-slate-500">#{activeTracking.orderNumber}</span>
                    </h5>

                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {activeTracking.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={it.listing.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                              alt={it.listing.title}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-800 truncate text-[11px]">{it.listing.title}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono font-bold shrink-0">
                            <span className="text-slate-400">×{toPersianDigits(it.quantity)}</span>
                            <span className="text-[#005c55]">{formatToman(it.listing.price * it.quantity)} ت</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>هزینه واقعی ارسال:</span>
                        <span className="font-mono font-bold text-slate-800">{formatToman(activeTracking.shippingFee)} تومان</span>
                      </div>
                      <div className="flex items-center justify-between font-black text-slate-900 text-sm pt-1">
                        <span>مبلغ کل فاکتور:</span>
                        <span className="text-[#005c55] font-mono">{formatToman(activeTracking.total)} تومان</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}

      </div>

      {/* Payment Gateway Modal for Direct Checkout */}
      <BankPaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        transactionId={activeTransactionId}
        amount={finalTotal}
        description="پرداخت آنلاین فاکتور سفارش خرید آوان مارکت"
        onSuccess={handleCartGatewaySuccess}
        onFailure={handleCartGatewayFailure}
        onCancel={() => {
          setIsGatewayOpen(false);
          onShowToast('❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.', 'warning');
        }}
      />
    </div>
  );
};
