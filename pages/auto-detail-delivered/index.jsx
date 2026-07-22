import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const CAR_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=85',
  detail: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
  interior: 'https://images.unsplash.com/photo-1632823471563-0cb07f513a0d?w=1200&q=80',
}

export default function AutoDetailHome() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', backgroundColor: '#080808', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>

      {/* ════════════════════════════════════════════ HERO ═══ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${CAR_IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.4) contrast(1.15)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.8) 85%, #080808 100%)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '820px'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #d4af37',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 60px rgba(212,175,55,0.25)',
              overflow: 'hidden'
            }}>
              <Image
                src="/images/auto-detail-logo.png"
                alt="Auto Detail Delivered"
                width={120}
                height={120}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            marginBottom: '0.25rem',
            textShadow: '0 4px 60px rgba(0,0,0,0.9)',
            WebkitTextStroke: '0px'
          }}>
            Auto Detail
          </h1>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            fontWeight: 900,
            color: '#d4af37',
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            marginBottom: '2rem',
            textShadow: '0 4px 40px rgba(212,175,55,0.3)',
            WebkitTextStroke: '0px'
          }}>
            Delivered
          </h1>

          <p style={{
            color: '#aaa',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            fontWeight: 400,
            marginBottom: '3rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Premium Mobile Detailing — We Come To You
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              textTransform: 'uppercase',
              boxShadow: '0 0 50px rgba(212,175,55,0.35)'
            }}>
              Book Now
            </Link>
            <Link href="/auto-detail-delivered/about" style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#fff',
              padding: '1rem 2.5rem',
              borderRadius: '3px',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Our Services
            </Link>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(212,175,55,0.5)',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          ↓
        </div>
      </section>

      {/* ══════════════════════════════════════ SERVICES ═══ */}
      <section style={{ backgroundColor: '#080808', padding: '8rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p style={{ color: '#d4af37', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
              What We Offer
            </p>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              Interior & Exterior Detailing
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5px', backgroundColor: '#1a1a1a' }}>
            {[
              {
                title: 'Interior Detail',
                desc: 'Full vacuum, surface wipe, glass cleaning, air freshener. Your car feels new from the inside out.',
                price: 'From $150',
                image: CAR_IMAGES.interior
              },
              {
                title: 'Exterior Wash',
                desc: 'Hand wash, dry, tire shine, and window cleaning. No brushes — just a flawless finish.',
                price: 'From $50',
                image: CAR_IMAGES.detail
              },
              {
                title: 'Full Combo',
                desc: 'Interior + Exterior at a bundle price. The complete detail experience.',
                price: 'Save 15%',
                image: CAR_IMAGES.hero
              },
            ].map((service) => (
              <div key={service.title} style={{ backgroundColor: '#0f0f0f', position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${service.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.5) saturate(0.8)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, #0f0f0f 100%)'
                  }} />
                </div>
                <div style={{ padding: '2rem' }}>
                  <h3 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.5rem',
                    color: '#fff',
                    fontWeight: 700,
                    marginBottom: '0.75rem'
                  }}>{service.title}</h3>
                  <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{service.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '1rem' }}>{service.price}</span>
                    <Link href="/auto-detail-delivered/book" style={{
                      color: '#888',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #333',
                      paddingBottom: '2px'
                    }}>Book →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ HOW IT WORKS */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '7rem 2rem', borderTop: '1px solid #141414', borderBottom: '1px solid #141414' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p style={{ color: '#d4af37', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Simple Process
            </p>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              Three Steps to a Clean Car
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem' }}>
            {[
              { num: '01', title: 'Book Online', desc: 'Select your service, add your vehicle details, and pick a date that works for you.' },
              { num: '02', title: 'We Come To You', desc: 'Our team arrives at your location fully equipped. No driving needed.' },
              { num: '03', title: 'Drive Clean', desc: 'Your car is detailed on-site. Pay when it is done. Simple.' },
            ].map((item) => (
              <div key={item.num} style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#d4af37',
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  fontFamily: '"Playfair Display", serif',
                  marginBottom: '1.25rem',
                  lineHeight: 1,
                  opacity: 0.35
                }}>{item.num}</div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h4>
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ CTA */}
      <section style={{
        position: 'relative',
        padding: '10rem 2rem',
        textAlign: 'center',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${CAR_IMAGES.detail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.25) contrast(1.2)',
          transform: 'scale(1.05)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.5) 50%, #000 100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '650px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: '#fff',
            fontWeight: 900,
            marginBottom: '1.5rem',
            lineHeight: 1.05,
            letterSpacing: '-0.02em'
          }}>
            Your Car Deserves<br />
            <span style={{ color: '#d4af37' }}>To Shine.</span>
          </h2>
          <p style={{ color: '#888', fontSize: '1.05rem', marginBottom: '3rem', lineHeight: 1.7 }}>
            Book in under two minutes. We handle the rest.
          </p>
          <Link href="/auto-detail-delivered/book" style={{
            display: 'inline-block',
            backgroundColor: '#d4af37',
            color: '#000',
            padding: '1.25rem 3.5rem',
            borderRadius: '3px',
            fontWeight: 800,
            fontSize: '1rem',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 0 60px rgba(212,175,55,0.4)'
          }}>
            Book Your Detail →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#000',
        borderTop: '1px solid #1a1a1a',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#d4af37',
            marginBottom: '0.75rem'
          }}>Auto Detail Delivered</p>
          <p style={{ color: '#444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Wheaton, IL · Serving DuPage County & Surrounding Areas</p>
          <p style={{ color: '#333', fontSize: '0.8rem' }}>© 2026 Auto Detail Delivered. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
