
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { automation, AutomationLog, SystemHealth } from '../services/automation';
import { Donation, Expense, Leader, Member, Event, GalleryItem } from '../types';
import { 
  LayoutDashboard, Users, Calendar, DollarSign, LogOut, Check, X, ShieldAlert, Lock, 
  Loader2, User, ImageOff, Plus, Trash2, Pencil, Receipt, GripVertical, MessageSquare, 
  ArrowUpDown, ArrowUp, ArrowDown, UserPlus, Link2, Upload, Sparkles, Copy, MapPin, 
  Image as ImageIcon, Settings, Phone, ArrowLeft, Facebook, Youtube, Twitter, Share2, 
  Menu, CloudOff, RefreshCw, Database, Mail, TrendingDown, Tag, Bell, Globe, ChevronRight,
  Search, Filter, Eye, ChevronLeft, Briefcase, FileText, Zap, Cpu, Activity, Server
} from 'lucide-react';
import { LOGO_URL, ADMIN_CONFIG } from '../constants';
import { generateEventSummary } from '../services/ai';
import { useSettings } from '../contexts/SettingsContext';

// --- HELPER FOR ID ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// --- HELPER FOR IMAGE COMPRESSION ---
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
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
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

// --- ADMIN TRANSLATIONS ---
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
    welcomeBack: { en: 'Welcome back,', bn: 'স্বাগতম,' },
    adminPanel: { en: 'Admin Panel', bn: 'অ্যাডমিন প্যানেল' },
    search: { en: 'Search...', bn: 'অনুসন্ধান...' },
    actions: { en: 'Actions', bn: 'পদক্ষেপ' },
    status: { en: 'Status', bn: 'অবস্থা' },
    date: { en: 'Date', bn: 'তারিখ' },
    amount: { en: 'Amount', bn: 'পরিমাণ' },
    name: { en: 'Name', bn: 'নাম' },
    role: { en: 'Designation', bn: 'পদবী' },
    addNew: { en: 'Add New', bn: 'নতুন যোগ করুন' },
    save: { en: 'Save Changes', bn: 'সংরক্ষণ করুন' },
    cancel: { en: 'Cancel', bn: 'বাতিল' },
    edit: { en: 'Edit', bn: 'সম্পাদনা' },
    delete: { en: 'Delete', bn: 'মুছুন' },
    confirmDelete: { en: 'Are you sure?', bn: 'আপনি কি নিশ্চিত?' },
    uploadImage: { en: 'Upload Image', bn: 'ছবি আপলোড করুন' },
    clickToUpload: { en: 'Click to upload', bn: 'আপলোড করতে ক্লিক করুন' },
    noData: { en: 'No data found', bn: 'কোন তথ্য পাওয়া যায়নি' },
    title: { en: 'Title', bn: 'শিরোনাম' },
    category: { en: 'Category', bn: 'ক্যাটাগরি' },
    description: { en: 'Description', bn: 'বিবরণ' },
    totalExpenses: { en: 'Total Expenses', bn: 'মোট ব্যয়' },
    thisMonth: { en: 'This Month', bn: 'এই মাস' }
};

// --- CONTEXT ---
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

// --- AUTH HOOK ---
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

// --- COMPONENTS ---

// 1. Notification Toast
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

// 2. Sidebar Link
const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
        <Icon size={20} className={`${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'} transition-colors`} />
        <span className="font-medium relative z-10">{label}</span>
        {active && <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-100 z-0"></div>}
    </Link>
);

// 3. Layout Component
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
        { path: '/admin/gallery', icon: ImageIcon, label: ADMIN_TEXT.gallery[lang] },
        { path: '/admin/automation', icon: Cpu, label: ADMIN_TEXT.automation[lang] },
        { path: '/admin/settings', icon: Settings, label: ADMIN_TEXT.settings[lang] },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={toggleMobileMenu}></div>
            )}

            {/* Sidebar */}
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
                
                <div className="p-4 pt-0 text-center">
                   <p className="text-[10px] text-gray-400">Designed & Developed by <br/><span className="font-bold text-gray-500 dark:text-gray-400">Ahmed Hossain Pavel</span></p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
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

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

