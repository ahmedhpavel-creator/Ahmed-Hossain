
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ORGANIZATION_INFO, TRANSLATIONS } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, HeartHandshake, ChevronRight, FileText, X, Send, MapPin, Play } from 'lucide-react';
import { storage } from '../services/storage';
import { Event, Leader } from '../types';

const Home: React.FC = () => {
  const { lang } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
        try {
            const eventsData = await storage.getEvents();
            if(Array.isArray(eventsData)) {
                 setEvents(eventsData.slice(0, 3));
            }
            const leadersData = await storage.getLeaders();
            if (Array.isArray(leadersData)) {
                setLeaders(leadersData.sort((a, b) => a.order - b.order).slice(0, 3));
            }
        } catch(e) {
            console.error("Failed to load home data", e);
        }
    };
    fetchData();
  }, []);

  const [isAppFormOpen, setIsAppFormOpen] = useState(false);
  const [appData, setAppData] = useState({ name: '', address: '', mobile: '', message: '' });

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const settings = await storage.getAppSettings();
    const adminPhone = settings.contactPhone;
    const text = `*New Application*\n\nName: ${appData.name}\nAddress: ${appData.address}\nMobile: ${appData.mobile}\nMessage: ${appData.message}`;
    window.open(`https://wa.me/+88${adminPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setIsAppFormOpen(false);
    setAppData({ name: '', address: '', mobile: '', message: '' });
  };

  return (
    <div className="flex flex-col bg-pattern">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-brand-50 dark:from-brand-950 dark:via-gray-900 dark:to-brand-950 opacity-90"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-800 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
          {/* Animated Calligraphy */}
          <div className="mb-12 mx-auto w-full max-w-md h-32 flex items-center justify-center">
            <svg viewBox="0 0 300 80" className="w-full h-full drop-shadow-lg">
              <path className="calligraphy-path stroke-brand-800 dark:stroke-brand-400 stroke-[3] fill-transparent" d="M260,40 Q240,10 210,10 T150,30 T90,10 T40,40" />
              <path className="calligraphy-path stroke-brand-600 dark:stroke-brand-600 stroke-[2] fill-transparent" style={{animationDelay: '0.5s'}} d="M250,55 Q200,75 150,55 T50,55" />
              <text x="150" y="55" textAnchor="middle" fontFamily="Amiri, serif" fontSize="40" className="fill-brand-900 dark:fill-brand-100 font-bold opacity-0" style={{animation: 'fillIn 1s ease-in-out 1.5s forwards'}}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</text>
            </svg>
          </div>
          
          <div className="space-y-6 mb-12 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold font-bengali text-brand-950 dark:text-white leading-tight">
              {ORGANIZATION_INFO.name[lang]}
            </h1>
            <div className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full"></div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium font-bengali max-w-3xl mx-auto leading-relaxed">
              {ORGANIZATION_INFO.slogan[lang]}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200">
            <Link to="/donate" className="group relative inline-flex items-center justify-center gap-3 bg-brand-800 hover:bg-brand-700 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-brand-900/20 transition-all overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <HeartHandshake size={20} className="text-gold-400" />
              {TRANSLATIONS.get('donate', lang)}
            </Link>
            
            <button onClick={() => setIsAppFormOpen(true)} className="inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-brand-900 dark:text-white hover:bg-gray-50 font-bold py-4 px-10 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 transition-all">
              <FileText size={20} className="text-brand-600" />
              {lang === 'en' ? 'Apply Now' : 'আবেদন করুন'}
            </button>
          </div>
        </div>
      </section>

      {/* Leadership Section - Enterprise Cards */}
      <section className="py-24 bg-white dark:bg-brand-950 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 border-b border-gray-100 dark:border-gray-800 pb-4">
             <div>
               <h2 className="text-3xl font-bold text-brand-900 dark:text-white font-serif">{TRANSLATIONS.get('leaders', lang)}</h2>
               <p className="text-gray-500 mt-2">Guiding our vision with wisdom and dedication.</p>
             </div>
             <Link to="/leaders" className="text-brand-600 dark:text-brand-400 font-bold hover:text-gold-600 transition-colors flex items-center gap-1">
               View All <ArrowRight size={16} />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leaders.map((leader, i) => (
              <div key={leader.id} className="group relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 shrink-0">
                        <div className="absolute inset-0 bg-gold-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img src={leader.image} alt={leader.name?.[lang]} className="relative w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-brand-900 dark:text-white">{leader.name?.[lang]}</h3>
                        <p className="text-sm font-bold text-gold-600 dark:text-gold-500 uppercase tracking-wider mt-1">{leader.designation?.[lang]}</p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-400 italic text-sm leading-relaxed">"{leader.message?.[lang]}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section - Modern Grid */}
      <section className="py-24 bg-brand-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-brand-900 dark:text-white font-serif mb-4">{TRANSLATIONS.get('recentEvents', lang)}</h2>
             <div className="w-16 h-1 bg-gold-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="group bg-white dark:bg-brand-950 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all z-10"></div>
                  <img src={event.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Calendar size={14} className="text-brand-600" />
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-900 dark:text-white">{event.date}</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-3 line-clamp-1">{event.title?.[lang]}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{event.description?.[lang]}</p>
                  <Link to="/events" className="inline-flex items-center gap-2 text-gold-600 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats - Islamic Pattern Background */}
      <section className="py-20 bg-brand-900 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                    { icon: Users, val: '50+', label: TRANSLATIONS.get('leaders', lang) },
                    { icon: HeartHandshake, val: '1k+', label: 'Donors' },
                    { icon: Calendar, val: '35+', label: 'Years' },
                    { icon: Play, val: '100%', label: 'Action' }
                ].map((stat, idx) => (
                    <div key={idx} className="p-4">
                        <stat.icon size={40} className="mx-auto mb-4 text-gold-500 opacity-80" />
                        <div className="text-5xl font-serif font-bold mb-2">{stat.val}</div>
                        <div className="text-brand-200 uppercase tracking-widest text-xs font-bold">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* App Form Modal (unchanged logic, better style) */}
      {isAppFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-8 relative border border-gray-100 dark:border-gray-700">
              <button onClick={() => setIsAppFormOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-brand-900 dark:text-white mb-6 text-center font-serif">Official Application</h2>
              <form onSubmit={handleAppSubmit} className="space-y-4">
                 <input required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-brand-500" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} placeholder={lang === 'en' ? "Full Name" : "আপনার নাম"} />
                 <input required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-brand-500" value={appData.address} onChange={e => setAppData({...appData, address: e.target.value})} placeholder={lang === 'en' ? "Address" : "ঠিকানা"} />
                 <input required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-brand-500" value={appData.mobile} onChange={e => setAppData({...appData, mobile: e.target.value})} placeholder={lang === 'en' ? "Mobile Number" : "মোবাইল"} />
                 <textarea required rows={4} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-brand-500" value={appData.message} onChange={e => setAppData({...appData, message: e.target.value})} placeholder={lang === 'en' ? "Detailed Message..." : "বিবরণ..."}></textarea>
                 <button type="submit" className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition shadow-lg flex justify-center gap-2"><Send size={20} /> Submit via WhatsApp</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
