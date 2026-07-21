import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Lock, LogOut } from 'lucide-react';

const STAFF_PIN = process.env.STAFF_PIN || '1234';

function formatUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function StaffPage() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('hr_staff_auth');
    if (saved === STAFF_PIN) setAuthenticated(true);
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      setAuthenticated(true);
      setPinError(false);
      localStorage.setItem('hr_staff_auth', STAFF_PIN);
    } else {
      setPinError(true);
    }
  };

  const fetchOrders = async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?pin=${STAFF_PIN}&status=unpicked`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 15000); // poll every 15s
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleMarkPickedUp = async (orderId) => {
    setMarkingId(orderId);
    try {
      await fetch(`/api/orders/${orderId}/pickup`, {
        method: 'POST',
        headers: { 'x-staff-pin': STAFF_PIN },
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {
      alert('Failed. Try again.');
    }
    setMarkingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('hr_staff_auth');
    setAuthenticated(false);
    setPin('');
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
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#FFFFFF',
            marginBottom: '8px',
          }}
        >
          Staff Access
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '32px' }}>
          Enter your 4-digit PIN
        </p>

        <form onSubmit={handlePinSubmit} style={{ width: '100%', maxWidth: '280px' }}>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError(false);
            }}
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
        padding: '0',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#14143C',
          padding: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            🎱 Staff Queue
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} waiting
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchOrders}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </div>

      {/* Order List */}
      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {loading && orders.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>Loading...</p>
        )}

        {!loading && orders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
            }}
          >
            <CheckCircle size={48} color="#22C55E" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#14143C', marginBottom: '4px' }}>
              All caught up!
            </p>
            <p style={{ fontSize: '14px' }}>No orders waiting to be picked up.</p>
          </div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px 18px',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(20,20,60,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: '#F9F5FF',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#14143C',
                  }}
                >
                  {order.quantity} cotton cand{order.quantity === 1 ? 'y' : 'ies'}
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#22C55E',
                  }}
                >
                  {formatUSD(order.amount_cents)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} color="#999" />
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {formatTime(order.created_at)}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                  }}
                >
                  #{order.id?.substring(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleMarkPickedUp(order.id)}
              disabled={markingId === order.id}
              style={{
                padding: '10px 18px',
                background: markingId === order.id ? '#A0A0A0' : '#22C55E',
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                cursor: markingId === order.id ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {markingId === order.id ? '...' : '✓ Pick Up'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
