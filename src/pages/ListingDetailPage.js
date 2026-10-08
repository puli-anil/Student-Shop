import React from 'react';
import { Icon } from '../components/Icons.js';
import { ListingCard } from '../components/ListingCard.js';
import { CannedPingModal } from '../components/CannedPingModal.js';
import { ChatModal } from '../components/ChatModal.js';
import { store } from '../store.js';
import { CANNED_PINGS } from '../seedData.js';

const e = React.createElement;

export const ListingDetailPage = ({ 
  listingId, 
  onNavigate, 
  onSelectListing, 
  onOpenAuthModal 
}) => {
  const [listing, setListing] = React.useState(null);
  const [isFav, setIsFav] = React.useState(false);
  const [showPingModal, setShowPingModal] = React.useState(false);
  const [showChatModal, setShowChatModal] = React.useState(false);
  const [pingSuccessToast, setPingSuccessToast] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const user = store.currentUser;

  React.useEffect(() => {
    const found = store.listings.find(l => String(l.id) === String(listingId));
    if (found) {
      setListing(found);
      setIsFav(store.isFavorite(found.id));
      found.views = (found.views || 0) + 1;
    }
  }, [listingId]);

  React.useEffect(() => {
    return store.subscribe(() => {
      if (listing) {
        setIsFav(store.isFavorite(listing.id));
      }
    });
  }, [listing]);

  if (!listing) {
    return e('div', { className: "text-center py-16 bg-[#FFFDF8] rounded-2xl border border-[#E2DDD3]" },
      e(Icon, { name: "AlertCircle", className: "w-12 h-12 text-stone-400 mx-auto mb-2" }),
      e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Listing not found'),
      e('p', { className: "text-xs text-stone-500 mt-1 mb-4" }, 'This ad may have been removed by the seller.'),
      e('button', {
        onClick: () => onNavigate('browse'),
        className: "bg-[#3D7A6E] text-white px-4 py-2 rounded-xl text-xs font-bold"
      }, 'Back to Browse')
    );
  }

  const campus = store.selectedCampus;
  const similarAds = store.listings
    .filter(l => l.campus === listing.campus && l.id !== listing.id && (l.category === listing.category || l.listing_kind === listing.listing_kind))
    .slice(0, 4);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleHeartClick = () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    store.toggleFavorite(listing.id);
  };

  const handleQuickPingClick = (pingText) => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    store.sendPing(listing.id, pingText);
    setPingSuccessToast(true);
    setTimeout(() => setPingSuccessToast(false), 3000);
  };

  return e('div', { className: "space-y-8 pb-12" },
    
    /* Top bar */
    e('div', { className: "flex items-center justify-between" },
      e('button', {
        onClick: () => onNavigate('browse'),
        className: "flex items-center gap-1.5 text-xs font-bold text-[#3D7A6E] hover:text-[#2A544C] bg-[#FFFDF8] border border-[#E2DDD3] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
      },
        e(Icon, { name: "ArrowLeft", className: "w-4 h-4" }),
        e('span', null, 'Back to Browse')
      ),

      e('div', { className: "flex items-center gap-2" },
        e('button', {
          onClick: handleCopyLink,
          className: "flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
        },
          e(Icon, { name: "Share2", className: "w-3.5 h-3.5" }),
          e('span', null, copiedLink ? 'Link Copied!' : 'Share')
        ),

        e('button', {
          onClick: handleHeartClick,
          className: `flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${isFav ? 'bg-rose-500 text-white border-rose-500 shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'}`
        },
          e(Icon, { name: "Heart", className: `w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}` }),
          e('span', null, isFav ? 'Saved' : 'Save Ad')
        )
      )
    ),

    /* Details Grid */
    e('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
      
      /* Left Column */
      e('div', { className: "md:col-span-2 space-y-6" },
        e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl overflow-hidden shadow-sm relative aspect-[4/3] sm:aspect-[16/10] bg-stone-100 flex items-center justify-center" },
          e('img', { src: listing.image_url, alt: listing.title, className: "w-full h-full object-cover" }),
          listing.featured && e('div', { className: "absolute top-4 left-4 bg-amber-400 text-stone-950 font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-md" },
            e(Icon, { name: "Sparkles", className: "w-3.5 h-3.5 fill-stone-950" }),
            'Featured Listing'
          )
        ),

        e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl space-y-6 shadow-xs" },
          e('div', { className: "flex flex-wrap gap-2 text-xs" },
            e('span', { className: "bg-stone-100 text-stone-800 px-3 py-1 rounded-full font-semibold border border-stone-200" }, listing.category),
            listing.condition && e('span', { className: "bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-medium border border-emerald-200" }, `Condition: ${listing.condition}`),
            listing.extra?.occupancy && e('span', { className: "bg-purple-50 text-purple-800 px-3 py-1 rounded-full font-medium border border-purple-200" }, listing.extra.occupancy),
            listing.extra?.subject && e('span', { className: "bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200" }, `Subject: ${listing.extra.subject}`),
            listing.extra?.status && e('span', { className: `px-3 py-1 rounded-full font-bold text-white ${listing.extra.status === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'}` }, `Status: ${listing.extra.status}`)
          ),

          e('div', null,
            e('h3', { className: "font-display font-bold text-lg text-[#102A27] mb-2" }, 'Description'),
            e('p', { className: "text-stone-700 text-sm font-sans leading-relaxed whitespace-pre-line" }, listing.description)
          ),

          Object.keys(listing.extra || {}).length > 0 && e('div', { className: "pt-4 border-t border-stone-100" },
            e('h4', { className: "text-xs font-bold text-stone-500 uppercase tracking-wider mb-2" }, 'Specifications / Details'),
            e('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs" },
              Object.entries(listing.extra).map(([k, v]) => 
                e('div', { key: k, className: "bg-stone-50 p-2.5 rounded-xl border border-stone-200/80" },
                  e('span', { className: "text-stone-400 capitalize block text-[10px]" }, k),
                  e('span', { className: "font-semibold text-stone-800" }, String(v))
                )
              )
            )
          )
        )
      ),

      /* Right Column */
      e('div', { className: "space-y-6" },
        
        /* Price Card */
        e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl space-y-4 shadow-xs" },
          e('div', null,
            e('div', { className: "text-xs font-bold uppercase tracking-wider text-[#3D7A6E]" }, 'Listing Price'),
            e('h1', { className: "font-display font-black text-3xl sm:text-4xl text-[#102A27] mt-1" },
              listing.price_label || `₹ ${listing.price.toLocaleString('en-IN')}`
            )
          ),

          e('h2', { className: "font-sans font-bold text-stone-800 text-lg leading-snug" }, listing.title),

          e('div', { className: "pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#5C6B68]" },
            e('div', { className: "flex items-center gap-1.5 font-semibold text-stone-700" },
              e(Icon, { name: "Building2", className: "w-4 h-4 text-[#3D7A6E]" }),
              e('span', null, `${listing.hostel} Hostel • ${listing.city}`)
            ),
            e('span', { className: "text-stone-400" }, `${listing.views || 1} views`)
          )
        ),

        /* Seller Profile Card */
        e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl space-y-4 shadow-xs" },
          e('div', { className: "flex items-center justify-between" },
            e('h3', { className: "font-display font-bold text-base text-[#102A27]" }, 'Student Seller'),
            listing.verified && e('span', { className: "bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1" },
              e(Icon, { name: "CheckCircle2", className: "w-3.5 h-3.5 text-emerald-600" }),
              'Verified Student'
            )
          ),

          e('div', { className: "flex items-center gap-3" },
            e('div', { className: "w-12 h-12 rounded-full bg-[#102A27] text-amber-300 font-display font-bold text-xl flex items-center justify-center border-2 border-[#3D7A6E]" },
              listing.seller_label?.charAt(0) || 'S'
            ),
            e('div', null,
              e('div', { className: "font-bold text-stone-900 text-sm" }, listing.seller_label),
              e('div', { className: "text-xs text-[#5C6B68]" }, `Student at ${campus.fullName}`),
              e('div', { className: "text-[11px] text-emerald-700 font-medium" }, `${listing.hostel} • On-Campus Spot`)
            )
          )
        ),

        /* Campus Pings & Live Chat Card */
        e('div', { className: "bg-gradient-to-br from-[#102A27] to-[#1A3F3B] text-white p-6 rounded-3xl space-y-4 shadow-md" },
          e('div', { className: "flex items-center gap-2" },
            e(Icon, { name: "MessageCircle", className: "w-5 h-5 text-amber-300" }),
            e('div', null,
              e('h3', { className: "font-display font-bold text-lg text-white" }, 'Campus Live Chat'),
              e('p', { className: "text-[11px] text-stone-300" }, 'Canned pings • Instant live chat stream')
            )
          ),

          pingSuccessToast && e('div', { className: "bg-emerald-500 text-stone-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce" },
            e(Icon, { name: "CheckCircle2", className: "w-4 h-4" }),
            e('span', null, 'Ping sent to seller! Check your live chat stream.')
          ),

          e('button', {
            onClick: () => {
              if (!user) onOpenAuthModal();
              else setShowChatModal(true);
            },
            className: "w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          },
            e(Icon, { name: "MessageCircle", className: "w-4.5 h-4.5 fill-stone-950" }),
            e('span', null, '💬 Open Live Buyer-Seller Chat')
          ),

          e('div', { className: "space-y-2 pt-2 border-t border-[#1C3E3A]" },
            e('div', { className: "text-[11px] font-bold text-amber-300 uppercase tracking-wider" }, 'Quick 1-Click Pings:'),
            CANNED_PINGS.map((pingText) => 
              e('button', {
                key: pingText,
                onClick: () => handleQuickPingClick(pingText),
                className: "w-full text-left bg-[#1C3E3A] hover:bg-[#25504B] border border-[#2D6059] p-2.5 rounded-xl text-xs text-stone-100 font-medium transition-colors flex items-center justify-between group"
              },
                e('span', null, `"${pingText}"`),
                e(Icon, { name: "ChevronRight", className: "w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" })
              )
            )
          )
        )

      )
    ),

    /* Similar Ads */
    similarAds.length > 0 && e('section', { className: "space-y-4 pt-6 border-t border-[#E2DDD3]" },
      e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, `Similar Ads in ${campus.name}`),
      e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
        similarAds.map(sim => 
          e(ListingCard, {
            key: sim.id,
            listing: sim,
            onSelect: onSelectListing,
            onFavoriteClick: onOpenAuthModal
          })
        )
      )
    ),

    showChatModal && e(ChatModal, {
      listing,
      onClose: () => setShowChatModal(false)
    }),

    showPingModal && e(CannedPingModal, {
      listing,
      onClose: () => setShowPingModal(false),
      onSuccess: () => {
        setPingSuccessToast(true);
        setTimeout(() => setPingSuccessToast(false), 3000);
      }
    })
  );
};
