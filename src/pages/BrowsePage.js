import React from 'react';
import { Icon } from '../components/Icons.js';
import { ListingCard } from '../components/ListingCard.js';
import { CATEGORIES } from '../seedData.js';
import { store } from '../store.js';

const e = React.createElement;

export const BrowsePage = ({ 
  selectedCategory = 'all', 
  onSelectCategory, 
  searchQuery = '', 
  onSelectListing,
  onOpenAuthModal
}) => {
  const campus = store.selectedCampus;

  const [kind, setKind] = React.useState('all');
  const [condition, setCondition] = React.useState('all');
  const [hostel, setHostel] = React.useState('all');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [sort, setSort] = React.useState('newest');
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const filters = {
    category: selectedCategory,
    kind,
    condition,
    hostel,
    minPrice,
    maxPrice,
    sort,
    query: searchQuery
  };

  const listings = store.getListingsForCampus(filters);

  const clearFilters = () => {
    onSelectCategory('all');
    setKind('all');
    setCondition('all');
    setHostel('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  };

  return e('div', { className: "space-y-6 pb-12" },
    
    /* Top Header Bar */
    e('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] border border-[#E2DDD3] p-4 rounded-2xl shadow-xs" },
      e('div', null,
        e('h1', { className: "font-display font-bold text-2xl text-[#102A27]" },
          searchQuery ? `Search results for "${searchQuery}"` : 'Browse Campus Listings'
        ),
        e('p', { className: "text-xs text-[#5C6B68]" },
          'Showing ', e('strong', { className: "text-stone-900" }, listings.length), ' active ads in ', e('strong', { className: "text-[#3D7A6E]" }, campus.name)
        )
      ),

      e('div', { className: "flex items-center gap-2 self-end sm:self-auto" },
        e('button', {
          onClick: () => setShowMobileFilters(!showMobileFilters),
          className: "md:hidden flex items-center gap-1.5 bg-stone-100 border border-stone-300 text-stone-800 px-3 py-2 rounded-xl text-xs font-semibold"
        },
          e(Icon, { name: "SlidersHorizontal", className: "w-4 h-4 text-[#3D7A6E]" }),
          e('span', null, 'Filters')
        ),

        e('div', { className: "flex items-center gap-1 bg-stone-100 border border-stone-200 px-3 py-2 rounded-xl text-xs" },
          e('span', { className: "text-stone-500 font-medium" }, 'Sort:'),
          e('select', {
            value: sort,
            onChange: (evt) => setSort(evt.target.value),
            className: "bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
          },
            e('option', { value: "newest" }, 'Featured & Newest'),
            e('option', { value: "price-low" }, 'Price: Low to High'),
            e('option', { value: "price-high" }, 'Price: High to Low')
          )
        )
      )
    ),

    /* Grid Layout */
    e('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6" },
      
      /* Sidebar Filters */
      e('aside', { className: `md:block space-y-6 ${showMobileFilters ? 'block' : 'hidden'} bg-[#FFFDF8] border border-[#E2DDD3] p-5 rounded-2xl shadow-xs h-fit` },
        e('div', { className: "flex items-center justify-between pb-3 border-b border-stone-100" },
          e('div', { className: "flex items-center gap-2 font-display font-bold text-base text-[#102A27]" },
            e(Icon, { name: "Filter", className: "w-4 h-4 text-[#3D7A6E]" }),
            e('span', null, 'Filter Listings')
          ),
          e('button', {
            onClick: clearFilters,
            className: "text-[11px] text-[#3D7A6E] hover:underline font-semibold"
          }, 'Reset All')
        ),

        /* Category Filter */
        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Category'),
          e('select', {
            value: selectedCategory,
            onChange: (evt) => onSelectCategory(evt.target.value),
            className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          },
            e('option', { value: "all" }, 'All Categories'),
            CATEGORIES.map(cat => e('option', { key: cat.id, value: cat.id }, cat.name))
          )
        ),

        /* Listing Kind Filter */
        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Listing Kind'),
          e('div', { className: "grid grid-cols-2 gap-1.5" },
            [
              { id: 'all', label: 'All' },
              { id: 'marketplace', label: 'Items' },
              { id: 'roommate', label: 'Roommates' },
              { id: 'lostfound', label: 'Lost & Found' },
              { id: 'service', label: 'Services' }
            ].map(k => 
              e('button', {
                key: k.id,
                onClick: () => setKind(k.id),
                className: `px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${kind === k.id ? 'bg-[#102A27] text-white border-[#102A27] font-semibold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'}`
              }, k.label)
            )
          )
        ),

        /* Campus Spot Filter */
        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Campus Spot / Location'),
          e('select', {
            value: hostel,
            onChange: (evt) => setHostel(evt.target.value),
            className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          },
            e('option', { value: "all" }, `All Spots in ${campus.name}`),
            campus.hostels.map(h => e('option', { key: h, value: h }, h))
          )
        ),

        /* Condition Filter */
        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Condition'),
          e('select', {
            value: condition,
            onChange: (evt) => setCondition(evt.target.value),
            className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          },
            e('option', { value: "all" }, 'Any Condition'),
            e('option', { value: "Brand new" }, 'Brand New'),
            e('option', { value: "Like new" }, 'Like New'),
            e('option', { value: "Good" }, 'Good Condition'),
            e('option', { value: "Fair" }, 'Fair / Usable')
          )
        ),

        /* Price Range */
        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Price Range (₹)'),
          e('div', { className: "flex items-center gap-2" },
            e('input', {
              type: "number",
              placeholder: "Min ₹",
              value: minPrice,
              onChange: (evt) => setMinPrice(evt.target.value),
              className: "w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
            }),
            e('span', { className: "text-stone-400 text-xs" }, '-'),
            e('input', {
              type: "number",
              placeholder: "Max ₹",
              value: maxPrice,
              onChange: (evt) => setMaxPrice(evt.target.value),
              className: "w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
            })
          )
        )
      ),

      /* Listings Grid */
      e('main', { className: "md:col-span-3 space-y-4" },
        listings.length === 0 ? e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-2xl p-12 text-center space-y-4 shadow-xs" },
          e('div', { className: "w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto" },
            e(Icon, { name: "Search", className: "w-8 h-8" })
          ),
          e('h3', { className: "font-display font-bold text-xl text-[#102A27]" }, 'No matching campus ads'),
          e('p', { className: "text-xs text-[#5C6B68] max-w-sm mx-auto" },
            `We couldn't find any listings matching your selected filters in ${campus.name}. Try broadening your search.`
          ),
          e('button', {
            onClick: clearFilters,
            className: "bg-[#3D7A6E] hover:bg-[#2F6157] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
          }, 'Clear All Filters')
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

    )
  );
};
