import { OrganizationInfo, LocalizedString } from './types';

// NOTE: For the live website on XAMPP, upload your 'logo.png' to the project root 
// and change this line to: export const LOGO_URL = '/logo.png';
// Using a generated Data URI here to ensure the logo is visible in this preview environment.
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <!-- Outer Dark Green Ring -->
  <circle cx="250" cy="250" r="245" fill="#064e3b" />
  
  <!-- Inner White Ring for Text -->
  <circle cx="250" cy="250" r="200" fill="white" />

  <!-- Inner Green Field -->
  <circle cx="250" cy="250" r="140" fill="#047857" stroke="#facc15" stroke-width="4"/>
  
  <!-- Red Sun Rising -->
  <circle cx="250" cy="210" r="60" fill="#dc2626" />

  <!-- Stylized White Shapla (National Flower) -->
  <g transform="translate(250, 240) scale(1.1)">
     <!-- Center Petal -->
     <path d="M0,-50 Q15,-20 0,0 Q-15,-20 0,-50 Z" fill="white" />
     <!-- Side Petals -->
     <path d="M0,0 Q20,-15 35,-35 Q25,-5 0,10 Z" fill="white" />
     <path d="M0,0 Q-20,-15 -35,-35 Q-25,-5 0,10 Z" fill="white" />
     <!-- Lower Leaves -->
     <path d="M-40,15 Q0,40 40,15 L40,25 Q0,50 -40,25 Z" fill="#10b981" />
  </g>
  
  <!-- Open Book (Symbol of Education) -->
  <path d="M190,320 Q250,340 310,320 L310,340 Q250,360 190,340 Z" fill="white" />
  <path d="M250,330 L250,350" stroke="#047857" stroke-width="2"/>

  <!-- Top Text (Organization Name) - Simplified Arc approximation -->
  <!-- Note: SVG textPath is complex in data URIs, using straight text carefully placed or curved path if supported -->
  <path id="textCurveTop" d="M 90,250 A 160,160 0 1,1 410,250" fill="none" />
  <text font-family="'Noto Sans Bengali', sans-serif" font-weight="bold" font-size="34" fill="#064e3b" text-anchor="middle">
    <textPath href="#textCurveTop" startOffset="50%" side="right">
      আজাদী সমাজ কল্যাণ সংঘ
    </textPath>
  </text>
  
  <!-- Bottom Ribbon with Est Date -->
  <path d="M120,380 Q250,450 380,380 L380,420 Q250,490 120,420 Z" fill="#b91c1c" stroke="white" stroke-width="2"/>
  <text x="250" y="415" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="white" letter-spacing="2">ESTD • 1988</text>

  <!-- Stars -->
  <g fill="#facc15">
     <polygon points="250,60 256,78 275,78 260,89 266,107 250,95 234,107 240,89 225,78 244,78" transform="translate(0, -10) scale(0.6)"/>
     <circle cx="100" cy="250" r="8" />
     <circle cx="400" cy="250" r="8" />
  </g>
</svg>
`;

// A beautiful Bismillah Calligraphy for the Header
const CALLIGRAPHY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
  <path d="M260,40 Q240,10 210,10 T150,30 T90,10 T40,40" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
  <path d="M250,55 Q200,75 150,55 T50,55" fill="none" stroke="#047857" stroke-width="2" opacity="0.6" />
  <text x="150" y="50" text-anchor="middle" font-family="Amiri, serif" font-size="40" fill="#065f46" font-weight="bold">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</text>
</svg>
`;

// Helper to safely Base64 encode Unicode strings (fixes the Uncaught DOMException)
const safeBtoa = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error('Encoding error', e);
    return '';
  }
};

export const LOGO_URL = `data:image/svg+xml;base64,${safeBtoa(LOGO_SVG)}`;
export const CALLIGRAPHY_URL = `data:image/svg+xml;base64,${safeBtoa(CALLIGRAPHY_SVG)}`;

export const ORGANIZATION_INFO: OrganizationInfo = {
  name: {
    bn: 'আজাদী সমাজ কল্যাণ সংঘ',
    en: 'Azadi Social Welfare Organization',
  },
  slogan: {
    bn: 'ঐক্য শিক্ষা শান্তি সেবা ক্রীড়া',
    en: 'Unity • Education • Peace • Service • Sports',
  },
  estDate: {
    bn: '২৭ শে জ্যৈষ্ঠ ১৩৯৫',
    en: '10 June 1988',
  },
  address: 'Ward-17, Road-1, Mirbox Tula, Sylhet, Bangladesh',
  contact: {
    phone: '01711975488',
    email: 'azadisocialwelfareorganization@gmail.com',
  },
};

export const MOCK_LEADERS = [];

export const DICTIONARY: Record<string, LocalizedString> = {
  home: { en: 'Home', bn: 'হোম' },
  leaders: { en: 'Leaders', bn: 'নেতৃবৃন্দ' },
  events: { en: 'Events', bn: 'ইভেন্ট' },
  gallery: { en: 'Gallery', bn: 'গ্যালারি' },
  about: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  donate: { en: 'Donate Now', bn: 'দান করুন' },
  donation_form: { en: 'Donation Form', bn: 'দান ফরম' },
  admin: { en: 'Admin', bn: 'অ্যাডমিন' },
  login: { en: 'Login', bn: 'লগইন' },
  logout: { en: 'Logout', bn: 'লগআউট' },
  name: { en: 'Name', bn: 'নাম' },
  mobile: { en: 'Mobile Number', bn: 'মোবাইল নম্বর' },
  amount: { en: 'Amount', bn: 'পরিমাণ' },
  method: { en: 'Payment Method', bn: 'পেমেন্ট পদ্ধতি' },
  trxId: { en: 'Transaction ID', bn: 'ট্রানজেকশন আইডি' },
  hideName: { en: 'Hide Name (Anonymous)', bn: 'নাম গোপন রাখুন' },
  submit: { en: 'Submit Donation', bn: 'জমা দিন' },
  receipt: { en: 'Acknowledgement Receipt', bn: 'প্রাপ্তি স্বীকার পত্র' },
  status: { en: 'Status', bn: 'অবস্থা' },
  pending: { en: 'Pending', bn: 'অপেক্ষমান' },
  approved: { en: 'Approved', bn: 'অনুমোদিত' },
  rejected: { en: 'Rejected', bn: 'বাতিল' },
  totalDonation: { en: 'Total Donation', bn: 'মোট দান' },
  thisMonth: { en: 'This Month', bn: 'এই মাস' },
  expense: { en: 'Expense', bn: 'ব্যয়' },
  income: { en: 'Income', bn: 'আয়' },
  print: { en: 'Print Receipt', bn: 'রশিদ প্রিন্ট করুন' },
  mission: { en: 'Mission', bn: 'লক্ষ্য' },
  vision: { en: 'Vision', bn: 'উদ্দেশ্য' },
  recentEvents: { en: 'Recent Events', bn: 'সাম্প্রতিক ইভেন্ট' },
  footer_dev: { en: 'Developed by Ahmed Hossain Pavel', bn: 'ডেভেলপার: আহমেদ হোসেন পাভেল' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  manageDonations: { en: 'Manage Donations', bn: 'দান ব্যবস্থাপনা' },
  accounting: { en: 'Accounting', bn: 'হিসাবরক্ষণ' },
  date: { en: 'Date', bn: 'তারিখ' },
};

export const TRANSLATIONS = {
    // Helper to get text safely
    get: (key: string, lang: 'en' | 'bn'): string => {
        return DICTIONARY[key] ? DICTIONARY[key][lang] : key;
    }
};