
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { TRANSLATIONS } from '../constants';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { ORGANIZATION_INFO } from '../constants';

interface NavbarProps {
  toggleTheme: () => void;
  darkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, darkMode }) => {
  const { lang, setLang } = useLanguage();
  const { logo } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: TRANSLATIONS.get('home', lang) },
    { path: '/leaders', label: TRANSLATIONS.get('leaders', lang) },
    { path: '/members', label: TRANSLATIONS.get('members', lang) },
    { path: '/events', label: TRANSLATIONS.get('events', lang) },
    { path: '/gallery', label: TRANSLATIONS.get('gallery', lang) },
    { path: '/about', label: TRANSLATIONS.get('about', lang) },
    { path: '/donate', label: TRANSLATIONS.get('donate', lang), special: true },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b no-print
      ${scrolled || isOpen 
        ? 'bg-white/95 dark:bg-brand-950/95 backdrop-blur-xl border-brand-100 dark:border-brand-800 shadow-xl' 
        : 'bg-transparent border-transparent py-2'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 py-2 flex justify-between items-center">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-4 group" onClick={closeMenu}>
           <div className={`shrink-0 flex items-center justify-center overflow-hidden bg-white rounded-full ring-4 ring-brand-50 dark:ring-brand-900 shadow-xl transition-all duration-500 ${scrolled ? 'h-12 w-12' : 'h-16 w-16'}`}>
             <img 
               src={logo} 
               alt="Logo" 
               className="h-full w-full object-contain p-1"
             />
           </div>
          <div className={`flex flex-col transition-all duration-500 ${!scrolled && 'text-shadow-sm'}`}>
             <span className="font-bold text-base md:text-xl leading-tight text-brand-900 dark:text-white font-bengali tracking-wide line-clamp-1">
               {ORGANIZATION_INFO.name[lang]}
             </span>
             <span className="text-[10px] md:text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-[0.2em] hidden sm:block">
               Est. 1988 • Sylhet
             </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden group
                ${link.special
                  ? 'bg-gradient-to-r from-gold-500 to-brand-600 text-white shadow-lg hover:shadow-gold-500/20 hover:-translate-y-0.5 ml-3'
                  : location.pathname === link.path
                    ? 'text-brand-800 dark:text-white font-bold bg-brand-50 dark:bg-brand-900/50'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-300'
                }
              `}
            >
              <span className="relative z-10">{link.label}</span>
              {!link.special && <span className={`absolute inset-0 bg-brand-50 dark:bg-brand-900/30 transform origin-left transition-transform duration-300 ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>}
            </Link>
          ))}
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3"></div>

          <button 
            onClick={toggleLang} 
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-brand-800 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors"
            title="Switch Language"
          >
            {lang.toUpperCase()}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-brand-800 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors ml-2"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <button onClick={toggleLang} className="text-xs font-bold uppercase bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 px-2 py-1.5 rounded text-brand-800 dark:text-brand-200">
             {lang}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-brand-800 dark:text-white hover:bg-brand-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-brand-950/95 backdrop-blur-xl border-b border-brand-100 dark:border-gray-800 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={`text-base font-semibold block px-5 py-4 rounded-xl transition-all
                 ${link.special 
                   ? 'bg-gradient-to-r from-brand-700 to-brand-600 text-white text-center shadow-lg' 
                   : location.pathname === link.path
                     ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-white pl-8 border-l-4 border-gold-500'
                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                 }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex justify-between items-center px-5 py-4 mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Appearance</span>
             <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-xs font-bold border border-gray-100 dark:border-gray-700">
                {darkMode ? <Sun size={14} className="text-gold-500" /> : <Moon size={14} className="text-brand-600" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
