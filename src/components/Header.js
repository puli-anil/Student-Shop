import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';
import { CAMPUSES } from '../seedData.js';

const e = React.createElement;

export const Header = ({ 
  activeRoute, 
  onNavigate, 
  searchQuery = '', 
  onSearchChange,
  onSearchSubmit,
  onOpenAuthModal
}) => {
  const [currentCampus, setCurrentCampus] = React.useState(store.selectedCampus);
  const [currentHostel, setCurrentHostel] = React.useState(store.selectedHostel);
  const [user, setUser] = React.useState(store.currentUser);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showCampusDropdown, setShowCampusDropdown] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    return store.subscribe(() => {
      setCurrentCampus(store.selectedCampus);
      setCurrentHostel(store.selectedHostel);
      setUser(store.currentUser);
    });
  }, []);

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleCampusSelect = (campusId) => {
    store.setCampus(campusId);
    setShowCampusDropdown(false);
    if (onNavigate && activeRoute !== 'browse' && activeRoute !== 'home') {
      onNavigate('home');
    }
  };

  const handleHostelChange = (evt) => {
    store.setHostel(evt.target.value);
  };

  const handleSearchSubmitForm = (evt) => {
    evt.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    }
  };

  return e('header', { className: "bg-[#102A27] text-white sticky top-0 z-40 shadow-md" },
    e('div', { className: "bg-[#0A1D1B] border-b border-[#1C3E3A] px-4 py-1 text-center text-xs text-emerald-300 font-medium" },
      '🎓 Hyperlocal Campus Marketplace for Day Scholars & Hostellers • Meet on Campus • Verified Students Only'
    ),
    e('div', { className: "max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center gap-3" },
      
      /* Logo + Campus Selector */
      e('div', { className: "flex items-center justify-between w-full md:w-auto gap-4 shrink-0" },
        e('div', { 
          onClick: () => onNavigate('home'), 
          className: "flex items-center gap-2 cursor-pointer group" 
        },
          e('div', { className: "w-10 h-10 rounded-xl bg-[#3D7A6E] flex items-center justify-center text-amber-300 font-display font-black text-xl shadow-inner group-hover:scale-105 transition-transform" }, 'SS'),
          e('div', null,
            e('span', { className: "font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-300 transition-colors" },
              'Student ', e('span', { className: "text-amber-400" }, 'Shop')
            ),
            e('span', { className: "block text-[10px] text-emerald-400 font-sans tracking-wide uppercase font-semibold" },
              `${currentCampus.name} Hub`
            )
          )
        ),
        e('div', { className: "relative" },
          e('button', {
            onClick: () => setShowCampusDropdown(!showCampusDropdown),
            className: "flex items-center gap-1.5 bg-[#1C3E3A] hover:bg-[#25504B] text-amber-200 px-3 py-1.5 rounded-lg border border-[#2D6059] text-xs font-semibold transition-colors"
          },
            e(Icon, { name: "Building2", className: "w-3.5 h-3.5 text-amber-300" }),
            e('span', { className: "max-w-[120px] truncate" }, currentCampus.name),
            e(Icon, { name: "ChevronDown", className: "w-3.5 h-3.5 text-emerald-300" })
          ),
          showCampusDropdown && e('div', { className: "absolute top-full left-0 mt-1 w-64 bg-[#FFFDF8] text-stone-900 rounded-xl shadow-xl border border-[#E2DDD3] py-2 z-50 animate-in fade-in duration-150" },
            e('div', { className: "px-3 py-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider" }, 'Select Engineering College'),
            CAMPUSES.map(c => 
              e('button', {
                key: c.id,
                onClick: () => handleCampusSelect(c.id),
                className: `w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${c.id === currentCampus.id ? 'font-bold text-[#102A27] bg-emerald-50/80' : 'text-stone-700'}`
              },
                e('div', null,
                  e('div', { className: "font-semibold" }, c.name),
                  e('div', { className: "text-[11px] text-stone-500" }, `${c.fullName} • ${c.city}`)
                ),
                c.id === currentCampus.id && e(Icon, { name: "CheckCircle2", className: "w-4 h-4 text-emerald-600" })
              )
            )
          )
        )
      ),

      /* Search Bar */
      e('form', { 
        onSubmit: handleSearchSubmitForm,
        className: "flex-1 w-full flex items-center bg-[#FFFDF8] rounded-xl border border-[#E2DDD3] overflow-hidden focus-within:ring-2 focus-within:ring-[#3D7A6E] shadow-sm"
      },
        e('div', { className: "hidden sm:flex items-center px-2 py-1 bg-stone-100/80 border-r border-[#E2DDD3]" },
          e(Icon, { name: "MapPin", className: "w-3.5 h-3.5 text-[#3D7A6E] mr-1" }),
          e('select', {
            value: currentHostel,
            onChange: handleHostelChange,
            className: "bg-transparent text-stone-800 text-xs font-medium focus:outline-none cursor-pointer pr-1"
          },
            e('option', { value: "All Hostels" }, 'All Campus Spots'),
            currentCampus.hostels.map(h => e('option', { key: h, value: h }, h))
          )
        ),
        e('div', { className: "flex-1 flex items-center px-3 py-2 text-stone-900" },
          e(Icon, { name: "Search", className: "w-4 h-4 text-stone-400 mr-2 shrink-0" }),
          e('input', {
            type: "text",
            value: localSearch,
            onChange: (evt) => {
              setLocalSearch(evt.target.value);
              if (onSearchChange) onSearchChange(evt.target.value);
            },
            placeholder: "Find books, calci, drafters, cycles, roommates...",
            className: "w-full bg-transparent text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none"
          })
        ),
        e('button', {
          type: "submit",
          className: "bg-[#3D7A6E] hover:bg-[#2F6157] text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
        }, 'Search')
      ),

      /* User Actions */
      e('div', { className: "flex items-center gap-2 shrink-0 self-end md:self-auto" },
        e('button', {
          onClick: () => {
            if (!user) onOpenAuthModal();
            else onNavigate('favorites');
          },
          className: `p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${activeRoute === 'favorites' ? 'bg-[#1C3E3A] text-amber-300' : 'hover:bg-[#1C3E3A] text-stone-200'}`,
          title: "Saved listings"
        },
          e(Icon, { name: "Heart", className: "w-4 h-4 text-rose-400" }),
          e('span', { className: "hidden lg:inline" }, 'Saved')
        ),

        user ? e('div', { className: "relative" },
          e('button', {
            onClick: () => setShowUserMenu(!showUserMenu),
            className: "flex items-center gap-2 bg-[#1C3E3A] hover:bg-[#25504B] p-1.5 pl-2.5 rounded-lg border border-[#2D6059] text-xs transition-colors"
          },
            e('img', { src: user.avatar, alt: user.name, className: "w-6 h-6 rounded-full object-cover border border-amber-300" }),
            e('span', { className: "font-semibold text-white max-w-[90px] truncate" }, user.name),
            e(Icon, { name: "ChevronDown", className: "w-3.5 h-3.5 text-stone-300" })
          ),
          showUserMenu && e('div', { className: "absolute right-0 top-full mt-1 w-52 bg-[#FFFDF8] text-stone-900 rounded-xl shadow-xl border border-[#E2DDD3] py-2 z-50" },
            e('div', { className: "px-3 py-2 border-b border-stone-100" },
              e('div', { className: "font-bold text-stone-900 text-xs" }, user.name),
              e('div', { className: "text-[11px] text-stone-500" }, user.email),
              e('div', { className: "text-[10px] text-emerald-700 font-medium mt-0.5" }, `${user.hostel} Hostel • ${user.year}`)
            ),
            e('button', {
              onClick: () => { setShowUserMenu(false); onNavigate('my-ads'); },
              className: "w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2"
            },
              e(Icon, { name: "Tag", className: "w-4 h-4 text-[#3D7A6E]" }),
              'My Posted Ads'
            ),
            e('button', {
              onClick: () => { setShowUserMenu(false); onNavigate('favorites'); },
              className: "w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2"
            },
              e(Icon, { name: "Heart", className: "w-4 h-4 text-rose-500" }),
              'Saved Favorites'
            ),
            e('button', {
              onClick: () => {
                setShowUserMenu(false);
                store.logout();
                onNavigate('home');
              },
              className: "w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-stone-100"
            },
              e(Icon, { name: "LogOut", className: "w-4 h-4" }),
              'Sign Out'
            )
          )
        ) : e('button', {
          onClick: onOpenAuthModal,
          className: "px-3 py-2 rounded-lg bg-[#1C3E3A] hover:bg-[#25504B] text-amber-200 text-xs font-semibold transition-colors border border-[#2D6059]"
        }, 'Log In'),

        e('button', {
          onClick: () => {
            if (!user) onOpenAuthModal();
            else onNavigate('post');
          },
          className: "bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all transform active:scale-95"
        },
          e(Icon, { name: "PlusCircle", className: "w-4 h-4 stroke-[2.5]" }),
          e('span', null, '+ SELL')
        )
      )
    )
  );
};
