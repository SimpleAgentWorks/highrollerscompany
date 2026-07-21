import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PayPage() {
  const [settings, setSettings] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const price = settings?.price_cents || 1000;
  const unitPrice = price / 100;
  const productName = settings?.product_name || 'Cotton Candy';
  const productDescription = settings?.product_description || `${productName} — $${unitPrice.toFixed(2)} each`;
  const productImageUrl = settings?.product_image_url || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled')) setCanceled(true);

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to defaults if API fails
        setSettings({
          product_name: 'Cotton Candy',
          product_description: 'Freshly spun cotton candy — $10 each',
          price_cents: 1000,
        });
        setLoading(false);
      });
  }, []);

  const total = (quantity * unitPrice).toFixed(2);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, price_cents: price, product_name: productName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment failed to initialize. Please try again.');
        setPaying(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Logo / Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #14143C 0%, #DC5A82 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '36px',
            fontWeight: '800',
            color: '#FFC832',
          }}
        >
          🎱
        </div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#14143C',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
          }}
        >
          High Rollers
        </h1>
        <p
          style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#DC5A82',
            margin: 0,
          }}
        >
          {loading ? 'Loading...' : productDescription}
        </p>
      </div>

      {/* Canceled Notice */}
      {canceled && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #DC5A82',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#DC5A82',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Payment was canceled. Select your quantity and try again.
        </div>
      )}

      {/* Card */}
      <div
        style={{
          background: '#F9F5FF',
          borderRadius: '20px',
          padding: '32px 24px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 4px 24px rgba(20, 20, 60, 0.08)',
        }}
      >
        {/* Product Image */}
        {!loading && productImageUrl && (
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '24px',
              height: '120px',
              background: '#F0F0F0',
            }}
          >
            <img
              src={productImageUrl}
              alt={productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Quantity Stepper */}
        <div style={{ marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#14143C',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            How many?
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: 'none',
                background: quantity <= 1 ? '#E5E5E5' : '#14143C',
                color: quantity <= 1 ? '#999' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
                fontSize: '20px',
              }}
            >
              <Minus size={22} />
            </button>

            <span
              style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#14143C',
                minWidth: '60px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {quantity}
            </span>

            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              disabled={quantity >= 10}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: 'none',
                background: quantity >= 10 ? '#E5E5E5' : '#14143C',
                color: quantity >= 10 ? '#999' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
                fontSize: '20px',
              }}
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Price Total */}
        <div
          style={{
            borderTop: '2px solid #E0E0E0',
            paddingTop: '20px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Total</p>
          <p
            style={{
              fontSize: '40px',
              fontWeight: '800',
              color: '#14143C',
              margin: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${total}
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={paying || loading}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: paying || loading ? '#A0A0A0' : 'linear-gradient(135deg, #DC5A82 0%, #C44E75 100%)',
            border: 'none',
            borderRadius: '14px',
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: '700',
            cursor: paying || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'opacity 150ms',
            boxShadow: paying || loading ? 'none' : '0 4px 16px rgba(220, 90, 130, 0.35)',
          }}
        >
          {paying ? (
            'Redirecting...'
          ) : (
            <>
              <ShoppingCart size={20} />
              Pay Now
            </>
          )}
        </button>
      </div>

      <p
        style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
        }}
      >
        Powered by Stripe · High Rollers Company
      </p>
    </div>
  );
}
