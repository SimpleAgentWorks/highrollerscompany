import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const TESTIMONIALS = [
  { name: 'Mike R.', rating: 5, text: "My car looked better than when I bought it. Incredible mobile detailers — they came to my office and finished in 2 hours." },
  { name: 'Jennifer L.', rating: 5, text: "Booked online, they showed up on time, and my SUV looked brand new. Best $200 I've spent this year." },
  { name: 'David K.', rating: 5, text: "Called on a Tuesday, got an appointment Thursday. The interior smelled like a new car. Highly recommend." },
];

const PACKAGES = [
  { id: 'interior', label: 'Interior Only', desc: 'Full vacuum, dashboard, seats, windows', base: '$150–$250' },
  { id: 'exterior', label: 'Exterior Wash', desc: 'Hand wash, dry, wheels & tires', base: '$50–$100' },
  { id: 'full', label: 'Full Detail', desc: 'Interior + Exterior + Wax', base: '$250–$350' },
];

export default function AutoDetailBook() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    package: '',
    vehicleInfo: '',
    electrical: '',
    water: '',
    contactPreference: '',
  });

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

  const resetForm = () => {
    setForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      package: '',
      vehicleInfo: '',
      electrical: '',
      water: '',
      contactPreference: '',
    });
    setStep(1);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          jobDescription: `[Auto Detail - ${form.package}] ${form.vehicleInfo}`,
          contactPreference: form.contactPreference,
          source: 'auto-detail',
        }),
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
    form.package.trim() && form.vehicleInfo.trim();

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080808' }}>
        <div className="max-w-md w-full text-center px-4">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: '#f5f5f5' }}>
            Request Received!
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Thanks, {form.name.split(' ')[0]}! We&apos;ll be in touch within 1 business hour to confirm your detail appointment.
          </p>
          <p style={{ color: '#d4af37' }} className="text-sm mb-8">📍 We come to you — home, office, anywhere.</p>
          <button
            onClick={resetForm}
            className="py-3 px-8 rounded-xl text-base font-bold"
            style={{ backgroundColor: '#d4af37', color: '#080808', cursor: 'pointer', border: 'none' }}
          >
            Book Another Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Book Auto Detail — Auto Detail Delivered</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#080808', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          backgroundColor: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
          padding: '0.875rem 2rem',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/auto-detail-delivered" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚗</div>
              <div>
                <div className="font-extrabold text-lg tracking-tight" style={{ color: '#f5f5f5' }}>Auto Detail Delivered</div>
                <div className="text-xs" style={{ color: '#d4af37' }}>Mobile Auto Detailing — We Come To You</div>
              </div>
            </Link>
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link href="/auto-detail-delivered" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Home</Link>
              <Link href="/auto-detail-delivered/about" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>About</Link>
              <Link href="/auto-detail-delivered/contact" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Contact</Link>
            </nav>
          </div>
        </header>

        <div style={{ paddingTop: '6rem' }} className="max-w-lg mx-auto px-4 py-8">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className="flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                  style={{
                    width: 32, height: 32,
                    backgroundColor: step >= s ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    color: step >= s ? '#080808' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className="flex-1 h-px mx-2" style={{ backgroundColor: step > s ? '#d4af37' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1 — Contact */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#f5f5f5' }}>Who are you?</h2>
              <p className="text-gray-500 text-sm mb-6">Step 1 of 3</p>
              <div className="space-y-4">
                {[
                  { name: 'name', label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
                  { name: 'phone', label: 'Phone', placeholder: '(555) 867-5309', type: 'tel' },
                  { name: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email' },
                ].map(({ name, label, placeholder, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-semibold mb-1" style={{ color: '#a0a0a0' }}>{label}</label>
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full rounded-xl px-4 py-3 text-base border"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#f5f5f5',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#a0a0a0' }}>Address (where we'll detail)</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St"
                    className="w-full rounded-xl px-4 py-3 text-base border mb-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#f5f5f5', outline: 'none' }} />
                  <div className="grid grid-cols-3 gap-2">
                    {['city', 'state', 'zip'].map(f => (
                      <input key={f} name={f} value={form[f]} onChange={handleChange} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                        maxLength={f === 'state' ? 2 : f === 'zip' ? 10 : 50}
                        className="rounded-xl px-3 py-2 text-sm border"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#f5f5f5', outline: 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => isStep1Valid() && setStep(2)}
                disabled={!isStep1Valid()}
                className="mt-8 w-full py-4 rounded-xl text-base font-bold"
                style={{
                  backgroundColor: isStep1Valid() ? '#d4af37' : 'rgba(255,255,255,0.1)',
                  color: isStep1Valid() ? '#080808' : 'rgba(255,255,255,0.3)',
                  cursor: isStep1Valid() ? 'pointer' : 'not-allowed',
                }}
              >
                Next: Service Details →
              </button>
            </div>
          )}

          {/* STEP 2 — Service */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#f5f5f5' }}>Choose your service</h2>
              <p className="text-gray-500 text-sm mb-6">Step 2 of 3</p>
              <div className="space-y-3">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setForm(prev => ({ ...prev, package: pkg.id }))}
                    className="w-full text-left rounded-xl p-4 border-2 transition-all"
                    style={{
                      borderColor: form.package === pkg.id ? '#d4af37' : 'rgba(255,255,255,0.1)',
                      backgroundColor: form.package === pkg.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold" style={{ color: form.package === pkg.id ? '#d4af37' : '#f5f5f5' }}>{pkg.label}</div>
                        <div className="text-sm text-gray-500">{pkg.desc}</div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: '#d4af37' }}>{pkg.base}</div>
                    </div>
                  </button>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-1 mt-4" style={{ color: '#a0a0a0' }}>Vehicle Info</label>
                  <textarea
                    name="vehicleInfo"
                    value={form.vehicleInfo}
                    onChange={handleChange}
                    placeholder="Year, Make, Model, Color (e.g., 2020 Toyota Camry, Silver)"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-base border resize-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#f5f5f5', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#a0a0a0' }}>Do you have electrical outlet &amp; water hookup?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{v:'yes',l:'Yes'},{v:'no',l:'No'},{v:'hr_brings',l:'I\'ll provide'}].map(o => (
                      <button key={o.v} onClick={() => setForm(prev => ({...prev, electrical: o.v}))}
                        className="py-2 rounded-lg text-sm font-bold border-2"
                        style={{
                          borderColor: form.electrical === o.v ? '#d4af37' : 'rgba(255,255,255,0.1)',
                          color: form.electrical === o.v ? '#d4af37' : '#888',
                          backgroundColor: form.electrical === o.v ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#888', backgroundColor: 'transparent', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={() => isStep2Valid() && setStep(3)}
                  disabled={!isStep2Valid()}
                  className="flex-1 py-4 rounded-xl text-base font-bold"
                  style={{
                    backgroundColor: isStep2Valid() ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    color: isStep2Valid() ? '#080808' : 'rgba(255,255,255,0.3)',
                    cursor: isStep2Valid() ? 'pointer' : 'not-allowed',
                    border: 'none',
                  }}>
                  Next: Contact →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Contact Preference */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#f5f5f5' }}>How should we reach you?</h2>
              <p className="text-gray-500 text-sm mb-6">Step 3 of 3</p>
              <div className="space-y-3">
                {[
                  { key: 'web', icon: '🌐', title: 'Email Me', desc: 'We\'ll send a quote to your email — quick & easy' },
                  { key: 'text', icon: '💬', title: 'Text Me', desc: "We'll text you within 1 business hour" },
                  { key: 'call', icon: '📞', title: 'Call Me', desc: 'Our team will call to confirm your appointment' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleContactSelect(opt.key)}
                    className="w-full text-left rounded-xl p-4 border-2 transition-all"
                    style={{
                      borderColor: form.contactPreference === opt.key ? '#d4af37' : 'rgba(255,255,255,0.1)',
                      backgroundColor: form.contactPreference === opt.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-bold" style={{ color: form.contactPreference === opt.key ? '#d4af37' : '#f5f5f5' }}>{opt.title}</div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#888', backgroundColor: 'transparent', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.contactPreference || submitting}
                  className="flex-1 py-4 rounded-xl text-base font-bold"
                  style={{
                    backgroundColor: form.contactPreference && !submitting ? '#22C55E' : 'rgba(255,255,255,0.1)',
                    color: form.contactPreference && !submitting ? '#fff' : 'rgba(255,255,255,0.3)',
                    cursor: form.contactPreference && !submitting ? 'pointer' : 'not-allowed',
                    border: 'none',
                  }}>
                  {submitting ? 'Sending…' : 'Submit Request ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {step < 3 && (
            <div className="mt-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-center text-xs mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>What customers say</p>
              <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-sm mb-2" style={{ color: '#d4af37' }}>{'★'.repeat(5)}</div>
                <p className="text-gray-400 italic text-sm mb-3 leading-relaxed">"{TESTIMONIALS[currentTestimonial].text}"</p>
                <p className="font-bold text-sm" style={{ color: '#f5f5f5' }}>— {TESTIMONIALS[currentTestimonial].name}</p>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: idx === currentTestimonial ? 20 : 8,
                      backgroundColor: idx === currentTestimonial ? '#d4af37' : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <p>🚗 Auto Detail Delivered — Serving the greater Wheaton area</p>
        </div>
      </div>
    </>
  );
}