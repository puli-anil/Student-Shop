import React from 'react';
import { Icon } from '../components/Icons.js';
import { CATEGORIES } from '../seedData.js';
import { store } from '../store.js';
import { compressImage } from '../utils/imageCompressor.js';

const e = React.createElement;

export const PostAdPage = ({ onNavigate, onPublished }) => {
  const user = store.currentUser;
  const campus = store.selectedCampus;

  const [step, setStep] = React.useState(1);
  const [kind, setKind] = React.useState('marketplace');
  const [category, setCategory] = React.useState('calci-drafters');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [priceLabel, setPriceLabel] = React.useState('');
  const [condition, setCondition] = React.useState('Good');
  const [hostel, setHostel] = React.useState(user?.hostel || campus.hostels[0]);
  const [imageUrl, setImageUrl] = React.useState('');
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [featured, setFeatured] = React.useState(false);

  const [occupancy, setOccupancy] = React.useState('3 Sharing AC');
  const [lostFoundStatus, setLostFoundStatus] = React.useState('LOST');
  const [subject, setSubject] = React.useState('Engineering Maths / CAD');

  if (!user) {
    return e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8" },
      e('div', { className: "w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto" },
        e(Icon, { name: "User", className: "w-8 h-8" })
      ),
      e('h2', { className: "font-display font-bold text-2xl text-[#102A27]" }, 'Login Required'),
      e('p', { className: "text-xs text-[#5C6B68]" }, `You must be logged in with a campus account to post an ad on ${campus.name}.`),
      e('button', {
        onClick: () => onNavigate('home'),
        className: "bg-[#102A27] text-amber-300 px-6 py-2.5 rounded-xl font-bold text-xs"
      }, 'Return to Home')
    );
  }

  const defaultSampleImages = {
    'books-notes': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'calci-drafters': 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?auto=format&fit=crop&w=800&q=80',
    'laptops-gadgets': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'phones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'cycles': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    'hostel-essentials': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'fashion': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    'sports-hobbies': 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
    'roommates': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'lost-found': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    'tutoring-services': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  };

  const handleFileSelect = async (evt) => {
    const file = evt.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Compress image client-side to < 80 KB
      const compressedDataUrl = await compressImage(file, 800, 0.6);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePublish = async (evt) => {
    evt.preventDefault();
    const finalImage = imageUrl || defaultSampleImages[category] || defaultSampleImages['calci-drafters'];

    const extra = {};
    if (kind === 'roommate') extra.occupancy = occupancy;
    if (kind === 'lostfound') extra.status = lostFoundStatus;
    if (kind === 'service') extra.subject = subject;

    const newAd = await store.addListing({
      title,
      description,
      price: Number(price) || 0,
      price_label: priceLabel || (Number(price) > 0 ? `₹ ${price}` : 'Free'),
      category,
      condition,
      hostel,
      image_url: finalImage,
      featured,
      listing_kind: kind,
      extra
    });

    if (onPublished) onPublished(newAd);
  };

  return e('div', { className: "max-w-2xl mx-auto space-y-6 pb-12" },
    
    /* Header progress */
    e('div', { className: "bg-[#102A27] text-white p-6 rounded-3xl shadow-md space-y-3" },
      e('div', { className: "flex items-center justify-between text-xs text-amber-300 font-semibold" },
        e('span', null, `Posting on ${campus.name}`),
        e('span', null, `Step ${step} of 3`)
      ),

      e('h1', { className: "font-display font-bold text-2xl" },
        step === 1 && 'Step 1: Select Ad Kind & Category',
        step === 2 && 'Step 2: Enter Ad Details & Upload Photo',
        step === 3 && 'Step 3: Preview & Boost Listing'
      ),

      e('div', { className: "w-full bg-[#1C3E3A] h-2 rounded-full overflow-hidden" },
        e('div', {
          className: "bg-amber-400 h-full transition-all duration-300",
          style: { width: `${(step / 3) * 100}%` }
        })
      )
    ),

    /* Form Container */
    e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] p-6 sm:p-8 rounded-3xl shadow-xs" },
      
      /* STEP 1 */
      step === 1 && e('div', { className: "space-y-6" },
        e('div', null,
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2" }, 'What are you posting?'),
          e('div', { className: "grid grid-cols-2 sm:grid-cols-4 gap-2" },
            [
              { id: 'marketplace', label: 'Sell / Rent Item', icon: 'Tag' },
              { id: 'roommate', label: 'Roommate Finder', icon: 'Users' },
              { id: 'lostfound', label: 'Lost & Found', icon: 'Search' },
              { id: 'service', label: 'Peer Service', icon: 'GraduationCap' }
            ].map(k => 
              e('button', {
                key: k.id,
                type: "button",
                onClick: () => {
                  setKind(k.id);
                  if (k.id === 'roommate') setCategory('roommates');
                  else if (k.id === 'lostfound') setCategory('lost-found');
                  else if (k.id === 'service') setCategory('tutoring-services');
                },
                className: `p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${kind === k.id ? 'border-[#3D7A6E] bg-emerald-50 text-[#102A27] font-bold shadow-xs' : 'border-stone-200 hover:bg-stone-50 text-stone-700'}`
              },
                e(Icon, { name: k.icon, className: `w-5 h-5 ${kind === k.id ? 'text-[#3D7A6E]' : 'text-stone-400'}` }),
                e('span', { className: "text-xs" }, k.label)
              )
            )
          )
        ),

        e('div', null,
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2" }, 'Select Category'),
          e('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1" },
            CATEGORIES.map(cat => 
              e('button', {
                key: cat.id,
                type: "button",
                onClick: () => setCategory(cat.id),
                className: `p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${category === cat.id ? 'border-[#3D7A6E] bg-[#3D7A6E] text-white font-semibold shadow-xs' : 'border-stone-200 hover:bg-stone-50 text-stone-800'}`
              },
                e(Icon, { name: cat.icon, className: `w-4 h-4 ${category === cat.id ? 'text-amber-300' : 'text-[#3D7A6E]'}` }),
                e('div', null,
                  e('div', { className: "text-xs font-semibold" }, cat.name),
                  e('div', { className: `text-[10px] ${category === cat.id ? 'text-stone-200' : 'text-stone-500'}` }, cat.blurb)
                )
              )
            )
          )
        ),

        e('div', { className: "pt-4 flex justify-end" },
          e('button', {
            type: "button",
            onClick: () => setStep(2),
            className: "bg-[#102A27] hover:bg-[#1C3E3A] text-amber-300 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
          },
            e('span', null, 'Continue to Details'),
            e(Icon, { name: "ChevronRight", className: "w-4 h-4" })
          )
        )
      ),

      /* STEP 2 */
      step === 2 && e('div', { className: "space-y-4" },
        e('div', null,
          e('label', { className: "block text-xs font-bold text-stone-700 mb-1" }, 'Ad Title *'),
          e('input', {
            type: "text",
            required: true,
            value: title,
            onChange: (evt) => setTitle(evt.target.value),
            placeholder: "e.g. Casio FX-991EX Classwiz Scientific Calculator",
            className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          })
        ),

        /* Direct Image File Picker */
        e('div', { className: "space-y-1.5" },
          e('label', { className: "block text-xs font-bold text-stone-700" }, 'Upload Photo (Phone / PC Gallery)'),
          e('div', { className: "border-2 border-dashed border-stone-300 hover:border-[#3D7A6E] rounded-2xl p-4 text-center bg-stone-50 transition-colors relative" },
            e('input', {
              type: "file",
              accept: "image/*",
              onChange: handleFileSelect,
              className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            }),
            imageUrl ? e('div', { className: "flex flex-col items-center gap-2" },
              e('img', { src: imageUrl, alt: "Preview", className: "w-28 h-20 object-cover rounded-xl border border-stone-300 shadow-xs" }),
              e('span', { className: "text-[11px] text-emerald-700 font-bold flex items-center gap-1" },
                e(Icon, { name: "CheckCircle2", className: "w-3.5 h-3.5" }),
                'Photo Uploaded & Compressed (< 1.5 MB Limit)'
              )
            ) : e('div', { className: "space-y-1 text-stone-500" },
              e(Icon, { name: "UploadCloud", className: "w-8 h-8 mx-auto text-[#3D7A6E]" }),
              e('div', { className: "text-xs font-semibold text-stone-800" },
                isCompressing ? 'Compressing photo...' : 'Click or drop a photo from your gallery'
              ),
              e('div', { className: "text-[10px] text-stone-400" }, 'Auto-compressed (Max 1.5 MB limit per photo)')
            )
          )
        ),

        e('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
          e('div', null,
            e('label', { className: "block text-xs font-bold text-stone-700 mb-1" }, 'Price (₹) *'),
            e('input', {
              type: "number",
              required: true,
              value: price,
              onChange: (evt) => setPrice(evt.target.value),
              placeholder: "e.g. 500",
              className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
            })
          ),
          e('div', null,
            e('label', { className: "block text-xs font-bold text-stone-700 mb-1" }, 'Preferred On-Campus Pickup Spot'),
            e('select', {
              value: hostel,
              onChange: (evt) => setHostel(evt.target.value),
              className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
            },
              campus.hostels.map(h => e('option', { key: h, value: h }, h))
            )
          )
        ),

        kind === 'marketplace' && e('div', null,
          e('label', { className: "block text-xs font-bold text-stone-700 mb-1" }, 'Item Condition'),
          e('select', {
            value: condition,
            onChange: (evt) => setCondition(evt.target.value),
            className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          },
            e('option', { value: "Brand new" }, 'Brand New'),
            e('option', { value: "Like new" }, 'Like New'),
            e('option', { value: "Good" }, 'Good Condition'),
            e('option', { value: "Fair" }, 'Fair / Usable')
          )
        ),

        e('div', null,
          e('label', { className: "block text-xs font-bold text-stone-700 mb-1" }, 'Full Description *'),
          e('textarea', {
            required: true,
            rows: 3,
            value: description,
            onChange: (evt) => setDescription(evt.target.value),
            placeholder: "Include item age, condition, reasons for selling, and preferred canteen / hostel meeting spot...",
            className: "w-full bg-white border border-stone-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
          })
        ),

        e('div', { className: "pt-4 flex items-center justify-between" },
          e('button', {
            type: "button",
            onClick: () => setStep(1),
            className: "px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
          }, 'Back'),
          e('button', {
            type: "button",
            disabled: !title || !description,
            onClick: () => setStep(3),
            className: "bg-[#102A27] hover:bg-[#1C3E3A] text-amber-300 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
          },
            e('span', null, 'Preview & Boost'),
            e(Icon, { name: "ChevronRight", className: "w-4 h-4" })
          )
        )
      ),

      /* STEP 3 */
      step === 3 && e('form', { onSubmit: handlePublish, className: "space-y-6" },
        e('div', { className: "bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2" },
          e('div', { className: "flex items-center gap-2 text-amber-900 font-bold text-xs" },
            e(Icon, { name: "Sparkles", className: "w-4 h-4 text-amber-600 fill-amber-400" }),
            e('span', null, 'Feature This Listing (Free During Beta)')
          ),
          e('p', { className: "text-xs text-stone-600" },
            `Pin your ad to the top of ${campus.name} homepage and browse lists for maximum visibility.`
          ),
          e('label', { className: "flex items-center gap-2 pt-1 cursor-pointer" },
            e('input', {
              type: "checkbox",
              checked: featured,
              onChange: (evt) => setFeatured(evt.target.checked),
              className: "w-4 h-4 accent-amber-500 rounded"
            }),
            e('span', { className: "text-xs font-bold text-stone-900" }, 'Pin as "Featured Ad" on campus')
          )
        ),

        e('div', { className: "space-y-2" },
          e('label', { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider" }, 'Ad Summary Preview'),
          e('div', { className: "bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center gap-4" },
            e('img', {
              src: imageUrl || defaultSampleImages[category] || defaultSampleImages['calci-drafters'],
              alt: "Preview",
              className: "w-20 h-20 rounded-xl object-cover"
            }),
            e('div', null,
              e('div', { className: "font-bold text-stone-900 text-sm" }, title || 'Untitled Ad'),
              e('div', { className: "font-display font-extrabold text-lg text-[#102A27]" }, `₹ ${price || '0'}`),
              e('div', { className: "text-xs text-stone-500" }, `${hostel} Hostel • ${campus.name}`)
            )
          )
        ),

        e('div', { className: "pt-4 flex items-center justify-between border-t border-stone-100" },
          e('button', {
            type: "button",
            onClick: () => setStep(2),
            className: "px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
          }, 'Back to Edit'),
          e('button', {
            type: "submit",
            className: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          },
            e(Icon, { name: "CheckCircle2", className: "w-4 h-4" }),
            e('span', null, 'Publish Campus Ad')
          )
        )
      )

    )
  );
};
