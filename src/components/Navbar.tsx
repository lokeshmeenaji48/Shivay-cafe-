import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Menu, X, Phone, Calendar, Clock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'menu', label: 'Menu' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reservation', label: 'Reservation' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-800/60 bg-stone-950/80 backdrop-blur-md">
      {/* Top Banner with Quick Details */}
      <div className="hidden bg-stone-900 px-6 py-2 text-xs text-stone-300 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Daily: 7:00 AM – 10:00 PM</span>
            </span>
            <span className="flex items-center space-x-1">
              <Phone className="h-3.5 w-3.5 text-amber-500" />
              <span>+91 98765 43210</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavClick('admin')}
              className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-medium border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 rounded-lg"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Console</span>
            </button>
            <button 
              onClick={() => handleNavClick('reservation')}
              className="flex items-center space-x-1 text-stone-300 hover:text-white transition-colors cursor-pointer font-medium"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>Reserve Table</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5" aria-label="Main Navigation">
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="group flex items-center space-x-2 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
          id="nav-logo"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-900/40">
            <Coffee className="h-5.5 w-5.5 text-stone-950" />
            <span className="absolute -inset-0.5 rounded-xl border border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </div>
          <div>
            <span className="block font-sans text-xl font-bold tracking-tight text-white uppercase">
              Shivay<span className="text-amber-500">.</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-amber-400/80 -mt-1 font-mono">
              Luxury Cafe
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center space-x-1 md:flex">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 font-sans text-sm font-medium tracking-wide transition-all cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavBackground"
                    className="absolute inset-0 z-0 rounded-lg bg-stone-900/60"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
          
          <button
            id="nav-cta-btn"
            onClick={() => handleNavClick('reservation')}
            className="ml-4 cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all shadow-md shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-950"
          >
            Book Table
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-800 bg-stone-900 text-stone-300 hover:text-white md:hidden focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-b border-stone-800 bg-stone-950 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-1.5 px-6 py-6" id="mobile-menu-container">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-400 border-l-4 border-amber-500' 
                        : 'text-stone-300 hover:bg-stone-900/60 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                id="mobile-nav-cta-btn"
                onClick={() => handleNavClick('reservation')}
                className="mt-4 w-full cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-center text-sm font-bold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Book a Table
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
