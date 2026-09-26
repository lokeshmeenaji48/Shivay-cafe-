import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitFeedbackOnServer } from '../lib/feedbackStore';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setSubmitError('Please enter your message or review');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitFeedbackOnServer({
        rating,
        message: message.trim(),
        customerName: name.trim() || undefined,
      });

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit feedback to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: <MapPin className="h-5 w-5 text-amber-500" />,
      title: 'Our Location',
      details: ['Main Road, Mandawari, Lalsot', 'Dausa District, Rajasthan 303504'],
      action: 'Get Directions',
      href: 'https://maps.google.com/?q=Mandawari+Lalsot+Rajasthan',
    },
    {
      icon: <Phone className="h-5 w-5 text-amber-500" />,
      title: 'Direct Phone',
      details: ['Mobile: +91 98290 12345', 'Kitchen Orders: +91 63679 70232'],
      action: 'Call Now',
      href: 'tel:+919829012345',
    },
    {
      icon: <Mail className="h-5 w-5 text-amber-500" />,
      title: 'Email & Inquiries',
      details: ['rinkusaini7862@gmail.com', 'vip@shivaycafe.com'],
      action: 'Send Email',
      href: 'mailto:rinkusaini7862@gmail.com',
    },
    {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      title: 'Opening Hours',
      details: ['Mon – Fri: 07:00 AM – 10:00 PM', 'Sat – Sun: 07:00 AM – 10:00 PM'],
      action: 'Daily Open',
      href: '#',
    },
  ];

  return (
    <section className="bg-stone-950 py-16 md:py-24 text-stone-300 min-h-screen" id="contact-section">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            Hospitality & Feedback
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            Get In Touch & Review Us
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Have questions or want to leave feedback? Your reviews are stored directly in Supabase and displayed on the Owner console.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {contactCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-stone-900/40 border border-stone-850 p-6 rounded-3xl backdrop-blur-sm flex flex-col justify-between hover:border-amber-500/20 transition-colors"
            >
              <div>
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-sans text-base font-bold text-white mb-2">{card.title}</h3>
                <div className="space-y-1 text-xs text-stone-400">
                  {card.details.map((d, i) => (
                    <p key={i}>{d}</p>
                  ))}
                </div>
              </div>
              <a
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="mt-4 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
              >
                {card.action} →
              </a>
            </div>
          ))}
        </div>

        {/* Form and Map Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-stretch">
          {/* Feedback Form */}
          <div className="lg:col-span-6 bg-stone-900/40 border border-stone-850 p-6 md:p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between">
            <div className="space-y-2 mb-6">
              <h3 className="font-sans text-lg font-bold text-white flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                <span>Leave Review or Message</span>
              </h3>
              <p className="text-xs text-stone-400">
                Directly saved to the Supabase production database.
              </p>
            </div>

            {submitError && (
              <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 py-3 px-4 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Phone / Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Phone number or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 py-3 px-4 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-400 ml-2 font-bold">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Feedback / Review Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the coffee, wood-fired pizza, burgers, or service..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 py-3 px-4 text-xs text-white focus:border-amber-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Review to Supabase</span>
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 flex items-center space-x-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 font-medium"
                >
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>Review recorded successfully in database! Thank you.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location & Map Block */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="relative aspect-[4/3] w-full rounded-3xl border border-stone-900 bg-stone-950 overflow-hidden flex-1 flex flex-col items-center justify-center p-6 text-center shadow-lg group">
              <div className="absolute inset-0 bg-[radial-gradient(#38332c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-ping"></div>
                <div className="absolute h-20 w-20 rounded-full border border-amber-500/20"></div>
                <div className="absolute h-10 w-10 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
              </div>

              <div className="relative z-10 mt-4 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">
                  Shivay Café & Restaurant
                </span>
                <h4 className="font-sans text-xl font-bold text-white">Mandawari, Lalsot</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Owner Rinku Saini welcomes you to Mandawari, Lalsot, Dausa, Rajasthan. Premium cold coffees, wood-fired pizzas, and fresh burgers.
                </p>
              </div>

              <div className="relative z-10 mt-6 w-full border-t border-stone-900 pt-4 grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <span className="block text-[10px] text-stone-500 uppercase font-mono tracking-widest">
                    Weekdays
                  </span>
                  <span className="block text-xs font-bold text-stone-300">
                    Mon – Fri: 07:00 AM – 10:00 PM
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] text-stone-500 uppercase font-mono tracking-widest">
                    Weekends
                  </span>
                  <span className="block text-xs font-bold text-stone-300">
                    Sat – Sun: 07:00 AM – 10:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-stone-900/15 border border-stone-900 p-5 flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold text-stone-300">Connect with Owner Rinku Saini</span>
              <div className="flex space-x-4">
                <a
                  href="https://api.whatsapp.com/send?phone=916367970232"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors font-semibold"
                >
                  WhatsApp
                </a>
                <a
                  href="tel:+919829012345"
                  className="hover:text-amber-500 transition-colors font-semibold"
                >
                  Phone
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
