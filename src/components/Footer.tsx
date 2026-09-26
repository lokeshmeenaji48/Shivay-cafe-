import { useState, FormEvent } from 'react';
import { Coffee, Mail, Clock, Phone, MapPin, Instagram, Facebook, Twitter, ArrowUp, Send, Check } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleQuickLink = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-400">
      {/* Top Footer Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Identity */}
          <div className="space-y-6">
            <button 
              onClick={() => handleQuickLink('home')}
              className="flex items-center space-x-2 text-left cursor-pointer outline-none group"
              id="footer-logo"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md">
                <Coffee className="h-5.5 w-5.5 text-stone-950" />
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
            <p className="text-sm leading-relaxed text-stone-400">
              An epicurean sanctuary celebrating third-wave micro-lots, hand-made pastries, and slow fermentation wood-fired gastronomy in a refined, warm glassmorphic architecture.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                aria-label="Instagram Link"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                aria-label="Facebook Link"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                aria-label="Twitter Link"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { id: 'home', label: 'Home Page' },
                { id: 'about', label: 'Our Story' },
                { id: 'menu', label: 'Artisanal Menu' },
                { id: 'gallery', label: 'Photo Gallery' },
                { id: 'reservation', label: 'Book a Table' },
                { id: 'blog', label: 'The Coffee Blog' },
                { id: 'contact', label: 'Get in Touch' },
                { id: 'admin', label: 'Admin Portal (Rinku Saini)' },
                { id: 'faq', label: 'Help & FAQ' }
              ].map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => handleQuickLink(link.id)}
                    className="cursor-pointer hover:text-amber-400 hover:underline transition-all text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating Hours & Contact */}
          <div className="space-y-6">
            <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-white">Cafe House</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <Clock className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <span className="block font-medium text-stone-200">Daily Opening Hours</span>
                  <span className="block text-stone-400 text-xs">07:00 AM – 10:00 PM</span>
                  <span className="block text-amber-500/80 text-[11px] font-mono font-medium">Kitchen orders close at 9:30 PM</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <span className="block font-medium text-stone-200">Shivay Café Mandawari</span>
                  <span className="block text-stone-400 text-xs">Mandawari, Lalsot, Dausa, Rajasthan</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <span className="block font-medium text-stone-200">Phone Reservation</span>
                  <span className="block text-stone-400 text-xs">+91 98765 43210</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-6">
            <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-white">Join the Circle</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Subscribe to recieve private sensory coffee releases, priority booking window notifications, and executive chef dinner event alerts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 relative">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900 py-3 pl-4 pr-11 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400 animate-fadeIn">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Thank you! Welcome to Shivay Circle.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-stone-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 text-stone-500">
          <div>
            <p>© {currentYear} Shivay Cafe. Owner: Rinku Saini | Mandawari, Lalsot, Rajasthan. All Rights Reserved.</p>
          </div>
          <div className="flex space-x-6">
            <button onClick={() => alert('Shivay Cafe Privacy Policy: Your data is secure with us and processed locally in accordance with absolute customer standards.')} className="hover:text-stone-300">
              Privacy Policy
            </button>
            <button onClick={() => alert('Shivay Cafe Terms & Conditions: Standard booking, safety, and service regulations apply to all events.')} className="hover:text-stone-300">
              Terms & Conditions
            </button>
          </div>
          <div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center space-x-1 hover:text-white transition-colors cursor-pointer font-medium"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3 w-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
