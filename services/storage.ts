import { Donation, Event, Leader, GalleryItem, Expense, Member, AppSettings } from '../types';
import { MOCK_LEADERS, ORGANIZATION_INFO } from '../constants';

const DB_URL = "https://azadi-647ab-default-rtdb.asia-southeast1.firebasedatabase.app";

const SEED_SETTINGS: AppSettings = {
    contactPhone: ORGANIZATION_INFO.contact.phone,
    adminUser: 'admin',
    adminPassHash: 'MzIxYXNtaW4=', // admin123 hash (base64 reversed)
    socialLinks: {
        facebook: 'https://facebook.com',
        youtube: 'https://youtube.com',
        twitter: ''
    }
};

// Helper to handle API requests and Transform Firebase Object to Array
const api = {
    get: async <T>(path: string, defaultVal: T): Promise<T> => {
        try {
            const res = await fetch(`${DB_URL}/${path}.json`);
            const data = await res.json();
            
            if (!data) return defaultVal;

            if (Array.isArray(defaultVal)) {
                // If expected return is array, convert Firebase object (keys as IDs) to array values
                // Firebase might return an array if keys are sequential integers, otherwise object
                return (Array.isArray(data) ? data.filter(x => x) : Object.values(data)) as unknown as T;
            }
            
            // For objects (like settings), merge with default to ensure new fields exist
            if (typeof defaultVal === 'object' && defaultVal !== null) {
                 return { ...defaultVal, ...data };
            }

            return data as T;
        } catch (e) {
            console.error(`Error fetching ${path}`, e);
            return defaultVal;
        }
    },
    
    // We use PUT to save with specific ID to avoid duplicates and maintain control
    put: async (path: string, data: any) => {
        await fetch(`${DB_URL}/${path}.json`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    // Patch for partial updates
    patch: async (path: string, data: any) => {
        await fetch(`${DB_URL}/${path}.json`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    delete: async (path: string) => {
        await fetch(`${DB_URL}/${path}.json`, { method: 'DELETE' });
    }
};

export const storage = {
    // --- SETTINGS MANAGEMENT ---
    getAppSettings: () => api.get<AppSettings>('app_settings', SEED_SETTINGS),
    updateAppSettings: (settings: AppSettings) => api.put('app_settings', settings),

    // --- DONATIONS ---
    getDonations: () => api.get<Donation[]>('donations', []),
    saveDonation: async (donation: Donation) => {
        await api.put(`donations/${donation.id}`, donation);
    },
    updateDonationStatus: async (id: string, status: 'approved' | 'rejected') => {
        await api.patch(`donations/${id}`, { status });
    },
    deleteDonation: (id: string) => api.delete(`donations/${id}`),
    
    // --- EXPENSES ---
    getExpenses: () => api.get<Expense[]>('expenses', []),
    addExpense: (expense: Expense) => api.put(`expenses/${expense.id}`, expense),
    updateExpense: (expense: Expense) => api.put(`expenses/${expense.id}`, expense),
    deleteExpense: (id: string) => api.delete(`expenses/${id}`),

    // --- LEADERS ---
    getLeaders: async () => {
        // Fallback to MOCK if DB is empty so the site isn't blank initially
        const leaders = await api.get<Leader[]>('leaders', []);
        if (leaders.length === 0 && MOCK_LEADERS.length > 0) {
             return MOCK_LEADERS;
        }
        return leaders;
    },
    saveLeader: (leader: Leader) => api.put(`leaders/${leader.id}`, leader),
    deleteLeader: (id: string) => api.delete(`leaders/${id}`),

    // --- MEMBER MANAGEMENT ---
    getMembers: () => api.get<Member[]>('members', []),
    saveMember: (member: Member) => api.put(`members/${member.id}`, member),
    deleteMember: (id: string) => api.delete(`members/${id}`),

    // --- EVENT MANAGEMENT ---
    getEvents: () => api.get<Event[]>('events', []),
    saveEvent: (event: Event) => api.put(`events/${event.id}`, event),
    deleteEvent: (id: string) => api.delete(`events/${id}`),
    
    // --- GALLERY MANAGEMENT ---
    getGallery: () => api.get<GalleryItem[]>('gallery', []),
    saveGalleryItem: (item: GalleryItem) => api.put(`gallery/${item.id}`, item),
    deleteGalleryItem: (id: string) => api.delete(`gallery/${id}`),
};