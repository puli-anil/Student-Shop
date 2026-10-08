import React from 'react';
import { Icon } from '../components/Icons.js';
import { ListingCard } from '../components/ListingCard.js';
import { store } from '../store.js';

const e = React.createElement;

export const HubPage = ({ hubType, onNavigate, onSelectListing, onOpenAuthModal }) => {
  const campus = store.selectedCampus;
  
  const hubConfigs = {
    roommates: {
      title: 'Roommate & Flatmate Finder',
      subtitle: 'Hostel room swaps, PG flatmates & occupancy replacements on campus',
      kind: 'roommate',
      icon: 'Users',
      color: 'bg-purple-600',
      heroBadge: 'Roommates Hub',
      postCTA: 'Post Roommate Ad'
    },
    'lost-found': {
      title: 'Campus Lost & Found',
      subtitle: 'Report lost student ID cards, keys, earbud cases, drafter lids & found items',
      kind: 'lostfound',
      icon: 'Search',
      color: 'bg-amber-600',
      heroBadge: 'Lost & Found Hub',
      postCTA: 'Report Item'
    },
    services: {
      title: 'Peer Tutoring & Student Services',
      subtitle: 'Maths backlog crash courses, SolidWorks CAD modeling, Python mini projects & report help',
      kind: 'service',
      icon: 'GraduationCap',
      color: 'bg-blue-600',
      heroBadge: 'Services Hub',
      postCTA: 'Offer Service'
    }
  };

  const config = hubConfigs[hubType] || hubConfigs['roommates'];
  const listings = store.getListingsForCampus({ kind: config.kind });

  return e('div', { className: "space-y-8 pb-12" },
    
    /* Hero Banner */
    e('div', { className: "bg-[#102A27] text-white p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" },
      e('div', { className: "space-y-3 max-w-xl" },
        e('div', { className: "inline-flex items-center gap-2 bg-[#1C3E3A] border border-[#2D6059] text-amber-300 text-xs px-3 py-1 rounded-full font-semibold" },
          e(Icon, { name: config.icon, className: "w-3.5 h-3.5 text-amber-300" }),
          e('span', null, `${config.heroBadge} • ${campus.name}`)
        ),

        e('h1', { className: "font-display font-extrabold text-3xl sm:text-4xl leading-tight" }, config.title),
        e('p', { className: "text-stone-300 text-xs sm:text-sm leading-relaxed" }, config.subtitle)
      ),

      e('button', {
        onClick: () => {
          if (!store.currentUser) onOpenAuthModal();
          else onNavigate('post');
        },
        className: "bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shrink-0"
      },
        e(Icon, { name: "PlusCircle", className: "w-4 h-4 stroke-[2.5]" }),
        e('span', null, config.postCTA)
      )
    ),

    /* Listings Section */
    e('div', { className: "space-y-4" },
      e('div', { className: "flex items-center justify-between" },
        e('h2', { className: "font-display font-bold text-xl text-[#102A27]" }, `Active ${config.heroBadge} List (${listings.length})`),
        e('span', { className: "text-xs text-[#5C6B68]" }, `Filtered by ${campus.name}`)
      ),

      listings.length === 0 ? e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-2xl p-12 text-center space-y-3" },
        e(Icon, { name: config.icon, className: "w-10 h-10 text-stone-400 mx-auto" }),
        e('h3', { className: "font-bold text-stone-700" }, `No active ${config.title.toLowerCase()} listings`),
        e('p', { className: "text-xs text-stone-500" }, `Be the first student to post in this hub for ${campus.name}!`)
      ) : e('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
        listings.map(listing => 
          e(ListingCard, {
            key: listing.id,
            listing,
            onSelect: onSelectListing,
            onFavoriteClick: onOpenAuthModal
          })
        )
      )
    )
  );
};
