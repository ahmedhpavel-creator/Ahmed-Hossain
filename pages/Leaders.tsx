
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { storage } from '../services/storage';
import { TRANSLATIONS } from '../constants';
import { Quote } from 'lucide-react';
import { Leader } from '../types';

const Leaders: React.FC = () => {
  const { lang } = useLanguage();
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
        try {
            const data = await storage.getLeaders();
            if (Array.isArray(data)) {
                setLeaders(data.sort((a, b) => a.order - b.order));
            }
        } catch(e) {
            console.error("Failed to fetch leaders", e);
        }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen bg-pattern py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-900 dark:text-white font-serif mb-4">
            {TRANSLATIONS.get('leaders', lang)}
          </h1>
          <div className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {lang === 'en' 
              ? 'Meet the visionaries dedicated to serving humanity and upholding our core values.' 
              : 'আমাদের লক্ষ্য ও উদ্দেশ্য বাস্তবায়নে নিবেদিতপ্রাণ ব্যক্তিবর্গের সাথে পরিচিত হোন।'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {leaders.map((leader) => (
            <div key={leader.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:-translate-y-2">
              <div className="h-40 bg-gradient-to-r from-brand-800 to-brand-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <div className="px-8 pb-10 flex flex-col items-center -mt-20 relative z-10">
                <div className="w-36 h-36 rounded-full p-1.5 bg-white dark:bg-gray-900 shadow-2xl mb-6">
                  <img src={leader.image} alt={leader.name?.[lang]} loading="lazy" className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-brand-900 dark:text-white mb-1 font-serif text-center">
                  {leader.name?.[lang]}
                </h2>
                <p className="text-gold-600 dark:text-gold-500 font-bold text-xs uppercase tracking-[0.15em] mb-6 text-center">
                  {leader.designation?.[lang]}
                </p>

                {leader.bio?.[lang] && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center line-clamp-3 leading-relaxed">
                        {leader.bio[lang]}
                    </p>
                )}
                
                <div className="w-full bg-brand-50 dark:bg-gray-800/50 p-6 rounded-2xl relative">
                   <Quote size={24} className="text-brand-200 dark:text-gray-700 absolute -top-3 -left-2 fill-current" />
                   <p className="text-gray-700 dark:text-gray-300 text-sm italic text-center leading-relaxed">
                      "{leader.message?.[lang]}"
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaders;
