import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads-latest');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.warn('Failed to fetch leads:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.source === filter);

  const sourceCounts = {
    all: leads.length,
    painting: leads.filter(l => l.source === 'painting').length,
    'cotton-candy': leads.filter(l => l.source === 'cotton-candy').length,
    'auto-detail': leads.filter(l => l.source === 'auto-detail').length,
  };

  const sourceEmoji = {
    'painting': '🎨',
    'cotton-candy': '🍭',
    'auto-detail': '🚗',
    'unknown': '📋',
  };

  const sourceLabel = {
    'painting': 'Painting',
    'cotton-candy': 'Cotton Candy',
    'auto-detail': 'Auto Detail',
    'unknown': 'Other',
  };

  const prefEmoji = {
    'text': '💬',
    'call': '📞',
    'web': '🌐',
    'email': '🌐',
  };

  return (
    <>
      <Head>
        <title>Lead Dashboard — High Rollers</title>
      </Head>
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#f5f5f5', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>🎱 Lead Dashboard</h1>
              <p style={{ color: '#888', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Live feed of all intake form submissions
                {lastUpdate && <> · Last updated {lastUpdate.toLocaleTimeString()}</>}
              </p>
            </div>
            <button onClick={fetchLeads} disabled={loading}
              style={{
                padding: '0.5rem 1rem', backgroundColor: '#d4af37', color: '#000', border: 'none',
                borderRadius: '8px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}>
              {loading ? 'Loading…' : '↻ Refresh'}
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['all', 'painting', 'cotton-candy', 'auto-detail'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '999px', border: 'none',
                  backgroundColor: filter === f ? '#d4af37' : 'rgba(255,255,255,0.06)',
                  color: filter === f ? '#000' : '#aaa',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {sourceEmoji[f === 'all' ? 'all' : f] || '•'} {f === 'all' ? 'All' : sourceLabel[f]} ({sourceCounts[f]})
              </button>
            ))}
          </div>

          {/* Leads list */}
          {filteredLeads.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              {loading ? 'Loading leads…' : 'No leads yet. Submit a test form to verify the pipeline.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredLeads.map(lead => (
                <div key={lead.id} style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{sourceEmoji[lead.source] || '📋'}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{lead.name}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
                          {sourceLabel[lead.source] || 'Other'}
                        </span>
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <a href={`tel:${lead.phone}`} style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 600 }}>📱 {lead.phone}</a>
                        {lead.email && <> · <a href={`mailto:${lead.email}`} style={{ color: '#888' }}>{lead.email}</a></>}
                      </div>

                      {/* Source-specific details */}
                      {lead.source === 'painting' && (
                        <div style={{ fontSize: '0.875rem', color: '#ccc' }}>
                          {lead.job_description && <div>🎨 {lead.job_description}</div>}
                          {lead.address && (
                            <div style={{ color: '#888', marginTop: '0.25rem' }}>
                              📍 {lead.address}{lead.city && `, ${lead.city}`}{lead.state && `, ${lead.state}`} {lead.zip}
                            </div>
                          )}
                        </div>
                      )}
                      {lead.source === 'cotton-candy' && (
                        <div style={{ fontSize: '0.875rem', color: '#ccc' }}>
                          {lead.event_date && <div>📅 {lead.event_date}</div>}
                          {lead.event_type && <div>🎉 {lead.event_type}</div>}
                          {lead.guest_count && <div>👥 {lead.guest_count} guests</div>}
                          {lead.venue && <div>📍 {lead.venue}</div>}
                          {lead.special_requests && <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: '#aaa' }}>📝 {lead.special_requests}</div>}
                        </div>
                      )}
                      {lead.source === 'auto-detail' && (
                        <div style={{ fontSize: '0.875rem', color: '#ccc' }}>
                          {lead.job_description && <div>🚗 {lead.job_description}</div>}
                          {lead.address && (
                            <div style={{ color: '#888', marginTop: '0.25rem' }}>
                              📍 {lead.address}{lead.city && `, ${lead.city}`}{lead.state && `, ${lead.state}`} {lead.zip}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.25rem' }}>{prefEmoji[lead.contact_preference] || '🌐'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>
                        {lead.created_at && new Date(lead.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
