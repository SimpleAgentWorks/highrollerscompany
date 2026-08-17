// /book/thank-you — booking confirmation page
// Used by Google Ads as the conversion page, also linked from booking form success state

import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function ThankYou() {
  // Google Ads conversion tracking — fires when this page loads
  // The actual conversion tag should be installed via Google Tag Manager
  // or directly in _app.jsx. This page just needs a stable URL.
  useEffect(() => {
    // Tell any installed conversion scripts that the conversion happened
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // placeholder — replace with real values
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>Booking Received — Auto Detail Delivered</title>
        <meta name="description" content="Your mobile auto detailing appointment request has been received. We'll be in touch within 1 business hour to confirm." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://autodetaildelivered.com/book/thank-you" />
      </Head>

      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080808', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '2rem 1.5rem' }}>

          {/* Success icon */}
          <div style={{
            width: '80px', height: '80px', margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4cf6b 100%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
          }}>
            ✓
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800, margin: '0 0 1rem',
            color: '#f5f5f5',
          }}>
            Request Received!
          </h1>

          <p style={{
            fontSize: '1.125rem', color: '#aaa',
            margin: '0 0 2rem', lineHeight: 1.6,
          }}>
            Thanks for booking with Auto Detail Delivered. We'll be in touch within <strong style={{ color: '#d4af37' }}>1 business hour</strong> to confirm your appointment and gather any final details.
          </p>

          {/* What happens next */}
          <div style={{
            background: '#111', border: '1px solid #2a2a3e',
            borderRadius: '12px', padding: '1.5rem',
            marginBottom: '2rem', textAlign: 'left',
          }}>
            <p style={{
              fontSize: '12px', fontWeight: 700,
              color: '#d4af37', textTransform: 'uppercase',
              letterSpacing: '0.05em', margin: '0 0 0.75rem',
            }}>
              What Happens Next
            </p>
            <ol style={{
              margin: 0, padding: '0 0 0 1.25rem',
              color: '#ccc', fontSize: '14px', lineHeight: 1.8,
            }}>
              <li>We text/call you within 1 hour to confirm your slot</li>
              <li>You get a calendar invite with your detail time</li>
              <li>We show up at your location, fully equipped</li>
              <li>Pay when the detail is done — cash, card, or Venmo</li>
            </ol>
          </div>

          <p style={{
            fontSize: '13px', color: '#888',
            margin: '0 0 1.5rem',
          }}>
            📍 We come to you — home, office, or anywhere in Wheaton & DuPage County.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auto-detail-delivered" style={{
              display: 'inline-block',
              background: '#d4af37', color: '#080808',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px',
              textDecoration: 'none',
            }}>
              ← Back to Home
            </Link>
            <Link href="/auto-detail-delivered/book" style={{
              display: 'inline-block',
              background: 'transparent', color: '#d4af37',
              border: '1px solid #d4af37',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px',
              textDecoration: 'none',
            }}>
              Book Another
            </Link>
          </div>

          {/* Contact footer */}
          <div style={{
            marginTop: '3rem', paddingTop: '1.5rem',
            borderTop: '1px solid #2a2a3e',
            fontSize: '12px', color: '#555',
          }}>
            Questions? Text us directly:<br />
            <a href="sms:+16304560567" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              (630) 456-0567
            </a>
          </div>
        </div>
      </div>
    </>
  )
}