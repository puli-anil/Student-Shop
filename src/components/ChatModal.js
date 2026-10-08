import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';
import { CANNED_PINGS } from '../seedData.js';

const e = React.createElement;

export const ChatModal = ({ listing, onClose }) => {
  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const user = store.currentUser;
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    // Filter messages relevant to this listing
    const loadListingMessages = () => {
      const filtered = store.pings.filter(p => String(p.listing_id) === String(listing.id));
      setMessages([...filtered]);
    };

    loadListingMessages();
    return store.subscribe(() => {
      loadListingMessages();
    });
  }, [listing]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || !user) return;

    setSending(true);
    await store.sendPing(listing.id, text.trim());
    setInputText('');
    setSending(false);
  };

  return e('div', { className: "fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4" },
    
    e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[540px] animate-in fade-in zoom-in-95 duration-200" },
      
      /* Chat Header */
      e('div', { className: "bg-[#102A27] text-white p-4 flex items-center justify-between shadow-md shrink-0" },
        e('div', { className: "flex items-center gap-3" },
          e('div', { className: "w-10 h-10 rounded-full bg-[#1C3E3A] border border-amber-300 flex items-center justify-center text-amber-300 font-bold font-display" },
            listing.seller_label?.charAt(0) || 'S'
          ),
          e('div', null,
            e('div', { className: "font-display font-bold text-sm text-white flex items-center gap-1.5" },
              listing.seller_label,
              e('span', { className: "bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-sans" }, listing.hostel)
            ),
            e('div', { className: "text-[11px] text-stone-300 truncate max-w-[240px]" }, listing.title)
          )
        ),

        e('button', {
          onClick: onClose,
          className: "p-1.5 rounded-full hover:bg-[#1C3E3A] text-stone-300 hover:text-white transition-colors"
        },
          e(Icon, { name: "X", className: "w-5 h-5" })
        )
      ),

      /* Chat Messages Stream */
      e('div', { className: "flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F1EA]/50" },
        messages.length === 0 ? e('div', { className: "text-center py-12 space-y-2" },
          e(Icon, { name: "MessageCircle", className: "w-10 h-10 text-stone-300 mx-auto" }),
          e('div', { className: "font-semibold text-stone-700 text-xs" }, 'No messages yet in this chat'),
          e('div', { className: "text-[11px] text-stone-400 max-w-xs mx-auto" }, 'Send a 1-click canned ping or type a custom message to connect on campus!')
        ) : messages.map((msg, idx) => {
          const isMe = user && msg.from_user_name === user.name;
          return e('div', {
            key: msg.id || idx,
            className: `flex flex-col ${isMe ? 'items-end' : 'items-start'}`
          },
            e('div', {
              className: `max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${isMe ? 'bg-[#102A27] text-white rounded-br-none shadow-xs' : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none shadow-xs'}`
            },
              e('div', { className: `text-[10px] font-bold ${isMe ? 'text-amber-300' : 'text-[#3D7A6E]'}` },
                isMe ? 'You' : `${msg.from_user_name} (${msg.from_hostel})`
              ),
              e('div', { className: "leading-relaxed" }, msg.note),
              e('div', { className: `text-[9px] text-right ${isMe ? 'text-stone-400' : 'text-stone-400'}` },
                msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
              )
            )
          );
        }),
        e('div', { ref: messagesEndRef })
      ),

      /* 1-Click Quick Canned Pings Strip */
      e('div', { className: "p-2 bg-stone-100 border-t border-stone-200 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0" },
        CANNED_PINGS.slice(0, 3).map((ping) => 
          e('button', {
            key: ping,
            onClick: () => handleSendMessage(ping),
            className: "bg-white hover:bg-emerald-50 text-stone-700 hover:text-[#102A27] border border-stone-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-2xs transition-colors"
          }, `"${ping}"`)
        )
      ),

      /* Chat Input Bar */
      e('form', {
        onSubmit: (evt) => {
          evt.preventDefault();
          handleSendMessage();
        },
        className: "p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
      },
        e('input', {
          type: "text",
          value: inputText,
          onChange: (evt) => setInputText(evt.target.value),
          placeholder: "Type a campus message...",
          className: "flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
        }),

        e('button', {
          type: "submit",
          disabled: !inputText.trim() || sending,
          className: "bg-[#102A27] hover:bg-[#1C3E3A] text-amber-300 p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-40"
        },
          e(Icon, { name: "Send", className: "w-4 h-4 stroke-[2.5]" })
        )
      )

    )
  );
};
