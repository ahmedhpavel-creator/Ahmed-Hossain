import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../services/storage';
import { Donation, Expense, Leader, Member, Event, GalleryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Users, Calendar, DollarSign, LogOut, Check, X, ShieldAlert, Lock, Loader2, User, ImageOff, Plus, Trash2, Pencil, Receipt, GripVertical, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, UserPlus, Link2, Upload, Sparkles, Copy, MapPin, Image as ImageIcon, Settings, Phone, ArrowLeft, Facebook, Youtube, Twitter, Share2, Menu } from 'lucide-react';
import { LOGO_URL } from '../constants';

// --- HELPER FOR ID ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// --- HELPER FOR HASHING ---
const mockHash = (str: string) => {
  try {
    return btoa(str).split('').reverse().join('');
  } catch (e) {
    return str;
  }
};

// --- AUTHENTICATION ---
const authService = {
  login: async (username: string, pass: string): Promise<boolean> => {
    // Simulate server delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // FETCH CREDENTIALS FROM STORAGE (Async)
    const settings = await storage.getAppSettings();
    
    if (username.toLowerCase().trim() !== settings.adminUser) return false;
    if (mockHash(pass) !== settings.adminPassHash) return false;
    
    localStorage.setItem('admin_token', `tk_${Date.now()}`);
    localStorage.setItem('admin_user', username);
    return true;
  },
  isAuthenticated: () => !!localStorage.getItem('admin_token'),
  logout: () => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); }
};

// --- HELPER COMPONENTS ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4 border-4 border-red-50 dark:border-red-900/10">
                <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition">Delete</button>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS COMPONENT ---
