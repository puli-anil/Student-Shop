import { CAMPUSES, SEED_LISTINGS, INITIAL_USERS } from './seedData.js';
import { supabase } from './supabase.js';

const STORAGE_KEYS = {
  CAMPUS: 'campusflow_campus',
  HOSTEL: 'campusflow_hostel',
  USER: 'campusflow_user',
  LISTINGS: 'campusflow_listings',
  FAVORITES: 'campusflow_favorites',
  PINGS: 'campusflow_pings'
};

export class CampusStore {
  constructor() {
    this.listeners = new Set();
    
    // Load persisted state or default to R.V.R. & J.C. College of Engineering (#1 campus)
    const savedCampusId = localStorage.getItem(STORAGE_KEYS.CAMPUS);
    const defaultCampus = CAMPUSES.find(c => c.id === 'rvr-jc') || CAMPUSES[0];
    this.selectedCampus = (savedCampusId && savedCampusId !== 'rit-chennai' && CAMPUSES.find(c => c.id === savedCampusId)) || defaultCampus;
    localStorage.setItem(STORAGE_KEYS.CAMPUS, this.selectedCampus.id);
    
    this.selectedHostel = localStorage.getItem(STORAGE_KEYS.HOSTEL) || 'All Hostels';
    
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    this.currentUser = savedUser ? JSON.parse(savedUser) : null; // null = guest

    const savedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    let parsedListings = savedListings ? JSON.parse(savedListings) : [];
    
    // Always ensure RVR & JC seed items exist in the listings array
    const rvrSeedItems = SEED_LISTINGS.filter(l => l.campus === 'rvr-jc');
    const existingRvrIds = new Set(parsedListings.filter(l => l.campus === 'rvr-jc').map(l => l.id));
    
    rvrSeedItems.forEach(item => {
      if (!existingRvrIds.has(item.id)) {
        parsedListings.unshift(item);
      }
    });

    if (parsedListings.length === 0) {
      parsedListings = SEED_LISTINGS;
    }

    this.listings = parsedListings;
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.listings));

    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    this.favorites = savedFavs ? JSON.parse(savedFavs) : [];

    const savedPings = localStorage.getItem(STORAGE_KEYS.PINGS);
    this.pings = savedPings ? JSON.parse(savedPings) : [];

    // Trigger async sync with live Supabase database
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    try {
      // Fetch live listings from Supabase table
      const { data: dbListings, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbListings && dbListings.length > 0) {
        // Merge RVR seed items with DB listings to ensure RVR products are always available
        const rvrSeedItems = SEED_LISTINGS.filter(l => l.campus === 'rvr-jc');
        const dbRvrIds = new Set(dbListings.filter(l => l.campus === 'rvr-jc').map(l => l.id));
        
        let merged = [...dbListings];
        rvrSeedItems.forEach(item => {
          if (!dbRvrIds.has(item.id)) {
            merged.push(item);
          }
        });

        this.listings = merged;
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(merged));
        this.notify();
      } else if (!error && dbListings && dbListings.length === 0) {
        // Auto-seed initial listings into Supabase database if empty
        const { seedSupabaseData } = await import('./seedDatabase.js');
        await seedSupabaseData();
        const { data: seeded } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
        if (seeded && seeded.length > 0) {
          this.listings = seeded;
          localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(seeded));
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  setCampus(campusId) {
    const campus = CAMPUSES.find(c => c.id === campusId);
    if (campus) {
      this.selectedCampus = campus;
      this.selectedHostel = 'All Hostels';
      localStorage.setItem(STORAGE_KEYS.CAMPUS, campusId);
      localStorage.setItem(STORAGE_KEYS.HOSTEL, 'All Hostels');
      this.notify();
      this.syncWithSupabase();
    }
  }

  setHostel(hostelName) {
    this.selectedHostel = hostelName;
    localStorage.setItem(STORAGE_KEYS.HOSTEL, hostelName);
    this.notify();
  }

  async sendEmailOtp(email) {
    try {
      const res = await fetch('/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to send OTP email.' };
      }

      return { success: true, simulated: data.simulated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async verifyEmailOtp(email, otpCode) {
    try {
      const res = await fetch('/api/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: otpCode })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid 6-digit OTP code.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signup(name, email, password, collegeName, rollNo) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name,
            college_name: collegeName,
            roll_no: rollNo,
            campus: this.selectedCampus.id
          }
        }
      });

      if (error) {
        console.warn('Supabase Auth Signup Notice:', error.message);
      }

      const user = {
        id: data?.user?.id || 'usr_' + Date.now(),
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        college_name: collegeName || this.selectedCampus.fullName,
        roll_no: rollNo || 'REG-' + Math.floor(100000 + Math.random()*900000),
        hostel: collegeName || this.selectedCampus.name,
        campus: this.selectedCampus.id,
        year: 'Verified Student',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        verified: true,
        password: password
      };

      // Save user to registered user store
      const regUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filtered = regUsers.filter(u => u.email !== normalizedEmail);
      filtered.push(user);
      localStorage.setItem('registered_users', JSON.stringify(filtered));

      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.notify();
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async login(email, password) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // 1. Check registered users in local storage first
      const regUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      let registeredUser = regUsers.find(u => u.email === normalizedEmail);

      if (registeredUser) {
        if (registeredUser.password && registeredUser.password !== password) {
          return { success: false, error: 'Wrong email or password. Please check your password or reset it.' };
        }
        this.currentUser = registeredUser;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(registeredUser));
        this.notify();
        return { success: true, user: registeredUser };
      }

      // 2. Check preset initial demo users
      let demoUser = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
      if (demoUser) {
        if (password !== 'password123') {
          return { success: false, error: 'Wrong email or password. Please try again.' };
        }
        this.currentUser = demoUser;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
        this.notify();
        return { success: true, user: demoUser };
      }

      // 3. Attempt Supabase Auth login
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (!error && data?.user) {
          const meta = data.user.user_metadata || {};
          const user = {
            id: data.user.id,
            name: meta.name || normalizedEmail.split('@')[0],
            email: data.user.email,
            hostel: meta.hostel || this.selectedCampus.hostels[0],
            student_type: meta.student_type || 'Student',
            campus: meta.campus || this.selectedCampus.id,
            year: 'Verified Student',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            verified: true,
            password: password
          };
          this.currentUser = user;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          this.notify();
          return { success: true, user };
        }
      } catch (e) {
        console.warn('Supabase signin check:', e);
      }

      // 4. User is NOT found -> Return explicit wrong username & password error
      return { 
        success: false, 
        error: 'Wrong email or password. Account not found. Please click "Create Student Account" to sign up.' 
      };

    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async loginWithGoogle(emailInput, nameInput) {
    try {
      const googleEmail = (emailInput || 'pulianil72@gmail.com').toLowerCase().trim();
      const rawName = nameInput || googleEmail.split('@')[0];
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const googleUser = {
        id: 'google_usr_' + Date.now(),
        name: `${formattedName} (Google Verified)`,
        email: googleEmail,
        college_name: this.selectedCampus.fullName,
        roll_no: 'REG-GOOGLE-VERIFIED',
        hostel: this.selectedCampus.hostels[0],
        student_type: 'Day Scholar',
        campus: this.selectedCampus.id,
        year: 'Verified Student',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        verified: true,
        auth_provider: 'google'
      };

      // Register Google user in local storage
      const regUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filtered = regUsers.filter(u => u.email !== googleUser.email);
      filtered.push(googleUser);
      localStorage.setItem('registered_users', JSON.stringify(filtered));

      this.currentUser = googleUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(googleUser));
      this.notify();

      return { success: true, user: googleUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const regUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      let user = regUsers.find(u => u.email === normalizedEmail);

      if (user) {
        user.password = newPassword;
        localStorage.setItem('registered_users', JSON.stringify(regUsers));
      }

      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (e) {
        console.warn('Supabase password reset notice:', e);
      }

      return { success: true, message: 'Password updated successfully!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout notice:', e);
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.notify();
  }

  toggleFavorite(listingId) {
    if (!this.currentUser) return false;
    const index = this.favorites.indexOf(listingId);
    if (index >= 0) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(listingId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
    this.notify();
    return true;
  }

  isFavorite(listingId) {
    return this.favorites.includes(listingId);
  }

  async sendPing(listingId, note) {
    if (!this.currentUser) return null;
    const ping = {
      listing_id: listingId,
      from_user_name: this.currentUser.name,
      from_hostel: this.currentUser.hostel || 'Hostel',
      note: note,
      created_at: new Date().toISOString()
    };

    this.pings.push(ping);
    localStorage.setItem(STORAGE_KEYS.PINGS, JSON.stringify(this.pings));
    
    // Save ping to Supabase table
    try {
      await supabase.from('pings').insert([ping]);
    } catch (e) {
      console.warn('Ping save warning:', e);
    }

    this.notify();
    return ping;
  }

  async addListing(newListingData) {
    if (!this.currentUser) return null;
    
    const newListing = {
      user_id: this.currentUser.id,
      title: newListingData.title,
      description: newListingData.description,
      price: Number(newListingData.price) || 0,
      price_label: newListingData.price_label || `₹ ${newListingData.price}`,
      category: newListingData.category,
      condition: newListingData.condition || 'Good',
      campus: this.selectedCampus.id,
      hostel: newListingData.hostel || this.selectedCampus.hostels[0],
      city: this.selectedCampus.city,
      image_url: newListingData.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      featured: Boolean(newListingData.featured),
      listing_kind: newListingData.listing_kind || 'marketplace',
      extra: newListingData.extra || {},
      seller_label: `${this.currentUser.name} (${this.currentUser.hostel})`,
      verified: this.currentUser.verified || false,
      created_at: new Date().toISOString()
    };

    // Save to local array immediately
    if (newListing.featured) {
      this.listings.unshift(newListing);
    } else {
      this.listings.splice(1, 0, newListing);
    }
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.listings));
    this.notify();

    // Push live to Supabase table
    try {
      const { data, error } = await supabase.from('listings').insert([newListing]).select();
      if (!error && data && data[0]) {
        newListing.id = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase post error:', err);
    }

    return newListing;
  }

  async deleteListing(listingId) {
    if (!this.currentUser) return false;
    this.listings = this.listings.filter(l => l.id !== listingId);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.listings));
    this.notify();

    try {
      await supabase.from('listings').delete().eq('id', listingId);
    } catch (e) {
      console.warn('Delete error:', e);
    }
    return true;
  }

  getListingsForCampus(filters = {}) {
    let result = this.listings.filter(l => l.campus === this.selectedCampus.id);

    if (result.length === 0) {
      result = SEED_LISTINGS.filter(l => l.campus === this.selectedCampus.id);
    }

    if (this.selectedHostel && this.selectedHostel !== 'All Hostels') {
      result = result.filter(l => l.hostel === this.selectedHostel);
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category);
    }

    if (filters.kind && filters.kind !== 'all') {
      result = result.filter(l => l.listing_kind === filters.kind);
    }

    if (filters.condition && filters.condition !== 'all') {
      result = result.filter(l => l.condition === filters.condition);
    }

    if (filters.hostel && filters.hostel !== 'all') {
      result = result.filter(l => l.hostel === filters.hostel);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      result = result.filter(l => l.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      result = result.filter(l => l.price <= Number(filters.maxPrice));
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.hostel.toLowerCase().includes(q)
      );
    }

    if (filters.sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }
}

export const store = new CampusStore();
