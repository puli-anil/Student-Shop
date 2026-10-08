import React from 'react';
import { Icon } from '../components/Icons.js';
import { ListingCard } from '../components/ListingCard.js';
import { CATEGORIES } from '../seedData.js';
import { store } from '../store.js';

const e = React.createElement;

export const HomePage = ({ onNavigate, onSelectCategory, onSelectListing, onOpenAuthModal }) => {
  const [campus, setCampus] = React.useState(store.selectedCampus);

  React.useEffect(() => {
    return store.subscribe(() => {
      setCampus(store.selectedCampus);
    });
  }, []);

  const featuredListings = store.getListingsForCampus({ featuredOnly: true }).slice(0, 4);
  const freshListings = store.getListingsForCampus({}).slice(0, 8);

  const hubCards = [
    {
      id: 'roommates',
      title: 'Roommate Finder',
      subtitle: 'Hostel room swaps & PG flatmates',
      icon: 'Users',
      color: 'from-purple-900 to-indigo-900',
      badge: 'Roommates',
      route: 'roommates'
    },
    {
      id: 'lost-found',
      title: 'Lost & Found',
      subtitle: 'ID cards, keys, earbud cases & drafter lids',
      icon: 'Search',
      color: 'from-amber-900 to-orange-950',
      badge: 'Campus Lost/Found',
      route: 'lost-found'
    },
    {
      id: 'services',
      title: 'Peer Services',
      subtitle: 'Maths tutoring, CAD help & project work',
      icon: 'GraduationCap',
      color: 'from-emerald-950 to-teal-900',
      badge: 'Services & Skills',
      route: 'services'
    },
    {
      id: 'calci-drafters',
      title: 'Calci & Drafters',
      subtitle: 'Classwiz calculators & mini drafters',
      icon: 'Calculator',
      color: 'from-stone-900 to-emerald-950',
      badge: 'Hostel Essentials',
      route: 'browse'
    }
  ];

  return e('div', { className: "space-y-8 pb-12" },
    
    /* Hero Banner Section */
    e('section', { className: "relative bg-[#102A27] text-white rounded-3xl p-6 sm:p-10 overflow-hidden shadow-xl" },
      e('div', { className: "absolute top-0 right-0 w-96 h-96 bg-[#3D7A6E]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" }),
      
      e('div', { className: "relative z-10 max-w-2xl space-y-4" },
        e('div', { className: "inline-flex items-center gap-2 bg-[#1C3E3A] border border-[#2D6059] text-amber-300 text-xs px-3 py-1 rounded-full font-semibold" },
          e(Icon, { name: "Sparkles", className: "w-3.5 h-3.5 text-amber-300 fill-amber-300" }),
          e('span', null, `Official Campus Portal for ${campus.name}`)
        ),

        e('h1', { className: "font-display font-black text-3xl sm:text-5xl leading-[1.15] text-white tracking-tight" },
          'Buy, sell & trade across ',
          e('span', { className: "text-amber-400 font-serif italic" }, campus.shortCode),
          ' campus.'
        ),

        e('p', { className: "text-stone-300 text-xs sm:text-sm font-sans max-w-xl leading-relaxed" },
          'Hyperlocal student marketplace for Day Scholars, Hostellers & PGs. Trade used calculators, textbooks, lab coats, cycles, roommate swaps & lost items safely on campus.'
        ),

        e('div', { className: "pt-2 flex flex-wrap items-center gap-3" },
          e('button', {
            onClick: () => onNavigate('browse'),
            className: "bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
          }, 'Browse Campus Marketplace'),

          e('button', {
            onClick: () => {
              if (!store.currentUser) onOpenAuthModal();
              else onNavigate('post');
            },
            className: "bg-[#1C3E3A] hover:bg-[#25504B] border border-[#2D6059] text-stone-100 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          },
            e(Icon, { name: "PlusCircle", className: "w-4 h-4 text-amber-300 stroke-[2.5]" }),
            e('span', null, 'Post Free Ad')
          )
        )
      )
    ),

    /* 4 Hub Quick Cards */
    e('section', { className: "space-y-3" },
      e('div', { className: "flex items-center justify-between" },
        e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Student Life Hubs'),
        e('span', { className: "text-xs text-[#5C6B68]" }, `Active in ${campus.name}`)
      ),

      e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
        hubCards.map(hub => 
          e('div', {
            key: hub.id,
            onClick: () => {
              if (hub.id === 'calci-drafters') onSelectCategory('calci-drafters');
              else onNavigate(hub.route);
            },
            className: `bg-gradient-to-br ${hub.color} text-white p-5 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-200 shadow-md flex flex-col justify-between h-36 group`
          },
            e('div', { className: "flex items-start justify-between" },
              e('span', { className: "text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded text-amber-300" }, hub.badge),
              e(Icon, { name: hub.icon, className: "w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" })
            ),
            e('div', null,
              e('h3', { className: "font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors" }, hub.title),
              e('p', { className: "text-[11px] text-stone-300 line-clamp-1" }, hub.subtitle)
            )
          )
        )
      )
    ),

    /* Featured Campus Listings */
    featuredListings.length > 0 && e('section', { className: "space-y-4" },
      e('div', { className: "flex items-center justify-between" },
        e('div', { className: "flex items-center gap-2" },
          e(Icon, { name: "Sparkles", className: "w-5 h-5 text-amber-500 fill-amber-400" }),
          e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Featured Campus Ads')
        ),
        e('button', {
          onClick: () => onNavigate('browse'),
          className: "text-xs font-bold text-[#3D7A6E] hover:underline"
        }, 'See All Ads →')
      ),

      e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
        featuredListings.map(listing => 
          e(ListingCard, {
            key: listing.id,
            listing,
            onSelect: onSelectListing,
            onFavoriteClick: onOpenAuthModal
          })
        )
      )
    ),

    /* Popular Categories Grid */
    e('section', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 rounded-3xl space-y-4 shadow-xs" },
      e('div', { className: "flex items-center justify-between" },
        e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Explore Categories'),
        e('span', { className: "text-xs text-[#5C6B68]" }, 'Campus classifieds')
      ),

      e('div', { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" },
        CATEGORIES.map(cat => 
          e('button', {
            key: cat.id,
            onClick: () => onSelectCategory(cat.id),
            className: "bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 p-3 rounded-xl text-center flex flex-col items-center gap-2 group transition-all"
          },
            e('div', { className: "w-10 h-10 rounded-full bg-[#102A27] text-amber-300 flex items-center justify-center group-hover:bg-[#3D7A6E] transition-colors" },
              e(Icon, { name: cat.icon, className: "w-5 h-5" })
            ),
            e('span', { className: "text-xs font-semibold text-stone-800 group-hover:text-[#102A27]" }, cat.name)
          )
        )
      )
    ),

    /* Fresh Recommendations Grid */
    e('section', { className: "space-y-4" },
      e('div', { className: "flex items-center justify-between" },
        e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Fresh Recommendations'),
        e('span', { className: "text-xs text-[#5C6B68]" }, `Posted recently in ${campus.name}`)
      ),

      e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
        freshListings.map(listing => 
          e(ListingCard, {
            key: listing.id,
            listing,
            onSelect: onSelectListing,
            onFavoriteClick: onOpenAuthModal
          })
        )
      )
    ),

    /* Footer */
    e('footer', { className: "bg-[#102A27] text-stone-300 rounded-3xl p-6 sm:p-8 mt-12 space-y-6" },
      e('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6 text-xs" },
        e('div', { className: "space-y-2" },
          e('div', { className: "flex items-center gap-2" },
            e('div', { className: "w-8 h-8 rounded-lg bg-[#3D7A6E] flex items-center justify-center text-amber-300 font-display font-bold text-lg" }, 'SS'),
            e('span', { className: "font-display font-extrabold text-xl text-white" }, 'Student Shop')
          ),
          e('p', { className: "text-stone-400 text-[11px] leading-relaxed" },
            'Hyperlocal classifieds for Indian engineering college campuses. Buy, sell, rent, and sort hostel life directly with verified peers.'
          )
        ),
        e('div', null,
          e('h4', { className: "font-bold text-amber-300 uppercase tracking-wider mb-2" }, 'Marketplace'),
          e('ul', { className: "space-y-1.5 text-stone-300" },
            e('li', null, e('button', { onClick: () => { onSelectCategory('books-notes'); onNavigate('browse'); }, className: "hover:text-white" }, 'Books & Notes')),
            e('li', null, e('button', { onClick: () => { onSelectCategory('calci-drafters'); onNavigate('browse'); }, className: "hover:text-white" }, 'Calci & Drafters')),
            e('li', null, e('button', { onClick: () => { onSelectCategory('cycles'); onNavigate('browse'); }, className: "hover:text-white" }, 'Cycles & Transport')),
            e('li', null, e('button', { onClick: () => { onSelectCategory('hostel-essentials'); onNavigate('browse'); }, className: "hover:text-white" }, 'Hostel Essentials'))
          )
        ),
        e('div', null,
          e('h4', { className: "font-bold text-amber-300 uppercase tracking-wider mb-2" }, 'Student Life Hub'),
          e('ul', { className: "space-y-1.5 text-stone-300" },
            e('li', null, e('button', { onClick: () => onNavigate('roommates'), className: "hover:text-white" }, 'Roommate Finder')),
            e('li', null, e('button', { onClick: () => onNavigate('lost-found'), className: "hover:text-white" }, 'Lost & Found')),
            e('li', null, e('button', { onClick: () => onNavigate('services'), className: "hover:text-white" }, 'Peer Tutoring & CAD')),
            e('li', null, e('button', { onClick: () => onNavigate('post'), className: "hover:text-white" }, 'Post a Free Ad'))
          )
        ),
        e('div', null,
          e('h4', { className: "font-bold text-amber-300 uppercase tracking-wider mb-2" }, 'Seeded Campuses'),
          e('ul', { className: "space-y-1.5 text-stone-300" },
            e('li', { className: "font-semibold text-amber-200" }, 'RVR & JC — R.V.R. & J.C. College of Engg'),
            e('li', null, 'RIT Chennai — Riverside Inst of Tech'),
            e('li', null, 'VKI Pune — Valley Knowledge Inst'),
            e('li', null, 'HCE Mumbai — Harbor College of Engg'),
            e('li', { className: "text-stone-400 pt-1" }, '© 2026 Student Shop • Made for Engineering Colleges')
          )
        )
      )
    )

  );
};
