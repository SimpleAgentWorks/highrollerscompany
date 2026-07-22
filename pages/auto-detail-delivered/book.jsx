import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

// Reuse the same form component from book.jsx
import BookingForm from '../book'

export default function AutoDetailBook() {
  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>

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
        <BookingForm />
      </main>

      <footer style={{ backgroundColor: '#000', borderTop: '1px solid #1a1a1a', padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', fontWeight: 800, color: '#d4af37', marginBottom: '0.75rem' }}>Auto Detail Delivered</p>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>Wheaton, IL · Serving DuPage County & Surrounding Areas</p>
      </footer>
    </div>
  )
}
