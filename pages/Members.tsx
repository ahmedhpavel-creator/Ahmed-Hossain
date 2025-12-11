
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { storage } from '../services/storage';
import { TRANSLATIONS } from '../constants';
import { User, Loader2 } from 'lucide-react';
import { Member } from '../types';

const Members: React.FC = () => {
  const { lang } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
        try {
            const data = await storage.getMembers();
            if (Array.isArray(data)) {
                setMembers(data.sort((a, b) => a.order - b.order));
            }
        } catch(e) {
            console.error("Failed to fetch members", e);
        } finally {
            setLoading(false);
        }
    };
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-bengali mb-4">
            {TRANSLATIONS.get('members', lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-2">
            {lang === 'en' 
              ? 'Our valuable members who work tirelessly for social welfare.' 
              : 'আমাদের সম্মানিত সদস্যবৃন্দ যারা সমাজ সেবায় নিরলস কাজ করে যাচ্ছেন।'}
          </p>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                 <Loader2 className="animate-spin text-brand-600" size={40} />
             </div>
        ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 group border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-2"
                    >
                      {/* Image Container with subtle ring on hover */}
                      <div className="w-24 h-24 md:w-28 md:h-28 mb-4 rounded-full p-1 border-2 border-transparent group-hover:border-brand-500/20 transition-colors duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner">
                            {member.image ? (
                                <img 
                                    src={member.image} 
                                    alt={member.name?.[lang]} 
                                    loading="lazy" 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                      </div>
                      
                      <div className="w-full space-y-1">
                        <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {member.name?.[lang] || 'Unknown'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider line-clamp-2">
                          {member.designation?.[lang] || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 text-gray-400 border border-gray-200 dark:border-gray-700">
                            <User size={32} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'No members found.' : 'কোনো সদস্য পাওয়া যায়নি।'}</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Members;
