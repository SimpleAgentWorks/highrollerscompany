import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function AutoDetailAbout() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', backgroundColor: '#080808', color: '#f5f5f5', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10,10,10,0.92)',
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
            <Link href="/auto-detail-delivered/about" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>About</Link>
            <Link href="/auto-detail-delivered/contact" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Contact</Link>
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
        <section style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: '#0a0a0a', borderBottom: '1px solid #141414' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <p style={{ color: '#d4af37', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
              About Us
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
              We Come To You.<br />
              <span style={{ color: '#d4af37' }}>We Leave You Clean.</span>
            </h1>
            <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.7 }}>
              Auto Detail Delivered brings professional mobile auto detailing directly to your location — your driveway, office, or anywhere. No driving, no waiting, no hassle.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: '7rem 2rem', backgroundColor: '#080808' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            {[
              { title: 'Professional', desc: 'Every detailer on our team is trained, insured, and equipped with professional-grade products and tools.' },
              { title: 'Convenient', desc: 'We come to you. No dropping off your car, no waiting at a shop. Book online in minutes.' },
              { title: 'Transparent', desc: 'The price you see is the price you pay. No surprises, no upsells on the day of service.' },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.5rem',
                  color: '#d4af37',
                  fontWeight: 700,
                  marginBottom: '1rem'
                }}>{item.title}</h3>
                <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Overview */}
        <section style={{ padding: '7rem 2rem', backgroundColor: '#0a0a0a', borderTop: '1px solid #141414' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ color: '#d4af37', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                Pricing
              </p>
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '-0.02em'
              }}>
                Simple, Upfront Pricing
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5px', backgroundColor: '#1a1a1a' }}>
              {[
                { type: 'Interior Detail', price: '$150–$250', detail: 'Price varies by vehicle size. Sedan from $150, SUV from $200, Minivan from $250.' },
                { type: 'Exterior Wash', price: 'From $50', detail: 'Hand wash, dry, tire shine, and window cleaning. Add wax for +$50.' },
                { type: 'Full Combo', price: 'Save 15%', detail: 'Interior + Exterior together at a bundle price. Our most popular option.' },
              ].map(item => (
                <div key={item.type} style={{ backgroundColor: '#0f0f0f', padding: '2rem', textAlign: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.type}</h4>
                  <p style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: 900, fontFamily: '"Playfair Display", serif', marginBottom: '1rem' }}>{item.price}</p>
                  <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Multi-vehicle discount: 5% off 2nd vehicle, 10% off 3rd, 15% off 4th
              </p>
              <Link href="/auto-detail-delivered/book" style={{
                display: 'inline-block',
                backgroundColor: '#d4af37',
                color: '#000',
                padding: '1rem 2.5rem',
                borderRadius: '3px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                Book Now →
              </Link>
            </div>
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