// 4. Dashboard Widgets
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

// --- AUTOMATION DASHBOARD ---
const ManageAutomation = () => {
    const { lang, notify } = useAdmin();
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [running, setRunning] = useState(false);
    const [health, setHealth] = useState<SystemHealth | null>(null);

    useEffect(() => {
        // Subscribe to logs
        const unsubscribe = automation.subscribe((newLogs) => setLogs(newLogs));
        
        // Initial health check
        automation.getHealth().then(setHealth);

        return () => unsubscribe();
    }, []);

    const runScan = async () => {
        setRunning(true);
        notify('success', 'Automation tasks started...');
        await automation.runAllTasks();
        
        // Refresh health after scan
        const h = await automation.getHealth();
        setHealth(h);
        
        setRunning(false);
        notify('success', 'Automation completed');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Cpu className="text-brand-600"/> {lang === 'en' ? 'AI Task Automation' : 'এআই টাস্ক অটোমেশন'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">System Health, Auto-Translation & Data Integrity</p>
                </div>
                <button 
                    onClick={runScan} 
                    disabled={running}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition animate-in zoom-in-95"
                >
                    {running ? <Loader2 size={20} className="animate-spin"/> : <Zap size={20}/>}
                    {lang === 'en' ? (running ? 'Processing...' : 'Run Auto-Scan') : (running ? 'প্রক্রিয়া চলছে...' : 'স্ক্যান শুরু করুন')}
                </button>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase">System Status</h4>
                        <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            Healthy
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                        <Server size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase">Storage Usage</h4>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {health ? health.storageUsage.toFixed(1) : 0}% <span className="text-xs text-gray-400 font-normal">of Quota</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-600">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase">AI Features</h4>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            Active
                        </p>
                    </div>
                </div>
            </div>

            {/* Logs Console */}
            <div className="bg-gray-900 text-gray-300 rounded-3xl overflow-hidden shadow-lg border border-gray-800">
                <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
                    <span className="font-mono text-sm font-bold flex items-center gap-2">
                        <span className="text-green-500">➜</span> ~/system/logs
                    </span>
                    <span className="text-xs text-gray-500">Live Stream</span>
                </div>
                <div className="p-6 h-80 overflow-y-auto font-mono text-sm space-y-2">
                    {logs.length === 0 && <div className="text-gray-600 italic">No activity logs yet. Run a scan to see details.</div>}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={`font-bold uppercase shrink-0 w-24 ${
                                log.status === 'success' ? 'text-green-400' : 
                                log.status === 'warning' ? 'text-yellow-400' : 
                                log.status === 'error' ? 'text-red-400' : 'text-blue-400'
                            }`}>{log.task}</span>
                            <span className="text-gray-300">{log.message}</span>
                        </div>
                    ))}
                    {running && (
                        <div className="flex gap-3 animate-pulse">
                             <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                             <span className="text-blue-400 font-bold uppercase shrink-0 w-24">SYSTEM</span>
                             <span className="text-gray-300">Processing background tasks...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- PAGE COMPONENTS ---

const DashboardHome = () => {
    const { lang } = useAdmin();
    const [stats, setStats] = useState({ donations: 0, pending: 0, members: 0, events: 0 });
    const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

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
            setRecentDonations(d.slice(0, 5));
        };
        load();
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMIN_TEXT.dashboard[lang]}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label={ADMIN_TEXT.totalDonations[lang]} value={`৳ ${stats.donations.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" subColor="bg-green-500" />
                <StatCard label={ADMIN_TEXT.pendingReview[lang]} value={stats.pending} icon={ShieldAlert} color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" subColor="bg-amber-500" />
                <StatCard label={ADMIN_TEXT.totalMembers[lang]} value={stats.members} icon={Users} color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" subColor="bg-blue-500" />
                <StatCard label={ADMIN_TEXT.totalEvents[lang]} value={stats.events} icon={Calendar} color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" subColor="bg-purple-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ADMIN_TEXT.recentActivity[lang]}</h3>
                    <Link to="/admin/donations" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">{ADMIN_TEXT.donations[lang]} <ChevronRight size={16}/></Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">{ADMIN_TEXT.date[lang]}</th>
                                <th className="px-6 py-4">{ADMIN_TEXT.name[lang]}</th>
                                <th className="px-6 py-4">{ADMIN_TEXT.amount[lang]}</th>
                                <th className="px-6 py-4">{ADMIN_TEXT.status[lang]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentDonations.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{d.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{d.isAnonymous ? 'Anonymous' : d.donorName}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">৳ {d.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.status === 'approved' ? 'bg-green-100 text-green-700' : d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                            {d.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentDonations.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">{ADMIN_TEXT.noData[lang]}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
        const data = await storage.getDonations();
        setDonations(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMIN_TEXT.donations[lang]}</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input type="text" placeholder={ADMIN_TEXT.search[lang]} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none w-full"/>
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none cursor-pointer">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">{ADMIN_TEXT.date[lang]}</th>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">{ADMIN_TEXT.amount[lang]}</th>
                                <th className="px-6 py-4 text-center">{ADMIN_TEXT.status[lang]}</th>
                                <th className="px-6 py-4 text-right">{ADMIN_TEXT.actions[lang]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">{d.date}<br/><span className="text-[10px] opacity-70">#{d.id.substring(0,6)}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{d.isAnonymous ? 'Anonymous' : d.donorName}</div>
                                        <div className="text-xs text-gray-500">{d.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold uppercase text-gray-500">{d.method}</div>
                                        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block mt-1">{d.trxId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">৳ {d.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={`px-3 py-1 rounded-full text-xs font-bold border ${d.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : d.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleStatus(d.id, 'approved')} title="Approve" className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Check size={16}/></button>
                                                    <button onClick={() => handleStatus(d.id, 'rejected')} title="Reject" className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X size={16}/></button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(d.id)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-red-600"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No donations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ManageExpenses = () => {
    const { lang, notify } = useAdmin();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isEditing, setIsEditing] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({});
    
    // Stats state
    const [stats, setStats] = useState({ total: 0, month: 0 });

    const loadData = async () => {
        const data = await storage.getExpenses();
        // Sort by date desc
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(sorted);
        
        // Calc stats
        const now = new Date();
        const total = sorted.reduce((acc, curr) => acc + curr.amount, 0);
        const month = sorted.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((acc, curr) => acc + curr.amount, 0);
        
        setStats({ total, month });
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const expenseToSave = {
            id: currentExpense.id || generateId(),
            title: currentExpense.title || 'Untitled',
            amount: Number(currentExpense.amount) || 0,
            category: currentExpense.category || 'General',
            date: currentExpense.date || new Date().toISOString().split('T')[0],
            description: currentExpense.description || ''
        } as Expense;

        if (currentExpense.id) {
            await storage.updateExpense(expenseToSave);
            notify('success', 'Expense updated');
        } else {
            await storage.addExpense(expenseToSave);
            notify('success', 'Expense added');
        }
        setIsEditing(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if(confirm(ADMIN_TEXT.confirmDelete[lang])) {
            await storage.deleteExpense(id);
            notify('success', 'Expense deleted');
            loadData();
        }
    };

    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));
    const filtered = expenses.filter(e => 
        (filterCategory === 'all' || e.category === filterCategory) &&
        (e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()))
    );

    const defaultCategories = ['Event', 'Salary', 'Rent', 'Utilities', 'Maintenance', 'Donation', 'Other'];

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <StatCard 
                     label={ADMIN_TEXT.totalExpenses[lang]} 
                     value={`৳ ${stats.total.toLocaleString()}`} 
                     icon={TrendingDown} 
                     color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" 
                     subColor="bg-red-500" 
                 />
                 <StatCard 
                     label={ADMIN_TEXT.thisMonth[lang]} 
                     value={`৳ ${stats.month.toLocaleString()}`} 
                     icon={Calendar} 
                     color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" 
                     subColor="bg-orange-500" 
                 />
             </div>

             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMIN_TEXT.expenses[lang]}</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input type="text" placeholder={ADMIN_TEXT.search[lang]} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none w-full"/>
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none cursor-pointer">
                        <option value="all">All Categories</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => { setCurrentExpense({}); setIsEditing(true); }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition">
                         <Plus size={18}/> {ADMIN_TEXT.addNew[lang]}
                    </button>
                </div>
            </div>

             {/* Modal */}
             {isEditing && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 relative border border-gray-100 dark:border-gray-700">
                        <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><TrendingDown size={24} className="text-brand-600"/> {currentExpense.id ? 'Edit Expense' : 'Add New Expense'}</h3>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{ADMIN_TEXT.title[lang]}</label>
                                <input required value={currentExpense.title || ''} onChange={e => setCurrentExpense({...currentExpense, title: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Office Rent"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{ADMIN_TEXT.amount[lang]}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400 font-bold">৳</span>
                                        <input type="number" required value={currentExpense.amount || ''} onChange={e => setCurrentExpense({...currentExpense, amount: Number(e.target.value)})} className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="0.00"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{ADMIN_TEXT.date[lang]}</label>
                                    <input type="date" required value={currentExpense.date || new Date().toISOString().split('T')[0]} onChange={e => setCurrentExpense({...currentExpense, date: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500"/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{ADMIN_TEXT.category[lang]}</label>
                                <div className="relative">
                                    <input list="categories" value={currentExpense.category || ''} onChange={e => setCurrentExpense({...currentExpense, category: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="Select or type..."/>
                                    <datalist id="categories">
                                        {defaultCategories.map(c => <option key={c} value={c}/>)}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{ADMIN_TEXT.description[lang]}</label>
                                <textarea rows={3} value={currentExpense.description || ''} onChange={e => setCurrentExpense({...currentExpense, description: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="Optional details..."></textarea>
                            </div>

                            <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 transition mt-2">
                                {ADMIN_TEXT.save[lang]}
                            </button>
                        </form>
                    </div>
                 </div>
             )}

             {/* Table */}
             <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">{ADMIN_TEXT.date[lang]}</th>
                                <th className="px-6 py-4">{ADMIN_TEXT.title[lang]}</th>
                                <th className="px-6 py-4">{ADMIN_TEXT.category[lang]}</th>
                                <th className="px-6 py-4 text-right">{ADMIN_TEXT.amount[lang]}</th>
                                <th className="px-6 py-4 text-right">{ADMIN_TEXT.actions[lang]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">{e.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{e.title}</div>
                                        {e.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{e.description}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">{e.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">- ৳ {e.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setCurrentExpense(e); setIsEditing(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={16}/></button>
                                            <button onClick={() => handleDelete(e.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No expenses found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Generic Member/Leader Manager
const ManageMembers = ({ isLeader = false }: { isLeader?: boolean }) => {
    const { lang, notify } = useAdmin();
    const [items, setItems] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        const data = isLeader ? await storage.getLeaders() : await storage.getMembers();
        setItems(data.sort((a, b) => a.order - b.order));
    };
    useEffect(() => { load(); }, [isLeader]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { 
            ...editItem, 
            id: editItem.id || generateId(),
            order: Number(editItem.order) 
        };
        
        isLeader ? await storage.saveLeader(data) : await storage.saveMember(data);
        notify('success', 'Saved successfully');
        setIsEditing(false);
        load();
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
                // Use tighter compression for member avatars (300px max, 0.6 quality)
                const base64 = await compressImage(e.target.files[0], 300, 0.6);
                setEditItem({ ...editItem, image: base64 });
            } catch(err) {
                notify('error', 'Image processing failed');
            }
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isLeader ? ADMIN_TEXT.leaders[lang] : ADMIN_TEXT.members[lang]}</h2>
                <button onClick={() => { setEditItem({ id: '', name: {en:'',bn:''}, designation: {en:'',bn:''}, image: '', order: items.length + 1 }); setIsEditing(true); }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition">
                    <Plus size={18}/> {ADMIN_TEXT.addNew[lang]}
                </button>
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{editItem.id ? 'Edit Profile' : 'New Profile'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="shrink-0">
                                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition overflow-hidden relative group">
                                    {editItem.image ? (
                                        <img src={editItem.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2 text-gray-400">
                                            <Upload size={24} className="mx-auto mb-1"/>
                                            <span className="text-[10px] uppercase font-bold">Photo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">Change</div>
                                </div>
                                <input type="file" ref={fileInputRef} hidden onChange={handleImage} accept="image/*" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input placeholder="Name (English)" value={editItem.name.en} onChange={e => setEditItem({...editItem, name: {...editItem.name, en: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="নাম (বাংলা)" value={editItem.name.bn} onChange={e => setEditItem({...editItem, name: {...editItem.name, bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="Designation (English)" value={editItem.designation.en} onChange={e => setEditItem({...editItem, designation: {...editItem.designation, en: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                    <input placeholder="পদবী (বাংলা)" value={editItem.designation.bn} onChange={e => setEditItem({...editItem, designation: {...editItem.designation, bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-full" required />
                                </div>
                                <div className="flex gap-4">
                                    <input type="number" placeholder="Order" value={editItem.order} onChange={e => setEditItem({...editItem, order: e.target.value})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 w-24" />
                                    {isLeader && (
                                        <input placeholder="Short Message / Quote" value={editItem.message?.en || ''} onChange={e => setEditItem({...editItem, message: {en: e.target.value, bn: e.target.value}})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 flex-1" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{ADMIN_TEXT.cancel[lang]}</button>
                            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition">{ADMIN_TEXT.save[lang]}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all flex flex-col items-center text-center group relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => { setEditItem(item); setIsEditing(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-1.5 bg-white shadow-md rounded-full text-blue-600 hover:scale-110 transition border border-gray-100"><Pencil size={14}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white shadow-md rounded-full text-red-600 hover:scale-110 transition border border-gray-100"><Trash2 size={14}/></button>
                        </div>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-3 overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-400"/>}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight w-full truncate px-1">{item.name[lang]}</h4>
                        <p className="text-[10px] sm:text-xs text-brand-600 dark:text-brand-400 font-medium uppercase mt-1 w-full truncate px-1">{item.designation[lang]}</p>
                        <span className="text-[10px] text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded">Order: {item.order}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- LOGIN PAGE ---
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-3xl"></div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 dark:border-gray-700 relative z-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <img src={logo} className="w-20 h-20 mx-auto mb-6 object-contain drop-shadow-lg" alt="Logo" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
                    <p className="text-gray-500 text-sm mt-2">Sign in to manage Azadi Organization</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold animate-pulse">{error}</div>}
                    <div className="space-y-4">
                        <input type="text" placeholder="Username / Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition" required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition transform active:scale-95 flex justify-center">
                        {loading ? <Loader2 className="animate-spin"/> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Placeholder components for brevity (Events/Gallery follow similar patterns)
const ManageEvents = () => <div className="text-center p-10 text-gray-500">Event Manager Module</div>;
const ManageGallery = () => <div className="text-center p-10 text-gray-500">Gallery Manager Module</div>;
const ManageSettingsFull = () => {
    const { settings, refreshSettings } = useSettings();
    const { notify } = useAdmin();
    const [form, setForm] = useState({ contactPhone: '', adminPass: '' });
    
    useEffect(() => { if(settings) setForm({ contactPhone: settings.contactPhone, adminPass: '' })}, [settings]);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        await storage.updateAppSettings({ ...settings, contactPhone: form.contactPhone });
        refreshSettings();
        notify('success', 'Settings updated');
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">System Settings</h2>
            <form onSubmit={save} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                    <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <button className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition">Save Changes</button>
            </form>
        </div>
    );
};

// --- PROTECTED ROUTE WRAPPER ---
// Moved outside Admin to fix component definition nesting and type issues
const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="animate-spin text-brand-600" size={40} />
        </div>
    );
    if (!user) return <Navigate to="/admin/login" replace />;
    return <AdminLayout>{children}</AdminLayout>;
};

// --- MAIN ROUTER ---
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
