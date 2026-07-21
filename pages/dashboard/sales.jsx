import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Heart, Lock, Calendar, RefreshCw } from 'lucide-react';

const DASHBOARD_PIN = process.env.DASHBOARD_PIN || process.env.STAFF_PIN || '5678';

function formatUSD(cents) {
  if (cents == null) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatNumber(n) {
  if (n == null) return '0';
  return n.toLocaleString();
}

function getDateRange(option) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const dayOfWeek = now.getDay(); // 0=Sun

  let from = new Date();
  let to = new Date();

  switch (option) {
    case 'today':
      from = new Date(year, month, day, 0, 0, 0);
      to = new Date(year, month, day, 23, 59, 59);
      break;
    case 'this_week':
      from = new Date(year, month, day - dayOfWeek, 0, 0, 0);
      to = new Date(year, month, day - dayOfWeek + 6, 23, 59, 59);
      break;
    case 'last_week': {
      const lastWeekStart = new Date(year, month, day - dayOfWeek - 7, 0, 0, 0);
      const lastWeekEnd = new Date(year, month, day - dayOfWeek - 1, 23, 59, 59);
      from = lastWeekStart;
      to = lastWeekEnd;
      break;
    }
    case 'this_month':
      from = new Date(year, month, 1, 0, 0, 0);
      to = new Date(year, month + 1, 0, 23, 59, 59);
      break;
    case 'last_month':
      from = new Date(year, month - 1, 1, 0, 0, 0);
      to = new Date(year, month, 0, 23, 59, 59);
      break;
    case 'ytd':
      from = new Date(year, 0, 1, 0, 0, 0);
      to = new Date(year, month, day, 23, 59, 59);
      break;
    default:
      from = new Date(year, month, day, 0, 0, 0);
      to = new Date(year, month, day, 23, 59, 59);
  }

  return { from, to };
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Range' },
];

export default function SalesDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [dateOption, setDateOption] = useState('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hr_dashboard_auth');
    if (saved === DASHBOARD_PIN) setAuthenticated(true);
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === DASHBOARD_PIN) {
      setAuthenticated(true);
      setPinError(false);
      localStorage.setItem('hr_dashboard_auth', DASHBOARD_PIN);
    } else {
      setPinError(true);
    }
  };

  const fetchOrders = async (from, to) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pin: DASHBOARD_PIN,
        dateFrom: toISO(from),
        dateTo: toISO(to),
      });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error('Failed to fetch orders');
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authenticated) return;
    const { from, to } =
      dateOption === 'custom' && customFrom && customTo
        ? { from: new Date(customFrom + 'T00:00:00'), to: new Date(customTo + 'T23:59:59') }
        : getDateRange(dateOption);
    fetchOrders(from, to);
  }, [authenticated, dateOption, customFrom, customTo]);

  const { from, to } =
    dateOption === 'custom' && customFrom && customTo
      ? { from: new Date(customFrom + 'T00:00:00'), to: new Date(customTo + 'T23:59:59') }
      : getDateRange(dateOption);

  // Include picked_up orders in sales (sold is sold)
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'picked_up');

  const totalSales = paidOrders.reduce((sum, o) => sum + (o.amount_cents || 0), 0);
  const totalItems = paidOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalTips = paidOrders.reduce((sum, o) => sum + (o.tip_cents || 0), 0);

  // Stat cards
  const stats = [
    {
      label: 'Total Sales',
      value: formatUSD(totalSales),
      icon: <DollarSign size={22} color="#22C55E" />,
      bg: '#F0FDF4',
      border: '#BBF7D0',
    },
    {
      label: 'Quantity Sold',
      value: formatNumber(totalItems),
      icon: <ShoppingBag size={22} color="#14143C" />,
      bg: '#F9F5FF',
      border: '#E9D5FF',
    },
    {
      label: 'Total Tips',
      value: formatUSD(totalTips),
      icon: <Heart size={22} color="#DC5A82" />,
      bg: '#FDF2F8',
      border: '#FBCFE8',
    },
  ];

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
          Sales Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '32px' }}>
          Enter your PIN to view sales
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            🎱 Sales Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
            High Rollers Company
          </p>
        </div>
        <button
          onClick={() => fetchOrders(from, to)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        {/* Date Picker */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(20,20,60,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            <Calendar size={14} color="#666" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Date Range
            </span>
          </div>

          {/* Quick select buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: dateOption === 'custom' ? '12px' : '0' }}>
            {DATE_OPTIONS.filter((o) => o.value !== 'custom').map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateOption(opt.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: dateOption === opt.value ? '#14143C' : '#F0F0F0',
                  color: dateOption === opt.value ? '#FFFFFF' : '#666',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setDateOption('custom')}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: dateOption === 'custom' ? '2px solid #14143C' : '2px solid #E0E0E0',
                background: dateOption === 'custom' ? '#F9F5FF' : '#FFFFFF',
                color: dateOption === 'custom' ? '#14143C' : '#666',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Custom
            </button>
          </div>

          {/* Custom date range */}
          {dateOption === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '2px' }}>From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    fontSize: '13px',
                    background: '#F9F5FF',
                    color: '#14143C',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '2px' }}>To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    fontSize: '13px',
                    background: '#F9F5FF',
                    color: '#14143C',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>
            </div>
          )}

          {/* Date range label */}
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', marginBottom: 0 }}>
            {toISO(from) === toISO(to)
              ? toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              : `${toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>

        {/* Stats */}
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: loading ? '14px' : '30px',
                  fontWeight: '800',
                  color: '#14143C',
                  margin: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {loading ? '—' : stat.value}
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              {stat.icon}
            </div>
          </div>
        ))}

        {/* Order count note */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#999',
            marginTop: '12px',
          }}
        >
          {loading
            ? 'Loading...'
            : `${paidOrders.length} order${paidOrders.length !== 1 ? 's' : ''} in this period · ${formatNumber(totalItems)} items`}
        </p>
      </div>
    </div>
  );
}
