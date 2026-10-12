import React, { useState, useEffect, useRef } from 'react';
import {
  ScreenType,
  Listing,
  Conversation,
  ChatMessage,
  UserProfile,
  WalletTransaction,
  SellerReview,
  ShowcasePost,
  CartItem,
  Order,
} from './types';
import {
  initialListings,
  initialConversations,
  currentUser as defaultUser,
  initialWalletTransactions,
  initialShowcasePosts,
  initialOrders,
  formatToman,
  toPersianDigits,
} from './data/mockData';

// Components
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { ToastNotification } from './components/ToastNotification';
import { CitySelectorModal } from './components/CitySelectorModal';
import { OfferModal } from './components/OfferModal';
import { WalletModal } from './components/WalletModal';
import { CartModal } from './components/CartModal';
import { AndroidAppModal } from './components/AndroidAppModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { CategoryFeedScreen } from './screens/CategoryFeedScreen';
import { ListingDetailsScreen } from './screens/ListingDetailsScreen';
import { PostAdScreen } from './screens/PostAdScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AuthScreen } from './screens/AuthScreen';
import { ShowcaseFeedScreen } from './screens/ShowcaseFeedScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { OnlineSupportWidget } from './components/OnlineSupportWidget';

type DeviceMode = 'responsive' | 'ios' | 'android';

