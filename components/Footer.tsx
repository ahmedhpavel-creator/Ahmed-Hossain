
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { ORGANIZATION_INFO, TRANSLATIONS } from '../constants';
import { Phone, Mail, MapPin, Heart, Facebook, Twitter, Youtube, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { lang } = useLanguage();
  const { logo, settings } = useSettings();
  const phone = settings.contactPhone;

  return (
    <footer className="bg-brand-950 text-white relative no-print overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
      
      {/* Gold Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-800 via-gold-500 to-brand-800"></div>
      
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-5">
               <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl shadow-black/50">
                 <img src={logo} alt="Logo" className="w-full h-full object-contain" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold font-serif text-white leading-none mb-2">
                    {ORGANIZATION_INFO.name[lang]}
                  </h3>
                  <p className="text-xs text-brand-300 font-bold uppercase tracking-[0.2em]">Est. 1988 • Sylhet</p>
               </div>
            </div>
            <p className="text-brand-100 text-sm leading-relaxed opacity-80 max-w-sm">
              {ORGANIZATION_INFO.slogan[lang]}
            </p>
            <div className="flex gap-4">
               {['facebook', 'youtube', 'twitter'].map((social) => (
                 settings.socialLinks[social as keyof typeof settings.socialLinks] && (
                   <a key={social} href={settings.socialLinks[social as keyof typeof settings.socialLinks]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-800 flex items-center justify-center hover:bg-gold-500 hover:text-brand-950 transition-all duration-300">
                     {social === 'facebook' && <Facebook size={18} />}
                     {social === 'youtube' && <Youtube size={18} />}
                     {social === 'twitter' && <Twitter size={18} />}
                   </a>
                 )
               ))}
            </div>
          </div>

          {/* Links Column */}
          <div className="lg:col-span-2 lg:col-start-6">
             <h4 className="text-lg font-bold font-serif mb-8 text-gold-400">{lang === 'en' ? 'Navigate' : 'ন্যাভিগেশন'}</h4>
             <ul className="space-y-4">
               {[
                 { to: '/about', label: TRANSLATIONS.get('about', lang) },
                 { to: '/events', label: TRANSLATIONS.get('events', lang) },
                 { to: '/gallery', label: TRANSLATIONS.get('gallery', lang) },
                 { to: '/leaders', label: TRANSLATIONS.get('leaders', lang) },
                 { to: '/admin', label: TRANSLATIONS.get('admin', lang) },
               ].map((item, idx) => (
                 <li key={idx}>
                   <Link to={item.to} className="text-brand-200 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center gap-2">
                     <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                     {item.label}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-bold font-serif mb-8 text-gold-400">{lang === 'en' ? 'Contact' : 'যোগাযোগ'}</h4>
            <ul className="space-y-6">
               <li className="flex items-start gap-4 text-brand-200 text-sm group">
                 <MapPin size={20} className="shrink-0 text-gold-500 group-hover:animate-bounce" />
                 <span className="opacity-90 leading-relaxed">{ORGANIZATION_INFO.address}</span>
               </li>
               <li className="flex items-center gap-4 text-brand-200 text-sm">
                 <Phone size={20} className="shrink-0 text-gold-500" />
                 <a href={`tel:${phone}`} className="hover:text-white transition-colors font-mono tracking-wide">{phone}</a>
               </li>
               <li className="flex items-center gap-4 text-brand-200 text-sm">
                 <Mail size={20} className="shrink-0 text-gold-500" />
                 <a href={`mailto:${ORGANIZATION_INFO.contact.email}`} className="hover:text-white transition-colors break-all opacity-90">{ORGANIZATION_INFO.contact.email}</a>
               </li>
            </ul>
          </div>

          {/* CTA Column */}
          <div className="lg:col-span-3">
             <div className="bg-gradient-to-br from-brand-800 to-brand-900 rounded-2xl p-6 border border-brand-700 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full -mr-8 -mt-8 blur-xl transition-all group-hover:bg-gold-500/20"></div>
                <Heart size={28} className="text-gold-500 mb-4" fill="currentColor" />
                <h5 className="font-bold text-white mb-2 text-lg">{lang === 'en' ? 'Make a Difference' : 'অবদান রাখুন'}</h5>
                <p className="text-xs text-brand-300 mb-6 leading-relaxed">Your sadaqah can change lives and bring eternal rewards.</p>
                <Link to="/donate" className="flex items-center justify-between bg-white text-brand-900 px-5 py-3 rounded-xl text-sm font-bold hover:bg-gold-400 transition-colors">
                  {TRANSLATIONS.get('donate', lang)} <ArrowRight size={16} />
                </Link>
             </div>
          </div>
        </div>

        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60 text-xs">
          <p>© {new Date().getFullYear()} Azadi Social Welfare Organization. All Rights Reserved.</p>
          <p>Developed by <span className="text-white font-bold">Ahmed Hossain Pavel</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
