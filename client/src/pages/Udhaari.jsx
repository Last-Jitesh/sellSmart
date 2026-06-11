import { useEffect, useState } from 'react'
import UdhaariCard from '../components/UdhaariCard'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'

export default function Udhaari() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('pending') // pending | all | paid
  const [form, setForm] = useState({ customerName: '', phone: '', items: '', totalAmount: '' })

  const load = async () => {
    try {
      const res = await api.get('/api/udhaari')
      setEntries(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const totalOutstanding = entries.reduce((s, e) => s + Math.max(0, (e.totalAmount || 0) - (e.paidAmount || 0)), 0)
  const totalPaid = entries.reduce((s, e) => s + (e.paidAmount || 0), 0)

  const filtered = entries.filter(e => {
    const isPaid = (e.totalAmount - (e.paidAmount || 0)) <= 0
    if (filter === 'pending') return !isPaid
    if (filter === 'paid') return isPaid
    return true
  })

  const handleAdd = async (ev) => {
    ev.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/udhaari', form)
      setShowModal(false)
      setForm({ customerName: '', phone: '', items: '', totalAmount: '' })
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleMarkPaid = async (id) => {
    if (!confirm('Mark this as fully paid?')) return
    try {
      await api.patch(`/api/udhaari/${id}/pay`, { amount: null })
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleWhatsApp = (entry) => {
    const outstanding = (entry.totalAmount || 0) - (entry.paidAmount || 0)
    const msg = encodeURIComponent(
      `Hello ${entry.customerName} 🙏\n\nThis is a gentle reminder from our shop.\n\nYou have an outstanding balance of *₹${outstanding}* for: ${entry.items || 'your purchase'}.\n\nPlease settle at your earliest convenience. Thank you!\n\n— SellSmart`
    )
    window.open(`https://wa.me/91${entry.phone}?text=${msg}`, '_blank')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Udhaari Ledger</h2>
          <p className="section-sub">Digital khata for your credit customers</p>
        </div>
        <button className="btn-primary" id="add-udhaari-btn" onClick={() => setShowModal(true)}>
          + Add Entry
        </button>
      </div>

      {/* Summary banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Outstanding', value: formatCurrency(totalOutstanding), highlight: true },
          { label: 'Total Recovered', value: formatCurrency(totalPaid) },
          { label: 'Active Entries', value: entries.filter(e => (e.totalAmount - (e.paidAmount || 0)) > 0).length },
        ].map((s, i) => (
          <div key={i} className="surface-card animate-fadeInUp" style={{
            padding: '18px 20px',
            animationDelay: `${i * 0.07}s`,
            border: s.highlight ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.03em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['pending', 'all', 'paid'].map(f => (
          <button
            key={f}
            id={`udhaari-filter-${f}`}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: filter === f ? 'rgba(255,255,255,0.2)' : 'var(--border)',
              background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === f ? 'var(--heading)' : 'var(--muted)',
              transition: 'all 0.2s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
          <p style={{ fontSize: 15, color: 'var(--subtle)' }}>
            {filter === 'pending' ? 'No pending udharis! All settled. 🎉' : 'No entries found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map((entry, i) => (
            <UdhaariCard
              key={entry._id}
              entry={entry}
              onMarkPaid={handleMarkPaid}
              onWhatsApp={handleWhatsApp}
            />
          ))}
        </div>
      )}

      {/* ── Add Udhaari Modal ─────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 20 }}>Add Udhaari Entry</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Customer Name *</label>
                <input className="input-field" required placeholder="e.g. Ramesh Kumar" id="udhaari-name"
                  value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input-field" type="tel" placeholder="10-digit mobile number" id="udhaari-phone"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">Items Bought</label>
                <input className="input-field" placeholder="e.g. Maggi x5, Bread x2" id="udhaari-items"
                  value={form.items} onChange={e => setForm({...form, items: e.target.value})} />
              </div>
              <div>
                <label className="label">Total Bill Amount (₹) *</label>
                <input className="input-field" required type="number" min="1" placeholder="0" id="udhaari-amount"
                  value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn-primary" disabled={saving} id="submit-udhaari" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Add Entry'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
