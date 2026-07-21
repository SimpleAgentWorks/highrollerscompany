import Head from 'next/head'
import { useState } from 'react'

// Deterministic photo layout — scattered/overlapping like reference image
// Using fixed math so it renders same on server and client (no Math.random)
const PHOTOS = Array.from({length: 20}, (_, i) => i + 1)

// Deterministic pseudo-random values based on index
function det(i, offset) {
  return ((i * 2654435761 + offset * 40503) >>> 0) / 4294967296
}

function makePhotoStyle(i) {
  const left = det(i, 1) * 90   // 0–90% across
  const top = det(i, 2) * 500   // spread over 500vh worth of height
  const rot = (det(i, 3) * 28) - 14   // -14 to +14 deg
  const w = 140 + det(i, 4) * 110     // 140–250px
  const zIdx = Math.floor(det(i, 5) * 10)
  return { left, top, rot, w, zIdx }
}

// Build full set: 2 repeating batches for seamless scroll loop
const ALL_PHOTOS = [
  ...PHOTOS.map(i => ({ i, batch: 0, style: makePhotoStyle(i) })),
  ...PHOTOS.map(i => ({ i, batch: 1, style: { ...makePhotoStyle(i), top: makePhotoStyle(i).top + 500 } })),
]

export default function Home() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', eventDate: '',
    guestCount: '', location: '', service: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', phone: '', email: '', eventDate: '', guestCount: '', location: '', service: '', notes: '' })
      }, 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>High Rollers Company - Premium Event Services</title>
        <meta name="description" content="Cotton Candy, Trivia, & DJ Entertainment for Your Event" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ===================== COLLAGE BACKGROUND =====================
          Absolutely-positioned photos scattered like on a table,
          scrolling slowly upward via CSS animation.
          The container is fixed (stays behind everything) and very tall
          so photos appear across the full page.
      ================================================================ */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#080808',
      }}>
        {/* Dark overlay so text stays readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* The scrolling canvas — 1000vh tall, animates upward */}
        <div className="collage-canvas">
          {ALL_PHOTOS.map(({ i, batch, style }) => (
            <div
              key={`${batch}-${i}`}
              className="photo-card"
              style={{
                left: `${style.left}%`,
                top: `${style.top}vh`,
                width: `${style.w}px`,
                transform: `rotate(${style.rot}deg)`,
                zIndex: style.zIdx,
              }}
            >
              <img
                src={`/images/photo-${String(i).padStart(3,'0')}.jpg`}
                alt="High Rollers event"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===================== PAGE CONTENT ===================== */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="text-center px-6 md:px-12 max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-black mb-6 carnival-text-gradient">
              Unforgettable Events.<br />Zero Stress.
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Premium Cotton Candy, Live Trivia, &amp; DJ Entertainment.<br />
              We design and execute events that stick with your guests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#booking" className="cta-primary">Book Your Event</a>
              <a href="#services" className="cta-secondary">See What We Do</a>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="section-padding content-section text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-5xl font-black carnival-text-gradient mb-4">⭐ 4.9 stars | 119+ Reviews</p>
            <p className="text-xl text-gray-300 mb-8">
              "They made our event amazing!" &nbsp;·&nbsp; "Best cotton candy experience ever." &nbsp;·&nbsp; "Professional, fun, and worth every penny."
            </p>
            <p className="text-lg text-gray-400">Started in 2020 by a 12-year-old girl. Now Wheaton's go-to for unforgettable events.</p>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section-padding content-section">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-4 carnival-text-gradient">What We Offer</h2>
            <p className="text-center text-gray-300 text-lg mb-12">Three event experiences. Mix and match. Make it yours.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="service-card p-8 rounded-xl">
                <div className="text-5xl mb-4">🍭</div>
                <h3 className="text-2xl font-bold mb-4 text-carnival-pink">Cotton Candy Package</h3>
                <p className="text-4xl font-black carnival-text-gradient mb-6">$750</p>
                <ul className="space-y-3 text-gray-300">
                  <li>✓ Onsite staff (2 hours)</li>
                  <li>✓ Up to 100 fresh cotton candies</li>
                  <li>✓ Full setup &amp; cleanup</li>
                  <li>✓ Your choice of flavors &amp; colors</li>
                  <li>✓ Zelle deposit holds your date</li>
                </ul>
              </div>
              <div className="service-card p-8 rounded-xl">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4 text-carnival-cyan">Onsite Trivia Night</h3>
                <p className="text-4xl font-black carnival-text-gradient mb-6">$250</p>
                <ul className="space-y-3 text-gray-300">
                  <li>✓ Live-hosted quiz competition</li>
                  <li>✓ Custom rounds &amp; scoring</li>
                  <li>✓ 2–3 hours of entertainment</li>
                  <li>✓ Team scoreboard included</li>
                  <li>✓ No contract required</li>
                </ul>
              </div>
              <div className="service-card p-8 rounded-xl">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold mb-4 text-carnival-yellow">DJ Services</h3>
                <p className="text-4xl font-black carnival-text-gradient mb-6">$150/hr</p>
                <ul className="space-y-3 text-gray-300">
                  <li>✓ Live mixing &amp; curated playlists</li>
                  <li>✓ Karaoke capability</li>
                  <li>✓ Full sound equipment</li>
                  <li>✓ Professional hosting</li>
                  <li>✓ Add to any package</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-300">💡 <strong>Pro Tip:</strong> Mix and match. Cotton Candy + Trivia + DJ = epic event.</p>
            </div>
          </div>
        </section>

        {/* WHO BOOKS US */}
        <section className="section-padding content-section">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-12 carnival-text-gradient">Who Books Us?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-l-4 border-carnival-pink pl-6">
                <h3 className="text-2xl font-bold mb-2">Kids&apos; Birthday Parties</h3>
                <p className="text-gray-300">Cotton candy + DJ + your backyard = instant legend status.</p>
              </div>
              <div className="border-l-4 border-carnival-cyan pl-6">
                <h3 className="text-2xl font-bold mb-2">Corporate Team Events</h3>
                <p className="text-gray-300">Trivia night, cotton candy, DJ. Break the ice and build culture.</p>
              </div>
              <div className="border-l-4 border-carnival-yellow pl-6">
                <h3 className="text-2xl font-bold mb-2">Weddings &amp; Receptions</h3>
                <p className="text-gray-300">Dessert stations are cool. Cotton candy stations are memorable.</p>
              </div>
              <div className="border-l-4 border-carnival-purple pl-6">
                <h3 className="text-2xl font-bold mb-2">Festivals &amp; Community Events</h3>
                <p className="text-gray-300">We have mobile experience and a proven track record.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BOOKING FORM */}
        <section id="booking" className="section-padding content-section">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-4 carnival-text-gradient">Book Your Event</h2>
            <p className="text-center text-gray-300 text-lg mb-12">Fill out the form below. We&apos;ll text you to confirm.</p>

            {submitted && (
              <div className="bg-green-900 border border-green-500 text-green-200 p-4 rounded-lg mb-6 text-center font-bold">
                ✓ Got it! We&apos;ll text you shortly at {formData.phone}.
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required className="form-input" />
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="form-input" />
              </div>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="form-input w-full" />
              <div className="grid md:grid-cols-2 gap-6">
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required className="form-input" />
                <input type="number" name="guestCount" placeholder="Guest Count" value={formData.guestCount} onChange={handleChange} className="form-input" />
              </div>
              <input type="text" name="location" placeholder="Event Location (city or address)" value={formData.location} onChange={handleChange} required className="form-input w-full" />
              <select name="service" value={formData.service} onChange={handleChange} required className="form-input w-full">
                <option value="">Select Service(s)</option>
                <option value="Cotton Candy ($750)">Cotton Candy ($750)</option>
                <option value="Trivia Night ($250)">Trivia Night ($250)</option>
                <option value="DJ Services ($150/hr)">DJ Services ($150/hr)</option>
                <option value="Combo Package">Combo (Cotton Candy + Trivia)</option>
                <option value="Full Package">Full Package (Cotton Candy + Trivia + DJ)</option>
              </select>
              <textarea name="notes" placeholder="Any special requests or notes?" value={formData.notes} onChange={handleChange} rows="4" className="form-input w-full resize-none" />
              <button type="submit" className="w-full cta-primary text-lg py-4" disabled={submitting}>
                {submitting ? '⏳ Sending...' : '🎉 Send Booking Request'}
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-6">
              Or text us directly: <span className="font-bold text-carnival-cyan">(630) 456-0567</span>
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-black bg-opacity-95 border-t border-gray-800 section-padding text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-black carnival-text-gradient mb-4">High Rollers Company</h3>
            <p className="text-gray-400 mb-4">
              📍 400 S Hale St, Suite B, Wheaton, IL 60187<br />
              📱 (630) 456-0567<br />
              🌐 highrollerscompany.com
            </p>
            <div className="flex justify-center gap-6 mb-8">
              <a href="https://instagram.com/highrollerscompany1" target="_blank" rel="noopener noreferrer" className="text-carnival-pink hover:text-carnival-cyan transition">Instagram</a>
              <a href="https://facebook.com/HighRollersCompany" target="_blank" rel="noopener noreferrer" className="text-carnival-cyan hover:text-carnival-pink transition">Facebook</a>
            </div>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-xs text-gray-500 mb-1">Powered by <a href="https://simpleagentworks.com" target="_blank" rel="noopener noreferrer" className="text-carnival-cyan hover:underline">SimpleAgentWorks</a></p>
              <p className="text-gray-600 text-sm">© 2026 High Rollers Company. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        /* ── COLLAGE CANVAS ── */
        .collage-canvas {
          position: absolute;
          width: 100%;
          height: 1000vh;
          animation: collageScroll 120s linear infinite;
        }
        @keyframes collageScroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-500vh); }
        }

        /* ── PHOTO CARDS ── */
        .photo-card {
          position: absolute;
          border: 6px solid #fff;
          border-bottom: 22px solid #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5);
          background: #fff;
          border-radius: 2px;
          overflow: hidden;
        }
        .photo-card img {
          width: 100%;
          height: auto;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
        }

        /* ── CONTENT SECTIONS ── */
        .content-section {
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        /* ── FORM INPUT ── */
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(30,30,30,0.9);
          border: 2px solid #7c3aed;
          border-radius: 0.5rem;
          color: #fff;
          font-size: 1rem;
        }
        .form-input:focus {
          outline: none;
          border-color: #00f5ff;
        }
        .form-input option {
          background: #1a1a1a;
        }
      `}</style>
    </>
  )
}
