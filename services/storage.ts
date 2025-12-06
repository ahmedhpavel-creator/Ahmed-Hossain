import { Donation, Event, Leader, GalleryItem, Expense, Member, AppSettings } from '../types';
import { MOCK_LEADERS, ORGANIZATION_INFO } from '../constants';

// --- HELPER FOR HASHING (Same as Admin.tsx to ensure consistency) ---
const mockHash = (str: string) => {
  try {
    return btoa(str).split('').reverse().join('');
  } catch (e) {
    return str;
  }
};

// Initial Mock Data Seeding - CLEARED DONATIONS
const SEED_DONATIONS: Donation[] = [];

const SEED_EXPENSES: Expense[] = [
    { id: 'e1', title: 'Event Banner', description: 'Banner for peace rally', amount: 1200, category: 'Marketing', date: '2023-10-01' }
];

const SEED_EVENTS: Event[] = [
    {
        id: 'ev1',
        title: { en: 'Free Medical Camp', bn: 'বিনামূল্যে চিকিৎসা ক্যাম্প' },
        description: { en: 'Free checkups for the poor.', bn: 'দরিদ্রদের জন্য বিনামূল্যে চেকআপ।' },
        location: 'Sylhet',
        date: '2023-11-15',
        image: 'https://picsum.photos/800/400?random=10'
    }
];

const SEED_MEMBERS: Member[] = [];

// Seed Gallery with some initial items
const SEED_GALLERY: GalleryItem[] = [
    {
        id: 'g1',
        imageUrl: 'https://picsum.photos/600/600?random=1',
        category: 'Social Work',
        caption: { en: 'Winter Cloth Distribution', bn: 'শীতবস্ত্র বিতরণ' }
    },
    {
        id: 'g2',
        imageUrl: 'https://picsum.photos/600/600?random=2',
        category: 'Meetings',
        caption: { en: 'Annual Committee Meeting', bn: 'বার্ষিক কমিটি সভা' }
    },
    {
        id: 'g3',
        imageUrl: 'https://picsum.photos/600/600?random=3',
        category: 'Events',
        caption: { en: 'Sports Day 2023', bn: 'ক্রীড়া দিবস ২০২৩' }
    }
];

// Default Settings Seeding
const SEED_SETTINGS: AppSettings = {
    contactPhone: ORGANIZATION_INFO.contact.phone,
    adminUser: 'admin',
    adminPassHash: mockHash('admin123'),
    socialLinks: {
        facebook: 'https://facebook.com',
        youtube: 'https://youtube.com',
        twitter: ''
    }
};

// Helper to simulate DB
const get = <T>(key: string, seed: T): T => {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }
    // Deep merge for settings to ensure new fields (like socialLinks) exist if loading old data
    if (key === 'app_settings') {
        const parsed = JSON.parse(data);
        return { ...seed, ...parsed, socialLinks: { ...seed['socialLinks' as keyof T], ...parsed.socialLinks } };
    }
    return JSON.parse(data);
};

const set = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
    // --- SETTINGS MANAGEMENT (Global Phone & Admin Creds) ---
    getAppSettings: () => get<AppSettings>('app_settings', SEED_SETTINGS),
    updateAppSettings: (settings: AppSettings) => {
        set('app_settings', settings);
    },

    // --- DONATIONS ---
    getDonations: () => get<Donation[]>('donations', SEED_DONATIONS),
    saveDonation: (donation: Donation) => {
        const list = get<Donation[]>('donations', SEED_DONATIONS);
        set('donations', [donation, ...list]);
    },
    updateDonationStatus: (id: string, status: 'approved' | 'rejected') => {
        const list = get<Donation[]>('donations', SEED_DONATIONS);
        const updated = list.map(d => d.id === id ? { ...d, status } : d);
        set('donations', updated);
    },
    deleteDonation: (id: string) => {
        const list = get<Donation[]>('donations', SEED_DONATIONS);
        set('donations', list.filter(d => d.id !== id));
    },
    
    // --- EXPENSES ---
    getExpenses: () => get<Expense[]>('expenses', SEED_EXPENSES),
    addExpense: (expense: Expense) => {
        const list = get<Expense[]>('expenses', SEED_EXPENSES);
        set('expenses', [expense, ...list]);
    },
    updateExpense: (expense: Expense) => {
        const list = get<Expense[]>('expenses', SEED_EXPENSES);
        const updated = list.map(e => e.id === expense.id ? expense : e);
        set('expenses', updated);
    },
    deleteExpense: (id: string) => {
        const list = get<Expense[]>('expenses', SEED_EXPENSES);
        set('expenses', list.filter(e => e.id !== id));
    },

    // --- LEADERS ---
    getLeaders: () => {
        const leaders = get<Leader[]>('leaders', MOCK_LEADERS);
        // Fallback merge if local storage has very old/empty data but constants has full list
        if (leaders.length < 7 && MOCK_LEADERS.length > 10) {
            return MOCK_LEADERS;
        }
        return leaders;
    },
    saveLeader: (leader: Leader) => {
        const list = get<Leader[]>('leaders', MOCK_LEADERS);
        // Check if exists (update) or new
        const exists = list.find(l => l.id === leader.id);
        if (exists) {
             set('leaders', list.map(l => l.id === leader.id ? leader : l));
        } else {
             set('leaders', [...list, leader]);
        }
    },
    deleteLeader: (id: string) => {
        const list = get<Leader[]>('leaders', MOCK_LEADERS);
        set('leaders', list.filter(l => l.id !== id));
    },

    // --- MEMBER MANAGEMENT ---
    getMembers: () => get<Member[]>('members', SEED_MEMBERS),
    saveMember: (member: Member) => {
        const list = get<Member[]>('members', SEED_MEMBERS);
        const exists = list.find(m => m.id === member.id);
        if (exists) {
            set('members', list.map(m => m.id === member.id ? member : m));
        } else {
            set('members', [...list, member]);
        }
    },
    deleteMember: (id: string) => {
        const list = get<Member[]>('members', SEED_MEMBERS);
        set('members', list.filter(m => m.id !== id));
    },

    // --- EVENT MANAGEMENT ---
    getEvents: () => get<Event[]>('events', SEED_EVENTS),
    saveEvent: (event: Event) => {
        const list = get<Event[]>('events', SEED_EVENTS);
        const exists = list.find(e => e.id === event.id);
        if (exists) {
            set('events', list.map(e => e.id === event.id ? event : e));
        } else {
            set('events', [event, ...list]); // Add new events to top
        }
    },
    deleteEvent: (id: string) => {
        const list = get<Event[]>('events', SEED_EVENTS);
        set('events', list.filter(e => e.id !== id));
    },
    
    // --- GALLERY MANAGEMENT ---
    getGallery: () => get<GalleryItem[]>('gallery', SEED_GALLERY),
    saveGalleryItem: (item: GalleryItem) => {
        const list = get<GalleryItem[]>('gallery', SEED_GALLERY);
        set('gallery', [item, ...list]); // Newest first
    },
    deleteGalleryItem: (id: string) => {
        const list = get<GalleryItem[]>('gallery', SEED_GALLERY);
        set('gallery', list.filter(g => g.id !== id));
    },
};