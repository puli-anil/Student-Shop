import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';

const e = React.createElement;

export const ListingCard = ({ listing, onSelect, onFavoriteClick }) => {
  const [isFav, setIsFav] = React.useState(store.isFavorite(listing.id));

  React.useEffect(() => {
    return store.subscribe(() => {
      setIsFav(store.isFavorite(listing.id));
    });
  }, [listing.id]);

  const handleHeartClick = (evt) => {
    evt.stopPropagation();
    if (!store.currentUser) {
      if (onFavoriteClick) onFavoriteClick(listing);
      return;
    }
    store.toggleFavorite(listing.id);
  };

  const getKindBadge = () => {
    switch (listing.listing_kind) {
      case 'roommate':
        return e('span', { className: "bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-semibold" }, 'Roommate');
      case 'lostfound':
        return listing.extra?.status === 'LOST' 
          ? e('span', { className: "bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-semibold" }, 'Lost')
          : e('span', { className: "bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold" }, 'Found');
      case 'service':
        return e('span', { className: "bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold" }, 'Service');
      default:
        return listing.condition ? e('span', { className: "bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full font-medium" }, listing.condition) : null;
    }
  };

  return e('div', {
    onClick: () => onSelect && onSelect(listing),
    className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col h-full"
  },
    e('div', { className: "relative aspect-[4/3] bg-stone-100 overflow-hidden" },
      e('img', {
        src: listing.image_url,
        alt: listing.title,
        className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
        loading: "lazy"
      }),
      listing.featured && e('div', { className: "absolute top-2 left-2 bg-amber-400 text-stone-900 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm" },
        e(Icon, { name: "Sparkles", className: "w-3 h-3 text-stone-900 fill-amber-400" }),
        'Featured'
      ),
      e('button', {
        onClick: handleHeartClick,
        'aria-label': "Save listing",
        className: `absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${isFav ? 'bg-rose-500 text-white' : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-500'}`
      },
        e(Icon, { name: "Heart", className: `w-4 h-4 ${isFav ? 'fill-white' : ''}` })
      )
    ),
    e('div', { className: "p-3.5 flex flex-col flex-1 justify-between gap-2" },
      e('div', null,
        e('div', { className: "flex items-baseline justify-between gap-1 mb-1" },
          e('h4', { className: "font-display font-bold text-lg text-[#102A27] tracking-tight" },
            listing.price_label || (listing.price > 0 ? `₹ ${listing.price.toLocaleString('en-IN')}` : 'Free / Contact')
          ),
          getKindBadge()
        ),
        e('h3', { className: "font-sans font-medium text-stone-800 text-sm line-clamp-2 leading-snug group-hover:text-[#3D7A6E] transition-colors" },
          listing.title
        )
      ),
      e('div', { className: "pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#5C6B68]" },
        e('div', { className: "flex items-center gap-1 font-medium text-stone-600 truncate max-w-[65%]" },
          e(Icon, { name: "Building2", className: "w-3.5 h-3.5 text-[#3D7A6E] shrink-0" }),
          e('span', { className: "truncate" }, `${listing.hostel}, ${listing.campus?.split('-')[0]?.toUpperCase()}`)
        ),
        e('span', { className: "text-[11px] text-stone-400 shrink-0" }, listing.created_at)
      )
    )
  );
};
