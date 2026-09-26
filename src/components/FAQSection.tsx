import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data';
import { ChevronDown, HelpCircle, ArrowUpRight } from 'lucide-react';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="bg-stone-950 py-16 md:py-20 text-stone-300">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            Help & Guidelines
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Find immediate answers regarding table durations, sourcing practices, vegan and allergen profiles, and custom corporate bookings.
          </p>
        </div>

        {/* FAQs list accordion */}
        <div className="space-y-4" id="faq-accordion-list">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-stone-900 bg-stone-900/10 overflow-hidden hover:border-amber-500/15 transition-all"
              >
                {/* Accordion header button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer outline-none focus:bg-stone-900/35"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-sans text-sm font-bold text-stone-100 leading-snug md:text-base">{faq.question}</span>
                  </div>
                  
                  {/* Chevron arrow icon */}
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-stone-950 border border-stone-850 text-stone-400 group-hover:text-white transition-all shrink-0 ml-4`}>
                    <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </div>
                </button>

                {/* Animated Body panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-stone-400 border-t border-stone-950/60 leading-relaxed space-y-3 bg-stone-950/20">
                        <p>{faq.answer}</p>
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-400 font-mono">{faq.category} Tag</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact fallback alert box */}
        <div className="mt-16 rounded-3xl border border-stone-900 bg-stone-900/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-sans text-base font-bold text-white">Still have queries?</h3>
            <p className="text-xs text-stone-400">Get in touch with a live representative from our Mandawari café team directly.</p>
          </div>
          <a
            href="mailto:hello@shivaycafe.com"
            className="flex items-center space-x-1 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/10"
          >
            <span>Ask Concierge</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
