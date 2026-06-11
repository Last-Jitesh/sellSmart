import { useEffect, useState } from 'react'
import LowStockBanner from '../components/LowStockBanner'
import api from '../utils/api'

const CATEGORIES = ['General', 'Food & Beverages', 'Stationery', 'Electronics', 'Clothing', 'Household', 'Other']

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'General', stock: '', costPrice: '', sellingPrice: '', threshold: 5 })
  const [stockQty, setStockQty] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/api/products')
      setProducts(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const lowStock = products.filter(p => p.stock <= p.threshold)
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/products', form)
      setShowAddModal(false)
      setForm({ name: '', category: 'General', stock: '', costPrice: '', sellingPrice: '', threshold: 5 })
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error adding product') }
    finally { setSaving(false) }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/api/products/${selectedProduct._id}/add-stock`, { qty: Number(stockQty) })
      setShowStockModal(false)
      setStockQty('')
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const stockLevel = (p) => {
    if (p.stock <= p.threshold) return 'low'
    if (p.stock <= p.threshold * 2) return 'medium'
    return 'good'
  }

  const stockColor = { low: '#555', medium: '#666', good: '#888' }

  return (
    <div>
      <LowStockBanner items={lowStock} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Inventory</h2>
          <p className="section-sub">{products.length} products tracked</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input-field"
            style={{ width: 220 }}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="inventory-search"
          />
          <button className="btn-primary" id="add-product-btn" onClick={() => setShowAddModal(true)}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="surface-card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 15, color: 'var(--subtle)' }}>No products found</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Add your first product to get started</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const level = stockLevel(p)
                return (
                  <tr key={p._id} className={level === 'low' ? 'low-stock-row' : ''} style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontWeight: 500, color: 'var(--heading)' }}>
                      {level === 'low' && <span className="low-stock-dot" style={{ marginRight: 8 }} />}
                      {p.name}
                    </td>
                    <td><span className="badge badge-dark">{p.category || 'General'}</span></td>
                    <td style={{ fontWeight: 700, fontSize: 15, color: level === 'low' ? '#888' : 'var(--heading)' }}>
                      {p.stock}
                    </td>
                    <td style={{ color: 'var(--subtle)' }}>₹{p.costPrice || '—'}</td>
                    <td style={{ color: 'var(--text)' }}>₹{p.sellingPrice || '—'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: level === 'low' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                          color: level === 'low' ? '#666' : '#999',
                        }}
                      >
                        {level === 'low' ? '⚠ Low' : level === 'medium' ? 'Medium' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-ghost"
                        id={`add-stock-${p._id}`}
                        onClick={() => { setSelectedProduct(p); setShowStockModal(true) }}
                        style={{ fontSize: 12 }}
                      >
                        + Add Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Product Modal ─────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 20 }}>Add New Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Product Name *</label>
                <input className="input-field" required placeholder="e.g. Maggi Noodles" id="new-product-name"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" id="new-product-category"
                    value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Initial Stock *</label>
                  <input className="input-field" required type="number" min="0" placeholder="0" id="new-product-stock"
                    value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Cost Price (₹)</label>
                  <input className="input-field" type="number" min="0" placeholder="0" id="new-product-cost"
                    value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} />
                </div>
                <div>
                  <label className="label">Selling Price (₹)</label>
                  <input className="input-field" type="number" min="0" placeholder="0" id="new-product-sell"
                    value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Low Stock Threshold</label>
                <input className="input-field" type="number" min="1" id="new-product-threshold"
                  value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn-primary" disabled={saving} id="submit-add-product" style={{ flex: 1 }}>
                  {saving ? 'Adding...' : 'Add Product'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Stock Modal ───────────────────────────── */}
      {showStockModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>Add Stock</h3>
            <p style={{ fontSize: 13, color: 'var(--subtle)', marginBottom: 20 }}>
              {selectedProduct.name} — Current stock: <strong style={{ color: 'var(--text)' }}>{selectedProduct.stock}</strong>
            </p>
            <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Quantity to Add *</label>
                <input className="input-field" required type="number" min="1" placeholder="e.g. 50"
                  id="add-stock-qty" value={stockQty} onChange={e => setStockQty(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={saving} id="submit-add-stock" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Add Stock'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowStockModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
