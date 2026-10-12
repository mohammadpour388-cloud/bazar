import React, { useState, useRef } from 'react';
import { ShowcasePost, ShowcaseComment, Listing, ScreenType, UserProfile } from '../types';
import { formatToman, toPersianDigits } from '../data/mockData';

interface ShowcaseFeedScreenProps {
  posts: ShowcasePost[];
  listings: Listing[];
  user: UserProfile;
  walletBalance: number;
  onSelectListing: (listing: Listing) => void;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenWallet: () => void;
  onAddPost: (newPost: ShowcasePost, tierCost: number) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const ShowcaseFeedScreen: React.FC<ShowcaseFeedScreenProps> = ({
  posts,
  listings,
  user,
  walletBalance,
  onSelectListing,
  onNavigate,
  onShowToast,
  onOpenWallet,
  onAddPost,
  onToggleLike,
  onAddComment,
}) => {
  // Navigation Tabs in Showcase: 'explore' | 'stories' | 'profile'
  const [mainTab, setMainTab] = useState<'explore' | 'stories' | 'profile'>('explore');
  const [profileSubTab, setProfileSubTab] = useState<'my-videos' | 'saved' | 'following' | 'followers'>('my-videos');
  const [activeCategory, setActiveCategory] = useState<string>('همه');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(posts[0]?.id || null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [followedSellers, setFollowedSellers] = useState<Set<string>>(new Set(['seller_pharma', 'seller_digi']));
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [selectedStory, setSelectedStory] = useState<ShowcasePost | null>(null);
  const [fullscreenReelPost, setFullscreenReelPost] = useState<ShowcasePost | null>(null);
  const [heartBurstPostId, setHeartBurstPostId] = useState<string | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [storyReply, setStoryReply] = useState<string>('');
  const lastTapRef = useRef<{ [postId: string]: number }>({});

  // Upload Form State
  const [uploadMediaType, setUploadMediaType] = useState<'video' | 'image'>('video');
  const [uploadMediaUrl, setUploadMediaUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('کالای دیجیتال');
  const [uploadListingId, setUploadListingId] = useState<string>(listings[0]?.id || '');
  const [uploadTier, setUploadTier] = useState<'free' | 'promoted' | 'vip' | 'diamond'>('promoted');

  const categories = [
    { id: 'همه', name: 'همه', icon: 'apps' },
    { id: 'کالای دیجیتال', name: 'کالای دیجیتال', icon: 'devices' },
    { id: 'دارو، مکمل و سلامت', name: 'دارو و سلامت', icon: 'medication' },
    { id: 'خانه و آشپزخانه', name: 'خانه و آشپزخانه', icon: 'chair' },
    { id: 'وسایل نقلیه', name: 'وسایل نقلیه', icon: 'directions_car' },
    { id: 'املاک', name: 'املاک', icon: 'apartment' },
    { id: 'وسایل شخصی', name: 'مد و پوشاک', icon: 'checkroom' },
    { id: 'خدمات', name: 'خدمات', icon: 'home_repair_service' },
  ];

  // VIP Subscription Tiers: Diamond 6m, Golden 3m, Standard 1m
  const tierPrices: Record<'free' | 'promoted' | 'vip' | 'diamond', number> = {
    free: 0,
    promoted: 340000,
    vip: 890000,
    diamond: 1490000,
  };

  const sampleVideos = [
    { title: 'بررسی تخصصی گوشی هوشمند', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { title: 'تور بازدید ویلا و املاک لوکس', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { title: 'آنباکسینگ مکمل و پروتئین اصل', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4' },
    { title: 'تست فنی خودرو و سواری', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
  ];

  // Dummy followers / following data for profile tab
  const followingList = [
    { id: 'seller_pharma', name: 'داروخانه و مکمل معتمد', avatar: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80', category: 'دارو، مکمل و سلامت', followers: '۲.۴K' },
    { id: 'seller_digi', name: 'فروشگاه معتمد دیجیتال', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPrNmRGkzZW4VHVjt9Bz4DusTs3FOgbCfqfk46y4eN0YaSgJZBcotMe2toQoqbzxpkIv0viRqy7i-7ApBgZQnrISULlpLJG1k5b7vXXeo9mhrjHiSo7L_b3eoW-hF6PQYzMBQh_a1sTalkcR8qQz5tIsUnNI2IF9Mqd38HxYdQlE0PkOu7KlEP2dPVyLtkitEXSVb4nM2kcaxxQfubjiQVdl7iA_TibAhbp6bONhrq2uxGLPgbXuHyoQ', category: 'کالای دیجیتال', followers: '۸.۹K' },
    { id: 'seller_estate', name: 'املاک بزرگ نیاوران', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80', category: 'املاک و مستغلات', followers: '۵.۱K' },
    { id: 'seller_auto', name: 'نمایشگاه اتومبیل پایتخت', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', category: 'وسایل نقلیه', followers: '۳.۲K' },
  ];

  const followersList = [
    { id: 'f1', name: 'امیرحسین کاظمی', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', city: 'تهران', isFollowBack: true },
    { id: 'f2', name: 'مریم سلیمانی', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', city: 'کرج', isFollowBack: false },
    { id: 'f3', name: 'پوریا مرادی', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80', city: 'شیراز', isFollowBack: true },
    { id: 'f4', name: 'نگار احمدی', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', city: 'اصفهان', isFollowBack: true },
  ];

  const filteredPosts = [...posts]
    .filter((p) => {
      if (activeCategory === 'همه') return true;
      return p.category === activeCategory || p.category.includes(activeCategory);
    })
    .sort((a, b) => {
      // 1. VIP Subscription Priority ALWAYS first! Diamond (3000) > VIP Golden (2000) > Promoted (1000) > Free (0)
      const getTierWeight = (tier: string) => {
        if (tier === 'diamond') return 3000;
        if (tier === 'vip') return 2000;
        if (tier === 'promoted') return 1000;
        return 0;
      };
      const tierDiff = getTierWeight(b.tier) - getTierWeight(a.tier);
      if (tierDiff !== 0) return tierDiff;
      return b.viewsCount - a.viewsCount;
    });

  const handleVideoTap = (postId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[postId] || 0;
    if (now - lastTap < 350) {
      // Double tap detected - heart burst!
      const targetPost = posts.find((p) => p.id === postId);
      if (targetPost && !targetPost.isLiked) {
        onToggleLike(postId);
      }
      setHeartBurstPostId(postId);
      setTimeout(() => setHeartBurstPostId(null), 900);
      lastTapRef.current[postId] = 0;
    } else {
      lastTapRef.current[postId] = now;
      // Toggle sound or play
      setIsMuted((prev) => !prev);
    }
  };

  const toggleExpandCaption = (postId: string) => {
    setExpandedCaptions((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const myUploadedPosts = posts.filter((p) => p.sellerId === user.id || p.sellerName === user.name);
  const mySavedPosts = posts.filter((p) => savedPosts.has(p.id));

  const handleToggleFollow = (sellerId: string, sellerName: string) => {
    setFollowedSellers((prev) => {
      const next = new Set(prev);
      if (next.has(sellerId)) {
        next.delete(sellerId);
        onShowToast(`دنبال کردن «${sellerName}» لغو شد.`);
      } else {
        next.add(sellerId);
        onShowToast(`فروشنده «${sellerName}» با موفقیت دنبال شد.`);
      }
      return next;
    });
  };

  const handleToggleSave = (postId: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        onShowToast('ویدیو از نشان‌شده‌ها حذف شد.');
      } else {
        next.add(postId);
        onShowToast('ویدیو به نشان‌شده‌های شما اضافه شد.');
      }
      return next;
    });
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
    onShowToast('دیدگاه شما با موفقیت ثبت و منتشر گردید.', 'success');
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCaption.trim()) {
      onShowToast('لطفاً توضیحاتی برای ویدیو یا عکس خود وارد نمایید.', 'warning');
      return;
    }

    const cost = tierPrices[uploadTier];
    if (cost > walletBalance) {
      onShowToast(`موجودی کیف پول شما کافی نیست! برای این پکیج نیاز به ${formatToman(cost)} تومان دارید.`, 'warning');
      onOpenWallet();
      return;
    }

    const linkedListing = listings.find((l) => l.id === uploadListingId);

    const newPost: ShowcasePost = {
      id: `post_${Date.now()}`,
      sellerId: user.id,
      sellerName: user.name,
      sellerAvatar: user.avatar,
      sellerCity: user.city || 'تهران',
      isVerifiedSeller: user.isVerified,
      mediaType: uploadMediaType,
      mediaUrl: uploadMediaUrl,
      thumbnailUrl: linkedListing?.images[0] || user.avatar,
      caption: uploadCaption.trim(),
      category: uploadCategory,
      listingId: linkedListing?.id,
      listingTitle: linkedListing?.title,
      listingPrice: linkedListing?.price,
      likesCount: 1,
      isLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      timeAgo: 'لحظاتی پیش',
      tier: uploadTier,
      badge: uploadTier === 'diamond' ? '💎 اشتراک الماس ۶ ماهه' : uploadTier === 'vip' ? '🌟 اشتراک طلایی ۳ ماهه' : uploadTier === 'promoted' ? '⚡ اشتراک معمولی ۱ ماهه' : undefined,
      comments: [],
    };

    onAddPost(newPost, cost);
    setIsUploadModalOpen(false);
    setUploadCaption('');
    setMainTab('profile');
    setProfileSubTab('my-videos');
    onShowToast('پست ویدیویی شما با موفقیت در اکسپلور بازار منتشر شد!', 'success');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-36 flex flex-col gap-5 text-right">
      {/* 1. Header with Channel Navigation & Action Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#005c55] via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[28px]">movie</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                ویترین و اکسپلور ویدیویی بازار
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#005c55] border border-emerald-200 text-[10px] font-extrabold shadow-2xs">
                اکسپلور کالاها
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ویدیوهای تست کالا، آنباکسینگ و معرفی زنده محصولات توسط فروشندگان برگزیده
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Wallet Trigger Pill */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200/70 text-[#005c55] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="مشاهده و شارژ کیف پول"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>موجودی: {formatToman(walletBalance)} ت</span>
            <span className="material-symbols-outlined text-[14px]">add_circle</span>
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ba0035] to-rose-600 hover:from-[#9e002d] hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">video_call</span>
            <span>آپلود ویدیو جدید</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: EXPLORE & VIDEO FEED ======================= */}
      {mainTab === 'explore' && (
        <div className="flex flex-col gap-5">
          {/* Stories Tray Bar */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xs border border-slate-100 flex items-center gap-4 overflow-x-auto scrollbar-none">
            {/* User's Add Story Bubble */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-slate-300 group-hover:border-[#005c55] transition-colors flex items-center justify-center">
                <img
                  src={user.avatar}
                  alt="پروفایل شما"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#005c55] text-white flex items-center justify-center text-xs font-black shadow-md">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-700 max-w-[70px] truncate text-center">
                استوری شما
              </span>
            </button>

            {/* Other Sellers' Active Stories */}
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedStory(post)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform flex items-center justify-center shadow-xs">
                  <img
                    src={post.sellerAvatar}
                    alt={post.sellerName}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 max-w-[75px] truncate text-center">
                  {post.sellerName}
                </span>
              </button>
            ))}
          </div>

          {/* Category & View Switcher Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none bg-white p-2 sm:p-3 rounded-2xl shadow-xs border border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#005c55] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'feed'
                    ? 'bg-white text-[#005c55] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="نمای فید ویدیویی"
              >
                <span className="material-symbols-outlined text-[18px]">view_stream</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#005c55] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="نمای شبکه‌ای اکسپلور"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>

          {/* Grid View Mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setViewMode('feed');
                    setPlayingVideoId(post.id);
                  }}
                  className="group relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xs cursor-pointer border border-slate-100"
                >
                  <img
                    src={post.thumbnailUrl || post.sellerAvatar}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3 text-white">
                    <div className="flex items-center justify-between">
                      {post.badge ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ba0035] text-white text-[9px] font-extrabold shadow-sm">
                          {post.badge}
                        </span>
                      ) : <span />}
                      <div className="flex items-center gap-1 text-[11px] font-semibold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>{toPersianDigits(post.viewsCount)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold line-clamp-2 leading-relaxed mb-1">{post.caption}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <img src={post.sellerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span className="truncate">{post.sellerName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Feed / Reels Stream Mode - Authentic Instagram Style */
            <div className="flex flex-col gap-8 items-center w-full">
              {filteredPosts.map((post) => {
                const isFollowed = followedSellers.has(post.sellerId);
                const isSaved = savedPosts.has(post.id);
                const linkedListing = listings.find((l) => l.id === post.listingId);
                const isCaptionExpanded = expandedCaptions.has(post.id);
                const isDiamond = post.tier === 'diamond';
                const isVipGold = post.tier === 'vip';
                const isStandard = post.tier === 'promoted';

                return (
                  <div
                    key={post.id}
                    className={`w-full max-w-md sm:max-w-lg bg-black text-white rounded-3xl overflow-hidden shadow-2xl relative transition-all ${
                      isDiamond
                        ? 'border-2 border-indigo-400/90 ring-4 ring-purple-500/30 shadow-purple-900/40'
                        : isVipGold
                        ? 'border-2 border-amber-400/90 ring-4 ring-amber-400/25 shadow-amber-900/30'
                        : isStandard
                        ? 'border-2 border-teal-500/80 ring-2 ring-teal-500/20'
                        : 'border border-slate-800'
                    }`}
                  >
                    {/* VIP Ribbon Header Bar for Diamond, Gold and Standard */}
                    {(isDiamond || isVipGold || isStandard) && (
                      <div className={`px-4 py-1.5 flex items-center justify-between text-xs font-black ${
                        isDiamond
                          ? 'bg-gradient-to-r from-purple-800 via-indigo-600 to-teal-500 text-white'
                          : isVipGold
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950'
                          : 'bg-gradient-to-r from-teal-700 to-emerald-600 text-white'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span>{isDiamond ? '💎' : isVipGold ? '🌟' : '⚡'}</span>
                          <span>
                            {post.badge || (
                              isDiamond
                                ? 'اشتراک الماس ۶ ماهه (اولویت اول ویترین)'
                                : isVipGold
                                ? 'اشتراک طلایی ۳ ماهه (اولویت ویژه)'
                                : 'اشتراک معمولی ۱ ماهه (اولویت سوم)'
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-90 font-mono font-black">
                          {isDiamond ? 'VIP DIAMOND' : isVipGold ? 'VIP GOLD' : 'STANDARD VIP'}
                        </span>
                      </div>
                    )}

                    {/* Media Container (Instagram 9:16 Aspect ratio with black backdrop) */}
                    <div
                      onClick={() => handleVideoTap(post.id)}
                      className="relative w-full aspect-[9/16] bg-slate-950 overflow-hidden flex items-center justify-center cursor-pointer select-none group"
                    >
                      {post.mediaType === 'video' ? (
                        <video
                          src={post.mediaUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt={post.caption}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Top Overlay Controls: Views, Sound, Fullscreen */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto z-20">
                        {/* Views pill */}
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white/90">
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>{toPersianDigits(post.viewsCount)} بازدید</span>
                        </div>

                        {/* Top-Right Action: Mute/Unmute & Fullscreen */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsMuted(!isMuted);
                            }}
                            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                            title={isMuted ? 'روشن کردن صدا' : 'قطع صدا'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isMuted ? 'volume_off' : 'volume_up'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFullscreenReelPost(post);
                            }}
                            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                            title="نمایش تمام‌صفحه ریلز اینستاگرام"
                          >
                            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                          </button>
                        </div>
                      </div>

                      {/* Instagram Double-Tap Pop Heart Animation ❤️ */}
                      {heartBurstPostId === post.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 duration-200">
                          <div className="w-24 h-24 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl scale-110 animate-bounce">
                            <span className="material-symbols-outlined text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              favorite
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Gradient Shade for Overlay Readability */}
                      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

                      {/* Instagram Floating Right-Side Vertical Action Column */}
                      <div className="absolute left-3 bottom-14 z-20 flex flex-col items-center gap-4 text-white">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike(post.id);
                          }}
                          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                        >
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            post.isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/50 hover:bg-black/70 text-white'
                          }`}>
                            <span
                              className={`material-symbols-outlined text-[28px] transition-transform active:scale-130 ${
                                post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
                              }`}
                              style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              favorite
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-white shadow-xs">
                            {toPersianDigits(post.likesCount)}
                          </span>
                        </button>

                        {/* Comment Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                          }}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all">
                            <span className="material-symbols-outlined text-[26px]">chat_bubble</span>
                          </div>
                          <span className="text-[11px] font-bold text-white shadow-xs">
                            {toPersianDigits(post.comments.length || post.commentsCount)}
                          </span>
                        </button>

                        {/* Share Button (Direct) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowToast('لینک این ویدیو کپی شد!');
                          }}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all">
                            <span className="material-symbols-outlined text-[24px]">send</span>
                          </div>
                          <span className="text-[11px] font-bold text-white shadow-xs">
                            {toPersianDigits(post.sharesCount)}
                          </span>
                        </button>

                        {/* Save Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(post.id);
                          }}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isSaved ? 'bg-amber-500/20 text-amber-400' : 'bg-black/50 hover:bg-black/70 text-white'
                          }`}>
                            <span
                              className={`material-symbols-outlined text-[26px] ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}`}
                              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              bookmark
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-white/90">ذخیره</span>
                        </button>

                        {/* Instagram Vinyl Music Disc Spinner */}
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/80 bg-slate-900 flex items-center justify-center animate-spin cursor-pointer shadow-lg"
                          style={{ animationDuration: '4s' }}
                          title="موسیقی اصلی ویدیو"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-300">music_note</span>
                        </div>
                      </div>

                      {/* Instagram Bottom Overlay: Author info, Caption, Tags & Product Banner */}
                      <div className="absolute right-3 left-16 bottom-3 z-20 flex flex-col gap-2 text-right">
                        {/* Author Bar with Instagram Story Ring */}
                        <div className="flex items-center gap-2.5">
                          <div className="p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full shrink-0 shadow-sm">
                            <img
                              src={post.sellerAvatar}
                              alt={post.sellerName}
                              className="w-9 h-9 rounded-full object-cover border border-black"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-extrabold text-xs sm:text-sm text-white drop-shadow truncate">
                              {post.sellerName}
                            </span>
                            {post.isVerifiedSeller && (
                              <span
                                className="material-symbols-outlined text-teal-400 text-[15px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                verified
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFollow(post.sellerId, post.sellerName);
                            }}
                            className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap shadow ${
                              isFollowed
                                ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                                : 'bg-[#005c55] text-white hover:bg-[#004741]'
                            }`}
                          >
                            {isFollowed ? 'دنبال شده' : '+ دنبال کردن'}
                          </button>
                        </div>

                        {/* Caption with Expand / Collapse */}
                        <div className="text-xs text-white/95 leading-relaxed drop-shadow-sm">
                          <span className={isCaptionExpanded ? '' : 'line-clamp-2'}>
                            {post.caption}
                          </span>
                          {post.caption.length > 70 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandCaption(post.id);
                              }}
                              className="text-teal-300 hover:underline mr-1 font-bold text-[11px] cursor-pointer inline-block"
                            >
                              {isCaptionExpanded ? 'بستن' : '...بیشتر'}
                            </button>
                          )}
                        </div>

                        {/* Audio track ticker bar */}
                        <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                          <span className="material-symbols-outlined text-[14px] text-teal-300">graphic_eq</span>
                          <span className="truncate">موسیقی اصلی • ریلز بازار ({post.category})</span>
                        </div>

                        {/* Direct Product Shopping Tag Pill */}
                        {post.listingTitle && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (linkedListing) onSelectListing(linkedListing);
                              else onShowToast('آگهی مربوطه باز شد.');
                            }}
                            className="p-2 sm:p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-lg mt-1"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-teal-500/80 text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[11px] sm:text-xs text-white truncate">
                                  {post.listingTitle}
                                </p>
                                {post.listingPrice && (
                                  <p className="text-[10px] sm:text-[11px] font-black text-emerald-300">
                                    {formatToman(post.listingPrice)} تومان
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-[#005c55] text-white text-[11px] font-extrabold whitespace-nowrap shadow-xs">
                              مشاهده کالا
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment Drawer (Instagram style comment sheet) */}
                    {activeCommentPostId === post.id && (
                      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3 text-right">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                          <span className="font-extrabold text-white">دیدگاه‌های کاربران ({toPersianDigits(post.comments.length)})</span>
                          <button
                            type="button"
                            onClick={() => setActiveCommentPostId(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            بستن
                          </button>
                        </div>

                        {/* Comments scrollable list */}
                        <div className="max-h-44 overflow-y-auto space-y-2.5 text-xs">
                          {post.comments.length === 0 ? (
                            <p className="text-slate-500 text-center py-3">اولین نظر را شما برای این ویدیوی ریلز ثبت فرمایید!</p>
                          ) : (
                            post.comments.map((comm) => (
                              <div key={comm.id} className="flex items-start gap-2.5">
                                <img src={comm.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                <div className="flex-1 bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-white text-[11px]">{comm.userName}</span>
                                    <span className="text-[10px] text-slate-400">{comm.timeAgo}</span>
                                  </div>
                                  <p className="text-slate-200 text-xs leading-relaxed">{comm.text}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Quick reaction emojis */}
                        <div className="flex items-center justify-around py-1 border-t border-slate-800/80 text-lg">
                          {['🔥', '❤️', '👏', '😍', '💯', '🙌'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                onAddComment(post.id, emoji);
                                onShowToast(`ری‌اکشن ${emoji} ثبت شد.`);
                              }}
                              className="hover:scale-125 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Input bar */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="نوشتن دیدگاه..."
                            className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendComment(post.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSendComment(post.id)}
                            className="px-4 py-2 bg-[#005c55] hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            ارسال
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: ACTIVE STORIES ======================= */}
      {mainTab === 'stories' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba0035] text-[22px]">amp_stories</span>
                <span>استوری‌های ۲۴ ساعته و تخفیف‌های فوری فروشندگان</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">مشاهده پیشنهادهای لحظه‌ای و حراجی‌های محلی اطراف شما</p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ba0035] to-rose-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              + ثبت استوری جدید
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedStory(post)}
                className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 shadow-md cursor-pointer border-2 border-rose-500/80 p-3 flex flex-col justify-between text-white"
              >
                <img
                  src={post.thumbnailUrl || post.sellerAvatar}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                <div className="relative z-10 flex items-center gap-2">
                  <img src={post.sellerAvatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">{post.sellerName}</p>
                    <p className="text-[10px] text-slate-300">{post.timeAgo}</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-semibold line-clamp-2 mb-2 leading-relaxed">{post.caption}</p>
                  {post.listingPrice && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold inline-block shadow">
                      {formatToman(post.listingPrice)} ت
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: MY PERSONAL CHANNEL & PROFILE ======================= */}
      {mainTab === 'profile' && (
        <div className="flex flex-col gap-5">
          {/* Channel Header Profile Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              {/* Avatar & User Details */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-[#005c55]/20 shadow-md"
                  />
                  <span className="absolute -bottom-1 -left-1 bg-[#005c55] text-white p-1 rounded-full shadow-xs">
                    <span className="material-symbols-outlined text-[16px] block">verified</span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">{user.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#005c55] text-[10px] font-extrabold border border-emerald-200">
                      کانال ویدیویی رسمی
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phone}</p>
                  <p className="text-xs text-slate-600 max-w-md mt-2 leading-relaxed">
                    {user.bio || 'فروشنده و تولیدکننده محتوا در آوان مارکت. برای هماهنگی و خرید پیام دهید.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>آپلود ویدیوی جدید</span>
                </button>
              </div>
            </div>

            {/* Metric Counters (Followers, Following, Video Views, Likes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-xl font-black text-slate-900">{toPersianDigits(myUploadedPosts.length)}</span>
                <span className="text-xs text-slate-500 mt-0.5">ویدیوهای من</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <span className="text-lg sm:text-xl font-black text-[#005c55]">{toPersianDigits(user.followersCount || 1420)}</span>
                <span className="text-xs text-slate-500 mt-0.5">دنبال‌کنندگان (Followers)</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <span className="text-lg sm:text-xl font-black text-slate-900">{toPersianDigits(user.followingCount || followingList.length)}</span>
                <span className="text-xs text-slate-500 mt-0.5">دنبال‌شده‌ها (Following)</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <span className="text-lg sm:text-xl font-black text-amber-600">{toPersianDigits(user.totalVideoViews || 38400)}</span>
                <span className="text-xs text-slate-500 mt-0.5">مجموع بازدید ویدیوها</span>
              </div>
            </div>

            {/* Profile Navigation Subtabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setProfileSubTab('my-videos')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileSubTab === 'my-videos'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">video_library</span>
                <span>ویدیوهای من ({toPersianDigits(myUploadedPosts.length)})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileSubTab('saved')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileSubTab === 'saved'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">bookmark</span>
                <span>نشان‌شده‌ها ({toPersianDigits(mySavedPosts.length)})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileSubTab('following')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileSubTab === 'following'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">group</span>
                <span>فروشندگان دنبال‌شده ({toPersianDigits(followingList.length)})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileSubTab('followers')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  profileSubTab === 'followers'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">person_add</span>
                <span>دنبال‌کنندگان من ({toPersianDigits(followersList.length)})</span>
              </button>
            </div>

            {/* Subtab 1: My Uploaded Videos */}
            {profileSubTab === 'my-videos' && (
              <div>
                {myUploadedPosts.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px]">videocam_off</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">هنوز ویدیویی آپلود نکرده‌اید</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      با ثبت ویدیوی معرفی محصولات خود، فروش کالاها را تا ۵ برابر افزایش دهید.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-2 px-5 py-2.5 bg-[#ba0035] hover:bg-[#9e002d] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      آپلود اولین ویدیو
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {myUploadedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 shadow-xs border border-slate-100 flex flex-col justify-between p-3 text-white"
                      >
                        <img
                          src={post.thumbnailUrl || user.avatar}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-[#005c55] text-white text-[9px] font-extrabold">
                            {post.badge || 'ویدیو فعال'}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-semibold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                            <span className="material-symbols-outlined text-[13px]">visibility</span>
                            <span>{toPersianDigits(post.viewsCount)}</span>
                          </div>
                        </div>

                        <div className="relative z-10">
                          <p className="text-xs font-bold line-clamp-2 leading-relaxed mb-1">{post.caption}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/20">
                            <span>❤️ {toPersianDigits(post.likesCount)}</span>
                            <span>💬 {toPersianDigits(post.comments.length || post.commentsCount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Saved Videos */}
            {profileSubTab === 'saved' && (
              <div>
                {mySavedPosts.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-400">
                    <span className="material-symbols-outlined text-[36px]">bookmark_border</span>
                    <p className="text-xs font-bold">ویدیوی ذخیره‌شده‌ای وجود ندارد</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {mySavedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 shadow-xs border border-slate-100 flex flex-col justify-between p-3 text-white"
                      >
                        <img
                          src={post.thumbnailUrl || post.sellerAvatar}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[11px] font-bold">{post.sellerName}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSave(post.id)}
                            className="text-amber-400 hover:text-white"
                          >
                            <span className="material-symbols-outlined text-[20px]">bookmark</span>
                          </button>
                        </div>
                        <div className="relative z-10">
                          <p className="text-xs font-bold line-clamp-2">{post.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: Following Sellers */}
            {profileSubTab === 'following' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followingList.map((seller) => (
                  <div
                    key={seller.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={seller.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{seller.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{seller.category} • {seller.followers} دنبال‌کننده</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFollow(seller.id, seller.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      دنبال می‌کنید
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Subtab 4: Followers List */}
            {profileSubTab === 'followers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followersList.map((follower) => (
                  <div
                    key={follower.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={follower.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{follower.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">ساکن {follower.city}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onShowToast(`درخواست پاسخ به ${follower.name} ثبت شد.`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      {follower.isFollowBack ? 'دنبال شده' : 'دنبال کردن'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: UPLOAD NEW VIDEO / POST ======================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs text-right animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-950 via-[#005c55] to-teal-800 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">video_call</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">آپلود پست ویدیویی در اکسپلور بازار</h3>
                  <p className="text-xs text-teal-100/80">معرفی زنده، جذب مشتری بیشتر و ارتقای فروش</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreatePostSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
              {/* Media Selection Presets */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-800">انتخاب ویدیوی نمونه یا بارگذاری:</label>
                <div className="grid grid-cols-2 gap-2">
                  {sampleVideos.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUploadMediaUrl(sample.url)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right flex items-center gap-2 ${
                        uploadMediaUrl === sample.url
                          ? 'border-[#005c55] bg-teal-50 text-[#005c55] shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      <span className="truncate">{sample.title}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={uploadMediaUrl}
                  onChange={(e) => setUploadMediaUrl(e.target.value)}
                  placeholder="یا لینک ویدیوی اختصاصی MP4 را وارد کنید..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#005c55] font-mono"
                  dir="ltr"
                />
              </div>

              {/* Caption */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">متن و توضیحات ویدیو (کپشن):</label>
                <textarea
                  rows={3}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="درباره ویژگی‌های کالا، نحوه تست یا ارسال توضیح دهید..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#005c55] focus:bg-white resize-none"
                  required
                />
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">دسته‌بندی مرتبط:</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#005c55]"
                  >
                    {categories.filter((c) => c.id !== 'همه').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Link to existing ad */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">اتصال به آگهی من (اختیاری):</label>
                  <select
                    value={uploadListingId}
                    onChange={(e) => setUploadListingId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#005c55]"
                  >
                    <option value="">بدون اتصال به آگهی</option>
                    {listings.slice(0, 10).map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title.slice(0, 35)}... ({formatToman(listing.price)} ت)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tier / Promotion Package Selector with 3 clean options & direct Telegram bot link */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">انتخاب پکیج انتشار و خرید اشتراک:</span>
                  <a
                    href="https://t.me/bazar_mahali_bot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>ربات تلگرام:</span>
                    <strong className="dir-ltr font-mono">@bazar_mahali_bot</strong>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Tier 1: Standard 1m */}
                  <div
                    onClick={() => setUploadTier('promoted')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      uploadTier === 'promoted'
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">اشتراک معمولی</div>
                        <span className="text-[10px] text-slate-500">۱ ماهه (۳۰ روز)</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-teal-800 font-mono self-end">
                      {formatToman(tierPrices.promoted)} تومان
                    </span>
                  </div>

                  {/* Tier 2: Golden 3m */}
                  <div
                    onClick={() => setUploadTier('vip')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                      uploadTier === 'vip'
                        ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    <span className="absolute top-0 left-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-br-lg">
                      پیشنهاد طلایی
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl">🌟</span>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">اشتراک طلایی</div>
                        <span className="text-[10px] text-slate-500">۳ ماهه (۹۰ روز)</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-900 font-mono self-end">
                      {formatToman(tierPrices.vip)} تومان
                    </span>
                  </div>

                  {/* Tier 3: Diamond 6m */}
                  <div
                    onClick={() => setUploadTier('diamond')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      uploadTier === 'diamond'
                        ? 'border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-300'
                        : 'border-slate-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💎</span>
                      <div>
                        <div className="font-extrabold text-xs text-purple-950">اشتراک الماس VIP</div>
                        <span className="text-[10px] text-purple-700">۶ ماهه (۱۸۰ روز)</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-900 font-mono self-end">
                      {formatToman(tierPrices.diamond)} تومان
                    </span>
                  </div>
                </div>
              </div>

              {/* Telegram Bot VIP Link & Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-extrabold text-sky-950">خرید مستقیم اشتراک از ربات تلگرام:</span>
                    <span className="text-[11px] text-sky-700 leading-relaxed">
                      با کلیک روی دکمه زیر یا تأیید انتشار، مستقیم به ربات هدایت می‌شوید:
                      <strong className="dir-ltr font-mono mr-1">@bazar_mahali_bot</strong>
                    </span>
                  </div>
                </div>
                <a
                  href={`https://t.me/bazar_mahali_bot?start=sub_${uploadTier}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>ورود مستقیم به بات خرید</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>

                {/* Primary Action Button: Direct to Bot as user instructed */}
                <a
                  href={`https://t.me/bazar_mahali_bot?start=sub_${uploadTier}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    onShowToast('به ربات تلگرام هدایت شدید. پس از خرید، اشتراک شما فعال می‌گردد.', 'info');
                    setIsUploadModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  <span>تأیید انتشار و خرید از ربات تلگرام ({formatToman(tierPrices[uploadTier])} ت)</span>
                </a>

                {/* Secondary Button: Publish with site wallet */}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  <span>انتشار با کیف پول سایت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= FULLSCREEN STORY VIEWER (INSTAGRAM STYLE) ======================= */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 text-white border border-white/10">
            {selectedStory.mediaType === 'video' ? (
              <video
                src={selectedStory.mediaUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
            ) : (
              <img
                src={selectedStory.thumbnailUrl || selectedStory.sellerAvatar}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

            {/* Story Top Progress & Profile Bar */}
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex gap-1">
                <div className="flex-1 h-full bg-white rounded-full animate-pulse" />
                <div className="flex-1 h-full bg-white/40 rounded-full" />
                <div className="flex-1 h-full bg-white/40 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-full">
                    <img src={selectedStory.sellerAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-extrabold text-xs">{selectedStory.sellerName}</p>
                      {selectedStory.isVerifiedSeller && (
                        <span className="material-symbols-outlined text-teal-400 text-[14px]">verified</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300">{selectedStory.timeAgo} • استوری بازار</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">{isMuted ? 'volume_off' : 'volume_up'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStory(null)}
                    className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Story Bottom Interactive Info & Direct Reply Input */}
            <div className="relative z-10 flex flex-col gap-2.5">
              <p className="text-xs sm:text-sm font-bold leading-relaxed drop-shadow">{selectedStory.caption}</p>

              {/* Linked Product Banner */}
              {selectedStory.listingTitle && (
                <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-between gap-2 shadow-lg">
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">{selectedStory.listingTitle}</p>
                    {selectedStory.listingPrice && (
                      <p className="text-[11px] font-black text-emerald-300">{formatToman(selectedStory.listingPrice)} تومان</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const linked = listings.find((l) => l.id === selectedStory.listingId);
                      setSelectedStory(null);
                      if (linked) onSelectListing(linked);
                    }}
                    className="px-3 py-1.5 bg-[#005c55] hover:bg-[#004741] text-white text-xs font-bold rounded-xl shadow whitespace-nowrap cursor-pointer"
                  >
                    مشاهده آگهی
                  </button>
                </div>
              )}

              {/* Instagram Direct Message & Heart Reaction Bar */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={storyReply}
                  onChange={(e) => setStoryReply(e.target.value)}
                  placeholder="پاسخ به این استوری..."
                  className="flex-1 px-3.5 py-2 rounded-full bg-black/50 border border-white/30 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-teal-400 backdrop-blur-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && storyReply.trim()) {
                      onShowToast(`پیام شما به «${selectedStory.sellerName}» ارسال شد.`, 'success');
                      setStoryReply('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onShowToast(`❤️ واکنش شما به استوری ${selectedStory.sellerName} ارسال شد.`);
                  }}
                  className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-500 flex items-center justify-center border border-rose-500/40 transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= FULLSCREEN INSTAGRAM REELS VIEWER MODAL ======================= */}
      {fullscreenReelPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full h-full sm:h-auto sm:max-w-md sm:aspect-[9/16] bg-slate-950 text-white sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
            {/* Background Reel Video / Media */}
            <div
              onClick={() => handleVideoTap(fullscreenReelPost.id)}
              className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center"
            >
              {fullscreenReelPost.mediaType === 'video' ? (
                <video
                  src={fullscreenReelPost.mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <img
                  src={fullscreenReelPost.mediaUrl}
                  alt={fullscreenReelPost.caption}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Double Tap Heart */}
              {heartBurstPostId === fullscreenReelPost.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 duration-200">
                  <div className="w-24 h-24 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl scale-125 animate-bounce">
                    <span className="material-symbols-outlined text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar with Close, Audio & Reels Label */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">Reels اینستاگرام</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                  ویترین اکسپلور
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <span className="material-symbols-outlined text-[18px]">{isMuted ? 'volume_off' : 'volume_up'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenReelPost(null)}
                  className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Bottom Shade & Floating Actions */}
            <div className="relative z-20 p-4 pb-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
              {/* Creator details & Buy Button */}
              <div className="flex-1 min-w-0 pr-2 pointer-events-auto flex flex-col gap-2 text-right">
                <div className="flex items-center gap-2.5">
                  <div className="p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-full">
                    <img src={fullscreenReelPost.sellerAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-black" />
                  </div>
                  <span className="font-extrabold text-sm">{fullscreenReelPost.sellerName}</span>
                  {fullscreenReelPost.isVerifiedSeller && (
                    <span className="material-symbols-outlined text-teal-400 text-[15px]">verified</span>
                  )}
                  {fullscreenReelPost.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                      {fullscreenReelPost.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/95 leading-relaxed line-clamp-3">
                  {fullscreenReelPost.caption}
                </p>

                {fullscreenReelPost.listingTitle && (
                  <button
                    type="button"
                    onClick={() => {
                      const linked = listings.find((l) => l.id === fullscreenReelPost.listingId);
                      setFullscreenReelPost(null);
                      if (linked) onSelectListing(linked);
                    }}
                    className="w-full mt-1 py-2.5 px-4 rounded-2xl bg-[#005c55] hover:bg-[#004741] text-white text-xs font-extrabold shadow-lg flex items-center justify-between cursor-pointer"
                  >
                    <span>🛍️ مشاهده و خرید «{fullscreenReelPost.listingTitle}»</span>
                    {fullscreenReelPost.listingPrice && (
                      <span className="font-mono text-emerald-300">{formatToman(fullscreenReelPost.listingPrice)} ت</span>
                    )}
                  </button>
                )}
              </div>

              {/* Vertical Actions */}
              <div className="flex flex-col items-center gap-4 pointer-events-auto pl-2">
                <button
                  type="button"
                  onClick={() => onToggleLike(fullscreenReelPost.id)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    fullscreenReelPost.isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/50 text-white'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: fullscreenReelPost.isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                      favorite
                    </span>
                  </div>
                  <span className="text-[11px] font-bold">{toPersianDigits(fullscreenReelPost.likesCount)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onShowToast('دیدگاه‌های این ویدیو باز شد.')}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                  </div>
                  <span className="text-[11px] font-bold">{toPersianDigits(fullscreenReelPost.commentsCount)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleToggleSave(fullscreenReelPost.id);
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[24px]">bookmark</span>
                  </div>
                  <span className="text-[10px] font-bold">ذخیره</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ======================= INSTAGRAM-STYLE BOTTOM NAVIGATION BAR ======================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-3 pb-2 sm:pb-3 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_30px_rgba(0,0,0,0.14)] px-4 sm:px-8 py-2 flex items-center justify-around rounded-3xl">
          {/* Tab 1: Explore & Feed */}
          <button
            type="button"
            onClick={() => setMainTab('explore')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors cursor-pointer ${
              mainTab === 'explore' ? 'text-[#005c55] font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: mainTab === 'explore' ? "'FILL' 1" : "'FILL' 0" }}>
              explore
            </span>
            <span className="text-[10px]">اکسپلور</span>
          </button>

          {/* Tab 2: Active Stories */}
          <button
            type="button"
            onClick={() => setMainTab('stories')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors cursor-pointer relative ${
              mainTab === 'stories' ? 'text-[#005c55] font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: mainTab === 'stories' ? "'FILL' 1" : "'FILL' 0" }}>
                amp_stories
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <span className="text-[10px]">استوری‌ها</span>
          </button>

          {/* Tab 3: Center Instagram Upload Action (+) Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex flex-col items-center -mt-5 group cursor-pointer"
            title="آپلود ویدیو جدید"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white shadow-lg shadow-rose-600/35 border-2 border-white">
              <span className="material-symbols-outlined text-[30px]">add</span>
            </div>
            <span className="text-[9px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">آپلود</span>
          </button>

          {/* Tab 4: Wallet Trigger */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex flex-col items-center gap-0.5 py-1 px-3 text-slate-500 hover:text-[#005c55] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[25px]">account_balance_wallet</span>
            <span className="text-[10px] font-mono">{formatToman(walletBalance)} ت</span>
          </button>

          {/* Tab 5: Profile & My Channel */}
          <button
            type="button"
            onClick={() => setMainTab('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors cursor-pointer ${
              mainTab === 'profile' ? 'text-[#005c55] font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-0.5 rounded-full ${mainTab === 'profile' ? 'ring-2 ring-[#005c55]' : ''}`}>
              <img src={user.avatar} alt="پروفایل" className="w-6 h-6 rounded-full object-cover" />
            </div>
            <span className="text-[10px]">کانال من</span>
          </button>
        </div>
      </div>
    </div>
  );
};
