import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reservation } from '../types';
import {
  getStoredReservations,
  fetchReservationsFromServer,
  createReservationOnServer,
  deleteReservationOnServer,
  setupSupabaseReservationRealtime,
} from '../lib/reservationStore';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Trash2,
  ShieldAlert,
  Sparkles,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ReservationSection() {
  const [reservations, setReservations] = useState<Reservation[]>(() => getStoredReservations());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState('18:00');
  const [guests, setGuests] = useState(2);
  const [tableType, setTableType] = useState('Standard Seating');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [latestBooking, setLatestBooking] = useState<Reservation | null>(null);

  // Load reservations from Supabase and subscribe to Realtime
  useEffect(() => {
    fetchReservationsFromServer().then(setReservations);

    setupSupabaseReservationRealtime(() => {
      fetchReservationsFromServer().then(setReservations);
    });

    const handleUpdate = () => {
      setReservations(getStoredReservations());
    };
    window.addEventListener('shivay_reservations_updated', handleUpdate);
    return () => {
      window.removeEventListener('shivay_reservations_updated', handleUpdate);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const booking = await createReservationOnServer({
        name: name.trim(),
        phone: cleanPhone,
        date,
        time,
        guests,
        tableType,
        specialRequests: specialRequests.trim() || undefined,
      });

      setLatestBooking(booking);
      setSubmitted(true);
      fetchReservationsFromServer().then(setReservations);

      // Reset form fields
      setName('');
      setPhone('');
      setSpecialRequests('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit reservation to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Cancel this table reservation?')) {
      await deleteReservationOnServer(id);
      fetchReservationsFromServer().then(setReservations);
    }
  };

  return (
    <section className="bg-stone-950 py-16 md:py-24 text-stone-300 min-h-screen" id="reservation-section">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-amber-500 uppercase">
            Exclusive Seating
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-white md:text-5xl mt-2">
            Reserve A Table
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            Secure your preferred leather booths, private work pods, or garden glass lounge at Shivay Café. Automatic instant booking confirmation stored in Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Booking Form Column */}
          <div className="lg:col-span-7 bg-stone-900/40 border border-stone-850 p-6 md:p-8 rounded-3xl backdrop-blur-sm shadow-xl">
            <h2 className="font-sans text-xl font-bold text-white mb-2">Book Your Table</h2>
            <p className="text-xs text-stone-400 mb-6">
              Reservations are instantly saved in our Supabase production system.
            </p>

            {submitError && (
              <div className="mb-6 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Meena"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Time Slot *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Preferred Seating Zone
                </label>
                <select
                  value={tableType}
                  onChange={(e) => setTableType(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Standard Seating">Standard Cozy Dining (Tables 1-8)</option>
                  <option value="Leather Booth">Plush Leather Booth (Intimate Dining)</option>
                  <option value="Glass Lounge">Garden Glass Lounge (Natural Light)</option>
                  <option value="Nomad Work Pod">Power-Docked Nomad Work Pod (Quiet)</option>
                  <option value="Outdoor Terrace">Outdoor Rooftop & Terrace</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Special Occasion or Request (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Birthday celebration, anniversary cake, extra baby high-chair..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-amber-600/50 text-stone-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-xl cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Booking in Supabase...</span>
                  </>
                ) : (
                  <span>Confirm Table Reservation</span>
                )}
              </button>
            </form>

            {/* Success Prompt Modal Inline */}
            <AnimatePresence>
              {submitted && latestBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-emerald-400 relative"
                >
                  <button
                    onClick={() => setSubmitted(false)}
                    className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    ✕
                  </button>
                  <div className="flex items-start space-x-3.5">
                    <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <h4 className="font-bold text-white">Booking Confirmed In Supabase!</h4>
                      <p className="text-stone-300 leading-relaxed">
                        Excellent, <span className="font-semibold text-white">{latestBooking.name}</span>. Your {latestBooking.guests}-guest table in <span className="font-semibold text-white">{latestBooking.tableType}</span> has been registered for <span className="font-semibold text-white">{latestBooking.date}</span> at <span className="font-semibold text-white">{latestBooking.time}</span>.
                      </p>
                      <span className="block text-xs font-mono text-emerald-400 mt-2 font-semibold">
                        Confirmation Reference: {latestBooking.id}
                      </span>

                      <div className="pt-3 mt-2 border-t border-emerald-500/20">
                        <a
                          href={`https://api.whatsapp.com/send?phone=916367970232&text=${encodeURIComponent(
                            `*नई टेबल बुकिंग - SHIVAY CAFÉ & RESTAURANT* 🪑✨\n----------------------------------------\n*बुकिंग आईडी (Booking ID):* ${latestBooking.id}\n*नाम (Name):* ${latestBooking.name}\n*मोबाइल (Phone):* ${latestBooking.phone}\n*दिनांक (Date):* ${latestBooking.date}\n*समय (Time):* ${latestBooking.time}\n*सदस्य (Guests):* ${latestBooking.guests} लोग\n*सीटिंग प्रकार (Table Type):* ${latestBooking.tableType}\n*विशेष अनुरोध:* ${latestBooking.specialRequests || 'कोई नहीं'}\n----------------------------------------\nकृपया टेबल बुकिंग की पुष्टि करें!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md mt-1"
                        >
                          <span>💬 व्हाट्सएप पर टेबल बुकिंग भेजें (+91 6367970232)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bookings Tracker Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Standards panel */}
            <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-6 space-y-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <h3 className="font-sans text-base font-bold text-white">The Seating Standards</h3>
              <p className="text-xs leading-relaxed text-stone-400">
                All table slots are block-reserved for 1.5 hours. For nomads in our work pods, slots are active for 3 hours with complimentary high-speed gigabit Wi-Fi.
              </p>
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-amber-500" />
                  <span>Cafe Reception: +91 98290 12345</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-amber-500" />
                  <span>Support: rinkusaini7862@gmail.com</span>
                </div>
              </div>
            </div>

            {/* My Active Bookings list */}
            <div className="rounded-3xl border border-stone-850 bg-stone-900/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-base font-bold text-white">My Active Bookings</h3>
                <span className="text-xs font-mono text-stone-500 bg-stone-900 px-2.5 py-0.5 rounded-full">
                  {reservations.length} in DB
                </span>
              </div>

              {reservations.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-stone-800 rounded-2xl">
                  <ShieldAlert className="mx-auto h-8 w-8 text-stone-600 mb-2" />
                  <span className="block text-xs text-stone-500 font-semibold uppercase">
                    No active reservations
                  </span>
                  <p className="text-[11px] text-stone-600 mt-1 px-4">
                    Submit the form to make your table reservation in Supabase.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-2xl border border-stone-800 bg-stone-950 p-4 relative flex flex-col justify-between hover:border-stone-700 transition-colors"
                    >
                      <button
                        onClick={() => handleDeleteReservation(res.id)}
                        className="absolute top-4 right-4 text-stone-600 hover:text-red-500 transition-colors cursor-pointer"
                        title="Cancel Reservation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                            {res.tableType}
                          </span>
                          <span className="rounded bg-stone-900 px-2 py-0.5 text-[9px] font-mono text-stone-500">
                            {res.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{res.name}</h4>
                        <div className="space-y-1 text-[11px] text-stone-400 mt-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            <span>Date: {res.date}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Time: {res.time}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Users className="h-3.5 w-3.5 text-amber-500" />
                            <span>Guests: {res.guests} people</span>
                          </div>
                        </div>
                        {res.specialRequests && (
                          <p className="text-[11px] text-amber-500/70 italic mt-2 line-clamp-1">
                            "{res.specialRequests}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
