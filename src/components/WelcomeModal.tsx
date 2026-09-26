import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Utensils, Sparkles, X, ChevronRight, Calendar, MessageSquare, Globe } from 'lucide-react';

interface WelcomeModalProps {
  onNavigateMenu: () => void;
  onNavigateReservation: () => void;
}

export default function WelcomeModal({ onNavigateMenu, onNavigateReservation }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    // Detect system / browser language
    try {
      const sysLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (sysLang.startsWith('en')) {
        setLang('en');
      } else {
        setLang('hi');
      }
    } catch {
      setLang('hi');
    }

    const hasSeenWelcome = sessionStorage.getItem('shivay_welcome_shown');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('shivay_welcome_shown', 'true');
    setIsOpen(false);
  };

  const handleGoMenu = () => {
    handleClose();
    onNavigateMenu();
  };

  const handleGoReservation = () => {
    handleClose();
    onNavigateReservation();
  };

  const content = {
    hi: {
      location: 'शिवाय कैफे एवं रेस्टोरेंट • मंडावरी',
      title: 'शिवाय कैफे में आपका स्वागत है!',
      subtitle: 'मंडावरी (लालसोट) के सबसे लोकप्रिय कैफे में आपका स्वागत है। स्वादिष्ट थिक कोल्ड कॉफी, पिज़ा, बर्गर एवं सैंडविच का आनंद लें और अपनी टेबल से ही सीधा ऑनलाइन ऑर्डर करें!',
      feature1Title: 'कोल्ड कॉफी व रॉयल शेक्स',
      feature1Desc: 'जयपुर स्टाइल थिक कोल्ड कॉफी, बादाम शेक, कैडबरी चॉकलेट शेक।',
      feature2Title: 'पिज़ा, बर्गर व सैंडविच',
      feature2Desc: 'पनीर टिक्का पिज़ा, क्रिस्पी आलू टिक्की बर्गर, ग्रिल्ड सैंडविच।',
      feature3Title: 'टेबल साइड ऑनलाइन ऑर्डर एवं बुकिंग',
      feature3Desc: 'आपकी टेबल से ही सीधा ऑर्डर करें या पहले से टेबल बुक करें - सीधा किचन में अलर्ट पहुंचेगा!',
      btnMenu: 'ऑर्डर / मेनू देखें',
      btnReserve: 'टेबल बुक करें',
    },
    en: {
      location: 'Shivay Café & Restaurant • Mandawari',
      title: 'Welcome to Shivay Café!',
      subtitle: 'Welcome to Mandawari, Lalsot\'s premier café. Enjoy gourmet thick cold coffee, delicious pizzas, burgers & instant tableside ordering!',
      feature1Title: 'Cold Coffee & Royal Shakes',
      feature1Desc: 'Jaipur style thick cold coffee, badam shake, cadbury chocolate shake.',
      feature2Title: 'Pizzas, Burgers & Sandwiches',
      feature2Desc: 'Paneer tikka pizza, crispy aloo tikki burger, grilled sandwiches.',
      feature3Title: 'Tableside Ordering & Reservations',
      feature3Desc: 'Order directly from your table or reserve in advance with live status updates!',
      btnMenu: 'View Menu & Order',
      btnReserve: 'Book a Table',
    }
  };

  const t = content[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-stone-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-amber-500/30 bg-stone-950 p-6 sm:p-8 shadow-2xl shadow-amber-950/50 z-10 my-auto"
          >
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-48 w-48 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>

            {/* Language Switcher & Close button */}
            <div className="absolute right-4 top-4 flex items-center space-x-2 z-20">
              <button
                onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition-all cursor-pointer text-xs font-semibold"
                title="Switch Language"
              >
                <Globe className="h-3.5 w-3.5 text-amber-500" />
                <span>{lang === 'hi' ? 'EN' : 'हिंदी'}</span>
              </button>

              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-amber-500/50 transition-all cursor-pointer"
                aria-label="Close Welcome Popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Header Content */}
            <div className="text-center space-y-3 pt-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-lg shadow-amber-500/20">
                <Coffee className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center space-x-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>{t.location}</span>
              </div>

              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {t.title}
              </h2>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {t.subtitle}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-850 bg-stone-900/50 p-3.5 flex items-start space-x-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Coffee className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{t.feature1Title}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{t.feature1Desc}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-850 bg-stone-900/50 p-3.5 flex items-start space-x-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Utensils className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{t.feature2Title}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{t.feature2Desc}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-850 bg-stone-900/50 p-3.5 flex items-start space-x-3 sm:col-span-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-white">
                    {t.feature3Title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{t.feature3Desc}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 pt-4 border-t border-stone-850 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleGoMenu}
                className="w-full sm:w-1/2 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center space-x-1.5"
              >
                <Utensils className="h-4 w-4" />
                <span>{t.btnMenu}</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleGoReservation}
                className="w-full sm:w-1/2 cursor-pointer rounded-xl border border-stone-700 bg-stone-900 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:border-amber-500 hover:bg-stone-850 transition-all flex items-center justify-center space-x-1.5"
              >
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>{t.btnReserve}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
