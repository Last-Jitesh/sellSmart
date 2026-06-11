import { useEffect, useState } from 'react'
import api from '../utils/api'

const RESTOCK_STYLE = {
  'Stock More': { label: '↑ Stock More', bg: 'rgba(255,255,255,0.12)', color: '#fff' },
  'Stock Same': { label: '= Stock Same', bg: 'rgba(160,160,160,0.1)', color: '#aaa' },
  'Stock Less': { label: '↓ Stock Less', bg: 'rgba(80,80,80,0.15)', color: '#666' },
}

export default function MLReport() {
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/ml/predict')
      setReport(res.data || [])
      setGenerated(true)
    } catch (e) {
      setError(e.response?.data?.message || 'ML service unavailable. Make sure the FastAPI service is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const nextMonthName = nextMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">ML Bestseller Report</h2>
          <p className="section-sub">AI-powered demand prediction for {nextMonthName}</p>
        </div>
        <button
          className="btn-primary"
          id="generate-ml-btn"
          onClick={generate}
          disabled={loading}
          style={{ minWidth: 160 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Predicting...
            </span>
          ) : '🤖 Generate Report'}
        </button>
      </div>

      {/* How it works cards */}
      {!generated && !loading && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
            {[
              {
                step: '01', title: 'Linear Regression',
                desc: 'Analyzes your past monthly sales data per product and predicts the quantity expected to sell next month.',
                icon: '📈',
              },
              {
                step: '02', title: 'Decision Tree Classifier',
                desc: 'Compares predicted demand vs. current stock and classifies each product into Stock More, Stock Same, or Stock Less.',
                icon: '🌳',
              },
              {
                step: '03', title: 'Actionable Report',
                desc: 'Products sorted by sales volume. Know exactly what to order before the new month begins.',
                icon: '📋',
              },
            ].map((c, i) => (
              <div key={i} className="surface-card animate-fadeInUp" style={{ padding: '22px 20px', animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em' }}>STEP {c.step}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="alert-banner alert-info">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Click "Generate Report" to run the ML models on your sales data. Requires at least 2 months of sales history per product.
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #333', color: '#888', fontSize: 13, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Report Table */}
      {generated && report.length > 0 && (
        <div className="animate-fadeInUp">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: 'var(--subtle)' }}>
              {report.length} products analyzed · Sorted by quantity sold
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(RESTOCK_STYLE).map(([k, v]) => (
                <span key={k} className="badge" style={{ background: v.bg, color: v.color, fontSize: 11 }}>{v.label}</span>
              ))}
            </div>
          </div>

          <div className="surface-card" style={{ overflow: 'hidden', padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Sold This Month</th>
                  <th>Predicted Demand</th>
                  <th>Current Stock</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, i) => {
                  const rs = RESTOCK_STYLE[r.recommendation] || RESTOCK_STYLE['Stock Same']
                  return (
                    <tr key={r.productId || i}>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.productName}</td>
                      <td><span className="badge badge-dark">{r.category || '—'}</span></td>
                      <td style={{ fontWeight: 500 }}>{r.qtySoldThisMonth}</td>
                      <td style={{ fontWeight: 700, color: 'var(--heading)' }}>{Math.round(r.predictedQty)}</td>
                      <td style={{ color: 'var(--subtle)' }}>{r.currentStock}</td>
                      <td>
                        <span className="badge" style={{ background: rs.bg, color: rs.color }}>{rs.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {generated && report.length === 0 && !error && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <p style={{ fontSize: 15, color: 'var(--subtle)' }}>Not enough sales history</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Record at least 2 months of sales to generate predictions.</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
