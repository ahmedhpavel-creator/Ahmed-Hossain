import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { TRANSLATIONS, ORGANIZATION_INFO } from '../constants';
import { storage } from '../services/storage';
import { Donation as DonationType } from '../types';
import { CheckCircle, Download, Printer, ImageOff, Loader2, CreditCard, User, Phone, Banknote, ShieldCheck, Share2, Copy, Heart, MessageSquare, ArrowRight } from 'lucide-react';

const Donation: React.FC = () => {
  const { lang } = useLanguage();
  const { logo, settings } = useSettings();
  const contactPhone = settings.contactPhone;

  const [formData, setFormData] = useState({
    donorName: '', mobile: '', amount: '', method: 'Bkash', trxId: '', note: '', isAnonymous: false
  });
  const [submittedDonation, setSubmittedDonation] = useState<DonationType | null>(null);
  const [imgError, setImgError] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const [stats, setStats] = useState({ month: 0, year: 0 });
  const [recentDonations, setRecentDonations] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const donationsData = await storage.getDonations();
        const donations = donationsData.filter(d => d.status === 'approved');
        setRecentDonations(donations.slice(0, 10));

        const now = new Date();
        const thisMonth = donations.filter(d => {
          const dDate = new Date(d.date);
          return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
        }).reduce((sum, d) => sum + d.amount, 0);
        
        const thisYear = donations.filter(d => {
          const dDate = new Date(d.date);
          return dDate.getFullYear() === now.getFullYear();
        }).reduce((sum, d) => sum + d.amount, 0);

        setStats({ month: thisMonth, year: thisYear });
        setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation: DonationType = {
      id: 'don_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      donorName: formData.donorName,
      mobile: formData.mobile,
      amount: Number(formData.amount),
      method: formData.method as any,
      trxId: formData.trxId,
      note: formData.note,
      isAnonymous: formData.isAnonymous,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    await storage.saveDonation(newDonation);
    setSubmittedDonation(newDonation);
    window.scrollTo(0,0);
  };

  const handleDownloadPDF = async () => {
    if (!submittedDonation) return;
    setGeneratingPdf(true);
    window.scrollTo(0, 0);
    const input = document.getElementById('receipt');
    if (input) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        // @ts-ignore
        const html2canvas = (await import('html2canvas')).default;
        // @ts-ignore
        const jsPDF = (await import('jspdf')).jsPDF;
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#fffdf8' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 10, 20, 190, (canvas.height * 190 / canvas.width));
        pdf.save(`Receipt_${submittedDonation.id}.pdf`);
      } catch (error) { alert("PDF Error. Try printing."); }
    }
    setGeneratingPdf(false);
  };

  if (submittedDonation) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 flex flex-col items-center justify-center p-4">
        {/* Modern Islamic Receipt */}
        <div id="receipt" className="bg-[#fffdf8] p-8 rounded-sm shadow-2xl w-full max-w-2xl border border-gray-200 relative overflow-hidden text-gray-800">
           <div className="absolute top-0 left-0 right-0 h-3 bg-brand-800"></div>
           <div className="absolute top-3 left-0 right-0 h-1 bg-gold-500"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
               <div className="flex items-center gap-5">
                   <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
                   <div>
                      <h1 className="text-2xl font-bold font-serif text-brand-900">{ORGANIZATION_INFO.name.en}</h1>
                      <p className="text-sm text-gray-500">{ORGANIZATION_INFO.address}</p>
                      <p className="text-sm text-brand-600 font-bold mt-1">Reg: 1988/SYL</p>
                   </div>
               </div>
               <div className="text-right">
                 <div className="text-4xl font-serif text-gray-200 font-bold">RECEIPT</div>
                 <div className="text-sm font-bold text-brand-600 tracking-wider">#{submittedDonation.id.substring(0, 8).toUpperCase()}</div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10">
               <div>
                 <p className="text-xs font-bold text-gold-600 uppercase tracking-widest mb-1">Received From</p>
                 <p className="font-bold text-xl text-brand-900">{submittedDonation.isAnonymous ? 'Anonymous Donor' : submittedDonation.donorName}</p>
                 {!submittedDonation.isAnonymous && <p className="text-gray-500 font-mono">{submittedDonation.mobile}</p>}
               </div>
               <div className="text-right">
                 <p className="text-xs font-bold text-gold-600 uppercase tracking-widest mb-1">Date</p>
                 <p className="font-bold text-xl text-gray-900">{submittedDonation.date}</p>
               </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl p-8 mb-10 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <span className="text-brand-800 font-medium text-lg">{TRANSLATIONS.get('amount', lang)}</span>
                <span className="font-bold text-4xl text-brand-900">৳ {submittedDonation.amount.toLocaleString()}</span>
              </div>
              <div className="relative z-10 flex justify-between items-center mt-6 pt-6 border-t border-brand-200 text-sm">
                 <div><span className="text-gray-500 mr-2">Method:</span><span className="font-bold text-brand-800">{submittedDonation.method}</span></div>
                 <div><span className="text-gray-500 mr-2">TrxID:</span><span className="font-mono bg-white px-2 py-1 rounded border border-brand-200 text-gray-800">{submittedDonation.trxId}</span></div>
              </div>
              {submittedDonation.note && <div className="mt-4 pt-4 border-t border-brand-200 text-brand-800 italic relative z-10">"{submittedDonation.note}"</div>}
            </div>

            <div className="flex justify-between items-end mt-12">
               <div className="text-center">
                  <div className="text-3xl font-arabic text-brand-900 mb-1">جزاك الله خيرا</div>
               </div>
               <div className="text-right">
                  <img src={logo} className="w-24 opacity-20 absolute bottom-8 right-8 pointer-events-none" />
                  <div className="h-px w-40 bg-gray-300 mb-2"></div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Authorized Signature</p>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 no-print">
          <button onClick={handleDownloadPDF} disabled={generatingPdf} className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white px-8 py-3 rounded-full font-bold shadow-xl transition disabled:opacity-70">{generatingPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />} Download PDF</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-full font-bold shadow-lg border border-gray-200 transition"><Printer size={20} /> Print</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <h1 className="text-4xl font-bold text-brand-900 dark:text-white font-serif mb-4">{TRANSLATIONS.get('donation_form', lang)}</h1>
             <p className="text-gray-600 dark:text-gray-400">Securely donate to support our welfare projects.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
              {/* Info Side */}
              <div className="md:w-2/5 bg-brand-900 p-10 text-white relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                       <h3 className="text-2xl font-bold font-serif mb-6 text-gold-400">Why Donate?</h3>
                       <p className="opacity-90 leading-relaxed mb-6">Your contribution directly impacts the lives of the underprivileged in Sylhet through education, food security, and healthcare.</p>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm"><ShieldCheck size={20} className="text-gold-400" /><span className="font-bold">100% Transparent</span></div>
                          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm"><CheckCircle size={20} className="text-gold-400" /><span className="font-bold">Shariah Compliant</span></div>
                       </div>
                    </div>
                    <div className="mt-10">
                       <p className="text-sm opacity-60 mb-2 uppercase tracking-widest">Total Raised This Year</p>
                       <p className="text-4xl font-bold text-white">৳ {loading ? '...' : stats.year.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              {/* Form Side */}
              <div className="md:w-3/5 p-10 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Name</label>
                        <input name="donorName" required className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition" value={formData.donorName} onChange={handleChange} placeholder="Full Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Mobile</label>
                        <input name="mobile" required className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition" value={formData.mobile} onChange={handleChange} placeholder="017..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Amount (BDT)</label>
                        <input name="amount" type="number" required className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition font-bold text-lg" value={formData.amount} onChange={handleChange} placeholder="500" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Method</label>
                        <select name="method" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition cursor-pointer" value={formData.method} onChange={handleChange}>
                            <option value="Bkash">Bkash</option><option value="Nagad">Nagad</option><option value="Cash">Cash</option>
                        </select>
                     </div>
                  </div>

                  {(formData.method === 'Bkash' || formData.method === 'Nagad') && (
                    <div className="bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-xl p-5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="bg-brand-100 dark:bg-brand-800 p-2 rounded-full text-brand-700 dark:text-brand-300"><Phone size={20}/></div>
                          <div><p className="text-sm font-bold text-gray-600 dark:text-gray-300">Send Money To</p><p className="font-mono font-bold text-lg text-brand-800 dark:text-white">{contactPhone}</p></div>
                       </div>
                       <button type="button" onClick={() => navigator.clipboard.writeText(contactPhone)} className="text-gray-400 hover:text-brand-600"><Copy size={18}/></button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">TrxID</label>
                    <input name="trxId" required className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition font-mono uppercase" value={formData.trxId} onChange={handleChange} placeholder="Transaction ID" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="anon" name="isAnonymous" checked={formData.isAnonymous} onChange={handleChange} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" />
                    <label htmlFor="anon" className="text-sm font-medium text-gray-600 dark:text-gray-400">Donate Anonymously</label>
                  </div>

                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-5 rounded-xl shadow-lg transition text-lg flex justify-center gap-2 items-center">
                    {TRANSLATIONS.get('submit', lang)} <ArrowRight size={20} />
                  </button>
                </form>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;