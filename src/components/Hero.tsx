import { motion } from 'motion/react';
import { Coffee, ShieldCheck, Award, Flame, ChevronRight } from 'lucide-react';

interface HeroProps {
  setCurrentPage: (page: string) => void;
}

export default function Hero({ setCurrentPage }: HeroProps) {
  const highlights = [
    {
      icon: <Award className="h-5 w-5 text-amber-400" />,
      title: "100% Organic Micro-Lots",
      desc: "Direct-trade beans sourced at high-altitudes, roasted weekly in-house."
    },
    {
      icon: <Flame className="h-5 w-5 text-amber-400" />,
      title: "Wood-Fired Gastronomy",
      desc: "Artisanal pizzas and baked delicacies prepped in our custom clay oven."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-amber-400" />,
      title: "Seamless Reservations",
      desc: "Select specific work pods or dining corners directly online."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-stone-950 pb-20 pt-16 md:pb-28 md:pt-24 lg:pt-28">
      {/* Background radial gradient decoration for high-end look */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px] lg:h-[700px] lg:w-[700px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 md:gap-16">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono"
            >
              <Coffee className="h-3.5 w-3.5 animate-pulse" />
              <span>Sourcing Gold • Baking Truth • Brewing Soul</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:leading-[1.1]"
            >
              Where Masterful <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Coffee Craft</span> Meets Gastronomy.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-stone-300 lg:mx-0 sm:text-lg"
            >
              Welcome to Shivay Cafe. Inspired by clean premium design and traditional Indian warmth, we craft award-winning cold coffees, delicious fast food, and artisan pizzas right here in Mandawari, Lalsot, Dausa, Rajasthan.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <button
                onClick={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center space-x-1 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6.5 py-4 text-sm font-bold uppercase tracking-wider text-stone-950 shadow-lg shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all hover:shadow-amber-500/20 active:scale-[0.98]"
              >
                <span>Explore the Menu</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('reservation');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer rounded-xl border border-stone-700 bg-stone-900/40 px-6.5 py-4 text-sm font-bold uppercase tracking-wider text-white hover:border-amber-500 hover:bg-stone-900 transition-all active:scale-[0.98]"
              >
                Reserve a Table
              </button>
            </motion.div>

            {/* Micro details panel in Hero */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="pt-4 grid grid-cols-3 gap-4 border-t border-stone-900 text-center lg:text-left"
            >
              <div>
                <span className="block text-2xl font-extrabold text-white sm:text-3xl">4.9★</span>
                <span className="text-stone-500 text-xs tracking-wider uppercase font-mono">1,500+ Reviews</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-white sm:text-3xl">100%</span>
                <span className="text-stone-500 text-xs tracking-wider uppercase font-mono">Organic Grade</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-white sm:text-3xl">27</span>
                <span className="text-stone-500 text-xs tracking-wider uppercase font-mono">Flaky Layers</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Interactive Display Image */}
          <div className="relative lg:col-span-5 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative aspect-square w-full max-w-[420px] rounded-3xl border border-stone-800 bg-stone-900/40 p-3.5 shadow-2xl"
            >
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent blur-xl"></div>
              
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
                alt="Luxury Espresso Pouring at Shivay Cafe"
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-[20px] object-cover filter brightness-[0.9] saturate-[1.15]"
              />

              {/* Glassmorphic overlay widget on Hero */}
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-stone-950/80 p-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center space-x-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-amber-400 font-mono tracking-widest uppercase">Signature Drink</span>
                    <span className="block text-sm font-bold text-white">Classic Jaipur Cold Coffee</span>
                    <span className="block text-[11px] text-stone-400 mt-0.5">Whipped cold espresso blended with thick milk & premium vanilla ice cream.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Highlight Panels Row */}
        <div className="mt-20 border-t border-stone-900 pt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-stone-900 bg-stone-950/40 p-6 hover:border-amber-500/30 hover:bg-stone-900/10 transition-all group"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-all">
                {item.icon}
              </div>
              <h3 className="mb-2 font-sans text-base font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-stone-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
