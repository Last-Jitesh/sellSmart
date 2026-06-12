import { useEffect, useState } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate, formatDateInput } from '../utils/formatters'
import { generateInvoice } from '../utils/generatePDF'

const emptyItem = { productId: '', qty: '', sellingPrice: '' }

export default function Sales() {
  const [products, setProducts]       = useState([])
  const [sales, setSales]             = useState([])
  const [todayTotal, setTodayTotal]   = useState(0)
  const [dateFilter, setDateFilter]   = useState(formatDateInput())
  const [loading, setLoading]         = useState(true)
  const [shopkeeper, setShopkeeper]   = useState({})
  const [showModal, setShowModal]     = useState(false)
  const [saving, setSaving]           = useState(false)

  // Bill form state
  const [customerName, setCustomerName]   = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [billItems, setBillItems]         = useState([{ ...emptyItem }])
  const [isPaid, setIsPaid]               = useState(true)

  const today = formatDateInput()

  // ── Data loaders ────────────────────────────────────────────────
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

  // ── Bill item helpers ────────────────────────────────────────────
  const updateItem = (index, field, value) => {
    const updated = [...billItems]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-fill selling price when product is selected
    if (field === 'productId') {
      const p = products.find(x => x._id === value)
      updated[index].sellingPrice = p?.sellingPrice || ''
    }
    setBillItems(updated)
  }

  const addItem = () => setBillItems([...billItems, { ...emptyItem }])

  const removeItem = (index) => {
    if (billItems.length === 1) return
    setBillItems(billItems.filter((_, i) => i !== index))
  }

  const billTotal = billItems.reduce((sum, item) => {
    const qty   = Number(item.qty) || 0
    const price = Number(item.sellingPrice) || 0
    return sum + qty * price
  }, 0)

  const resetForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setBillItems([{ ...emptyItem }])
    setIsPaid(true)
    setShowModal(false)
  }

  // ── Submit bill ──────────────────────────────────────────────────
  const handleLogSale = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        customerName,
        customerPhone,
        isPaid,
        date: today,
        items: billItems.map(i => ({
          productId:    i.productId,
          qty:          Number(i.qty),
          sellingPrice: Number(i.sellingPrice),
        })),
      }
      await api.post('/api/sales', payload)
      resetForm()
      loadSales(dateFilter)
    } catch (err) { alert(err.response?.data?.message || 'Error logging sale') }
    finally { setSaving(false) }
  }

  // ── Invoice helper ───────────────────────────────────────────────
  const handleInvoice = (sale) => {
    // Support both new bill format and legacy single-item
    const items = sale.items && sale.items.length > 0
      ? sale.items.map(i => ({ name: i.productName, qty: i.qty, price: i.sellingPrice }))
      : [{ name: sale.productName || 'Product', qty: sale.qty, price: sale.sellingPrice }]

    generateInvoice({
      shopkeeper,
      customerName: sale.customerName || '',
      items,
      date: sale.date,
      invoiceId: sale._id?.slice(-6).toUpperCase(),
    })
  }

  const handleWhatsApp = (sale) => {
    const d = getSaleDisplay(sale)
    const itemsList = sale.items?.length > 0
      ? sale.items.map(i => `  • ${i.productName} x${i.qty} = Rs.${i.qty * i.sellingPrice}`).join('\n')
      : `  • ${sale.productName} x${sale.qty} = Rs.${sale.qty * sale.sellingPrice}`

    const msg = encodeURIComponent(
      `Hello ${sale.customerName || 'Customer'} 🙏\n\n` +
      `*Bill from ${shopkeeper.shopName || 'Our Shop'}*\n` +
      `Date: ${sale.date}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Total: Rs.${d.revenue}*\n\n` +
      `Thank you for your purchase! 🛍️\n— SellSmart`
    )
    const phone = sale.customerPhone || ''
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank')
  }

  // ── Helpers for display ──────────────────────────────────────────
  const getSaleDisplay = (sale) => {
    if (sale.items && sale.items.length > 0) {
      return {
        description: sale.items.map(i => `${i.productName} ×${i.qty}`).join(', '),
        revenue: sale.totalAmount || 0,
        customer: sale.customerName || '—',
        multiItem: true,
      }
    }
    return {
      description: sale.productName,
      revenue: (sale.qty || 0) * (sale.sellingPrice || 0),
      customer: '—',
      multiItem: false,
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Sales Tracker</h2>
          <p className="section-sub">Create customer bills and track daily revenue</p>
        </div>
        <button className="btn-primary" id="log-sale-btn" onClick={() => setShowModal(true)}>
          + New Bill
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
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bills</p>
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
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Click "New Bill" to record a transaction</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Invoice</th>
                <th>Whatsapp</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => {
                const d = getSaleDisplay(s)
                return (
                  <tr key={s._id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td style={{ fontWeight: 500, color: 'var(--heading)' }}>{d.customer}</td>
                    <td style={{ color: 'var(--subtle)', fontSize: 13, maxWidth: 240 }}>{d.description}</td>
                    <td style={{ fontWeight: 600, color: 'var(--heading)' }}>{formatCurrency(d.revenue)}</td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: s.isPaid === false ? 'rgba(255,80,80,0.12)' : 'rgba(80,255,120,0.12)',
                        color: s.isPaid === false ? '#ff6060' : '#50c878',
                      }}>
                        {s.isPaid === false ? 'Udhaari' : 'Paid'}
                      </span>
                    </td>
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
                    <td>
                      <button
                        className="btn-ghost"
                        onClick={() => handleWhatsApp(s)}
                        style={{ fontSize: 12, color: '#25D366' }}
                        disabled={!s.customerPhone}
                        title={!s.customerPhone ? 'No phone number' : 'Send bill on WhatsApp'}
                      >
                        📲 WA
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── New Bill Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 540, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 20 }}>
              New Customer Bill
            </h3>

            <form onSubmit={handleLogSale} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Customer details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Customer Name</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Ramesh"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Phone No.</label>
                  <input
                    className="input-field"
                    placeholder="10-digit number"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Items
                </p>

                {billItems.map((item, idx) => {
                  const selectedProduct = products.find(p => p._id === item.productId)
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 }}>
                      {/* Product select */}
                      <div style={{ flex: 2 }}>
                        {idx === 0 && <label className="label">Product *</label>}
                        <select
                          className="input-field"
                          required
                          value={item.productId}
                          onChange={e => updateItem(idx, 'productId', e.target.value)}
                        >
                          <option value="">Select product</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
                          ))}
                        </select>
                      </div>

                      {/* Qty */}
                      <div style={{ flex: 1 }}>
                        {idx === 0 && <label className="label">Qty *</label>}
                        <input
                          className="input-field"
                          required
                          type="number"
                          min="1"
                          max={selectedProduct?.stock || undefined}
                          placeholder="1"
                          value={item.qty}
                          onChange={e => updateItem(idx, 'qty', e.target.value)}
                        />
                      </div>

                      {/* Price */}
                      <div style={{ flex: 1 }}>
                        {idx === 0 && <label className="label">Price (₹) *</label>}
                        <input
                          className="input-field"
                          required
                          type="number"
                          min="0"
                          placeholder="0"
                          value={item.sellingPrice}
                          onChange={e => updateItem(idx, 'sellingPrice', e.target.value)}
                        />
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          color: 'var(--muted)',
                          borderRadius: 6,
                          width: 34,
                          height: 38,
                          cursor: billItems.length === 1 ? 'not-allowed' : 'pointer',
                          fontSize: 16,
                          opacity: billItems.length === 1 ? 0.3 : 1,
                          flexShrink: 0,
                        }}
                        disabled={billItems.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addItem}
                  style={{ fontSize: 13, padding: '7px 14px', marginTop: 2 }}
                >
                  + Add Item
                </button>
              </div>

              {/* Bill total preview */}
              {billTotal > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--subtle)' }}>Bill Total</span>
                  <strong style={{ fontSize: 18, color: 'var(--heading)' }}>{formatCurrency(billTotal)}</strong>
                </div>
              )}

              {/* Payment status */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: `1px solid ${isPaid ? '#50c878' : 'var(--border)'}`,
                    background: isPaid ? 'rgba(80,200,120,0.1)' : 'transparent',
                    color: isPaid ? '#50c878' : 'var(--muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ✓ Paid
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: `1px solid ${!isPaid ? '#ff6060' : 'var(--border)'}`,
                    background: !isPaid ? 'rgba(255,80,80,0.1)' : 'transparent',
                    color: !isPaid ? '#ff6060' : 'var(--muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Udhaari (Unpaid)
                </button>
              </div>

              {!isPaid && (
                <p style={{ fontSize: 12, color: '#ff9060', marginTop: -8 }}>
                  ⚠️ This will automatically add an entry to the Udhaari ledger.
                </p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  id="submit-sale"
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : isPaid ? 'Save Bill' : 'Save & Add to Udhaari'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}