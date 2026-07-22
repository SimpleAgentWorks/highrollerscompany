import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #111; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #d4af37; }
          ::selection { background: #d4af37; color: #000; }
        `}</style>
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