const initialReviews: SellerReview[] = [
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
    sellerId: 'user_kamran',
    authorId: 'u_103',
    authorName: 'مریم حسینی',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    dealType: 'معامله حضوری',
    isPositive: true,
    tags: ['کالای مطابق توضیحات', 'خوش‌قولی'],
    comment: 'گوشی رو تحویل گرفتم، دقیقا مطابق عکس‌ها و توضیحات ثبت شده بود. ممنون از آقای رضوانی.',
    date: '۳ روز پیش',
    likesCount: 6,
  },
];

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState('تهران');
  const [selectedDistrict, setSelectedDistrict] = useState('همه محله‌ها');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAndroidAppModalOpen, setIsAndroidAppModalOpen] = useState(false);

  // Shopping Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart_init_1',
      listing: initialListings[0], // iPhone 13 Pro Max
      quantity: 1,
      addedAt: 'هم‌اکنون',
    },
  ]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Cart total items count
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Action Handlers
  const handleAddToCart = (listing: Listing, quantity: number = 1) => {
    const availableStock = listing.stockCount ?? 5;
    if (availableStock === 0) {
      showToast(`متاسفانه کالای «${listing.title}» در حال حاضر در انبار ناموجود است.`, 'warning');
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.listing.id === listing.id);
      if (existingIndex >= 0) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(availableStock, currentQty + quantity);
        if (newQty === currentQty) {
          showToast(`حداکثر موجودی قابل سفارش این کالا (${toPersianDigits(availableStock)} عدد) در سبد شما قرار دارد.`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        showToast(`تعداد «${listing.title}» در سبد خرید به ${toPersianDigits(newQty)} عدد افزایش یافت.`, 'success');
        return updated;
      } else {
        const toAddQty = Math.min(availableStock, quantity);
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          listing,
          quantity: toAddQty,
          addedAt: 'هم‌اکنون',
        };
        showToast(`«${listing.title}» با موفقیت به سبد خرید اضافه شد.`, 'success');
        return [newItem, ...prev];
      }
    });
  };

  const handleBuyNow = (listing: Listing, quantity: number = 1) => {
    handleAddToCart(listing, quantity);
    setIsCartModalOpen(true);
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.listing.stockCount ?? 5;
          const cappedQty = Math.min(maxStock, newQuantity);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('کالا از سبد خرید حذف شد.');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Also record transaction in user profile / dashboard
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      title: `خرید سفارش #${order.orderNumber}`,
      type: 'promotion',
      amount: order.total,
      date: 'هم‌اکنون',
      status: 'success',
      referenceId: order.trackingCode,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setUser((prev) => ({
      ...prev,
      totalPurchases: (prev.totalPurchases || 0) + 1,
    }));
  };

  // Device Simulator Mode (Desktop responsive, iPhone 15 Pro, Pixel 8)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');

  // Theme State: Enforce Clean Light White Theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('bazar_theme', 'light');
  }, []);

  // Bookmarked Ads Set
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(['ad_849203', 'ad_s24ultra'])
  );

  // Listings State
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedListing, setSelectedListing] = useState<Listing>(initialListings[0]);

  // User State
  const [user, setUser] = useState<UserProfile>(defaultUser);

  // Wallet Transactions & Reviews
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialWalletTransactions);
  const [reviews, setReviews] = useState<SellerReview[]>(initialReviews);
  const [showcasePosts, setShowcasePosts] = useState<ShowcasePost[]>(initialShowcasePosts);

  // Chat State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    initialConversations[0].id
  );

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerTargetListing, setOfferTargetListing] = useState<Listing | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');

  // Automatically restore session from backend on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.log('Auth check error:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    showToast('از حساب کاربری خارج شدید');
    handleNavigate('auth');
  };

  const handleSwitchUserRole = (role: 'admin1' | 'admin2' | 'regular') => {
    if (role === 'admin1') {
      setUser({
        id: 'admin_1',
        name: 'امیر مازنی (سازنده و مدیر کل)',
        phone: '۰۹۱۲۳۴۵۶۷۸۹',
        email: 'amir.mazani9988@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'مدیر کل و بنیان‌گذار رسمی سامانه آوان مارکت',
        walletBalance: 25000000,
        rating: 5.0,
        reviewsCount: 120,
        memberSince: 'سازنده اصلی',
        isVerified: true,
        city: 'تهران',
        district: 'سعادت‌آباد',
        nationalId: '۰۰۱۸۳۷۲۹۴۱',
        nationalIdVerified: true,
        phoneVerified: true,
        activeAdsCount: 15,
        savedAdsCount: 8,
        responseHours: '۲۴ ساعته',
        followersCount: 15400,
        followingCount: 120,
        totalVideoViews: 189000,
        subscriptionPlan: 'diamond',
        subscriptionTitle: 'مدیر کل ارشد سیستم',
        subscriptionRemainingDays: 365,
        subscriptionExpiry: 'اعتبار دائمی ادمین کل',
        freeAdsRemaining: 999,
        role: 'admin',
        isAdmin: true,
      });
      showToast('به اکانت «مدیر ارشد ۱ (امیر مازنی)» سوئیچ کردید. دسترسی کامل ادمین فعال شد.', 'success');
    } else if (role === 'admin2') {
      setUser({
        id: 'admin_2',
        name: 'امیرحسین رضایی (مدیر ارشد پشتیبانی)',
        phone: '۰۹۱۲۲۲۲۲۲۲۲',
        email: 'rezaei.support@bazar.ir',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'مدیریت پشتیبانی آنلاین و پیگیری مشکلات آگهی‌ها',
        walletBalance: 10000000,
        rating: 5.0,
        reviewsCount: 85,
        memberSince: 'مدیر پشتیبانی',
        isVerified: true,
        city: 'تهران',
        district: 'ونک',
        nationalId: '۰۰۲۹۳۸۱۷۴۲',
        nationalIdVerified: true,
        phoneVerified: true,
        activeAdsCount: 8,
        savedAdsCount: 5,
        responseHours: '۸ صبح تا ۱۲ شب',
        followersCount: 8400,
        followingCount: 50,
        totalVideoViews: 65000,
        subscriptionPlan: 'diamond',
        subscriptionTitle: 'مدیر ارشد پشتیبانی',
        subscriptionRemainingDays: 365,
        subscriptionExpiry: 'اعتبار ادمین فنی',
        freeAdsRemaining: 999,
        role: 'admin',
        isAdmin: true,
      });
      showToast('به اکانت «مدیر ارشد ۲ (امیرحسین رضایی)» سوئیچ کردید. دسترسی ادمین فعال شد.', 'success');
    } else {
      setUser({
        id: 'user_norm_101',
        name: 'رضا محمدی (کاربر عادی آگهی‌دهنده)',
        phone: '۰۹۳۵۹۹۹۸۸۷۷',
        email: 'reza.mohammadi@example.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'فروشنده خانگی وسایل برقی و شخصی',
        walletBalance: 150000,
        rating: 4.8,
        reviewsCount: 3,
        memberSince: '۳ ماه پیش',
        isVerified: true,
        city: 'تهران',
        district: 'نرمک',
        nationalId: '۰۰۴۸۱۷۲۹۳۸',
        nationalIdVerified: true,
        phoneVerified: true,
        activeAdsCount: 2,
        savedAdsCount: 4,
        responseHours: '۱۰ صبح تا ۸ شب',
        followersCount: 45,
        followingCount: 12,
        totalVideoViews: 1200,
        subscriptionPlan: 'standard',
        subscriptionTitle: 'اشتراک عادی کاربر',
        subscriptionRemainingDays: 14,
        subscriptionExpiry: '۱۴ روز باقیمانده',
        freeAdsRemaining: 3,
        role: 'user',
        isAdmin: false,
      });
      showToast('به اکانت «کاربر عادی» سوئیچ کردید. دسترسی ادمین غیرفعال گردید.', 'info');
    }
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('آگهی از نشان‌شده‌ها حذف شد');
      } else {
        next.add(id);
        showToast('آگهی به نشان‌شده‌ها اضافه شد');
      }
      return next;
    });
  };

  // Refs for asynchronous timeouts to prevent stale closures
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const activeConvIdRef = useRef(activeConversationId);
  activeConvIdRef.current = activeConversationId;

  // Mark a conversation as read and reset its unreadCount
  const handleMarkAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId && c.unreadCount > 0) {
          return {
            ...c,
            unreadCount: 0,
            messages: c.messages.map((m) =>
              !m.isOutgoing ? { ...m, status: 'read' as const } : m
            ),
          };
        }
        return c;
      })
    );
  };

  // Automatically mark active conversation as read when viewing chat screen
  useEffect(() => {
    if (currentScreen === 'chat' && activeConversationId) {
      handleMarkAsRead(activeConversationId);
    }
  }, [currentScreen, activeConversationId]);

  // Handlers
  const handleNavigate = (screen: ScreenType, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setCurrentScreen(screen);
    if (screen === 'chat' && activeConversationId) {
      handleMarkAsRead(activeConversationId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentScreen('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    handleMarkAsRead(convId);
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentScreen('listing-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChat = (listing: Listing) => {
    const existing = conversations.find((c) => c.listing.id === listing.id);
    if (existing) {
      setActiveConversationId(existing.id);
      handleMarkAsRead(existing.id);
    } else {
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        user: {
          id: listing.seller.id,
          name: listing.seller.name,
          avatar: listing.seller.avatar,
          isVerified: listing.seller.isVerified,
          role: 'seller',
          online: listing.seller.online,
          membershipDuration: `${listing.seller.memberYears} سال در بازار`,
        },
        listing: {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          image: listing.images[0],
          city: listing.city,
          neighborhood: listing.neighborhood,
        },
        lastMessage: 'شروع گفتگو پیرامون آگهی',
        lastMessageTime: 'هم‌اکنون',
        unreadCount: 0,
        type: 'buy',
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
    setCurrentScreen('chat');
  };

  const handleAdCreated = (newAd: Listing) => {
    setListings((prev) => [newAd, ...prev]);
    setSelectedListing(newAd);
    setUser((prev) => {
      const currentFree = prev.freeAdsRemaining !== undefined ? prev.freeAdsRemaining : 5;
      const updatedFree = Math.max(0, currentFree - 1);
      return {
        ...prev,
        activeAdsCount: (prev.activeAdsCount || 0) + 1,
        freeAdsRemaining: updatedFree,
      };
    });
    showToast('آگهی شما با موفقیت ثبت و تأیید شد!', 'success');
    setCurrentScreen('listing-details');
  };

  const handleOpenOfferModal = (listing: Listing) => {
    setOfferTargetListing(listing);
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = (amount: number, message: string) => {
    if (!offerTargetListing) return;

    const existingIndex = conversations.findIndex(
      (c) => c.listing.id === offerTargetListing.id
    );

    const newOfferMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      text: message,
      time: 'هم‌اکنون',
      isOutgoing: true,
      status: 'sent',
      offer: {
        proposedPrice: amount,
        originalPrice: offerTargetListing.price,
        discountPercent: Math.max(
          1,
          Math.round(((offerTargetListing.price - amount) / offerTargetListing.price) * 100)
        ),
        validity: '۲۴ ساعت',
        note: message,
        status: 'pending',
      },
    };

    if (existingIndex >= 0) {
      const updated = [...conversations];
      updated[existingIndex].messages = [...updated[existingIndex].messages, newOfferMsg];
      updated[existingIndex].lastMessage = `پیشنهاد قیمت جدید: ${amount.toLocaleString('fa-IR')} تومان`;
      updated[existingIndex].lastMessageTime = 'هم‌اکنون';
      setConversations(updated);
      setActiveConversationId(updated[existingIndex].id);
    } else {
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        user: {
          id: offerTargetListing.seller.id,
          name: offerTargetListing.seller.name,
          avatar: offerTargetListing.seller.avatar,
          isVerified: offerTargetListing.seller.isVerified,
          role: 'seller',
          online: offerTargetListing.seller.online,
          membershipDuration: `${offerTargetListing.seller.memberYears} سال در بازار`,
        },
        listing: {
          id: offerTargetListing.id,
          title: offerTargetListing.title,
          price: offerTargetListing.price,
          image: offerTargetListing.images[0],
          city: offerTargetListing.city,
          neighborhood: offerTargetListing.neighborhood,
        },
        lastMessage: `پیشنهاد قیمت: ${amount.toLocaleString('fa-IR')} تومان`,
        lastMessageTime: 'هم‌اکنون',
        unreadCount: 0,
        type: 'buy',
        messages: [newOfferMsg],
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }

    showToast('پیشنهاد قیمت رسمی ارسال شد و در گفتگوی شما ثبت گردید');
    setCurrentScreen('chat');
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      text,
      time: 'هم‌اکنون',
      isOutgoing: true,
      status: 'sent',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0,
            lastMessage: text,
            lastMessageTime: 'هم‌اکنون',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Realistic customer response simulation after 2.5 seconds
    setTimeout(() => {
      setConversations((prev) => {
        const targetConv = prev.find((c) => c.id === conversationId);
        if (!targetConv) return prev;

        const customerReplies = [
          'سلام، خیلی ممنون از پاسختون. هماهنگ می‌کنم حضوری خدمت برسم.',
          'بله حتماً، شرایط بسیار مناسبه. شماره تماس یا لوکیشن دقیق رو بفرمایید.',
          'عالیه، من خریدار قطعی هستم. در اولین فرصت معامله رو انجام میدیم.',
          'درود، متشکرم. تایید شد و منتظر هماهنگی نهایی با شما هستم.',
        ];
        const replyText = customerReplies[Math.floor(Math.random() * customerReplies.length)];

        // Check if user is currently looking at this conversation
        const isCurrentlyViewing =
          currentScreenRef.current === 'chat' &&
          activeConvIdRef.current === conversationId;

        const replyMsg: ChatMessage = {
          id: 'msg_reply_' + Date.now(),
          senderId: targetConv.user.id,
          senderName: targetConv.user.name,
          text: replyText,
          time: 'هم‌اکنون',
          isOutgoing: false,
          status: isCurrentlyViewing ? 'read' : 'sent',
        };

        if (!isCurrentlyViewing) {
          showToast(`پیام جدید از طرف ${targetConv.user.name}: «${replyText.slice(0, 32)}...»`, 'info');
        }

        return prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              unreadCount: isCurrentlyViewing ? 0 : c.unreadCount + 1,
              lastMessage: replyText,
              lastMessageTime: 'هم‌اکنون',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        });
      });
    }, 2500);
  };

  const handleSimulateCustomerMessage = (conversationId: string) => {
    setConversations((prev) => {
      const targetConv = prev.find((c) => c.id === conversationId);
      if (!targetConv) return prev;

      const testMessages = [
        'سلام! آگهی شما رو دیدم، هنوز موجوده؟',
        'سلام وقت بخیر، تخفیف جزئی پای معامله امکان داره؟',
        'درود، امکان تحویل یا ارسال با پیک امروز عصر هست؟',
        'سلام، مایل به خرید نقدی هستم. چه ساعتی هماهنگ کنیم؟',
      ];
      const text = testMessages[Math.floor(Math.random() * testMessages.length)];
      const isViewing =
        currentScreenRef.current === 'chat' &&
        activeConvIdRef.current === conversationId;

      const newMsg: ChatMessage = {
        id: 'msg_sim_' + Date.now(),
        senderId: targetConv.user.id,
        senderName: targetConv.user.name,
        text,
        time: 'هم‌اکنون',
        isOutgoing: false,
        status: isViewing ? 'read' : 'sent',
      };

      showToast(`پیام تستی دریافت شد از ${targetConv.user.name}: «${text}»`, 'info');

      return prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: isViewing ? 0 : c.unreadCount + 1,
            lastMessage: text,
            lastMessageTime: 'هم‌اکنون',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      });
    });
  };

  const handleDeleteMessage = (conversationId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const remaining = c.messages.filter((m) => m.id !== messageId);
          const last = remaining[remaining.length - 1];
          return {
            ...c,
            messages: remaining,
            lastMessage: last ? (last.offer ? 'پیشنهاد قیمت' : last.text) : 'گفتگو بدون پیام',
            lastMessageTime: last ? last.time : 'هم‌اکنون',
          };
        }
        return c;
      })
    );
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== conversationId);
      if (activeConversationId === conversationId && remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenewAd = (adId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === adId ? { ...l, isLaddered: true, timeAgo: 'هم‌اکنون' } : l))
    );
    showToast('آگهی شما با موفقیت نردبان و در صدر آگهی‌ها قرار گرفت.');
  };

  const handleDeleteAd = (adId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== adId));
    showToast('آگهی از سیستم حذف گردید');
  };

  const handleUpdateListing = (updatedAd: Listing) => {
    setListings((prev) => prev.map((l) => (l.id === updatedAd.id ? updatedAd : l)));
    if (selectedListing.id === updatedAd.id) {
      setSelectedListing(updatedAd);
    }
    showToast('آگهی با موفقیت ویرایش شد.');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    showToast('اطلاعات کاربری با موفقیت به‌روز شد.');
  };

  const handleDeposit = (amount: number, description: string = 'افزایش موجودی کیف پول') => {
    setUser((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance + amount),
    }));

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      title: description,
      type: amount >= 0 ? 'deposit' : 'promotion',
      amount,
      date: 'هم‌اکنون',
      status: 'success',
      referenceId: 'REF-' + Math.floor(1000000 + Math.random() * 9000000),
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddReview = (newReview: SellerReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleAddShowcasePost = (newPost: ShowcasePost, tierCost: number) => {
    setShowcasePosts((prev) => [newPost, ...prev]);
    if (tierCost > 0) {
      handleDeposit(-tierCost, `هزینه انتشار پست ویدیویی (${newPost.tier === 'vip' ? 'بسته طلایی VIP' : 'بسته ویژه اکسپلور'})`);
    }
    showToast('پست ویدیویی شما با موفقیت در ویترین بازار منتشر شد!');
  };

  const handleToggleShowcaseLike = (postId: string) => {
    setShowcasePosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddShowcaseComment = (postId: string, text: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      userName: user.name,
      userAvatar: user.avatar,
      text,
      timeAgo: 'هم‌اکنون',
      likesCount: 0,
      isLiked: false,
    };
    setShowcasePosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...p.comments],
          };
        }
        return p;
      })
    );
    showToast('دیدگاه شما با موفقیت ثبت شد.');
  };

  const totalUnreadChats = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const bookmarkedListings = listings.filter((l) => bookmarkedIds.has(l.id));

  // Render the current screen
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            listings={listings}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartModalOpen(true)}
            onSearch={handleSearch}
          />
        );
      case 'categories':
        return (
          <CategoryFeedScreen
            listings={listings}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />
        );
      case 'showcase':
        return (
          <ShowcaseFeedScreen
            posts={showcasePosts}
            listings={listings}
            user={user}
            walletBalance={user.walletBalance}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onOpenWallet={() => setIsWalletModalOpen(true)}
            onAddPost={handleAddShowcasePost}
            onToggleLike={handleToggleShowcaseLike}
            onAddComment={handleAddShowcaseComment}
          />
        );
      case 'listing-details':
        return (
          <ListingDetailsScreen
            listing={selectedListing}
            allListings={listings}
            currentUser={user}
            reviews={reviews}
            onAddReview={handleAddReview}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            onStartChat={handleStartChat}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isBookmarked={bookmarkedIds.has(selectedListing.id)}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
          />
        );
      case 'post-ad':
        return (
          <PostAdScreen
            onAdCreated={handleAdCreated}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            user={user}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            listings={listings}
            bookmarkedListings={bookmarkedListings}
            transactions={transactions}
            reviews={reviews}
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onShowToast={showToast}
            onRenewAd={handleRenewAd}
            onDeleteAd={handleDeleteAd}
            onUpdateAd={handleUpdateListing}
            onUpdateUser={handleUpdateUser}
            onToggleBookmark={handleToggleBookmark}
            onDeposit={handleDeposit}
            bookmarkedCount={bookmarkedIds.size}
          />
        );
      case 'admin':
        return (
          <AdminDashboardScreen
            listings={listings}
            user={user}
            orders={orders}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteAd}
            onUpdateUser={handleUpdateUser}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onOpenOfferModal={handleOpenOfferModal}
            onViewListing={(id) => {
              const target = listings.find((l) => l.id === id);
              if (target) {
                handleSelectListing(target);
              }
            }}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onMarkAsRead={handleMarkAsRead}
            onSimulateIncomingMessage={handleSimulateCustomerMessage}
            onDeleteMessage={handleDeleteMessage}
            onDeleteConversation={handleDeleteConversation}
          />
        );
      case 'auth':
        return (
          <AuthScreen
            onLoginSuccess={(loggedUser) => setUser(loggedUser)}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <HomeScreen
            listings={listings}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
          />
        );
    }
  };

  const appContent = (
    <div className="min-h-screen bg-[#ffffff] text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-700 selection:text-white pb-20 md:pb-0">
      {/* Global Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        selectedCity={selectedCity}
        selectedDistrict={selectedDistrict}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        unreadChatsCount={totalUnreadChats}
        selectedCategory={selectedCategory}
        cartItemsCount={totalCartCount}
        onOpenCart={() => setIsCartModalOpen(true)}
        onOpenAndroidApp={() => setIsAndroidAppModalOpen(true)}
        listings={listings}
        onSelectListing={handleSelectListing}
        onShowToast={showToast}
        onSwitchUserRole={handleSwitchUserRole}
      />

      {/* Main Screen Body */}
      <main className="flex-1 w-full">{renderScreenContent()}</main>

      {/* Global Footer (shown on larger screens or non-chat screens) */}
      {currentScreen !== 'chat' && currentScreen !== 'auth' && (
        <Footer onNavigate={handleNavigate} onShowToast={showToast} />
      )}

      {/* Mobile Bottom Navigation (Ergonomic for touch on iOS & Android) */}
      <MobileNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        unreadCount={totalUnreadChats}
      />

      {/* City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        selectedDistrict={selectedDistrict}
        onSelect={(city, dist) => {
          setSelectedCity(city);
          setSelectedDistrict(dist);
          showToast(`شهر به «${city}» تغییر کرد`);
        }}
      />

      {/* Shopping Cart & Checkout Modal (سبد خرید و محاسبه هزینه و تسویه حساب) */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        user={user}
        orders={orders}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        onDeposit={handleDeposit}
        onUpdateUser={handleUpdateUser}
        onShowToast={showToast}
        onNavigateToCategories={() => {
          setIsCartModalOpen(false);
          handleNavigate('categories');
        }}
      />

      {/* Official Android App Download Modal (اپلیکیشن اختصاصی اندروید) */}
      <AndroidAppModal
        isOpen={isAndroidAppModalOpen}
        onClose={() => setIsAndroidAppModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Offer Negotiation Modal (Screen 7) */}
      {offerTargetListing && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          listing={offerTargetListing}
          onSubmitOffer={handleSubmitOffer}
        />
      )}

      {/* User Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        user={user}
        walletBalance={user.walletBalance}
        onDeposit={handleDeposit}
        onUpdateUser={handleUpdateUser}
        transactions={transactions}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Online 24/7 Admin Support Floating Chat Widget Across Entire Site */}
      <OnlineSupportWidget
        userName={user?.name || 'کاربر بازار'}
        userPhone={user?.phone || '۰۹۱۲***۶۷۸۹'}
        isAdmin={Boolean(user?.role === 'admin' || user?.isAdmin || user?.phone === '۰۹۱۲۳۴۵۶۷۸۹')}
        onNavigateToAdmin={() => handleNavigate('admin')}
        onShowToast={showToast}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#059669]/15 selection:text-[#059669]">
      {/* Main Website Viewport */}
      <div className="flex-1 w-full flex flex-col min-h-screen">
        {appContent}
      </div>
    </div>
  );
}
