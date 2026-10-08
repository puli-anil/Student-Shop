import React from 'react';
import { Icon } from '../components/Icons.js';
import { ListingCard } from '../components/ListingCard.js';
import { store } from '../store.js';

const e = React.createElement;

export const FavoritesPage = ({ onNavigate, onSelectListing, onOpenAuthModal }) => {
  const [favIds, setFavIds] = React.useState(store.favorites);

  React.useEffect(() => {
    return store.subscribe(() => {
      setFavIds([...store.favorites]);
    });
  }, []);

  const user = store.currentUser;
  const favListings = store.listings.filter(l => favIds.includes(l.id));

  if (!user) {
    return e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8" },
      e('div', { className: "w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto" },
        e(Icon, { name: "Heart", className: "w-8 h-8" })
      ),
      e('h2', { className: "font-display font-bold text-2xl text-[#102A27]" }, 'Saved Ads (Login Required)'),
      e('p', { className: "text-xs text-[#5C6B68]" }, 'Sign in to save listings across sessions and get price drop updates.'),
      e('button', {
        onClick: onOpenAuthModal,
        className: "bg-[#102A27] text-amber-300 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
      }, 'Sign In Now')
    );
  }

  return e('div', { className: "space-y-6 pb-12" },
    e('div', { className: "flex items-center justify-between bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl" },
      e('div', null,
        e('h1', { className: "font-display font-bold text-2xl text-[#102A27]" }, `Saved Listings (${favListings.length})`),
        e('p', { className: "text-xs text-[#5C6B68]" }, `Your bookmarked items in ${store.selectedCampus.name}`)
      ),
      e(Icon, { name: "Heart", className: "w-8 h-8 text-rose-500 fill-rose-500" })
    ),

    favListings.length === 0 ? e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl p-12 text-center space-y-3" },
      e(Icon, { name: "Heart", className: "w-12 h-12 text-stone-300 mx-auto" }),
      e('h3', { className: "font-bold text-stone-700" }, 'No saved ads yet'),
      e('p', { className: "text-xs text-stone-500" }, 'Tap the heart icon on any listing to save it for later!'),
      e('button', {
        onClick: () => onNavigate('browse'),
        className: "bg-[#3D7A6E] text-white px-5 py-2 rounded-xl text-xs font-bold"
      }, 'Explore Listings')
    ) : e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
      favListings.map(listing => 
        e(ListingCard, {
          key: listing.id,
          listing,
          onSelect: onSelectListing,
          onFavoriteClick: onOpenAuthModal
        })
      )
    )
  );
};
