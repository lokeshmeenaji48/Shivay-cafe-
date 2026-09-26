import { motion } from 'motion/react';
import { Target, Eye, Globe, Sparkles, Heart } from 'lucide-react';

export default function AboutSection() {
  const pillars = [
    {
      icon: <Target className="h-5 w-5 text-amber-500" />,
      title: "Our Mission",
      desc: "To curate a high-precision sensory coffee and culinary sanctuary that fosters authentic human connections through extreme quality, elegant design, and thoughtful hospitality."
    },
    {
      icon: <Eye className="h-5 w-5 text-amber-500" />,
      title: "Our Vision",
      desc: "To pioneer third-wave specialty coffee and wood-fired fine dining synergy globally, standardizing premium, fair-trade bean ecosystems and microfoam craftsmanship."
    },
    {
      icon: <Globe className="h-5 w-5 text-amber-500" />,
      title: "Sourcing Ethics",
      desc: "We skip brokers, trading directly with organic micro-lot producers in high-altitude volcanic ridges, paying them 40% above Fair Trade baselines to guarantee unblemished yields."
    }
  ];

  const ownerInfo = {
    name: "Rinku Saini",
    role: "Founder & Owner",
    desc: "Visionary entrepreneur behind Shivay Café. Dedicated to bringing premium coffee culture, royal shakes, artisanal wood-fired pizzas, and exceptional hospitality to Mandawari, Lalsot, Dausa, Rajasthan.",
  };


  return (
    <div className="bg-stone-950 text-stone-300">
      {/* Narrative Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 md:gap-16">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
              The Shivay Heritage
            </span>
            <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl tracking-tight">
              An Architectural Sanctuary for True Devotees of Coffee.
            </h1>
            <p className="text-sm leading-relaxed text-stone-400">
              Founded in 2021 by a small collective of artists, engineers, and specialty roasters, Shivay Cafe is a devotion to coffee and gastronomy. Our name reflects a state of auspicious balance—represented in our meticulously calibrated roasting, flour proofing, and glassmorphic spatial alignment.
            </p>
            <p className="text-sm leading-relaxed text-stone-400">
              We did not want to open just another commercial cafe. We built an intentional sanctuary where coffee extraction is modeled down to the dissolved solids and where every croissant has been twice-baked with organic cardamom.
            </p>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-1 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Heart className="h-4 w-4" />
                <span>Loved Globally</span>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-6 flex justify-center">
            <div className="relative aspect-[4/3] w-full max-w-[500px] rounded-3xl border border-stone-800 bg-stone-900/40 p-3 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&auto=format&fit=crop&q=80"
                alt="Inside Shivay Cafe modern layout"
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-[20px] object-cover filter saturate-[1.1] brightness-[0.85]"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/5 bg-stone-950/90 p-5 shadow-lg md:block max-w-[240px]">
                <span className="block text-2xl font-extrabold text-amber-500">72 hrs</span>
                <span className="block text-xs font-semibold text-white mt-0.5">Slow Proofing Cycle</span>
                <p className="text-[10px] text-stone-500 mt-1">Our sourdough pastry crust is chilled to lock in micro-layers of organic butter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-stone-900/35 border-y border-stone-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center md:mb-16">
            <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">Core Beliefs</span>
            <h2 className="mt-2 font-sans text-2xl font-extrabold text-white sm:text-3xl">Our Foundations</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-stone-400">
              We operate under a strict triad of standards, keeping our raw bean sourcing ethical, our carbon footprints minimal, and our quality uncompromising.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pillars.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-stone-800 bg-stone-950/60 p-7 hover:border-amber-500/25 transition-colors"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-sans text-base font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Leadership Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
        <div className="mb-12 text-center md:mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">Café Leadership</span>
          <h2 className="mt-2 font-sans text-3xl font-extrabold text-white md:text-4xl">Meet Our Founder & Owner</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone-400">
            Guiding Shivay Café with passion, commitment to quality, and traditional Rajasthani hospitality.
          </p>
        </div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group max-w-md w-full rounded-3xl border border-amber-500/30 bg-stone-900/60 p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl shadow-amber-950/60 text-stone-950 font-serif font-extrabold text-2xl border border-amber-400/40">
              RS
            </div>
            <h3 className="mt-5 font-sans text-xl font-extrabold text-white">{ownerInfo.name}</h3>
            <p className="text-xs text-amber-400 font-extrabold mt-1 font-mono uppercase tracking-widest">{ownerInfo.role}</p>
            <p className="text-xs text-stone-300 mt-4 leading-relaxed font-sans">{ownerInfo.desc}</p>
            <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] font-mono text-stone-400">
              📍 Mandawari, Lalsot, Dausa, Rajasthan
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