const ManageSettings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        contactPhone: '',
        adminUser: '',
        currentPass: '',
        newPass: '',
        confirmPass: '',
        facebook: '',
        youtube: '',
        twitter: '',
    });
    const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

    useEffect(() => {
        const load = async () => {
            const data = await storage.getAppSettings();
            setSettings(data);
            setFormData(prev => ({
                ...prev,
                contactPhone: data.contactPhone,
                adminUser: data.adminUser,
                facebook: data.socialLinks?.facebook || '',
                youtube: data.socialLinks?.youtube || '',
                twitter: data.socialLinks?.twitter || '',
            }));
            setLoading(false);
        };
        load();
    }, []);

    const handleGeneralSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const updated = { 
            ...settings, 
            contactPhone: formData.contactPhone,
            socialLinks: {
                facebook: formData.facebook,
                youtube: formData.youtube,
                twitter: formData.twitter
            }
        };
        await storage.updateAppSettings(updated);
        setSettings(updated);
        setMsg({ type: 'success', text: 'General & Social Information Updated Successfully!' });
        setTimeout(() => setMsg(null), 3000);
    };

    const handleSecuritySave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (mockHash(formData.currentPass) !== settings.adminPassHash) {
            setMsg({ type: 'error', text: 'Current password is incorrect.' });
            return;
        }
        if (formData.newPass.length < 6) {
            setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (formData.newPass !== formData.confirmPass) {
            setMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        const updated = {
            ...settings,
            adminUser: formData.adminUser,
            adminPassHash: mockHash(formData.newPass)
        };
        await storage.updateAppSettings(updated);
        setSettings(updated);
        setFormData(prev => ({ ...prev, currentPass: '', newPass: '', confirmPass: '' }));
        setMsg({ type: 'success', text: 'Admin Credentials Updated Successfully!' });
        setTimeout(() => setMsg(null), 3000);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="text-brand-600" /> System Settings
            </h2>

            {msg && (
                <div className={`p-4 rounded-xl border ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} flex items-center gap-2 animate-in fade-in`}>
                   {msg.type === 'success' ? <Check size={18}/> : <ShieldAlert size={18}/>}
                   {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Phone size={18} /> General & Social
                    </h3>
                    <form onSubmit={handleGeneralSave} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Mobile Number (Payment)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.contactPhone}
                                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Displayed on Donation page, Footer, and Contact section.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                             <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Share2 size={14}/> Social Media Links</h4>
                             <div className="space-y-3">
                                <div className="relative">
                                    <Facebook size={18} className="absolute left-3 top-3 text-blue-600"/>
                                    <input 
                                        type="text" 
                                        placeholder="Facebook Page URL"
                                        className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                        value={formData.facebook}
                                        onChange={e => setFormData({...formData, facebook: e.target.value})}
                                    />
                                </div>
                                <div className="relative">
                                    <Youtube size={18} className="absolute left-3 top-3 text-red-600"/>
                                    <input 
                                        type="text" 
                                        placeholder="YouTube Channel URL"
                                        className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                        value={formData.youtube}
                                        onChange={e => setFormData({...formData, youtube: e.target.value})}
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter size={18} className="absolute left-3 top-3 text-sky-500"/>
                                    <input 
                                        type="text" 
                                        placeholder="Twitter/X Profile URL"
                                        className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                        value={formData.twitter}
                                        onChange={e => setFormData({...formData, twitter: e.target.value})}
                                    />
                                </div>
                             </div>
                        </div>

                        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-xl font-bold hover:bg-brand-700 transition">Update Information</button>
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lock size={18} /> Admin Security
                    </h3>
                    <form onSubmit={handleSecuritySave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.adminUser}
                                onChange={e => setFormData({...formData, adminUser: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.currentPass}
                                onChange={e => setFormData({...formData, currentPass: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.newPass}
                                    onChange={e => setFormData({...formData, newPass: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New</label>
                                <input 
                                    type="password" 
                                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.confirmPass}
                                    onChange={e => setFormData({...formData, confirmPass: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-xl font-bold hover:bg-black transition">Change Credentials</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- MANAGE GALLERY ---
const ManageGallery = () => {
    const [list, setList] = useState<GalleryItem[]>([]);
    const [formData, setFormData] = useState({ imageUrl: '', cat: 'Events', capEn: '', capBn: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => setList(await storage.getGallery());
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: GalleryItem = {
            id: generateId(),
            imageUrl: formData.imageUrl || 'https://picsum.photos/600/600?random=' + Date.now(),
            category: formData.cat,
            caption: { en: formData.capEn, bn: formData.capBn }
        };
        await storage.saveGalleryItem(newItem);
        setList(await storage.getGallery());
        setFormData({ imageUrl: '', cat: 'Events', capEn: '', capBn: '' });
    };

    const confirmDelete = async () => {
        if(deleteId) {
            await storage.deleteGalleryItem(deleteId);
            setList(await storage.getGallery());
            setDeleteId(null);
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
             {/* Add Form */}
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Plus size={20} className="text-brand-600"/> Add to Gallery</h2>
                 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
                         <div className="flex items-start gap-4 p-4 border rounded-xl dark:border-gray-600 border-dashed bg-gray-50 dark:bg-gray-700/30">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover"/>}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs w-full"/>
                                <input type="text" placeholder="Or Image URL" className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                            </div>
                         </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" required placeholder="Caption (English)" className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={formData.capEn} onChange={e => setFormData({...formData, capEn: e.target.value})} />
                            <input type="text" required placeholder="Caption (Bangla)" className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={formData.capBn} onChange={e => setFormData({...formData, capBn: e.target.value})} />
                        </div>
                        <select className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})}>
                            <option>Events</option>
                            <option>Social Work</option>
                            <option>Meetings</option>
                            <option>Others</option>
                        </select>
                        <button type="submit" className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-bold hover:bg-brand-700">Add Photo</button>
                    </div>
                 </form>
             </div>

             {/* Gallery Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {list.map(item => (
                     <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                         <img src={item.imageUrl} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-2 text-center">
                             <p className="text-xs font-bold mb-1">{item.category}</p>
                             <p className="text-[10px] line-clamp-2">{item.caption.en}</p>
                             <button onClick={() => setDeleteId(item.id)} className="mt-2 p-2 bg-red-600 rounded-full hover:bg-red-700"><Trash2 size={14}/></button>
                         </div>
                     </div>
                 ))}
             </div>

             <ConfirmationModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Photo?"
                message="Are you sure you want to remove this photo from the gallery?"
             />
        </div>
    );
};

// --- COMPONENTS ---

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    
    // Client-side Validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const success = await authService.login(formData.username, formData.password);
      if (success) {
        onLogin();
      } else {
        setErrors({ general: 'Invalid username or password.' });
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-brand-950 to-black px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
           <div className="w-20 h-20 rounded-full bg-white p-2 shadow-lg mb-4 flex items-center justify-center">
               <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
           </div>
           <h2 className="text-2xl font-bold text-white tracking-wide">Admin Portal</h2>
           <p className="text-gray-300 text-sm">Secure Access Only</p>
        </div>

        {errors.general && (
          <div className="mb-6 flex items-center gap-2 text-red-200 text-sm bg-red-900/50 p-3 rounded-xl border border-red-500/30 animate-in slide-in-from-top-2">
            <ShieldAlert size={16} className="shrink-0" /> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
             <User className={`absolute left-4 top-3.5 transition-colors ${errors.username ? 'text-red-400' : 'text-gray-400'}`} size={18} />
             <input type="text" placeholder="Username" 
                className={`w-full pl-12 pr-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 outline-none transition-all ${errors.username ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-brand-500 focus:ring-brand-500'}`}
                value={formData.username} 
                onChange={e => handleInputChange('username', e.target.value)}
             />
             {errors.username && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.username}</p>}
          </div>
          
          <div className="relative">
             <Lock className={`absolute left-4 top-3.5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400'}`} size={18} />
             <input type="password" placeholder="Password" 
                className={`w-full pl-12 pr-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-brand-500 focus:ring-brand-500'}`}
                value={formData.password} 
                onChange={e => handleInputChange('password', e.target.value)}
             />
             {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
        setDonations(await storage.getDonations() || []);
        setExpenses(await storage.getExpenses() || []);
    };
    load();
  }, []);

  const totalDonation = donations.filter(d => d.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const data = [{ name: 'Income', amount: totalDonation }, { name: 'Expense', amount: totalExpense }];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"><DollarSign size={48} /></div>
           <h3 className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">Total Income</h3>
           <p className="text-3xl font-bold">৳ {totalDonation.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"><Receipt size={48} /></div>
           <h3 className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Total Expense</h3>
           <p className="text-3xl font-bold">৳ {totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform"><ShieldAlert size={48} /></div>
           <h3 className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">Pending Requests</h3>
           <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
        <h3 className="text-lg font-bold mb-6 dark:text-white">Financial Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={80}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ManageDonations = () => {
  const [list, setList] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => setList(await storage.getDonations());
    load();
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    await storage.updateDonationStatus(id, status);
    setList(await storage.getDonations());
  };

  const confirmDelete = async () => {
    if(deleteId) {
        await storage.deleteDonation(deleteId);
        setList(await storage.getDonations());
        setDeleteId(null);
    }
  };

  const filteredList = list.filter(d => filter === 'all' ? true : d.status === filter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold dark:text-white flex items-center gap-2"><Users size={20} className="text-brand-600" /> Donations</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto max-w-full">
          {['all', 'pending', 'approved', 'rejected'].map((f: any) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${filter === f ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400 text-xs">
            <tr><th className="p-4">Date</th><th className="p-4">Donor</th><th className="p-4">Note/Method</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredList.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <td className="p-4 text-gray-500 dark:text-gray-400">{d.date}</td>
                <td className="p-4">
                    <div className="font-bold text-gray-900 dark:text-white">{d.donorName} {d.isAnonymous && <span className="text-xs text-gray-400">(Anon)</span>}</div>
                    <div className="text-xs text-gray-400">{d.mobile}</div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-300">
                    {d.note ? <span className="italic">"{d.note}"</span> : d.method}
                </td>
                <td className="p-4 font-bold text-brand-600">৳ {d.amount}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${d.status === 'approved' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span></td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                      {d.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatus(d.id, 'approved')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Approve"><Check size={16}/></button>
                            <button onClick={() => handleStatus(d.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject"><X size={16}/></button>
                          </>
                      )}
                      <button onClick={() => setDeleteId(d.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Donation?"
        message="Are you sure you want to delete this donation record? This cannot be undone."
      />
    </div>
  );
};

const ManageExpenses = () => {
  const [list, setList] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: '', date: '', description: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => setList(await storage.getExpenses());
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: generateId(),
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date || new Date().toISOString().split('T')[0],
      description: formData.description
    };
    await storage.addExpense(newExpense);
    setList(await storage.getExpenses());
    setIsModalOpen(false);
    setFormData({ title: '', amount: '', category: '', date: '', description: '' });
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await storage.deleteExpense(deleteId);
      setList(await storage.getExpenses());
      setDeleteId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold dark:text-white flex items-center gap-2"><Receipt size={20} className="text-brand-600" /> Expenses</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all"><Plus size={16} /> <span className="hidden sm:inline">Add Expense</span></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400 text-xs">
            <tr><th className="p-4">Date</th><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Amount</th><th className="p-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-4 text-gray-500 dark:text-gray-400">{e.date}</td>
                <td className="p-4 font-bold text-gray-800 dark:text-white">{e.title}</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{e.category}</span></td>
                <td className="p-4 font-bold text-red-500">৳ {e.amount}</td>
                <td className="p-4 text-right"><button onClick={() => setDeleteId(e.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No expenses recorded.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Expense?"
        message="Are you sure you want to remove this expense record? This action cannot be undone."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-6 dark:text-white">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <input type="number" placeholder="Amount" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                 <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                 <option value="" disabled>Select Category</option>
                 <option value="Event">Event</option>
                 <option value="Marketing">Marketing</option>
                 <option value="Operations">Operations</option>
                 <option value="Charity">Charity</option>
              </select>
              <textarea placeholder="Description" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ManageLeaders = () => {
  const [list, setList] = useState<Leader[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameBn: '', desigEn: '', desigBn: '', image: '', msgEn: '', msgBn: '', order: 0 });
  const [draggedItem, setDraggedItem] = useState<Leader | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    const load = async () => setList((await storage.getLeaders()).sort((a, b) => a.order - b.order));
    load();
  }, []);

  const openModal = (leader?: Leader) => {
      if (leader) {
          setEditingId(leader.id);
          setFormData({
              nameEn: leader.name.en, nameBn: leader.name.bn,
              desigEn: leader.designation.en, desigBn: leader.designation.bn,
              image: leader.image,
              msgEn: leader.message.en, msgBn: leader.message.bn,
              order: leader.order
          });
      } else {
          setEditingId(null);
          setFormData({ nameEn: '', nameBn: '', desigEn: '', desigBn: '', image: '', msgEn: '', msgBn: '', order: list.length + 1 });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLeader: Leader = {
       id: editingId || generateId(),
       name: { en: formData.nameEn, bn: formData.nameBn },
       designation: { en: formData.desigEn, bn: formData.desigBn },
       image: formData.image || 'https://picsum.photos/200/200',
       message: { en: formData.msgEn, bn: formData.msgBn },
       order: Number(formData.order) || list.length + 1
    };
    await storage.saveLeader(newLeader);
    setList((await storage.getLeaders()).sort((a, b) => a.order - b.order));
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await storage.deleteLeader(deleteId);
      setList(await storage.getLeaders());
      setDeleteId(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, leader: Leader) => {
    setDraggedItem(leader);
    e.dataTransfer.effectAllowed = "move";
    // Making it slightly transparent while dragging
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetLeader: Leader) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetLeader.id) return;

    // Create a copy of the list
    const updatedList = [...list];
    const draggedIdx = updatedList.findIndex(l => l.id === draggedItem.id);
    const targetIdx = updatedList.findIndex(l => l.id === targetLeader.id);

    // Remove dragged item and insert at target position
    updatedList.splice(draggedIdx, 1);
    updatedList.splice(targetIdx, 0, draggedItem);

    // Update order property for all items
    const reorderedList = updatedList.map((leader, index) => ({
      ...leader,
      order: index + 1
    }));

    setList(reorderedList);
    
    // Save all updated leaders to storage
    for (const l of reorderedList) {
        await storage.saveLeader(l);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
       <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <h2 className="text-lg font-bold dark:text-white flex items-center gap-2"><Users size={20} className="text-brand-600" /> Manage Leaders</h2>
         <button onClick={() => openModal()} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all"><Plus size={16} /> <span className="hidden sm:inline">Add Leader</span></button>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm min-w-[700px]">
           <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400 text-xs">
             <tr><th className="p-4">#</th><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Designation</th><th className="p-4">Message</th><th className="p-4 text-right">Action</th></tr>
           </thead>
           <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {list.map(l => (
               <tr 
                 key={l.id} 
                 draggable
                 onDragStart={(e) => handleDragStart(e, l)}
                 onDragEnd={handleDragEnd}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, l)}
                 className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-move"
               >
                 <td className="p-4 font-mono text-gray-400 flex items-center gap-2">
                   <GripVertical size={14} className="text-gray-300" />
                   {l.order}
                 </td>
                 <td className="p-4"><img src={l.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" /></td>
                 <td className="p-4 font-bold text-gray-800 dark:text-white">{l.name.en}</td>
                 <td className="p-4 text-brand-600">{l.designation.en}</td>
                 <td className="p-4">
                    <div className="space-y-1">
                        <div title={l.message.en} className="text-xs text-gray-600 dark:text-gray-300">
                           <span className="font-bold text-brand-600 dark:text-brand-400 mr-1">EN:</span> 
                           {l.message.en.length > 50 ? l.message.en.substring(0, 50) + '...' : l.message.en}
                        </div>
                        <div title={l.message.bn} className="text-xs text-gray-600 dark:text-gray-300">
                           <span className="font-bold text-brand-600 dark:text-brand-400 mr-1">BN:</span>
                           {l.message.bn.length > 50 ? l.message.bn.substring(0, 50) + '...' : l.message.bn}
                        </div>
                    </div>
                 </td>
                 <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => openModal(l)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Pencil size={16}/></button>
                    <button onClick={() => setDeleteId(l.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
             {list.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No leaders found.</td></tr>}
           </tbody>
         </table>
       </div>
       
       <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Leader?"
        message="Are you sure you want to remove this leader from the organization? This action cannot be undone."
      />

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
               <h3 className="text-xl font-bold mb-6 dark:text-white">{editingId ? 'Edit Leader' : 'Add New Leader'}</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" placeholder="Name (English)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                   <input type="text" placeholder="Name (Bangla)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" placeholder="Designation (EN)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.desigEn} onChange={e => setFormData({...formData, desigEn: e.target.value})} />
                   <input type="text" placeholder="Designation (BN)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.desigBn} onChange={e => setFormData({...formData, desigBn: e.target.value})} />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Profile Image</label>
                    <div className="flex items-start gap-4 p-3 border rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                        <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                           {formData.image ? (
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200"
                           />
                           <input 
                              type="text" 
                              placeholder="Or paste Image URL" 
                              className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                              value={formData.image} 
                              onChange={e => setFormData({...formData, image: e.target.value})} 
                           />
                        </div>
                    </div>
                 </div>

                 <input type="number" placeholder="Order (Sort)" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                 
                 <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Message (English)</label>
                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} value={formData.msgEn} onChange={e => setFormData({...formData, msgEn: e.target.value})}></textarea>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Message (Bangla)</label>
                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} value={formData.msgBn} onChange={e => setFormData({...formData, msgBn: e.target.value})}></textarea>
                 </div>

                 <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Save</button>
                 </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

const ManageMembers = () => {
  const [list, setList] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameBn: '', desigEn: '', desigBn: '', image: '', msgEn: '', msgBn: '', order: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    const load = async () => setList((await storage.getMembers()).sort((a, b) => a.order - b.order));
    load();
  }, []);

  const openModal = (member?: Member) => {
    if (member) {
        setEditingId(member.id);
        setFormData({
            nameEn: member.name.en, nameBn: member.name.bn,
            desigEn: member.designation.en, desigBn: member.designation.bn,
            image: member.image,
            msgEn: member.message?.en || '', msgBn: member.message?.bn || '',
            order: member.order
        });
    } else {
        setEditingId(null);
        setFormData({ nameEn: '', nameBn: '', desigEn: '', desigBn: '', image: '', msgEn: '', msgBn: '', order: list.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formData.image || 'https://picsum.photos/200/200';
    const newMember: Member = {
       id: editingId || generateId(),
       name: { en: formData.nameEn, bn: formData.nameBn },
       designation: { en: formData.desigEn, bn: formData.desigBn },
       image: finalImage,
       message: { en: formData.msgEn, bn: formData.msgBn },
       order: Number(formData.order) || list.length + 1
    };
    await storage.saveMember(newMember);
    setList((await storage.getMembers()).sort((a, b) => a.order - b.order));
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = async () => {
     if(deleteId) {
        await storage.deleteMember(deleteId);
        setList(await storage.getMembers());
        setDeleteId(null);
     }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
       <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <h2 className="text-lg font-bold dark:text-white flex items-center gap-2"><UserPlus size={20} className="text-brand-600" /> Manage Members</h2>
         <button onClick={() => openModal()} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all"><Plus size={16} /> <span className="hidden sm:inline">Add Member</span></button>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm min-w-[600px]">
           <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400 text-xs">
             <tr><th className="p-4">#</th><th className="p-4">Photo</th><th className="p-4">Name</th><th className="p-4">Position</th><th className="p-4 text-right">Action</th></tr>
           </thead>
           <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {list.map(m => (
               <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                 <td className="p-4 font-mono text-gray-400">{m.order}</td>
                 <td className="p-4"><img src={m.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200/200')} /></td>
                 <td className="p-4 font-bold dark:text-white">{m.name.en}</td>
                 <td className="p-4 text-brand-600">{m.designation.en}</td>
                 <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => openModal(m)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Pencil size={16}/></button>
                    <button onClick={() => setDeleteId(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
             {list.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No members found.</td></tr>}
           </tbody>
         </table>
       </div>
       
       <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Member?"
        message="Are you sure you want to remove this member? This action cannot be undone."
      />

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
               <h3 className="text-xl font-bold mb-6 dark:text-white">{editingId ? 'Edit Member' : 'Add New Member'}</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" placeholder="Name (English)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.nameEn} onChange={e => setFormData({...formData,nameEn: e.target.value})} />
                   <input type="text" placeholder="Name (Bangla)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" placeholder="Position (EN)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.desigEn} onChange={e => setFormData({...formData, desigEn: e.target.value})} />
                   <input type="text" placeholder="Position (BN)" required className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.desigBn} onChange={e => setFormData({...formData, desigBn: e.target.value})} />
                 </div>
                 
                 <div className="relative">
                    <Link2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input type="text" placeholder="Photo URL (Direct or Google Drive)" className="w-full pl-10 pr-3 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Or Upload Photo</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200" />
                 </div>

                 <input type="number" placeholder="Order (Sort)" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                 
                 <div className="space-y-2">
                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} placeholder="Message (English)" value={formData.msgEn} onChange={e => setFormData({...formData, msgEn: e.target.value})}></textarea>
                 </div>
                 <div className="space-y-2">
                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} placeholder="Message (Bangla)" value={formData.msgBn} onChange={e => setFormData({...formData, msgBn: e.target.value})}></textarea>
                 </div>

                 <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold">Save</button>
                 </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

const ManageEvents = () => {
  const [list, setList] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    titleEn: '', titleBn: '', 
    descEn: '', descBn: '', 
    location: '', date: '', image: '' 
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // AI Summary State
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => setList(await storage.getEvents());
    load();
  }, []);

  const openModal = (event?: Event) => {
    if (event) {
      setEditingId(event.id);
      setFormData({
        titleEn: event.title.en, titleBn: event.title.bn,
        descEn: event.description.en, descBn: event.description.bn,
        location: event.location,
        date: event.date,
        image: event.image
      });
    } else {
      setEditingId(null);
      setFormData({ 
        titleEn: '', titleBn: '', 
        descEn: '', descBn: '', 
        location: '', date: '', image: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: editingId || generateId(),
      title: { en: formData.titleEn, bn: formData.titleBn },
      description: { en: formData.descEn, bn: formData.descBn },
      location: formData.location,
      date: formData.date,
      image: formData.image || 'https://picsum.photos/800/400'
    };
    await storage.saveEvent(newEvent);
    setList(await storage.getEvents());
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const confirmDelete = async () => {
      if(deleteId) {
          await storage.deleteEvent(deleteId);
          setList(await storage.getEvents());
          setDeleteId(null);
      }
  };

  const handleSummarize = async (event: Event) => {
    setIsSummarizing(event.id);
    try {
        const { generateEventSummary } = await import('../services/ai');
        const summary = await generateEventSummary(event);
        setSummaryResult(summary);
    } catch (e) {
        console.error(e);
        alert("Failed to generate summary. Please check API key.");
    } finally {
        setIsSummarizing(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
       <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <h2 className="text-lg font-bold dark:text-white flex items-center gap-2"><Calendar size={20} className="text-brand-600" /> Manage Events</h2>
         <button onClick={() => openModal()} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all"><Plus size={16} /> <span className="hidden sm:inline">Add Event</span></button>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm min-w-[700px]">
           <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400 text-xs">
             <tr><th className="p-4">Date</th><th className="p-4">Image</th><th className="p-4">Title</th><th className="p-4">Location</th><th className="p-4 text-right">Action</th></tr>
           </thead>
           <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {list.map(e => (
               <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                 <td className="p-4 text-gray-500">{e.date}</td>
                 <td className="p-4"><img src={e.image} className="w-16 h-10 object-cover rounded-lg border border-gray-200" alt="" /></td>
                 <td className="p-4 font-bold dark:text-white">{e.title.en}</td>
                 <td className="p-4 text-gray-500">{e.location}</td>
                 <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                        onClick={() => handleSummarize(e)} 
                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition relative group"
                        title="Generate AI Summary"
                        disabled={!!isSummarizing}
                    >
                        {isSummarizing === e.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">AI Summary</span>
                    </button>
                    <button onClick={() => openModal(e)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Pencil size={16}/></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
             {list.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No events found.</td></tr>}
           </tbody>
         </table>
       </div>

       <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Event?"
        message="Are you sure you want to delete this event?"
       />

       {/* AI Summary Result Modal */}
       {summaryResult && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
                 <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                         <Sparkles size={18} className="text-brand-500"/> AI Generated Summary
                     </h3>
                     <button onClick={() => setSummaryResult(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500"><X size={20} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                     {summaryResult}
                 </div>
                 <div className="flex justify-end gap-3">
                     <button 
                         onClick={() => {navigator.clipboard.writeText(summaryResult); alert('Copied to clipboard!');}} 
                         className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition"
                     >
                         <Copy size={16} /> Copy Text
                     </button>
                     <button onClick={() => setSummaryResult(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">Close</button>
                 </div>
             </div>
         </div>
       )}

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Event' : 'Add New Event'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                   <X size={24} /> 
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                 
                 {/* Basic Info Section */}
                 <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-4">
                    <label className="text-xs uppercase font-bold text-gray-500 block">Event Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input type="date" required className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="e.g. Sylhet Sadar" required className="w-full pl-9 p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Image Section */}
                 <div>
                    <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Cover Image</label>
                    <div className="flex items-start gap-4 p-4 border rounded-xl dark:border-gray-600 border-dashed bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 shadow-sm">
                           {formData.image ? (
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-1">
                                <ImageIcon size={20} />
                                <span className="text-[10px]">No Image</span>
                             </div>
                           )}
                        </div>
                        <div className="flex-1 space-y-3">
                           <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload File</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 transition"
                                />
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Image URL</label>
                                <div className="relative">
                                    <Link2 size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="https://..." 
                                        className="w-full pl-8 p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                                        value={formData.image} 
                                        onChange={e => setFormData({...formData, image: e.target.value})} 
                                    />
                                </div>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Content Section - 2 Columns */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">English</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input type="text" placeholder="Event Title" required className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]" rows={4} placeholder="Write details..." value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})}></textarea>
                        </div>
                    </div>

                    {/* Bengali Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Bangla</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (শিরোনাম)</label>
                            <input type="text" placeholder="ইভেন্টের শিরোনাম" required className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-bengali" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (বিবরণ)</label>
                            <textarea className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-bengali min-h-[100px]" rows={4} placeholder="বিস্তারিত লিখুন..." value={formData.descBn} onChange={e => setFormData({...formData, descBn: e.target.value})}></textarea>
                        </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all transform active:scale-95">
                        {editingId ? 'Update Event' : 'Create Event'}
                    </button>
                 </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

const Admin: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setAuth(authService.isAuthenticated());
    setChecking(false);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { 
      authService.logout(); 
      setAuth(false); 
      navigate('/'); 
      setIsSidebarOpen(false);
  };

  if (checking) return null;
  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  const menu = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <DollarSign size={20} />, label: 'Donations', path: '/admin/donations' },
    { icon: <Calendar size={20} />, label: 'Events', path: '/admin/events' },
    { icon: <ImageIcon size={20} />, label: 'Gallery', path: '/admin/gallery' },
    { icon: <Users size={20} />, label: 'Leaders', path: '/admin/leaders' },
    { icon: <UserPlus size={20} />, label: 'Members', path: '/admin/members' },
    { icon: <Receipt size={20} />, label: 'Expenses', path: '/admin/expenses' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 font-sans relative">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-16 z-20">
          <div className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-400">
             <LayoutDashboard size={20} />
             <span>Admin Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
             <Menu size={24} />
          </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* Sidebar */}
      <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:h-[calc(100vh-64px)] md:sticky md:top-16
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center">
            <h2 className="font-bold text-2xl text-brand-700 dark:text-brand-400 flex items-center gap-2"><LayoutDashboard className="fill-brand-100" /> Admin</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menu.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold ${location.pathname === item.path ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {item.icon} <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 mt-auto"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition font-bold"><LogOut size={18} /> Logout</button></div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/donations" element={<ManageDonations />} />
          <Route path="/expenses" element={<ManageExpenses />} />
          <Route path="/leaders" element={<ManageLeaders />} />
          <Route path="/members" element={<ManageMembers />} />
          <Route path="/events" element={<ManageEvents />} />
          <Route path="/gallery" element={<ManageGallery />} />
          <Route path="/settings" element={<ManageSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;