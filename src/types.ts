export interface Listing {
  id: string;
  code: string;
  title: string;
  price: number; // in Tomans
  isNegotiable?: boolean;
  isExchangeable?: boolean;
  category: string;
  categoryPath: string[];
  city: string;
  neighborhood: string;
  timeAgo: string;
  views: number;
  chatsCount: number;
  callsCount: number;
  condition: 'new' | 'like-new' | 'used';
  isUrgent?: boolean;
  isFeatured?: boolean;
  isLaddered?: boolean;
  isVerifiedSeller?: boolean;
  hasDiscount?: boolean;
  discountBadge?: string;
  vipTier?: 'diamond' | 'golden' | 'standard' | 'none';
  vipBadge?: string;
  vipExpiryDays?: number;
  stockCount?: number; // Inventory available in warehouse
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
  images: string[];
  specs: Record<string, string>;
  description: string;
  tags: string[];
  mapCoords?: { lat: number; lng: number };
  status: 'active' | 'pending' | 'expired';
  expireDaysLeft?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
  offer?: {
    proposedPrice: number;
    originalPrice: number;
    discountPercent: number;
    validity: string;
    note?: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    role: 'buyer' | 'seller';
    online: boolean;
    lastSeen?: string;
    responseTimeText?: string;
    responseRatePercent?: number;
    membershipDuration: string;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    image: string;
    city: string;
    neighborhood: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'buy' | 'sell';
  messages: ChatMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  bio?: string;
  walletBalance: number;
  rating: number;
  reviewsCount: number;
  memberSince: string;
  isVerified: boolean;
  city?: string;
  district?: string;
  nationalId?: string;
  nationalIdVerified?: boolean;
  phoneVerified?: boolean;
  activeAdsCount?: number;
  savedAdsCount?: number;
  responseHours?: string;
  followersCount?: number;
  followingCount?: number;
  totalVideoViews?: number;
  totalRevenue?: number;
  totalPurchases?: number;
  netProfit?: number;
  freeAdsRemaining?: number; // Starts at 5, decrements on standard ad post down to 0
  subscriptionPlan?: 'free' | 'standard' | 'golden' | 'diamond';
  subscriptionTitle?: string;
  subscriptionExpiry?: string;
  subscriptionRemainingDays?: number;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface ShowcaseComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timeAgo: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface ShowcasePost {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerCity: string;
  isVerifiedSeller: boolean;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  category: string;
  listingId?: string;
  listingTitle?: string;
  listingPrice?: number;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  timeAgo: string;
  comments: ShowcaseComment[];
  tier: 'free' | 'promoted' | 'vip' | 'diamond';
  badge?: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  type: 'deposit' | 'promotion' | 'ladder' | 'withdrawal';
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  referenceId: string;
}

export interface SellerReview {
  id: string;
  sellerId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1 to 5
  dealType?: string;
  isPositive: boolean;
  tags: string[];
  comment: string;
  date: string;
  likesCount?: number;
  sellerResponse?: string;
}

export interface PromoPackage {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  durationDays: number;
  durationTitle: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  badge?: string;
  features: string[];
  popular?: boolean;
}

export interface CartItem {
  id: string;
  listing: Listing;
  quantity: number;
  selectedOption?: string;
  addedAt: string;
}

export type OrderDeliveryStage = 
  | 'order_confirmed' 
  | 'packaging' 
  | 'handed_to_courier' 
  | 'on_the_way' 
  | 'delivered';

export interface CourierInfo {
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  estimatedArrivalMinutes: number;
  currentLocationName: string;
}

export interface OrderCheckoutInfo {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  deliveryOption: 'express_today' | 'regular_post' | 'courier_instant' | 'tipax_safe';
  paymentMethod: 'wallet' | 'shaparak_gateway' | 'cod';
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryStage?: OrderDeliveryStage;
  courier?: CourierInfo;
  createdAt: string;
  checkoutInfo: OrderCheckoutInfo;
  trackingCode: string;
  estimatedDeliveryDate?: string;
}

export type ScreenType = 
  | 'home' 
  | 'categories' 
  | 'showcase'
  | 'listing-details' 
  | 'post-ad' 
  | 'dashboard' 
  | 'admin'
  | 'chat' 
  | 'cart'
  | 'checkout'
  | 'auth';
