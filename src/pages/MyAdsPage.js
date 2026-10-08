import React from 'react';
import { Icon } from '../components/Icons.js';
import { store } from '../store.js';

const e = React.createElement;

export const MyAdsPage = ({ onNavigate, onSelectListing, onOpenAuthModal }) => {
  const [listings, setListings] = React.useState([]);
  const [pings, setPings] = React.useState([]);
  const user = store.currentUser;

  React.useEffect(() => {
    if (user) {
      setListings(store.listings.filter(l => l.user_id === user.id));
      setPings(store.pings);
    }
    return store.subscribe(() => {
      if (store.currentUser) {
        setListings(store.listings.filter(l => l.user_id === store.currentUser.id));
        setPings([...store.pings]);
      }
    });
  }, [user]);

  if (!user) {
    return e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8" },
      e('div', { className: "w-16 h-16 rounded-full bg-[#102A27] text-amber-300 flex items-center justify-center mx-auto" },
        e(Icon, { name: "User", className: "w-8 h-8" })
      ),
      e('h2', { className: "font-display font-bold text-2xl text-[#102A27]" }, 'My Ads (Login Required)'),
      e('p', { className: "text-xs text-[#5C6B68]" }, 'Sign in to manage your posted ads, view campus pings, or delete sold items.'),
      e('button', {
        onClick: onOpenAuthModal,
        className: "bg-[#102A27] text-amber-300 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
      }, 'Sign In Now')
    );
  }

  const handleDelete = (listingId, evt) => {
    evt.stopPropagation();
    if (window.confirm('Are you sure you want to delete this listing?')) {
      store.deleteListing(listingId);
    }
  };

  return e('div', { className: "space-y-8 pb-12" },
    
    /* Header User Info */
    e('div', { className: "bg-[#102A27] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" },
      e('div', { className: "flex items-center gap-4" },
        e('img', { src: user.avatar, alt: user.name, className: "w-16 h-16 rounded-full object-cover border-2 border-amber-300" }),
        e('div', null,
          e('div', { className: "flex items-center gap-2" },
            e('h1', { className: "font-display font-bold text-2xl" }, user.name),
            user.verified && e('span', { className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" },
              e(Icon, { name: "CheckCircle2", className: "w-3 h-3 text-emerald-400" }),
              'Verified'
            )
          ),
          e('p', { className: "text-xs text-stone-300" }, `${user.email} • ${user.year}`),
          e('p', { className: "text-xs text-amber-300 font-semibold" }, `${user.hostel} Hostel • ${store.selectedCampus.name}`)
        )
      ),

      e('button', {
        onClick: () => onNavigate('post'),
        className: "bg-amber-400 hover:bg-amber-300 text-stone-950 px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shrink-0"
      },
        e(Icon, { name: "PlusCircle", className: "w-4 h-4 stroke-[2.5]" }),
        e('span', null, '+ Post New Ad')
      )
    ),

    /* User Ads List */
    e('div', { className: "space-y-4" },
      e('div', { className: "flex items-center justify-between" },
        e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, `My Active Ads (${listings.length})`),
        e('span', { className: "text-xs text-[#5C6B68]" }, 'Manage your listings')
      ),

      listings.length === 0 ? e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl p-12 text-center space-y-3" },
        e(Icon, { name: "Tag", className: "w-12 h-12 text-stone-300 mx-auto" }),
        e('h3', { className: "font-bold text-stone-700" }, "You haven't posted any ads yet"),
        e('p', { className: "text-xs text-stone-500" }, 'Sell your unused books, drafters, kettles, or cycles to campus peers!'),
        e('button', {
          onClick: () => onNavigate('post'),
          className: "bg-[#3D7A6E] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
        }, 'Post Your First Free Ad')
      ) : e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
        listings.map(listing => 
          e('div', {
            key: listing.id,
            onClick: () => onSelectListing(listing),
            className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          },
            e('div', { className: "relative aspect-[16/10] bg-stone-100 overflow-hidden" },
              e('img', { src: listing.image_url, alt: listing.title, className: "w-full h-full object-cover" }),
              listing.featured && e('span', { className: "absolute top-2 left-2 bg-amber-400 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase" }, 'Featured'),
              e('button', {
                onClick: (evt) => handleDelete(listing.id, evt),
                className: "absolute top-2 right-2 p-2 rounded-full bg-stone-900/70 hover:bg-rose-600 text-white transition-colors",
                title: "Delete Ad"
              }, e(Icon, { name: "Trash2", className: "w-4 h-4" }))
            ),

            e('div', { className: "p-4 space-y-2" },
              e('div', { className: "flex items-baseline justify-between" },
                e('h4', { className: "font-display font-bold text-[#102A27] text-lg" }, listing.price_label),
                e('span', { className: "text-xs text-stone-500" }, `${listing.views || 1} views`)
              ),
              e('h3', { className: "font-semibold text-stone-800 text-xs line-clamp-2" }, listing.title),
              e('div', { className: "pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#5C6B68]" },
                e('span', null, `${listing.hostel} Hostel`),
                e('span', { className: "text-stone-400" }, listing.created_at)
              )
            )
          )
        )
      )
    ),

    /* Received Pings */
    e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl space-y-4 shadow-xs" },
      e('div', { className: "flex items-center gap-2" },
        e(Icon, { name: "MessageCircle", className: "w-5 h-5 text-[#3D7A6E]" }),
        e('div', null,
          e('h3', { className: "font-display font-bold text-lg text-[#102A27]" }, 'Recent Campus Pings'),
          e('p', { className: "text-xs text-[#5C6B68]" }, 'Canned messages sent to your ads')
        )
      ),

      pings.length === 0 ? e('div', { className: "text-xs text-stone-400 py-4 text-center border border-dashed border-stone-200 rounded-xl" },
        'No pings received yet. Send a test ping on any listing detail page!'
      ) : e('div', { className: "space-y-2 max-h-60 overflow-y-auto" },
        pings.map(png => 
          e('div', { key: png.id, className: "bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs flex items-center justify-between" },
            e('div', null,
              e('div', { className: "font-bold text-stone-900" }, `"${png.note}"`),
              e('div', { className: "text-[11px] text-stone-500 mt-0.5" },
                'From ', e('strong', { className: "text-stone-800" }, png.from_user_name), ` (${png.from_hostel} Hostel)`
              )
            ),
            e('span', { className: "text-[10px] text-stone-400" }, png.created_at)
          )
        )
      )
    )

  );
};
