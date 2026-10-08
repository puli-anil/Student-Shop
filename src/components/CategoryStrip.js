import React from 'react';
import { Icon } from './Icons.js';
import { CATEGORIES } from '../seedData.js';

const e = React.createElement;

export const CategoryStrip = ({ activeCategory, onSelectCategory }) => {
  return e('div', { className: "bg-[#FFFDF8] border-b border-[#E2DDD3] shadow-xs sticky top-[108px] sm:top-[68px] z-30 overflow-x-auto no-scrollbar py-2 px-4" },
    e('div', { className: "max-w-7xl mx-auto flex items-center gap-2 min-w-max" },
      
      e('button', {
        onClick: () => onSelectCategory('all'),
        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
          !activeCategory || activeCategory === 'all'
            ? 'bg-[#102A27] text-white border-[#102A27] shadow-xs'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
        }`
      },
        e(Icon, { name: "SlidersHorizontal", className: "w-3.5 h-3.5" }),
        e('span', null, 'All Items')
      ),

      CATEGORIES.map(cat => {
        const isSelected = activeCategory === cat.id;
        return e('button', {
          key: cat.id,
          onClick: () => onSelectCategory(cat.id),
          className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
            isSelected
              ? 'bg-[#3D7A6E] text-white border-[#3D7A6E] font-semibold shadow-xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-[#E2DDD3]'
          }`
        },
          e(Icon, { name: cat.icon, className: `w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-[#3D7A6E]'}` }),
          e('span', null, cat.name)
        );
      })
    )
  );
};
