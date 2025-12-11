
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { automation, AutomationLog, SystemHealth } from '../services/automation';
import { Donation, Expense, Leader, Member } from '../types';
import { 
  LayoutDashboard, Users, Calendar, DollarSign, LogOut, Check, X, ShieldAlert, 
  Loader2, User, Plus, Trash2, Pencil, TrendingDown, Settings, Menu, 
  Globe, ChevronRight, Search, Briefcase, Zap, Cpu, Activity, Server, Upload, 
  Image as IconImage, Filter, Phone, Mail
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

// --- 1. HELPERS ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                } else {
                    if (height > maxWidth) { width *= maxWidth / height; height = maxWidth; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// --- 2. CONSTANTS & TRANSLATIONS ---
type AdminLang = 'en' | 'bn';
const ADMIN_TEXT = {
    dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    donations: { en: 'Donations', bn: 'দানসমূহ' },
    expenses: { en: 'Expenses', bn: 'ব্যয়সমূহ' },
    leaders: { en: 'Leaders', bn: 'নেতৃবৃন্দ' },
    members: { en: 'Members', bn: 'সদস্যবৃন্দ' },
    events: { en: 'Events', bn: 'ইভেন্ট' },
    gallery: { en: 'Gallery', bn: 'গ্যালারি' },
    settings: { en: 'Settings', bn: 'সেটিংস' },
    automation: { en: 'Automation', bn: 'অটোমেশন' },
    logout: { en: 'Logout', bn: 'লগআউট' },
    totalDonations: { en: 'Total Donations', bn: 'মোট দান' },
    pendingReview: { en: 'Pending Review', bn: 'পর্যালোচনাধীন' },
    totalMembers: { en: 'Total Members', bn: 'মোট সদস্য' },
    totalEvents: { en: 'Total Events', bn: 'মোট ইভেন্ট' },
    recentActivity: { en: 'Recent Activity', bn: 'সাম্প্রতিক কার্যকলাপ' },
    adminPanel: { en: 'Admin Panel', bn: 'অ্যাডমিন প্যানেল' },
    search: { en: 'Search...', bn: 'অনুসন্ধান...' },
    actions: { en: 'Actions', bn: 'পদক্ষেপ' },
    status: { en: 'Status', bn: 'অবস্থা' },
    date: { en: 'Date', bn: 'তারিখ' },
    amount: { en: 'Amount', bn: 'পরিমাণ' },
    name: { en: 'Name', bn: 'নাম' },
    role: { en: 'Designation', bn: 'পদবী' },
    order: { en: 'Order', bn: 'ক্রম' },
    addNew: { en: 'Add New', bn: 'নতুন যোগ করুন' },
    save: { en: 'Save Changes', bn: 'সংরক্ষণ করুন' },
    cancel: { en: 'Cancel', bn: 'বাতিল' },
    confirmDelete: { en: 'Are you sure?', bn: 'আপনি কি নিশ্চিত?' },
    noData: { en: 'No data found', bn: 'কোন তথ্য পাওয়া যায়নি' },
    title: { en: 'Title', bn: 'শিরোনাম' },
    category: { en: 'Category', bn: 'ক্যাটাগরি' },
    description: { en: 'Description', bn: 'বিবরণ' },
    totalExpenses: { en: 'Total Expenses', bn: 'মোট ব্যয়' },
    thisMonth: { en: 'This Month', bn: 'এই মাস' }
};

// --- 3. CONTEXT ---
interface AdminContextType {
    lang: AdminLang;
    setLang: (l: AdminLang) => void;
    notify: (type: 'success' | 'error', msg: string) => void;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
}
const AdminContext = createContext<AdminContextType>({ 
    lang: 'en', setLang: () => {}, notify: () => {}, isMobileMenuOpen: false, toggleMobileMenu: () => {} 
});
const useAdmin = () => useContext(AdminContext);

// --- 4. HOOKS ---
const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = storage.auth.subscribe((u: any) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { user, loading };
};

// --- 5. UI HELPER COMPONENTS ---
const Toast = ({ type, msg, onClose }: { type: 'success'|'error', msg: string, onClose: () => void }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, []);
    return (
        <div className={`fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <Check size={20}/> : <ShieldAlert size={20}/>}
            <span className="font-semibold">{msg}</span>
            <button onClick={onClose}><X size={16}/></button>
        </div>
    );
};

const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
        <Icon size={20} className={`${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'} transition-colors`} />
        <span className="font-medium relative z-10">{label}</span>
        {active && <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-100 z-0"></div>}
    </Link>
);

const StatCard = ({ label, value, icon: Icon, color, subColor }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 ${subColor}`}></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

// --- 6. FEATURE COMPONENTS (Defined before used) ---

const ManageAutomation = () => {
    const { lang, notify } = useAdmin();
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [running, setRunning] = useState(false);
    const [health, setHealth] = useState<SystemHealth | null>(null);

    useEffect(() => {
        // Safe check for automation availability
        if (automation) {
            const unsubscribe = automation.subscribe((newLogs) => setLogs(newLogs));
            automation.getHealth().then(setHealth);
            return () => unsubscribe();
        }
    }, []);

    const runScan = async () => {
        setRunning(true);
        notify('success', 'Automation tasks started...');
        try {
            await automation.runAllTasks();
            const h = await automation.getHealth();
            setHealth(h);
            notify('success', 'Automation completed');
        } catch (e) {
            notify('error', 'Automation failed');
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Cpu className="text-brand-600"/> {lang === 'en' ? 'AI Task Automation' : 'এআই টাস্ক অটোমেশন'}</h2>
                    <p className="text-gray-500 text-sm mt-1">System Health, Auto-Translation & Data Integrity</p>
                </div>
                <button onClick={runScan} disabled={running} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                    {running ? <Loader2 size={20} className="animate-spin"/> : <Zap size={20}/>}
                    {lang === 'en' ? 'Run Auto-Scan' : 'স্ক্যান শুরু করুন'}
                </button>
            </div>
            
            <div className="bg-gray-900 text-gray-300 rounded-3xl overflow-hidden shadow-lg border border-gray-800 p-4 h-60 overflow-y-auto font-mono text-sm">
                {logs.length === 0 && <div className="text-gray-500 italic">Ready to scan...</div>}
                {logs.map(log => (
                    <div key={log.id} className="py-1 border-b border-gray-800 last:border-0">
                        <span className={log.status === 'error' ? 'text-red-400' : log.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}>
                            [{log.status.toUpperCase()}]
                        </span> 
                        <span className="text-gray-500 text-xs mx-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManageDonations = () => {
    const { lang, notify } = useAdmin();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const loadData = async () => {
        try {
            const data = await storage.getDonations();
            setDonations(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
        await storage.updateDonationStatus(id, status);
        notify('success', `Donation ${status}`);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if(confirm(ADMIN_TEXT.confirmDelete[lang])) {
            await storage.deleteDonation(id);
            notify('success', 'Deleted successfully');
            loadData();
        }
    };

    const filtered = donations.filter(d => 
        (filter === 'all' || d.status === filter) &&
        (d.donorName.toLowerCase().includes(search.toLowerCase()) || d.trxId.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMIN_TEXT.donations[lang]}</h2>
                <div className="flex gap-2">
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Donor</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 dark:text-gray-300">{d.date}</td>
                                <td className="px-6 py-4 font-medium dark:text-white">{d.isAnonymous ? 'Anonymous' : d.donorName}<br/><span className="text-xs text-gray-400">{d.trxId}</span></td>
                                <td className="px-6 py-4 font-bold dark:text-white">৳ {d.amount}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.status === 'approved' ? 'bg-green-100 text-green-700' : d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span></td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {d.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatus(d.id, 'approved')} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16}/></button>
                                            <button onClick={() => handleStatus(d.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-600 p-1 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ManageExpenses = () => {
    const { lang, notify } = useAdmin();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState<Partial<Expense>>({});

    const load = async () => {
        const data = await storage.getExpenses();
        setExpenses(data);
    };
    useEffect(() => { load(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const expense = {
            id: current.id || generateId(),
            title: current.title || 'Untitled',
            amount: Number(current.amount),
            category: current.category || 'General',
            date: current.date || new Date().toISOString().split('T')[0],
            description: current.description || ''
        };
        current.id ? await storage.updateExpense(expense) : await storage.addExpense(expense);
        setIsEditing(false);
        load();
        notify('success', 'Expense Saved');
    };

    const handleDelete = async (id: string) => {
        if(confirm('Delete expense?')) {
            await storage.deleteExpense(id);
            load();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Expenses</h2>
                <button onClick={() => { setCurrent({}); setIsEditing(true); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18}/> Add Expense</button>
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 mb-6 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required placeholder="Title" value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input required type="number" placeholder="Amount" value={current.amount || ''} onChange={e => setCurrent({...current, amount: Number(e.target.value)})} className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input required type="date" value={current.date || ''} onChange={e => setCurrent({...current, date: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input placeholder="Category" list="cats" value={current.category || ''} onChange={e => setCurrent({...current, category: e.target.value})} className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <datalist id="cats"><option value="Rent"/><option value="Salary"/><option value="Event"/></datalist>
                        <div className="md:col-span-2 flex gap-3 justify-end mt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button className="px-6 py-2 bg-brand-600 text-white rounded-lg">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                        <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Title</th><th className="px-6 py-3 text-right">Amount</th><th className="px-6 py-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {expenses.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 dark:text-gray-300">{e.date}</td>
                                <td className="px-6 py-4 font-medium dark:text-white">{e.title}<div className="text-xs text-gray-400">{e.category}</div></td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">{e.amount}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ManageMembers = ({ isLeader = false }: { isLeader?: boolean }) => {
    const { lang, notify } = useAdmin();
    const [items, setItems] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        try {
            const data = isLeader ? await storage.getLeaders() : await storage.getMembers();
            setItems(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []);
        } catch (e) {
            setItems([]);
        }
    };
    useEffect(() => { load(); }, [isLeader]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const baseData = {
            id: editItem.id || generateId(),
            order: Number(editItem.order || 0),
            name: editItem.name || { en: '', bn: '' },
            designation: editItem.designation || { en: '', bn: '' },
            image: editItem.image || '',
        };

        try {
            if (isLeader) {
                await storage.saveLeader({
                    ...baseData,
                    message: editItem.message || { en: '', bn: '' },
                    bio: editItem.bio || { en: '', bn: '' }
                } as Leader);
            } else {
                await storage.saveMember({ ...baseData } as Member);
            }
            notify('success', 'Saved successfully');
            setIsEditing(false);
            load();
        } catch (err) {
            notify('error', 'Failed to save');
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm(ADMIN_TEXT.confirmDelete[lang])) {
            isLeader ? await storage.deleteLeader(id) : await storage.deleteMember(id);
            notify('success', 'Deleted');
            load();
        }
    };

    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            try {
                const base64 = await compressImage(e.target.files[0], 300, 0.6);
                if (editItem) setEditItem({ ...editItem, image: base64 });
            } catch(err) { notify('error', 'Image processing failed'); }
        }
    };

    const initNewItem = () => {
        setEditItem({ 
            id: '', 
            name: {en:'', bn:''}, 
            designation: {en:'', bn:''}, 
            image: '', 
            order: items.length + 1,
            message: {en:'', bn:''},
            bio: {en:'', bn:''} 
        });
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isLeader ? ADMIN_TEXT.leaders[lang] : ADMIN_TEXT.members[lang]}</h2>
                <button onClick={initNewItem} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition">
                    <Plus size={18}/> {ADMIN_TEXT.addNew[lang]}
                </button>
            </div>

            {isEditing && editItem && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{editItem.id ? 'Edit Profile' : 'New Profile'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="shrink-0">
                                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition overflow-hidden relative group">
                                    {editItem.image ? <img src={editItem.image} className="w-full h-full object-cover" /> : <div className="text-center p-2 text-gray-400"><Upload size={24} className="mx-auto mb-1"/><span className="text-[10px] uppercase font-bold">Photo</span></div>}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">Change</div>
                                </div>
                                <input type="file" ref={fileInputRef} hidden onChange={handleImage} accept="image/*" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input placeholder="Name (English)" value={editItem.name?.en ?? ''} onChange={e => setEditItem({...editItem, name: {...(editItem.name || {}), en: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="নাম (বাংলা)" value={editItem.name?.bn ?? ''} onChange={e => setEditItem({...editItem, name: {...(editItem.name || {}), bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="Designation (English)" value={editItem.designation?.en ?? ''} onChange={e => setEditItem({...editItem, designation: {...(editItem.designation || {}), en: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="পদবী (বাংলা)" value={editItem.designation?.bn ?? ''} onChange={e => setEditItem({...editItem, designation: {...(editItem.designation || {}), bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                </div>
                                <div className="flex gap-4">
                                    <input type="number" placeholder="Order" value={editItem.order ?? ''} onChange={e => setEditItem({...editItem, order: e.target.value})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-24" />
                                    {isLeader && (
                                        <input placeholder="Short Message / Quote" value={editItem.message?.en ?? ''} onChange={e => setEditItem({...editItem, message: {en: e.target.value, bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 flex-1" />
                                    )}
                                </div>
                                {isLeader && (
                                    <textarea placeholder="Bio (Optional)" value={editItem.bio?.en ?? ''} onChange={e => setEditItem({...editItem, bio: {en: e.target.value, bn: e.target.value}})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500" rows={2} />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{ADMIN_TEXT.cancel[lang]}</button>
                            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition">{ADMIN_TEXT.save[lang]}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm align-middle">
                         <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 w-16 text-center">#</th>
                                <th className="px-6 py-3 w-20 text-center">Photo</th>
                                <th className="px-6 py-3">{ADMIN_TEXT.name[lang]}</th>
                                <th className="px-6 py-3">{ADMIN_TEXT.role[lang]}</th>
                                <th className="px-6 py-3 text-center">{ADMIN_TEXT.order[lang]}</th>
                                <th className="px-6 py-3 text-right">{ADMIN_TEXT.actions[lang]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {items.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto overflow-hidden border border-gray-200 dark:border-gray-600">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{item.name?.en ?? ''}</div>
                                        <div className="text-xs text-gray-500 font-bengali">{item.name?.bn ?? ''}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.designation?.en ?? ''}</div>
                                        <div className="text-xs text-gray-500 font-bengali">{item.designation?.bn ?? ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold font-mono">{item.order}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditItem(item); setIsEditing(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Pencil size={16}/></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    const { lang } = useAdmin();
    const [stats, setStats] = useState({ donations: 0, pending: 0, members: 0, events: 0 });

    useEffect(() => {
        const load = async () => {
            const d = await storage.getDonations();
            const l = await storage.getLeaders();
            const m = await storage.getMembers();
            const e = await storage.getEvents();
            
            setStats({
                donations: d.filter(x => x.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0),
                pending: d.filter(x => x.status === 'pending').length,
                members: l.length + m.length,
                events: e.length
            });
        };
        load();
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMIN_TEXT.dashboard[lang]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label={ADMIN_TEXT.totalDonations[lang]} value={`৳ ${stats.donations.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-600" subColor="bg-green-500" />
                <StatCard label={ADMIN_TEXT.pendingReview[lang]} value={stats.pending} icon={ShieldAlert} color="bg-amber-100 text-amber-600" subColor="bg-amber-500" />
                <StatCard label={ADMIN_TEXT.totalMembers[lang]} value={stats.members} icon={Users} color="bg-blue-100 text-blue-600" subColor="bg-blue-500" />
                <StatCard label={ADMIN_TEXT.totalEvents[lang]} value={stats.events} icon={Calendar} color="bg-purple-100 text-purple-600" subColor="bg-purple-500" />
            </div>
        </div>
    );
};

const ManageEvents = () => <div className="p-10 text-center text-gray-500">Event Management Module (To be implemented)</div>;
const ManageGallery = () => <div className="p-10 text-center text-gray-500">Gallery Management Module (To be implemented)</div>;
const ManageSettingsFull = () => {
    const { settings, refreshSettings } = useSettings();
    const { notify } = useAdmin();
    const [phone, setPhone] = useState('');
    useEffect(() => { if(settings) setPhone(settings.contactPhone) }, [settings]);
    
    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        await storage.updateAppSettings({...settings, contactPhone: phone});
        refreshSettings();
        notify('success', 'Settings Saved');
    }
    return (
        <div className="max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
            <h3 className="font-bold mb-4 dark:text-white">General Settings</h3>
            <form onSubmit={save} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1 dark:text-gray-300">Contact Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
                <button className="bg-brand-600 text-white px-4 py-2 rounded">Save Changes</button>
            </form>
        </div>
    );
};

// --- 7. AUTH PAGES ---
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logo } = useSettings();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await storage.auth.login(email, password);
        if(res.success) navigate('/admin/dashboard');
        else setError(res.message || 'Login failed');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 dark:border-gray-700">
                <div className="text-center mb-10">
                    <img src={logo} className="w-20 h-20 mx-auto mb-6 object-contain" alt="Logo" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold">{error}</div>}
                    <input type="text" placeholder="Username / Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-brand-500" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-brand-500" required />
                    <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold flex justify-center">
                        {loading ? <Loader2 className="animate-spin"/> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- 8. LAYOUT & ROUTING (Defined last to use all above) ---

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { lang, setLang, isMobileMenuOpen, toggleMobileMenu } = useAdmin();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { logo } = useSettings();

    const handleLogout = async () => {
        if(confirm(lang === 'en' ? 'Are you sure you want to logout?' : 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?')) {
            await storage.auth.logout();
            navigate('/admin/login');
        }
    };

    const isActive = (path: string) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: ADMIN_TEXT.dashboard[lang] },
        { path: '/admin/donations', icon: DollarSign, label: ADMIN_TEXT.donations[lang] },
        { path: '/admin/expenses', icon: TrendingDown, label: ADMIN_TEXT.expenses[lang] },
        { path: '/admin/leaders', icon: Briefcase, label: ADMIN_TEXT.leaders[lang] },
        { path: '/admin/members', icon: Users, label: ADMIN_TEXT.members[lang] },
        { path: '/admin/events', icon: Calendar, label: ADMIN_TEXT.events[lang] },
        { path: '/admin/gallery', icon: IconImage, label: ADMIN_TEXT.gallery[lang] },
        { path: '/admin/automation', icon: Cpu, label: ADMIN_TEXT.automation[lang] },
        { path: '/admin/settings', icon: Settings, label: ADMIN_TEXT.settings[lang] },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={toggleMobileMenu}></div>
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 flex flex-col shadow-2xl lg:shadow-none`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-gray-900 dark:text-white">{ADMIN_TEXT.adminPanel[lang]}</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Azadi Social Welfare</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} active={isActive(item.path)} />
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">{ADMIN_TEXT.logout[lang]}</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-30">
                    <button onClick={toggleMobileMenu} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Menu size={24} />
                    </button>

                    <div className="hidden lg:block font-bold text-gray-400 text-sm">
                        {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                        >
                            <Globe size={16} />
                            {lang === 'en' ? 'বাংলা' : 'English'}
                        </button>
                        
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.displayName || 'Admin'}</p>
                                <p className="text-[10px] text-brand-600 font-semibold uppercase mt-1">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!user) return <Navigate to="/admin/login" replace />;
    return <AdminLayout>{children}</AdminLayout>;
};

// --- 9. MAIN COMPONENT ---
const Admin = () => {
    const [lang, setLang] = useState<AdminLang>('en');
    const [toast, setToast] = useState<{type: 'success'|'error', msg: string} | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const notify = (type: 'success'|'error', msg: string) => setToast({type, msg});
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <AdminContext.Provider value={{ lang, setLang, notify, isMobileMenuOpen, toggleMobileMenu }}>
            {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<Protected><DashboardHome /></Protected>} />
                <Route path="donations" element={<Protected><ManageDonations /></Protected>} />
                <Route path="leaders" element={<Protected><ManageMembers isLeader={true} /></Protected>} />
                <Route path="members" element={<Protected><ManageMembers isLeader={false} /></Protected>} />
                <Route path="events" element={<Protected><ManageEvents /></Protected>} /> 
                <Route path="gallery" element={<Protected><ManageGallery /></Protected>} />
                <Route path="automation" element={<Protected><ManageAutomation /></Protected>} />
                <Route path="settings" element={<Protected><ManageSettingsFull /></Protected>} />
                <Route path="expenses" element={<Protected><ManageExpenses /></Protected>} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </AdminContext.Provider>
    );
};

export default Admin;
