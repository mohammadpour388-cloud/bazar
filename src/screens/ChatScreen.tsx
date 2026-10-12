import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Listing, ScreenType } from '../types';
import { formatToman, toPersianDigits } from '../data/mockData';

interface ChatScreenProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onOpenOfferModal: (listing: Listing) => void;
  onViewListing: (listingId: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onMarkAsRead?: (conversationId: string) => void;
  onSimulateIncomingMessage?: (conversationId: string) => void;
  onDeleteMessage?: (conversationId: string, messageId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onOpenOfferModal,
  onViewListing,
  onNavigate,
  onShowToast,
  onMarkAsRead,
  onSimulateIncomingMessage,
  onDeleteMessage,
  onDeleteConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'offers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [deleteConfirmConvId, setDeleteConfirmConvId] = useState<string | null>(null);
  const [deleteConfirmMsgId, setDeleteConfirmMsgId] = useState<{ convId: string; msgId: string } | null>(null);
  const [onlineOverrides, setOnlineOverrides] = useState<Record<string, boolean>>({});
  const [isNudging, setIsNudging] = useState(false);
  const [showResponseDetails, setShowResponseDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const isUserOnline = activeConv
    ? (onlineOverrides[activeConv.id] !== undefined ? onlineOverrides[activeConv.id] : activeConv.user.online)
    : false;

  // Automatically mark active conversation as read as soon as user opens or views it
  useEffect(() => {
    if (activeConv && activeConv.unreadCount > 0) {
      onMarkAsRead?.(activeConv.id);
    }
  }, [activeConv?.id, activeConv?.unreadCount, onMarkAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const quickChips = [
    'تخفیف جزئی داره؟',
    'محل بازدید کجاست؟',
    'تعویض دارید؟',
    'سلام، آگهی هنوز موجوده؟',
    'امکان ارسال با پیک هست؟',
  ];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'unread') return c.unreadCount > 0;
    if (filterType === 'offers') return c.messages.some((m) => !!m.offer);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6">
      {/* Breadcrumb & Screen Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
          <button onClick={() => onNavigate('home')} className="hover:text-teal-700 transition-colors">
            صفحه اصلی
          </button>
          <span>/</span>
          <span className="text-stone-800 font-medium">پیام‌ها و مذاکرات خرید</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            سیستم چت امن و رمزنگاری شده
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[720px] max-h-[82vh]">
        {/* RIGHT PANEL: Conversations List (Persian RTL) */}
        <div
          className={`md:col-span-4 lg:col-span-4 border-l border-stone-200 flex flex-col bg-stone-50/50 ${
            !showMobileList && activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header of List */}
          <div className="p-4 border-b border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700 text-xl">chat</span>
                گفتگوها
                <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                  {toPersianDigits(conversations.length)}
                </span>
              </h2>
              <button
                onClick={() => onShowToast('پیام‌های قدیمی بایگانی شده در این نسخه نمایش داده نمی‌شوند')}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                title="فیلترهای بیشتر"
              >
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="جستجو در مخاطبان یا کالاها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-stone-100 border-none rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
              />
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'unread'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                خوانده نشده
              </button>
              <button
                onClick={() => setFilterType('offers')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'offers'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                پیشنهادها
              </button>
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl mb-2">forum</span>
                <p className="text-sm">گفتگویی با این مشخصات یافت نشد</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onMarkAsRead?.(conv.id);
                      setShowMobileList(false);
                    }}
                    className={`p-3 sm:p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-teal-50/70 border-r-4 border-r-teal-700'
                        : 'hover:bg-stone-100/60'
                    }`}
                  >
                    {/* Counterparty Avatar with Online Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={conv.user.name}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200"
                      />
                      {(onlineOverrides[conv.id] !== undefined ? onlineOverrides[conv.id] : conv.user.online) ? (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-300"
                          title="آنلاین"
                        ></span>
                      ) : (
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-stone-300 rounded-full border-2 border-white"
                          title="آفلاین"
                        ></span>
                      )}
                    </div>

                    {/* Chat Preview Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900 text-sm truncate flex items-center gap-1">
                          {conv.user.name}
                          {conv.user.isVerified && (
                            <span
                              className="material-symbols-outlined text-teal-600 text-sm"
                              title="کاربر احراز هویت شده"
                            >
                              verified
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-stone-400 shrink-0">
                          {conv.lastMessageTime || 'امروز'}
                        </span>
                      </div>

                      {/* Listing Reference */}
                      <div className="text-[11px] text-teal-800 font-medium truncate mb-1 bg-teal-50/50 px-1.5 py-0.5 rounded inline-block max-w-full">
                        {conv.listing.title}
                      </div>

                      {/* Last Message */}
                      <p className="text-xs text-stone-500 truncate">
                        {conv.messages[conv.messages.length - 1]?.offer
                          ? '🏷️ پیشنهاد قیمت ثبت شد'
                          : conv.messages[conv.messages.length - 1]?.text || conv.lastMessage || 'بدون پیام'}
                      </p>
                    </div>

                    {/* Unread Badge & Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1 bg-[#ba0035] text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                          {toPersianDigits(conv.unreadCount)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmConvId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all"
                        title="حذف این گفتگو"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LEFT / CENTER PANEL: Active Chat Thread */}
        <div
          className={`md:col-span-8 lg:col-span-8 flex flex-col h-full bg-white relative ${
            showMobileList ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-white z-10 shadow-2xs">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden p-1.5 -mr-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>

                  <div className="relative">
                    <img
                      src={activeConv.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={activeConv.user.name}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 transition-all ${
                        isUserOnline ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-stone-200'
                      }`}
                    />
                    {isUserOnline ? (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400/50 shadow-xs flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75"></span>
                      </span>
                    ) : (
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 bg-stone-300 rounded-full border-2 border-white shadow-xs"
                        title="کاربر آفلاین است"
                      ></span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
                        {activeConv.user.name}
                      </h3>
                      {activeConv.user.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded-md font-bold border border-teal-200/60">
                          <span className="material-symbols-outlined text-[13px] text-teal-700">verified</span>
                          تأیید هویت
                        </span>
                      )}
                    </div>

                    {/* Online Status & Responsiveness Metric Badge */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {isUserOnline ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>آنلاین (هم‌اکنون فعال)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                          <span>آفلاین • {activeConv.user.lastSeen || 'آخرین حضور: به تازگی'}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowResponseDetails(!showResponseDetails)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/60 px-2 py-0.5 rounded-full border border-slate-200/70 transition-colors cursor-pointer"
                        title="مشاهده جزئیات سرعت پاسخگویی و آمار"
                      >
                        <span className="material-symbols-outlined text-[14px] text-amber-500">
                          {isUserOnline ? 'bolt' : 'schedule'}
                        </span>
                        <span>{activeConv.user.responseTimeText || (isUserOnline ? 'پاسخگویی سریع کمتر از ۵ دقیقه' : 'میانگین پاسخ: کمتر از ۱ ساعت')}</span>
                        <span className="material-symbols-outlined text-[13px] text-slate-400">info</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call, Notify Ping, Delete & Options Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* Instant Nudge / Buzz Alert Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNudging(true);
                      setTimeout(() => {
                        setIsNudging(false);
                        onShowToast(`اعلان فوری پاسخ به گوشی ${activeConv.user.name} ارسال شد.`, 'success');
                      }, 600);
                    }}
                    disabled={isNudging}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200/80 cursor-pointer shadow-2xs active:scale-95"
                    title="ارسال اعلان پیامک و هشدار نوتیفیکیشن برای دریافت پاسخ سریع‌تر از طرف مقابل"
                  >
                    <span className={`material-symbols-outlined text-[16px] text-emerald-600 ${isNudging ? 'animate-spin' : ''}`}>
                      notifications_active
                    </span>
                    <span className="hidden sm:inline">{isNudging ? 'در حال ارسال...' : 'اعلان پاسخ سریع'}</span>
                  </button>

                  {/* Toggle Online/Offline State for Quick Testing */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isUserOnline;
                      setOnlineOverrides((prev) => ({ ...prev, [activeConv.id]: nextState }));
                      onShowToast(nextState ? 'وضعیت کاربر به «آنلاین» تغییر یافت.' : 'وضعیت کاربر به «آفلاین» تغییر یافت.', 'info');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
                    title="شبیه‌سازی وضعیت آنلاین یا آفلاین کاربر"
                  >
                    <span className="material-symbols-outlined text-[15px] text-slate-500">
                      {isUserOnline ? 'wifi' : 'wifi_off'}
                    </span>
                    <span className="hidden md:inline">{isUserOnline ? 'تست آفلاین' : 'تست آنلاین'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSimulateIncomingMessage?.(activeConv.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 hover:text-amber-950 text-[11px] font-bold transition-colors border border-amber-200/80 cursor-pointer shadow-2xs"
                    title="شبیه‌سازی دریافت پیام جدید از خریدار برای بررسی نوتیفیکیشن و عدد قرمز"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">forward_to_inbox</span>
                    <span className="hidden lg:inline">تست پیام</span>
                  </button>

                  <button
                    onClick={() => onShowToast(`تماس مستقیم با طرف گفتگو: ۰۹۱۲۳۴۵۶۷۸۹`)}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-colors border border-teal-200/60"
                  >
                    <span className="material-symbols-outlined text-[17px]">call</span>
                    <span className="hidden sm:inline">تماس امن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmConvId(activeConv.id)}
                    className="p-1.5 sm:p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="حذف کل تاریخچه این گفتگو"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              {/* Responsiveness Quick Stats Dropdown Panel */}
              {showResponseDetails && (
                <div className="bg-gradient-to-r from-teal-50/95 via-emerald-50/90 to-slate-50 border-b border-teal-200/60 p-3 sm:p-4 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-teal-700 text-base">query_stats</span>
                      شناسنامه پاسخگویی و فعالیت {activeConv.user.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowResponseDetails(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white/90 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block mb-0.5">وضعیت حاضر</span>
                      <span className="font-extrabold text-xs text-emerald-700 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                        {isUserOnline ? 'آنلاین و آماده پاسخ' : (activeConv.user.lastSeen || 'آفلاین')}
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block mb-0.5">میانگین زمان پاسخ</span>
                      <span className="font-extrabold text-xs text-slate-800">
                        {activeConv.user.responseTimeText || 'کمتر از ۵ دقیقه'}
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block mb-0.5">نرخ پاسخگویی به پیام‌ها</span>
                      <span className="font-extrabold text-xs text-teal-800">
                        {toPersianDigits(activeConv.user.responseRatePercent || 98)}٪ پیام‌ها
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block mb-0.5">سابقه عضویت</span>
                      <span className="font-extrabold text-xs text-slate-700">
                        {activeConv.user.membershipDuration}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pinned Ad Bar linked to this conversation */}
              <div className="bg-stone-50 border-b border-stone-200 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeConv.listing.image}
                    alt={activeConv.listing.title}
                    className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                      {activeConv.listing.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-teal-700">
                        {formatToman(activeConv.listing.price)} تومان
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-emerald-700 bg-emerald-50 text-[10px] px-1.5 py-0.5 rounded font-medium">
                        آگهی فعال
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewListing(activeConv.listing.id)}
                    className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    مشاهده آگهی
                  </button>
                  <button
                    onClick={() => {
                      const dummyListing: Listing = {
                        id: activeConv.listing.id,
                        code: 'IR-' + activeConv.listing.id,
                        title: activeConv.listing.title,
                        price: activeConv.listing.price,
                        category: 'کالای دیجیتال',
                        categoryPath: ['صفحه اصلی', 'کالای دیجیتال', 'موبایل'],
                        city: activeConv.listing.city || 'تهران',
                        neighborhood: activeConv.listing.neighborhood || 'سعادت‌آباد',
                        timeAgo: 'امروز',
                        views: 120,
                        chatsCount: 5,
                        callsCount: 2,
                        condition: 'like-new',
                        images: [activeConv.listing.image],
                        specs: {},
                        description: '',
                        tags: [],
                        status: 'active',
                        seller: {
                          id: activeConv.user.id,
                          name: activeConv.user.name,
                          avatar: activeConv.user.avatar,
                          phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
                          rating: 4.8,
                          dealsCount: 12,
                          memberYears: 2,
                          isVerified: activeConv.user.isVerified,
                          online: activeConv.user.online,
                          responseHours: 'تمام ساعات',
                        },
                      };
                      onOpenOfferModal(dummyListing);
                    }}
                    className="px-3 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">local_offer</span>
                    پیشنهاد قیمت
                  </button>
                </div>
              </div>

              {/* Safety notice ribbon */}
              <div className="bg-amber-50/80 border-b border-amber-200/60 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-800">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-sm">security</span>
                  <span>
                    هشدارهای امنیتی: هرگز پیش از تحویل و بررسی حضوری کالا بیعانه واریز نکنید.
                  </span>
                </div>
                <button
                  onClick={() => onShowToast('راهنمای خرید امن و قوانین آوان مارکت باز شد')}
                  className="font-semibold text-amber-900 underline hover:no-underline hidden sm:inline"
                >
                  راهنمای خرید امن
                </button>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/40">
                {/* Date Header */}
                <div className="flex justify-center">
                  <span className="bg-stone-200/80 text-stone-600 text-[11px] font-medium px-3 py-0.5 rounded-full">
                    امروز
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  const isMine = msg.isOutgoing;

                  if (msg.offer) {
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-md w-full bg-white border border-teal-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-sm">sell</span>
                              پیشنهاد قیمت رسمی
                            </span>
                            <span className="text-[11px] text-stone-400">{msg.time}</span>
                          </div>

                          <div className="bg-stone-50 p-3 rounded-xl mb-3">
                            <div className="text-xs text-stone-500 mb-0.5">مبلغ پیشنهادی خریدار:</div>
                            <div className="text-xl font-black text-teal-900">
                              {formatToman(msg.offer.proposedPrice)} تومان
                            </div>
                            <div className="text-[11px] text-stone-500 mt-1">
                              قیمت اصلی آگهی: {formatToman(activeConv.listing.price)} تومان
                            </div>
                          </div>

                          {msg.text && (
                            <p className="text-xs text-stone-700 mb-3 bg-white p-2 rounded-lg border border-stone-100">
                              💬 &quot;{msg.text}&quot;
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <span className="material-symbols-outlined text-sm animate-spin">
                                hourglass_empty
                              </span>
                              در انتظار تأیید
                            </span>

                            {!isMine && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onShowToast('پیشنهاد خریدار با موفقیت پذیرفته شد')}
                                  className="px-3 py-1 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors"
                                >
                                  پذیرش پیشنهاد
                                </button>
                                <button
                                  onClick={() => onShowToast('پیشنهاد رد شد')}
                                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-200 transition-colors"
                                >
                                  رد
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 group ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={activeConv.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={activeConv.user.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                        />
                      )}

                      {/* Quick delete button on hover for messages */}
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmMsgId({ convId: activeConv.id, msgId: msg.id })}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all text-xs shrink-0"
                          title="حذف این پیام"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}

                      <div
                        className={`max-w-[78%] sm:max-w-md rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                          isMine
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-bl-2xl rounded-br-xs shadow-xs'
                            : 'bg-white text-stone-800 border border-stone-200 rounded-br-2xl rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                            isMine ? 'text-teal-200' : 'text-stone-400'
                          }`}
                        >
                          <span>{msg.time}</span>
                          {isMine && (
                            <span className="material-symbols-outlined text-xs">
                              done_all
                            </span>
                          )}
                        </div>
                      </div>

                      {!isMine && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmMsgId({ convId: activeConv.id, msgId: msg.id })}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all text-xs shrink-0"
                          title="حذف این پیام از گفتگو"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Message Chips */}
              <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] text-stone-400 shrink-0 font-medium">
                  پیام سریع:
                </span>
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendMessage(activeConv.id, chip);
                    }}
                    className="shrink-0 text-xs px-2.5 py-1 bg-stone-100 hover:bg-teal-50 hover:text-teal-700 text-stone-700 rounded-full transition-colors border border-stone-200/60"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-stone-200">
                {isRecording ? (
                  <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 animate-pulse">
                    <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                      در حال ضبط صدا... {toPersianDigits(recordingSeconds)} ثانیه
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsRecording(false);
                          onShowToast('صدای ضبط شده حذف شد');
                        }}
                        className="text-stone-500 hover:text-rose-600 text-xs px-2 py-1"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => {
                          setIsRecording(false);
                          onSendMessage(
                            activeConv.id,
                            `🎤 پیام صوتی (${toPersianDigits(recordingSeconds)} ثانیه)`
                          );
                        }}
                        className="bg-rose-600 text-white text-xs px-3 py-1 rounded-lg font-semibold"
                      >
                        ارسال ویس
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Media attachments */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onShowToast('امکان انتخاب تصویر از گالری فعال شد')}
                        className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors"
                        title="ارسال عکس"
                      >
                        <span className="material-symbols-outlined text-xl">image</span>
                      </button>
                      <button
                        onClick={() => setIsRecording(true)}
                        className="p-2 text-stone-400 hover:text-teal-700 rounded-xl hover:bg-stone-100 transition-colors"
                        title="ارسال ویس"
                      >
                        <span className="material-symbols-outlined text-xl">mic</span>
                      </button>
                    </div>

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="پیام خود را بنویسید..."
                        className="w-full px-4 py-2.5 bg-stone-100 border border-transparent rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                        inputText.trim()
                          ? 'bg-gradient-to-r from-[#ef394a] to-rose-600 text-white hover:opacity-95 shadow-md shadow-rose-500/20 cursor-pointer'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl rotate-180">
                        send
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <span className="material-symbols-outlined text-5xl mb-3 text-stone-300">
                chat_bubble_outline
              </span>
              <h3 className="font-bold text-stone-700 text-lg mb-1">یک گفتگو را انتخاب کنید</h3>
              <p className="text-sm max-w-sm">
                برای شروع چت یا مذاکره با فروشنده، از ستون سمت راست گفتگوی مورد نظر را انتخاب نمایید.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modal for Deleting Conversation */}
      {deleteConfirmConvId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <h3 className="font-black text-slate-900 text-base mb-2">حذف گفتگو</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              آیا از حذف این گفتگو و تمام پیام‌های ردوبدل شده اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmConvId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deleteConfirmConvId;
                  setDeleteConfirmConvId(null);
                  onDeleteConversation?.(targetId);
                  onShowToast('گفتگو با موفقیت حذف گردید.', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Single Message */}
      {deleteConfirmMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[26px]">delete</span>
            </div>
            <h3 className="font-black text-slate-900 text-base mb-2">حذف پیام</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              آیا مایل به حذف این پیام از صفحه چت هستید؟
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMsgId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  const { convId, msgId } = deleteConfirmMsgId;
                  setDeleteConfirmMsgId(null);
                  onDeleteMessage?.(convId, msgId);
                  onShowToast('پیام مورد نظر حذف شد.', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
              >
                حذف پیام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
