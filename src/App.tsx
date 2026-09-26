/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Data & Types
import { TESTIMONIALS, PRODUCTS } from './data';
import { Product } from './types';

// Layout & Core Components
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';

// Pages
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import AboutSection from './components/AboutSection';
import MenuSection from './components/MenuSection';
import GallerySection from './components/GallerySection';
import ReservationSection from './components/ReservationSection';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';
import FAQSection from './components/FAQSection';
import AdminDashboard from './components/AdminDashboard';

// Icons
import { Star, Flame, Trophy, Calendar, Sparkles, MapPin, Clock, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/menu')) return 'menu';
      if (path.includes('/admin')) return 'admin';
      if (path.includes('/reservation')) return 'reservation';
      if (path.includes('/about')) return 'about';
      if (path.includes('/gallery')) return 'gallery';
      if (path.includes('/contact')) return 'contact';
    }
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [autoOpenOrdering, setAutoOpenOrdering] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/menu')) setCurrentPage('menu');
      else if (path.includes('/admin')) setCurrentPage('admin');
      else if (path.includes('/reservation')) setCurrentPage('reservation');
      else if (path.includes('/about')) setCurrentPage('about');
      else if (path.includes('/gallery')) setCurrentPage('gallery');
      else if (path.includes('/contact')) setCurrentPage('contact');
      else setCurrentPage('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO Configurations
  const seoConfig: Record<string, { title: string; description: string }> = {
    home: {
      title: 'Home - Shivay Café & Restaurant',
      description: 'Experience Shivay Cafe in Mandawari, Lalsot, Rajasthan. Owner Rinku Saini welcomes you to enjoy cold coffees, royal shakes, wood-fired pizzas, crispy burgers, and direct tableside ordering.',
    },
    about: {
      title: 'Our Heritage & Story',
      description: 'Founded by Owner Rinku Saini, Shivay Café brings world-class coffee culture, thick shakes, and delicious gastronomy to Mandawari, Lalsot, Rajasthan.',
    },
    menu: {
      title: 'Shivay Café Special Menu',
      description: 'Explore gourmet cold coffee, papaya and banana shakes, badam shake, wood-fired pizzas, crispy burgers, grilled sandwiches, and snacks.',
    },
    gallery: {
      title: 'Atmospheric Photo Gallery',
      description: 'A visual journey through our warm glassmorphic seating lounges, espresso extractions, and wood-fired baking ovens.',
    },
    reservation: {
      title: 'Reserve a Table Seating',
      description: 'Lock in your preferred leather booths, botanical glass garden tables, or ergonomic nomad work pods. Automatic instant confirmation.',
    },
    blog: {
      title: 'The Coffee Chronicles Blog',
      description: 'Expert articles detailing bean molecular extraction, lamination layers, latte art microfoam physics, and culinary workshops.',
    },
    contact: {
      title: 'Get In Touch',
      description: 'Find our opening hours, telephone numbers, and address in Mandawari, Lalsot, Dausa, Rajasthan.',
    },
    admin: {
      title: 'Admin Dashboard - Shivay Café',
      description: 'Owner management console for live order status updates, kitchen tracking, WhatsApp & Email notifications.',
    },
    faq: {
      title: 'Help & Guidelines FAQ',
      description: 'Frequently asked questions regarding table booking durations, allergen profiles, gluten-free pastries, and private hire rentals.',
    },
  };

  const currentSeo = seoConfig[currentPage] || seoConfig.home;

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-300 selection:bg-amber-500 selection:text-stone-950">
      {/* Dynamic SEO Injector */}
      <SEO 
        title={currentSeo.title} 
        description={currentSeo.description} 
        pagePath={currentPage === 'home' ? '/' : `/${currentPage}`} 
      />

      {/* Welcome Modal on Website Open */}
      <WelcomeModal 
        onNavigateMenu={() => navigateTo('menu')} 
        onNavigateReservation={() => navigateTo('reservation')} 
      />

      {/* Sticky Global Navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* MAIN VIEWPORT ROUTER */}
      <main id="main-content-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentPage === 'home' && (
              <div id="home-view-container">
                {/* 1. Hero Banner Section */}
                <Hero setCurrentPage={setCurrentPage} />

                {/* 2. Featured Coffee / Best Sellers */}
                <BestSellers setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} setAutoOpenOrdering={setAutoOpenOrdering} />

                {/* 3. Coffee Categories Highlight */}
                <section className="bg-stone-900/10 py-20 border-t border-stone-900" id="home-categories">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
                      <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                        Gourmet Collections
                      </span>
                      <h2 className="mt-2 font-sans text-3xl font-extrabold text-white md:text-4xl">
                        Sensory Categories
                      </h2>
                      <p className="mt-3 text-sm text-stone-400">
                        From high-intensity double ristrettos to refreshing cold draft taps, we organize our creations into distinct flavor columns.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { title: "Specialty Lattes", desc: "Gold-infused espresso, organic botanical essences, textured milks.", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80" },
                        { title: "Artisanal Baker", desc: "Twice-baked butter croissants, cardamon buns, multi-layer gateaus.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80" },
                        { title: "Wood-Fired Pizza", desc: "San Marzano bases, fresh burrata, chanterelles, white truffle oils.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80" },
                        { title: "Gastro Burgers", desc: "Shaved black truffles, aged gruyère, premium Wagyu on gold brioche.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80" },
                      ].map((cat, index) => (
                        <div
                          key={index}
                          onClick={() => navigateTo('menu')}
                          className="group relative h-72 overflow-hidden rounded-2xl border border-stone-900 bg-stone-900 cursor-pointer shadow-lg"
                        >
                          <img
                            src={cat.image}
                            alt={cat.title}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 h-full w-full object-cover filter brightness-[0.7] saturate-[1.1] transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 right-6 space-y-1">
                            <h3 className="font-sans text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{cat.title}</h3>
                            <p className="text-xs text-stone-400 leading-normal line-clamp-2">{cat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 4. About Preview Section */}
                <section className="bg-stone-950 py-20 border-t border-stone-900" id="home-about-preview">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
                      <div className="lg:col-span-6 relative aspect-video rounded-3xl overflow-hidden border border-stone-900 bg-stone-900 shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&auto=format&fit=crop&q=80"
                          alt="Specialty Roasting at Shivay"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="lg:col-span-6 space-y-6 text-left">
                        <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                          Our Philosophy Preview
                        </span>
                        <h2 className="font-sans text-3xl font-extrabold text-white md:text-4xl">
                          Sourcing Integrity, Culinary Devotion
                        </h2>
                        <p className="text-sm leading-relaxed text-stone-400">
                          Shivay Cafe represents a dedicated balance between botanical precision and warm hospitality. We source organic, high-altitude micro-lots directly from ethical farming cooperatives in Colombia and Ethiopia, paying them 40% above fair-trade baselines.
                        </p>
                        <p className="text-sm leading-relaxed text-stone-400">
                          In our lamination chamber, flour is proofed for 72 hours under meticulous climate control to guarantee 27 pristine, flaky layers on every pistachio croissant.
                        </p>
                        <button
                          onClick={() => navigateTo('about')}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 cursor-pointer"
                        >
                          <span>Discover Our full Story</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Menu Highlights Carousel/Row Preview */}
                <section className="bg-stone-900/10 py-20 border-t border-stone-900" id="home-menu-preview">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                      <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                        Gourmet Teasers
                      </span>
                      <h2 className="mt-2 font-sans text-3xl font-extrabold text-white">
                        On the Counter Today
                      </h2>
                      <p className="mt-3 text-sm text-stone-400">
                        A quick preview of our decadent, hand-crafted culinary and espresso masterpieces. Crafted fresh to order.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {PRODUCTS.slice(4, 7).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => { setSelectedProduct(product); setAutoOpenOrdering(true); navigateTo('menu'); }}
                          className="group relative flex items-center space-x-4 rounded-2xl border border-stone-900 bg-stone-950 p-4 hover:border-amber-500/25 transition-all cursor-pointer shadow-md"
                        >
                          <div className="h-16 w-16 overflow-hidden rounded-xl bg-stone-900 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-sans text-sm font-bold text-stone-200 truncate group-hover:text-amber-400 transition-colors">{product.name}</h3>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">{product.category} • {product.description}</p>
                            <span className="font-mono text-xs font-bold text-amber-400 mt-1 block">₹{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-10">
                      <button
                        onClick={() => navigateTo('menu')}
                        className="cursor-pointer rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500 hover:text-amber-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md"
                      >
                        Browse Full Menu
                      </button>
                    </div>
                  </div>
                </section>

                {/* 6. Photo Gallery Ribbon Preview */}
                <section className="bg-stone-950 py-20 border-t border-stone-900" id="home-gallery-preview">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                      <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                        Visual Sanctuary
                      </span>
                      <h2 className="mt-2 font-sans text-3xl font-extrabold text-white">
                        Atmospheric Previews
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
                      ].map((url, i) => (
                        <div
                          key={i}
                          onClick={() => navigateTo('gallery')}
                          className="relative aspect-square overflow-hidden rounded-2xl border border-stone-900 bg-stone-900 cursor-pointer group shadow-lg"
                        >
                          <img
                            src={url}
                            alt="Shivay Cafe Preview"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-stone-950 rounded px-2 py-1">View Gallery</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 7. Testimonials Section (6 reviews) */}
                <section className="bg-stone-900/10 py-20 border-t border-stone-900" id="home-testimonials">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
                      <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                        Customer Appreciations
                      </span>
                      <h2 className="mt-2 font-sans text-3xl font-extrabold text-white md:text-4xl">
                        Critique & Testimonials
                      </h2>
                      <p className="mt-3 text-sm text-stone-400">
                        Read verified descriptions and reviews from our culinary critics, brand experts, and community members.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {TESTIMONIALS.map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-stone-900 bg-stone-950 p-6 flex flex-col justify-between hover:border-stone-850 transition-colors shadow-lg"
                        >
                          <div className="space-y-4">
                            {/* Stars row */}
                            <div className="flex items-center space-x-0.5 text-amber-500">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} className="fill-amber-500 h-3.5 w-3.5" />
                              ))}
                            </div>
                            <p className="text-xs leading-relaxed text-stone-300 italic">" {t.text} "</p>
                          </div>

                          <div className="pt-6 border-t border-stone-900 flex items-center space-x-3.5 mt-6">
                            <img
                              src={t.avatar}
                              alt={t.name}
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-full object-cover border border-stone-800 bg-stone-900"
                            />
                            <div>
                              <span className="block text-xs font-bold text-stone-200">{t.name}</span>
                              <span className="block text-[10px] text-stone-500 font-mono uppercase">{t.role}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 8. Upcoming Masterclass & Tasting Events */}
                <section className="bg-stone-950 py-20 border-t border-stone-900" id="home-events">
                  <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
                      <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                        The Publishing Circle
                      </span>
                      <h2 className="mt-2 font-sans text-3xl font-extrabold text-white md:text-4xl">
                        Artisanal Masterclasses
                      </h2>
                      <p className="mt-3 text-sm text-stone-400">
                        Join our master roasters and pastry chefs tableside to learn high-level skills. Reserved seating only.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {[
                        { title: "Single-Origin Calibration & Tasting Masterclass", date: "Saturday, July 18, 2026", time: "2:00 PM – 4:30 PM", desc: "Learn to gauge water mineral parts-per-million, identify volcanic soil acidity notes, and calibrate standard commercial pull parameters like an elite champion.", seats: "8 slots remaining", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80" },
                        { title: "Sourdough Croissant Lamination Masterclass", date: "Sunday, July 26, 2026", time: "10:00 AM – 1:30 PM", desc: "Command the 72-hour chill chambers, study butter moisture ratios, and twice-bake your own signature cardamom danishes in our clay stoves.", seats: "4 slots remaining", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80" },
                      ].map((ev, index) => (
                        <div
                          key={index}
                          className="rounded-3xl border border-stone-900 bg-stone-950 overflow-hidden flex flex-col md:flex-row shadow-xl"
                        >
                          <div className="aspect-[4/3] w-full md:w-44 bg-stone-900 shrink-0 relative">
                            <img
                              src={ev.image}
                              alt={ev.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover filter brightness-[0.8] saturate-[1.1]"
                            />
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-amber-500 font-mono uppercase tracking-wide">
                                <span>{ev.date}</span>
                                <span>•</span>
                                <span>{ev.time}</span>
                              </div>
                              <h3 className="font-sans text-base font-bold text-white leading-snug">{ev.title}</h3>
                              <p className="text-xs text-stone-400 leading-relaxed">{ev.desc}</p>
                            </div>
                            <div className="pt-4 border-t border-stone-900 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">{ev.seats}</span>
                              <button
                                onClick={() => navigateTo('reservation')}
                                className="flex items-center space-x-1.5 text-xs font-bold uppercase text-amber-500 hover:text-amber-400 cursor-pointer"
                              >
                                <span>Book Seats</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 9. Interactive Reservation CTA Panel */}
                <section className="bg-stone-900/10 py-20 border-t border-stone-900" id="home-reservation-cta">
                  <div className="mx-auto max-w-5xl px-6">
                    <div className="relative rounded-3xl overflow-hidden border border-amber-500/15 bg-gradient-to-br from-stone-950 to-stone-900 p-8 md:p-12 text-center space-y-6 shadow-2xl">
                      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
                      <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                        <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
                          Tableside Priority Booking
                        </span>
                        <h2 className="font-sans text-3xl font-extrabold text-white md:text-4xl">
                          Secure Your Preferred Seating Section
                        </h2>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          Whether holding a high-stakes business partnership discussion in our leather booths, or getting deep focused work done in our power-docked Nomad work pods. Secure your spot now with instant automatic booking triggers.
                        </p>
                      </div>
                      <div className="relative z-10 pt-4">
                        <button
                          onClick={() => navigateTo('reservation')}
                          className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4.5 text-sm font-bold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
                        >
                          Reserve Seating Spot
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ROUTE ENDPOINTS */}
            {currentPage === 'about' && <AboutSection />}
            
            {currentPage === 'menu' && (
              <MenuSection 
                setCurrentPage={setCurrentPage} 
                selectedProduct={selectedProduct} 
                setSelectedProduct={setSelectedProduct} 
                autoOpenOrdering={autoOpenOrdering}
                setAutoOpenOrdering={setAutoOpenOrdering}
              />
            )}
            
            {currentPage === 'gallery' && <GallerySection />}
            
            {currentPage === 'reservation' && <ReservationSection />}
            
            {currentPage === 'blog' && <BlogSection />}
            
            {currentPage === 'contact' && <ContactSection />}
            
            {currentPage === 'admin' && <AdminDashboard setCurrentPage={setCurrentPage} />}
            
            {currentPage === 'faq' && <FAQSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Global Footer (Quick Links, Hours, Newsletters, Terms) */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
