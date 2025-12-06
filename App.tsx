import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Language } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Leaders from './pages/Leaders';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Donation from './pages/Donation';
import About from './pages/About';
import Admin from './pages/Admin';
import ChatBot from './components/ChatBot';
import { LanguageContext } from './contexts/LanguageContext';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans relative">
          <Navbar toggleTheme={toggleTheme} darkMode={darkMode} />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leaders" element={<Leaders />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/donate" element={<Donation />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;