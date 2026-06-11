import { useEffect, useState } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate, formatDateInput } from '../utils/formatters'
import { generateInvoice } from '../utils/generatePDF'

export default function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [dateFilter, setDateFilter] = useState(formatDateInput())
  const [loading, setLoading] = useState(true)
  const [shopkeeper, setShopkeeper] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productId: '', qty: '', sellingPrice: '' })
  const today = formatDateInput()

  const loadSales = async (date) => {
    try {
      const res = await api.get(`/api/sales?date=${date}`)
      setSales(res.data.sales || [])
      setTodayTotal(res.data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadProducts = async () => {
    const res = await api.get('/api/products')
    setProducts(res.data)
  }

  const loadShopkeeper = async () => {
    try {
      const res = await api.get('/api/shopkeeper')
      setShopkeeper(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { loadProducts(); loadSales(dateFilter); loadShopkeeper() }, [])
  useEffect(() => { setLoading(true); loadSales(dateFilter) }, [dateFilter])

  const selectedProduct = products.find(p => p._id === form.productId)

  const handleLogSale = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/sales', {
        productId: form.productId,
        qty: Number(form.qty),
        sellingPrice: Number(form.sellingPrice),
        date: today,
      })
      setShowModal(false)
      setForm({ productId: '', qty: '', sellingPrice: '' })
      loadSales(dateFilter)
    } catch (err) { alert(err.response?.data?.message || 'Error logging sale') }
    finally { setSaving(false) }
  }

  const handleInvoice = (sale) => {
    generateInvoice({
      shopkeeper,
      items: [{ name: sale.productName || 'Product', qty: sale.qty, price: sale.sellingPrice }],
      date: sale.date,
      invoiceId: sale._id?.slice(-6).toUpperCase(),
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Sales Tracker</h2>
          <p className="section-sub">Log sales and track daily revenue</p>
        </div>
        <button className="btn-primary" id="log-sale-btn" onClick={() => setShowModal(true)}>
          + Log Sale
        </button>
      </div>

      {/* Date picker + summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="date"
          className="input-field"
          style={{ width: 180 }}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          id="sales-date-filter"
        />
        <div className="surface-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {dateFilter === today ? "Today's Revenue" : 'Revenue'}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.03em' }}>
              {formatCurrency(todayTotal)}
            </p>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transactions</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)' }}>{sales.length}</p>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="surface-card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading sales...</div>
        ) : sales.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
            <p style={{ fontSize: 15, color: 'var(--subtle)' }}>No sales on this date</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Click "Log Sale" to record a transaction</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty Sold</th>
                <th>Selling Price</th>
                <th>Revenue</th>
                <th>Time</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={s._id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <td style={{ fontWeight: 500, color: 'var(--heading)' }}>{s.productName}</td>
                  <td>{s.qty}</td>
                  <td style={{ color: 'var(--subtle)' }}>₹{s.sellingPrice}</td>
                  <td style={{ fontWeight: 600, color: 'var(--heading)' }}>{formatCurrency(s.qty * s.sellingPrice)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {new Date(s.createdAt || s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <button
                      className="btn-ghost"
                      id={`invoice-${s._id}`}
                      onClick={() => handleInvoice(s)}
                      style={{ fontSize: 12 }}
                    >
                      ↓ PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Log Sale Modal ────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 20 }}>Log a Sale</h3>
            <form onSubmit={handleLogSale} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Product *</label>
                <select className="input-field" required id="sale-product" value={form.productId}
                  onChange={e => {
                    const p = products.find(x => x._id === e.target.value)
                    setForm({ ...form, productId: e.target.value, sellingPrice: p?.sellingPrice || '' })
                  }}>
                  <option value="">Select a product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Quantity *</label>
                  <input className="input-field" required type="number" min="1" id="sale-qty"
                    max={selectedProduct?.stock || undefined}
                    placeholder="1" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} />
                </div>
                <div>
                  <label className="label">Selling Price (₹) *</label>
                  <input className="input-field" required type="number" min="0" id="sale-price"
                    placeholder="0" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} />
                </div>
              </div>
              {form.qty && form.sellingPrice && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--subtle)' }}>
                    Total: <strong style={{ color: 'var(--heading)', fontSize: 15 }}>
                      {formatCurrency(Number(form.qty) * Number(form.sellingPrice))}
                    </strong>
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn-primary" disabled={saving} id="submit-sale" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Log Sale'}
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
