import { useState, useEffect } from 'react';
import { DollarSign, Image as ImageIcon, Lock, Save, CheckCircle, RefreshCw, ShoppingBag } from 'lucide-react';

const STAFF_PIN = process.env.STAFF_PIN || '1234';
const DASHBOARD_PIN = process.env.DASHBOARD_PIN || '5678';
const VALID_PIN = STAFF_PIN || DASHBOARD_PIN;

function formatUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SettingsPage() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [priceInput, setPriceInput] = useState(''); // user types in dollars

  useEffect(() => {
    const savedPin = localStorage.getItem('hr_dashboard_auth');
    if (savedPin === STAFF_PIN || savedPin === DASHBOARD_PIN) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch(`/api/settings?pin=${VALID_PIN}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setProductName(s.product_name || '');
          setProductDescription(s.product_description || '');
          setProductImageUrl(s.product_image_url || '');
          setPriceInput((s.price_cents / 100).toFixed(2));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authenticated]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN || pin === DASHBOARD_PIN) {
      setAuthenticated(true);
      setPinError(false);
      localStorage.setItem('hr_dashboard_auth', pin);
    } else {
      setPinError(true);
    }
  };

  const handleSave = async () => {
    const priceCents = Math.round(parseFloat(priceInput) * 100);
    if (isNaN(priceCents) || priceCents < 50) {
      alert('Please enter a valid price of at least $0.50');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/settings?pin=${VALID_PIN}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-staff-pin': VALID_PIN },
        body: JSON.stringify({
          product_name: productName.trim() || 'Cotton Candy',
          product_description: productDescription.trim(),
          product_image_url: productImageUrl.trim() || null,
          price_cents: priceCents,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setSaving(false);
  };

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #14143C 0%, #1e1e5a 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <Lock size={28} color="#FFC832" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
          Settings Access
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '32px' }}>
          Enter your staff PIN
        </p>
        <form onSubmit={handlePinSubmit} style={{ width: '100%', maxWidth: '280px' }}>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false); }}
            placeholder="• • • •"
            autoFocus
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '14px',
              border: pinError ? '2px solid #DC5A82' : '2px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              fontSize: '32px',
              textAlign: 'center',
              letterSpacing: '0.4em',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'monospace',
            }}
          />
          {pinError && (
            <p style={{ color: '#DC5A82', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
              Incorrect PIN. Try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '16px',
              background: '#DC5A82',
              border: 'none',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9F5FF',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#14143C',
          padding: '20px',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
          🎱 Product Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
          Configure what's shown on the payment page
        </p>
      </div>

      <div style={{ padding: '16px', maxWidth: '560px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>Loading settings...</p>
        ) : (
          <>
            {/* Product Name */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <ShoppingBag size={13} />
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Cotton Candy"
                maxLength={60}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E0E0E0',
                  background: '#FFFFFF',
                  fontSize: '16px',
                  color: '#14143C',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#DC5A82')}
                onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
              />
            </div>

            {/* Product Description */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <ShoppingBag size={13} />
                Description / Tagline
              </label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="e.g. Freshly spun cotton candy — $10 each"
                maxLength={120}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E0E0E0',
                  background: '#FFFFFF',
                  fontSize: '16px',
                  color: '#14143C',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#DC5A82')}
                onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <DollarSign size={13} />
                Price (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    color: '#999',
                    fontWeight: '600',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="10.00"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 32px',
                    borderRadius: '12px',
                    border: '1.5px solid #E0E0E0',
                    background: '#FFFFFF',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#14143C',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#DC5A82')}
                  onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                Current: {formatUSD(Math.round(parseFloat(priceInput || '0') * 100))} per unit
              </p>
            </div>

            {/* Product Image URL */}
            <div style={{ marginBottom: '28px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <ImageIcon size={13} />
                Product Image URL
                <span style={{ fontWeight: '400', color: '#999', textTransform: 'none' }}>(optional)</span>
              </label>
              <input
                type="url"
                value={productImageUrl}
                onChange={(e) => setProductImageUrl(e.target.value)}
                placeholder="https://example.com/cotton-candy-photo.jpg"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E0E0E0',
                  background: '#FFFFFF',
                  fontSize: '14px',
                  color: '#14143C',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#DC5A82')}
                onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
              />
              {productImageUrl && (
                <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E0E0E0', display: 'inline-block' }}>
                  <img
                    src={productImageUrl}
                    alt="Product preview"
                    style={{ width: '120px', height: '80px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.opacity = '0.3'; }}
                  />
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '16px',
                background: saved ? '#22C55E' : saving ? '#A0A0A0' : '#DC5A82',
                border: 'none',
                borderRadius: '14px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 200ms',
              }}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>

            {/* Live preview note */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '16px' }}>
              Changes apply immediately — the pay page updates in real time.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
