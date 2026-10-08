import React from 'react';
import { Header } from './components/Header.js';
import { CategoryStrip } from './components/CategoryStrip.js';
import { MobileNav } from './components/MobileNav.js';
import { AuthModal } from './components/AuthModal.js';

import { HomePage } from './pages/HomePage.js';
import { BrowsePage } from './pages/BrowsePage.js';
import { ListingDetailPage } from './pages/ListingDetailPage.js';
import { PostAdPage } from './pages/PostAdPage.js';
import { HubPage } from './pages/HubPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { MyAdsPage } from './pages/MyAdsPage.js';

import { store } from './store.js';

const e = React.createElement;

export const App = () => {
  const [activeRoute, setActiveRoute] = React.useState('home');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedListingId, setSelectedListingId] = React.useState(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [campus, setCampus] = React.useState(store.selectedCampus);

  React.useEffect(() => {
    return store.subscribe(() => {
      setCampus(store.selectedCampus);
    });
  }, []);

  const handleNavigate = (route, params = {}) => {
    setActiveRoute(route);
    if (params.listingId) {
      setSelectedListingId(params.listingId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (listing) => {
    setSelectedListingId(listing.id);
    setActiveRoute('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (activeRoute !== 'browse') {
      setActiveRoute('browse');
    }
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setActiveRoute('browse');
  };

  return e('div', { className: "min-h-screen bg-[#F4F1EA] text-stone-900 font-sans flex flex-col antialiased selection:bg-[#3D7A6E] selection:text-white" },
    
    e(Header, {
      activeRoute,
      onNavigate: handleNavigate,
      searchQuery,
      onSearchChange: (q) => setSearchQuery(q),
      onSearchSubmit: handleSearchSubmit,
      onOpenAuthModal: () => setShowAuthModal(true)
    }),

    e(CategoryStrip, {
      activeCategory: selectedCategory,
      onSelectCategory: handleSelectCategory
    }),

    e('main', { className: "flex-1 max-w-7xl w-full mx-auto px-4 py-6" },
      activeRoute === 'home' && e(HomePage, {
        onNavigate: handleNavigate,
        onSelectCategory: handleSelectCategory,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      }),

      activeRoute === 'browse' && e(BrowsePage, {
        selectedCategory,
        onSelectCategory: setSelectedCategory,
        searchQuery,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      }),

      activeRoute === 'detail' && e(ListingDetailPage, {
        listingId: selectedListingId,
        onNavigate: handleNavigate,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      }),

      activeRoute === 'post' && e(PostAdPage, {
        onNavigate: handleNavigate,
        onPublished: (newAd) => {
          setSelectedListingId(newAd.id);
          setActiveRoute('detail');
        }
      }),

      (activeRoute === 'roommates' || activeRoute === 'lost-found' || activeRoute === 'services') && e(HubPage, {
        hubType: activeRoute,
        onNavigate: handleNavigate,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      }),

      activeRoute === 'favorites' && e(FavoritesPage, {
        onNavigate: handleNavigate,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      }),

      activeRoute === 'my-ads' && e(MyAdsPage, {
        onNavigate: handleNavigate,
        onSelectListing: handleSelectListing,
        onOpenAuthModal: () => setShowAuthModal(true)
      })
    ),

    e(MobileNav, {
      activeRoute,
      onNavigate: handleNavigate,
      onOpenAuthModal: () => setShowAuthModal(true)
    }),

    showAuthModal && e(AuthModal, {
      onClose: () => setShowAuthModal(false),
      onSuccess: () => setShowAuthModal(false)
    })
  );
};
