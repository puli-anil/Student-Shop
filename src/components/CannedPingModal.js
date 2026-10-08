import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';
import { CANNED_PINGS } from '../seedData.js';

const e = React.createElement;

export const CannedPingModal = ({ listing, onClose, onSuccess }) => {
  const [selectedNote, setSelectedNote] = React.useState(CANNED_PINGS[0]);
  const [sending, setSending] = React.useState(false);
  const [sentSuccess, setSentSuccess] = React.useState(false);
  const user = store.currentUser;

  if (!listing) return null;

  const handleSend = (evt) => {
    evt.preventDefault();
    if (!user) return;

    setSending(true);
    setTimeout(() => {
      store.sendPing(listing.id, selectedNote);
      setSending(false);
      setSentSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1800);
    }, 500);
  };

  return e('div', { className: "fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" },
    e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-2xl max-w-md w-full p-6 shadow-2xl relative" },
      
      e('button', {
        onClick: onClose,
        className: "absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
      }, e(Icon, { name: "X", className: "w-5 h-5" })),

      sentSuccess ? e('div', { className: "text-center py-8" },
        e('div', { className: "w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce" },
          e(Icon, { name: "CheckCircle2", className: "w-10 h-10" })
        ),
        e('h3', { className: "font-display font-bold text-xl text-[#102A27]" }, 'Campus Ping Sent!'),
        e('p', { className: "text-xs text-[#5C6B68] mt-2 max-w-xs mx-auto" },
          'Your message was sent as ',
          e('span', { className: "font-semibold text-stone-900" }, `${user?.name} (${user?.hostel} Hostel)`),
          '. Seller will see it in their alerts!'
        )
      ) : e('form', { onSubmit: handleSend },
        
        e('div', { className: "flex items-center gap-3 mb-4 pb-3 border-b border-stone-100" },
          e('div', { className: "w-10 h-10 rounded-lg bg-emerald-100 text-[#3D7A6E] flex items-center justify-center shrink-0" },
            e(Icon, { name: "MessageCircle", className: "w-5 h-5" })
          ),
          e('div', null,
            e('h3', { className: "font-display font-bold text-lg text-[#102A27]" }, 'Send Campus Ping'),
            e('p', { className: "text-xs text-[#5C6B68]" }, 'Canned messages only • No phone numbers required')
          )
        ),

        e('div', { className: "bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4 flex items-center gap-3" },
          e('img', { src: listing.image_url, alt: listing.title, className: "w-12 h-12 rounded-lg object-cover" }),
          e('div', { className: "truncate" },
            e('div', { className: "font-semibold text-xs text-stone-900 truncate" }, listing.title),
            e('div', { className: "text-xs text-[#3D7A6E] font-bold" }, `${listing.price_label} • ${listing.seller_label}`)
          )
        ),

        e('div', { className: "text-xs text-stone-600 mb-3 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 flex items-center gap-2" },
          e(Icon, { name: "Building2", className: "w-4 h-4 text-amber-700 shrink-0" }),
          e('span', null, 'Sending as ', e('strong', { className: "text-stone-900" }, user?.name), ' from ', e('strong', { className: "text-stone-900" }, `${user?.hostel} Hostel`))
        ),

        e('div', { className: "space-y-2 mb-5" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1" }, 'Choose a Canned Message:'),
          CANNED_PINGS.map((pingText) => 
            e('label', {
              key: pingText,
              className: `flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedNote === pingText ? 'border-[#3D7A6E] bg-emerald-50/70 text-[#102A27] font-medium shadow-xs' : 'border-stone-200 hover:bg-stone-50 text-stone-700'}`
            },
              e('input', {
                type: "radio",
                name: "cannedPing",
                value: pingText,
                checked: selectedNote === pingText,
                onChange: () => setSelectedNote(pingText),
                className: "accent-[#3D7A6E]"
              }),
              e('span', { className: "text-xs" }, pingText)
            )
          )
        ),

        e('div', { className: "flex items-center justify-end gap-2 pt-2" },
          e('button', {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
          }, 'Cancel'),
          e('button', {
            type: "submit",
            disabled: sending,
            className: "bg-[#3D7A6E] hover:bg-[#2F6157] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          },
            sending 
              ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" }), e('span', null, 'Pinging...'))
              : e(React.Fragment, null, e(Icon, { name: "MessageCircle", className: "w-4 h-4" }), e('span', null, 'Ping Seller'))
          )
        )
      )
    )
  );
};
