import { useState, useEffect } from 'react';
import Head from 'next/head';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: "The cotton candy was the hit of our daughter's birthday! The team was professional and the machine was spotless. Will book again.",
  },
  {
    name: 'David K.',
    rating: 5,
    text: "Hired High Rollers for our corporate event — 200 guests, all loved the fresh cotton candy. Setup was fast and seamless.",
  },
  {
    name: 'Maria T.',
    rating: 5,
    text: "We had High Rollers at our wedding reception. Such a unique touch! The pink and blue cotton candy was beautiful.",
  },
];

const EVENT_TYPES = [
  'Birthday Party',
  'Corporate Event',
  'Wedding Reception',
  'Festival / Fair',
  'Private Party',
  'School Event',
  'Other',
];

export default function Promo() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: '',
    eventType: '',
    guestCount: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialRequests: '',
    contactPreference: '',
  });

  // Testimonials carousel
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSelect = (pref) => {
    setForm((prev) => ({ ...prev, contactPreference: pref }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jobDescription: `${form.eventType} — ${form.guestCount} guests` }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = () =>
    form.name.trim() && form.phone.trim() && form.email.trim() && form.email.includes('@');
  const isStep2Valid = () =>
    form.eventDate.trim() && form.eventType.trim() && form.guestCount.trim() && form.venue.trim();

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎱</div>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: '#14143C' }}>
            Request Received!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Thanks, {form.name.split(' ')[0]}! We&apos;ll be in touch within{' '}
            <strong>1 business hour</strong> to confirm your cotton candy event.
          </p>
          <div className="bg-gray-50 rounded-xl p-6 text-left">
            <p className="text-sm text-gray-500 mb-2">What happens next?</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>📋 We review your event details</li>
              <li>📞 We reach out — {form.contactPreference === 'text' ? 'text' : form.contactPreference === 'call' ? 'phone call' : 'email'}</li>
              <li>💰 You get a quote for your event</li>
            </ul>
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setForm({ name: '', phone: '', email: '', eventDate: '', eventType: '', guestCount: '', venue: '', address: '', city: '', state: '', zip: '', specialRequests: '', contactPreference: '' }); }}
            className="mt-6 text-sm text-pink-600 underline"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cotton Candy Events — High Rollers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div style={{ backgroundColor: '#14143C' }} className="py-4 px-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight">🎱 High Rollers</div>
              <div className="text-xs text-pink-300">Cotton Candy for Events</div>
            </div>
            <div className="text-2xl">🍭</div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                    step >= s ? 'text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                  style={step >= s ? { backgroundColor: '#14143C' } : {}}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${step > s ? '' : 'bg-gray-200'}`}
                    style={step > s ? { backgroundColor: '#14143C' } : {}}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#14143C' }}>
                Who&apos;s booking?
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 1 of 3 — Your contact info</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 867-5309"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }} />
                </div>
              </div>

              <button
                onClick={() => isStep1Valid() && setStep(2)}
                disabled={!isStep1Valid()}
                className={`mt-8 w-full py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                  isStep1Valid() ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={isStep1Valid() ? { backgroundColor: '#14143C' } : {}}
              >
                Next: Event Details →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#14143C' }}>
                Tell us about the event
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 2 of 3 — Event details</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Event Date *</label>
                    <input name="eventDate" type="date" value={form.eventDate} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Guests *</label>
                    <input name="guestCount" type="number" min="10" value={form.guestCount} onChange={handleChange} placeholder="100"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type *</label>
                  <select name="eventType" value={form.eventType} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                    style={{ color: '#1E1E1E' }}>
                    <option value="">Select event type...</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue / Location Name *</label>
                  <input name="venue" value={form.venue} onChange={handleChange} placeholder="The Park District"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 mb-2"
                    style={{ color: '#1E1E1E' }} />
                  <div className="grid grid-cols-3 gap-2">
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City"
                      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }} />
                    <input name="state" value={form.state} onChange={handleChange} placeholder="IL" maxLength={2}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }} />
                    <input name="zip" value={form.zip} onChange={handleChange} placeholder="60187" maxLength={10}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Special Requests (optional)</label>
                  <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange}
                    placeholder="Colors, setup time, accessibility needs, etc."
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    style={{ color: '#1E1E1E' }} />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600">
                  ← Back
                </button>
                <button
                  onClick={() => isStep2Valid() && setStep(3)}
                  disabled={!isStep2Valid()}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                    isStep2Valid() ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={isStep2Valid() ? { backgroundColor: '#14143C' } : {}}
                >
                  Next: Contact →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#14143C' }}>
                How should we reach you?
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 3 of 3 — Choose your preference</p>

              <div className="space-y-3">
                {[
                  { key: 'web', icon: '🌐', title: 'Email Me', desc: 'We\'ll send a quote to your email — quick & easy' },
                  { key: 'text', icon: '💬', title: 'Text Me', desc: "We'll text you within 1 business hour" },
                  { key: 'call', icon: '📞', title: 'Call Me', desc: 'Our team will call to discuss your event' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleContactSelect(opt.key)}
                    className={`w-full text-left rounded-xl p-4 border-2 transition-all duration-150 ${
                      form.contactPreference === opt.key ? 'border-pink-500 shadow-md' : 'border-gray-200 hover:border-pink-300'
                    }`}
                    style={
                      form.contactPreference === opt.key
                        ? { borderColor: '#DC5A82', backgroundColor: '#F9F5FF' }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-bold text-base" style={{ color: form.contactPreference === opt.key ? '#14143C' : '#1E1E1E' }}>
                          {opt.title}
                        </div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.contactPreference || submitting}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                    form.contactPreference && !submitting ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={form.contactPreference && !submitting ? { backgroundColor: '#22C55E' } : {}}
                >
                  {submitting ? 'Sending…' : 'Submit Request ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {step < 3 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-4">
                What event hosts say
              </p>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-gold text-xl mb-2" style={{ color: '#FFC832' }}>
                  {'★'.repeat(TESTIMONIALS[currentTestimonial].rating)}
                </div>
                <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                  &quot;{TESTIMONIALS[currentTestimonial].text}&quot;
                </p>
                <p className="font-bold text-sm" style={{ color: '#14143C' }}>
                  — {TESTIMONIALS[currentTestimonial].name}
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentTestimonial ? 'bg-pink-500 w-4' : 'bg-gray-300'}`}
                    style={idx === currentTestimonial ? { backgroundColor: '#DC5A82' } : {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-gray-400">
          <p>🎱 High Rollers Cotton Candy — Serving Wheaton &amp; surrounding areas</p>
          <p className="mt-1">highrollerscompany.com</p>
        </div>
      </div>
    </>
  );
}
