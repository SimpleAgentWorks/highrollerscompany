import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function AutoDetailContact() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', backgroundColor: '#080808', color: '#f5f5f5', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        padding: '0.875rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/auto-detail-delivered" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1.5px solid #d4af37',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Image src="/images/auto-detail-logo.png" alt="ADD" width={36} height={36} style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', fontWeight: 800, color: '#d4af37', lineHeight: 1 }}>Auto Detail</div>
              <div style={{ color: '#666', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Delivered</div>
            </div>
          </Link>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/auto-detail-delivered" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Home</Link>
            <Link href="/auto-detail-delivered/about" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>About</Link>
            <Link href="/auto-detail-delivered/contact" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Contact</Link>
            <Link href="/auto-detail-delivered/book" style={{
              backgroundColor: '#d4af37', color: '#000',
              padding: '0.5rem 1.25rem', borderRadius: '4px',
              fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none'
            }}>Book Now</Link>
          </nav>
        </div>
      </header>

      <main style={{ paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ padding: '7rem 2rem 4rem', textAlign: 'center', backgroundColor: '#0a0a0a', borderBottom: '1px solid #141414' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <p style={{ color: '#d4af37', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Get In Touch
            </p>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              color: '#fff',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              Contact <span style={{ color: '#d4af37' }}>Us</span>
            </h1>
            <p style={{ color: '#888', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Ready to book? Use the online form — it's the fastest way to get on the calendar.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section style={{ padding: '6rem 2rem', backgroundColor: '#080808' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>

            {/* Phone */}
            <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#0f0f0f', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📞</div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Phone / Text</h3>
              <a href="tel:+16304560567" style={{ color: '#d4af37', fontSize: '1.2rem', fontWeight: 700, textDecoration: 'none' }}>
                (630) 456-0567
              </a>
              <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>Mon–Sat, 8am–7pm</p>
            </div>

            {/* Email */}
            <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#0f0f0f', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✉️</div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Email</h3>
              <a href="mailto:info@simpleagentworks.com" style={{ color: '#d4af37', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                info@simpleagentworks.com
              </a>
              <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>We respond within 24 hours</p>
            </div>

            {/* Service Area */}
            <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#0f0f0f', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📍</div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Service Area</h3>
              <p style={{ color: '#aaa', fontSize: '1rem', fontWeight: 600 }}>Wheaton, IL</p>
              <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>DuPage County & surrounding areas</p>
            </div>

          </div>
        </section>

        {/* Book CTA */}
        <section style={{ padding: '5rem 2rem', backgroundColor: '#0a0a0a', borderTop: '1px solid #141414', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              color: '#fff',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              Ready to Book?
            </h2>
            <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              The online booking form takes under 2 minutes. Pick your service, add your vehicle, choose a date.
            </p>
            <Link href="/auto-detail-delivered/book" style={{
              display: 'inline-block',
              backgroundColor: '#d4af37',
              color: '#000',
              padding: '1rem 2.5rem',
              borderRadius: '3px',
              fontWeight: 800,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Book Your Detail →
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: '#000', borderTop: '1px solid #1a1a1a', padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', fontWeight: 800, color: '#d4af37', marginBottom: '0.75rem' }}>Auto Detail Delivered</p>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>Wheaton, IL · Serving DuPage County & Surrounding Areas</p>
      </footer>
    </div>
  )
}
