import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';

const e = React.createElement;

export const MobileNav = ({ activeRoute, onNavigate, onOpenAuthModal }) => {
  const [user, setUser] = React.useState(store.currentUser);

  React.useEffect(() => {
    return store.subscribe(() => setUser(store.currentUser));
  }, []);

  return e('div', { className: "md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-[#E2DDD3] shadow-lg z-40 px-3 py-1.5 flex items-center justify-around" },
    
    e('button', {
      onClick: () => onNavigate('home'),
      className: `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${activeRoute === 'home' ? 'text-[#102A27] font-bold' : 'text-stone-500'}`
    },
      e(Icon, { name: "Building2", className: `w-5 h-5 ${activeRoute === 'home' ? 'text-[#3D7A6E]' : ''}` }),
      e('span', null, 'Home')
    ),

    e('button', {
      onClick: () => onNavigate('browse'),
      className: `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${activeRoute === 'browse' ? 'text-[#102A27] font-bold' : 'text-stone-500'}`
    },
      e(Icon, { name: "Search", className: `w-5 h-5 ${activeRoute === 'browse' ? 'text-[#3D7A6E]' : ''}` }),
      e('span', null, 'Browse')
    ),

    e('button', {
      onClick: () => {
        if (!user) onOpenAuthModal();
        else onNavigate('post');
      },
      className: "flex flex-col items-center -mt-5"
    },
      e('div', { className: "w-12 h-12 rounded-full bg-amber-400 border-4 border-[#FFFDF8] flex items-center justify-center text-stone-950 shadow-md active:scale-95 transition-transform" },
        e(Icon, { name: "PlusCircle", className: "w-7 h-7 stroke-[2.5]" })
      ),
      e('span', { className: "text-[10px] font-extrabold text-stone-900 mt-0.5" }, 'Sell')
    ),

    e('button', {
      onClick: () => {
        if (!user) onOpenAuthModal();
        else onNavigate('favorites');
      },
      className: `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${activeRoute === 'favorites' ? 'text-[#102A27] font-bold' : 'text-stone-500'}`
    },
      e(Icon, { name: "Heart", className: `w-5 h-5 ${activeRoute === 'favorites' ? 'text-rose-500' : ''}` }),
      e('span', null, 'Saved')
    ),

    e('button', {
      onClick: () => {
        if (!user) onOpenAuthModal();
        else onNavigate('my-ads');
      },
      className: `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${activeRoute === 'my-ads' ? 'text-[#102A27] font-bold' : 'text-stone-500'}`
    },
      e(Icon, { name: "User", className: `w-5 h-5 ${activeRoute === 'my-ads' ? 'text-[#3D7A6E]' : ''}` }),
      e('span', null, 'My Ads')
    )
  );
};
