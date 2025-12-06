import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ORGANIZATION_INFO, TRANSLATIONS, CALLIGRAPHY_URL } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, HeartHandshake, ChevronRight, FileText, X, Send, MapPin, Phone, User, MessageSquare } from 'lucide-react';
import { storage } from '../services/storage';

const Home: React.FC = () => {
  const { lang } = useLanguage();
  const events = storage.getEvents().slice(0, 3);
  // Fetch leaders from storage and sort by order
  const leaders = storage.getLeaders().sort((a, b) => a.order - b.order).slice(0, 3);

  // Application Form State
  const [isAppFormOpen, setIsAppFormOpen] = useState(false);
  const [appData, setAppData] = useState({
    name: '',
    address: '',
    mobile: '',
    message: ''
  });

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get Admin Phone
    const adminPhone = storage.getAppSettings().contactPhone;
    
    // Format Message
    const title = "New Application / Complaint Submission";
    const text = `*${title}*\n\n` +
                 `👤 *Name:* ${appData.name}\n` +
                 `📍 *Address:* ${appData.address}\n` +
                 `📞 *Mobile:* ${appData.mobile}\n\n` +
                 `📝 *Message/Complaint:* \n${appData.message}`;

    // Create WhatsApp URL
    const url = `https://wa.me/+88${adminPhone}?text=${encodeURIComponent(text)}`;
    
    // Open WhatsApp
    window.open(url, '_blank');
    
    // Close modal and reset
    setIsAppFormOpen(false);
    setAppData({ name: '', address: '', mobile: '', message: '' });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-300/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[80px]"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          {/* Central Islamic Calligraphy Header */}
          <div className="mb-10 mx-auto w-full max-w-md flex items-center justify-center animate-in fade-in zoom-in duration-700">
             <img 
               src={CALLIGRAPHY_URL} 
               alt="Bismillah" 
               className="w-full h-auto max-h-32 object-contain filter dark:invert drop-shadow-lg opacity-90" 
             />
          </div>
          
          <div className="space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-bold font-bengali text-gray-900 dark:text-white leading-tight drop-shadow-sm">
              {ORGANIZATION_INFO.name[lang]}
            </h1>
            <p className="text-lg md:text-2xl text-brand-700 dark:text-brand-300 font-medium font-bengali max-w-2xl mx-auto">
              {ORGANIZATION_INFO.slogan[lang]}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200 text-sm font-semibold">
              <span>{lang === 'bn' ? 'স্থাপিত' : 'Est'}: {ORGANIZATION_INFO.estDate[lang]}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/donate" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-1 hover:shadow-xl">
              <HeartHandshake size={20} />
              {TRANSLATIONS.get('donate', lang)}
            </Link>
            
            {/* New Application Button */}
            <button 
              onClick={() => setIsAppFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-gray-700 font-bold py-4 px-8 rounded-full shadow-md transition-all transform hover:-translate-y-1 border border-brand-200 dark:border-gray-700"
            >
              <FileText size={20} />
              {lang === 'en' ? 'Submit Application' : 'আবেদন / অভিযোগ'}
            </button>

            <Link to="/about" className="inline-flex items-center justify-center gap-2 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold py-4 px-6 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              {TRANSLATIONS.get('about', lang)}
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 hidden md:block">
           <ArrowRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* Leaders Preview - Floating Cards */}
      <section className="py-20 bg-white dark:bg-gray-900 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
             <div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                 {TRANSLATIONS.get('leaders', lang)}
               </h2>
               <div className="h-1 w-20 bg-brand-500 rounded-full"></div>
             </div>
             <Link to="/leaders" className="group flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
               {lang === 'en' ? 'View All' : 'সব দেখুন'} 
               <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaders.map(leader => (
              <div key={leader.id} className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
                <div className="relative w-20 h-20 shrink-0">
                  <div className="absolute inset-0 bg-brand-200 dark:bg-brand-900 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  <img src={leader.image} alt={leader.name[lang]} className="relative w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {leader.name[lang]}
                  </h3>
                  <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mb-1">
                    {leader.designation[lang]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                    "{leader.message[lang]}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Events - Grid with Image Emphasis */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-end mb-10">
             <div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                 {TRANSLATIONS.get('recentEvents', lang)}
               </h2>
               <div className="h-1 w-20 bg-brand-500 rounded-full"></div>
             </div>
             <Link to="/events" className="group flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
               {lang === 'en' ? 'View All' : 'সব দেখুন'} 
               <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  <img src={event.image} alt={event.title[lang]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <Calendar size={12} className="text-brand-600" /> {event.date}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {event.title[lang]}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                    {event.description[lang]}
                  </p>
                  <Link to="/events" className="inline-block mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 underline decoration-transparent hover:decoration-brand-600 transition-all">
                     {lang === 'en' ? 'Read More' : 'আরও পড়ুন'}
                  </Link>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">{lang === 'en' ? 'No events found.' : 'কোনো ইভেন্ট পাওয়া যায়নি।'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Stats - Floating Gradient Card */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-3xl p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>

             <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                <div className="p-2">
                   <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <Users size={24} className="text-white" />
                   </div>
                   <div className="text-4xl font-bold mb-1">50+</div>
                   <div className="text-brand-100 text-sm font-medium uppercase tracking-wider">{TRANSLATIONS.get('leaders', lang)}</div>
                </div>
                <div className="p-2">
                   <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <HeartHandshake size={24} className="text-white" />
                   </div>
                   <div className="text-4xl font-bold mb-1">1000+</div>
                   <div className="text-brand-100 text-sm font-medium uppercase tracking-wider">{lang === 'en' ? 'Donors' : 'দাতা'}</div>
                </div>
                <div className="p-2">
                   <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <Calendar size={24} className="text-white" />
                   </div>
                   <div className="text-4xl font-bold mb-1">35+</div>
                   <div className="text-brand-100 text-sm font-medium uppercase tracking-wider">{lang === 'en' ? 'Years' : 'বছর'}</div>
                </div>
                <div className="p-2">
                   <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <ArrowRight size={24} className="text-white -rotate-45" />
                   </div>
                   <div className="text-4xl font-bold mb-1">100%</div>
                   <div className="text-brand-100 text-sm font-medium uppercase tracking-wider">{lang === 'en' ? 'Dedication' : 'উৎসর্গ'}</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Application / Complaint Form Modal */}
      {isAppFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 relative border border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setIsAppFormOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 dark:text-brand-400">
                    <FileText size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-bengali">
                   {lang === 'en' ? 'Application / Complaint Form' : 'আবেদন / অভিযোগ ফর্ম'}
                 </h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                   {lang === 'en' 
                     ? 'Fill out the details below to send a request directly to our Admin via WhatsApp.' 
                     : 'আমাদের অ্যাডমিনের কাছে সরাসরি হোয়াটসঅ্যাপে অনুরোধ পাঠাতে নিচের ফর্মটি পূরণ করুন।'}
                 </p>
              </div>

              <form onSubmit={handleAppSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {lang === 'en' ? 'Name' : 'নাম'}
                    </label>
                    <div className="relative">
                       <User size={18} className="absolute left-3 top-3 text-gray-400" />
                       <input 
                         type="text" 
                         required 
                         className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" 
                         value={appData.name}
                         onChange={e => setAppData({...appData, name: e.target.value})}
                         placeholder={lang === 'en' ? "Your Full Name" : "আপনার নাম"}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {lang === 'en' ? 'Address' : 'ঠিকানা'}
                    </label>
                    <div className="relative">
                       <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                       <input 
                         type="text" 
                         required 
                         className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" 
                         value={appData.address}
                         onChange={e => setAppData({...appData, address: e.target.value})}
                         placeholder={lang === 'en' ? "Your Area/Location" : "আপনার এলাকা/ঠিকানা"}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {lang === 'en' ? 'Mobile Number' : 'মোবাইল নাম্বার'}
                    </label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                       <input 
                         type="tel" 
                         required 
                         className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" 
                         value={appData.mobile}
                         onChange={e => setAppData({...appData, mobile: e.target.value})}
                         placeholder="017..."
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {lang === 'en' ? 'Application / Complaint Details' : 'আবেদন বা অভিযোগের বিবরণ'}
                    </label>
                    <div className="relative">
                       <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                       <textarea 
                         required 
                         rows={4}
                         className="w-full pl-10 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition" 
                         value={appData.message}
                         onChange={e => setAppData({...appData, message: e.target.value})}
                         placeholder={lang === 'en' ? "Describe your request here..." : "আপনার অভিযোগ বা আবেদন এখানে লিখুন..."}
                       ></textarea>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                 >
                    <Send size={18} />
                    {lang === 'en' ? 'Send via WhatsApp' : 'হোয়াটসঅ্যাপে পাঠান'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;