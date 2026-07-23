import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const TESTIMONIALS = [
  {
    name: 'Maria T.',
    rating: 5,
    text: "High Rollers transformed our backyard. The team was professional, on time, and the results were incredible. Highly recommend!",
  },
  {
    name: 'James K.',
    rating: 5,
    text: "Best pressure washing service I've ever used. They handled our driveway, deck, and siding all in one visit. Fair price, amazing work.",
  },
  {
    name: 'Sarah L.',
    rating: 5,
    text: "Booked online, got a quote same day, and the work was done the next week. Couldn't be easier. Our house looks brand new.",
  },
];

export default function Intake() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    jobDescription: '',
    contactPreference: '',
  });

  // Photos
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

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

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    const validFiles = files.filter((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext);
    });
    setPhotos((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleContactSelect = (pref) => {
    setForm((prev) => ({ ...prev, contactPreference: pref }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip.trim() &&
    form.jobDescription.trim();

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-extrabold text-navy mb-4" style={{ color: '#14143C' }}>
            Request Received!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Thanks, {form.name.split(' ')[0]}! We've got your request and will be in touch within{' '}
            <strong>1 business hour</strong>.
          </p>
          <div className="bg-gray-50 rounded-xl p-6 text-left">
            <p className="text-sm text-gray-500 mb-2">What happens next?</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>📋 We review your request</li>
              <li>📞 We reach out your way — {form.contactPreference === 'text' ? 'text' : form.contactPreference === 'call' ? 'phone call' : 'email'} </li>
              <li>💰 You get a detailed estimate</li>
            </ul>
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setForm({ name: '', phone: '', email: '', address: '', city: '', state: '', zip: '', jobDescription: '', contactPreference: '' }); setPhotos([]); setPhotoPreviews([]); }}
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
        <title>Painting Services — High Rollers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-navy text-white py-4 px-4" style={{ backgroundColor: '#14143C' }}>
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight">🎱 High Rollers</div>
              <div className="text-xs text-gray-300">Professional Services</div>
            </div>
            <div className="text-2xl">✨</div>
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
                    className={`flex-1 h-1 mx-2 rounded ${
                      step > s ? '' : 'bg-gray-200'
                    }`}
                    style={step > s ? { backgroundColor: '#14143C' } : {}}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>
                Who are you?
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 1 of 3 — Your contact info</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cell Phone *</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 867-5309"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>
              </div>

              <button
                onClick={() => isStep1Valid() && setStep(2)}
                disabled={!isStep1Valid()}
                className={`mt-8 w-full py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                  isStep1Valid()
                    ? 'text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={isStep1Valid() ? { backgroundColor: '#14143C' } : {}}
              >
                Next: Job Details →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>
                Where's the job?
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 2 of 3 — Address &amp; description</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Wheaton"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="IL"
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                      style={{ color: '#1E1E1E' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP *</label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="60187"
                    maxLength={10}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Job Description *
                  </label>
                  <textarea
                    name="jobDescription"
                    value={form.jobDescription}
                    onChange={handleChange}
                    placeholder="Tell us about the work you need done — be as specific as you like"
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    style={{ color: '#1E1E1E' }}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Photos (optional)
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-500 text-sm hover:border-pink-400 transition-colors"
                  >
                    📷 Add up to 5 photos — tap to upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/webp"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photoPreviews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {photoPreviews.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`Photo ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{photos.length}/5 photos — JPG, PNG, HEIC, WebP • 10MB max each</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600"
                >
                  ← Back
                </button>
                <button
                  onClick={() => isStep2Valid() && setStep(3)}
                  disabled={!isStep2Valid()}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                    isStep2Valid()
                      ? 'text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>
                How should we reach you?
              </h2>
              <p className="text-gray-500 text-sm mb-6">Step 3 of 3 — Choose your preference</p>

              <div className="space-y-3">
                {[
                  { key: 'web', icon: '🌐', title: 'Submit Online', desc: 'Get a quote link sent to your email — quick & easy' },
                  { key: 'text', icon: '💬', title: 'Text Me', desc: "We'll text you within 1 business hour" },
                  { key: 'call', icon: '📞', title: 'Call Me', desc: 'Our team will call to discuss your project' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleContactSelect(opt.key)}
                    className={`w-full text-left rounded-xl p-4 border-2 transition-all duration-150 ${
                      form.contactPreference === opt.key
                        ? 'border-pink-500 shadow-md'
                        : 'border-gray-200 hover:border-pink-300'
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
                        <div
                          className="font-bold text-base"
                          style={{ color: form.contactPreference === opt.key ? '#14143C' : '#1E1E1E' }}
                        >
                          {opt.title}
                        </div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.contactPreference || submitting}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${
                    form.contactPreference && !submitting
                      ? 'text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                What customers say
              </p>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-gold text-xl mb-2" style={{ color: '#FFC832' }}>
                  {'★'.repeat(TESTIMONIALS[currentTestimonial].rating)}
                </div>
                <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                  "{TESTIMONIALS[currentTestimonial].text}"
                </p>
                <p className="text-navy font-bold text-sm" style={{ color: '#14143C' }}>
                  — {TESTIMONIALS[currentTestimonial].name}
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentTestimonial ? 'bg-pink-500 w-4' : 'bg-gray-300'
                    }`}
                    style={idx === currentTestimonial ? { backgroundColor: '#DC5A82' } : {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-gray-400">
          <p>🎱 High Rollers — Serving Wheaton &amp; surrounding areas</p>
          <p className="mt-1">highrollerscompany.com</p>
        </div>
      </div>
    </>
  );
}
