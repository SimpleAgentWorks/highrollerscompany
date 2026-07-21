import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, AlertCircle, Lock, Unlock } from 'lucide-react';

const STAFF_PIN = process.env.STAFF_PIN || '1234';

function formatUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function shortId(id) {
  return id ? id.replace('cs_', '').substring(0, 8).toUpperCase() : '—';
}

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickedUp, setPickedUp] = useState(false);
  const [staffPin, setStaffPin] = useState('');
  const [showStaff, setShowStaff] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [markingPickup, setMarkingPickup] = useState(false);
  const [alreadyPickedUp, setAlreadyPickedUp] = useState(false);

  useEffect(() => {
    if (!session_id) return;

    Promise.all([
      fetch(`/api/orders?pin=${STAFF_PIN}&status=all`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([orderData, settingsData]) => {
        const found = (orderData.orders || []).find((o) => o.stripe_session_id === session_id || o.id === session_id);
        setOrder(found || null);
        setSettings(settingsData.settings || null);
        if (found?.status === 'picked_up') {
          setAlreadyPickedUp(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session_id]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (staffPin === STAFF_PIN) {
      setShowStaff(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!order) return;
    setMarkingPickup(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/pickup`, {
        method: 'POST',
        headers: { 'x-staff-pin': STAFF_PIN },
      });
      if (res.ok) {
        setPickedUp(true);
        setAlreadyPickedUp(true);
        setOrder({ ...order, status: 'picked_up' });
      }
    } catch {
      alert('Failed to mark as picked up. Try again.');
    }
    setMarkingPickup(false);
  };

  // Already picked up — show neutral state
  if (alreadyPickedUp) {
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
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#F9F5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={40} color="#DC5A82" />
        </div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#14143C',
            marginBottom: '8px',
          }}
        >
          Already Claimed
        </h1>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '300px' }}>
          This order has already been picked up. If you believe this is an error, please speak with staff.
        </p>
      </div>
    );
  }

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
        textAlign: 'center',
      }}
    >
      {/* Success Badge */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: '#22C55E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          boxShadow: '0 0 0 8px rgba(34, 197, 94, 0.2)',
        }}
      >
        <CheckCircle size={56} color="#FFFFFF" strokeWidth={2.5} />
      </div>

      <h1
        style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#FFFFFF',
          margin: '0 0 12px',
          letterSpacing: '-0.5px',
        }}
      >
        PAID ✅
      </h1>

      <p
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#FFC832',
          margin: '0 0 32px',
        }}
      >
        Show this screen to staff
      </p>

      {/* Order Summary Card */}
      {order && (
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px 32px',
            marginBottom: '32px',
            minWidth: '280px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
              ORDER SUMMARY
            </p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              {order.quantity} × {settings?.product_name || 'Cotton Candy'}
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
              TOTAL PAID
            </p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#22C55E', margin: 0 }}>
              {formatUSD(order.amount_cents)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
              CONFIRMATION CODE
            </p>
            <p
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#FFC832',
                margin: 0,
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              }}
            >
              {shortId(order.stripe_session_id || order.id)}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Loading order details...</p>
      )}

      {/* Staff PIN Reveal */}
      {!showStaff && (
        <button
          onClick={() => setShowStaff(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '10px 20px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
          }}
        >
          <Lock size={13} /> Staff
        </button>
      )}

      {showStaff && !pickedUp && (
        <div style={{ width: '100%', maxWidth: '320px' }}>
          {!pickedUp ? (
            <>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '12px' }}>
                Staff PIN to mark as picked up:
              </p>
              <form onSubmit={handlePinSubmit} style={{ marginBottom: '16px' }}>
                <input
                  type="password"
                  maxLength={6}
                  value={staffPin}
                  onChange={(e) => {
                    setStaffPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: pinError ? '2px solid #DC5A82' : '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '18px',
                    textAlign: 'center',
                    letterSpacing: '0.2em',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {pinError && (
                  <p style={{ color: '#DC5A82', fontSize: '13px', marginTop: '6px' }}>
                    Incorrect PIN. Try again.
                  </p>
                )}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '14px',
                    background: '#22C55E',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <Unlock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Unlock Staff Actions
                </button>
              </form>
            </>
          ) : null}

          {showStaff && staffPin === STAFF_PIN && !pickedUp && (
            <button
              onClick={handleMarkPickedUp}
              disabled={markingPickup}
              style={{
                width: '100%',
                padding: '16px',
                background: markingPickup ? '#A0A0A0' : '#22C55E',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                cursor: markingPickup ? 'not-allowed' : 'pointer',
              }}
            >
              {markingPickup ? 'Marking...' : '✓ Mark as Picked Up'}
            </button>
          )}
        </div>
      )}

      {pickedUp && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid #22C55E',
            borderRadius: '12px',
            padding: '16px 24px',
            color: '#22C55E',
            fontWeight: '600',
          }}
        >
          ✓ Order marked as picked up
        </div>
      )}

      <p
        style={{
          marginTop: '32px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}
      >
        High Rollers Company · Questions? Contact staff
      </p>
    </div>
  );
}
