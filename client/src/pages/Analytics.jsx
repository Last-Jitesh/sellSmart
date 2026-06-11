import { useEffect, useState } from 'react'
import SalesChart from '../components/SalesChart'
import CategoryPieChart from '../components/CategoryPieChart'
import StatCard from '../components/StatCard'
import api from '../utils/api'
import { formatCurrency, formatDateInput } from '../utils/formatters'

export default function Analytics() {
  const [weeklyData, setWeeklyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('bar')
  const [range, setRange] = useState({
    from: formatDateInput(new Date(Date.now() - 30 * 86400000)),
    to: formatDateInput(),
  })

  const load = async () => {
    setLoading(true)
    try {
      const [weekRes, catRes] = await Promise.all([
        api.get(`/api/analytics/weekly?from=${range.from}&to=${range.to}`),
        api.get(`/api/analytics/categories?from=${range.from}&to=${range.to}`),
      ])
      setWeeklyData(weekRes.data.weekly || [])
      setSummary(weekRes.data.summary || {})
      setCategoryData(catRes.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Weekly Analytics</h2>
          <p className="section-sub">Revenue trends and category breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="input-field" style={{ width: 160 }} id="analytics-from"
            value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>to</span>
          <input type="date" className="input-field" style={{ width: 160 }} id="analytics-to"
            value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} />
          <button className="btn-primary" id="apply-range-btn" onClick={load} style={{ padding: '9px 18px', fontSize: 13 }}>
            Apply
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 26 }}>
        <StatCard label="Total Revenue" value={formatCurrency(summary.totalRevenue)} sub="In selected range" delay={0.0}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        <StatCard label="Avg Daily Earnings" value={formatCurrency(summary.avgDaily)} sub="Per day average" delay={0.07}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        <StatCard label="Best Selling Day" value={summary.bestDay || '—'} sub={summary.bestDayRevenue ? formatCurrency(summary.bestDayRevenue) : ''} delay={0.14}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
        <StatCard label="Total Transactions" value={summary.totalTxns || 0} sub="Sales logged" delay={0.21}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Weekly bar/line chart */}
        <div className="surface-card animate-fadeInUp" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>Revenue Over Time</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['bar', 'line'].map(t => (
                <button
                  key={t}
                  id={`chart-type-${t}`}
                  onClick={() => setChartType(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: chartType === t ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    background: chartType === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: chartType === t ? '#fff' : 'var(--muted)',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading chart...</div>
          ) : (
            <SalesChart data={weeklyData} type={chartType} />
          )}
        </div>

        {/* Category pie */}
        <div className="surface-card animate-fadeInUp" style={{ padding: '22px 20px', animationDelay: '0.1s' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)', marginBottom: 18 }}>By Category</p>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading...</div>
          ) : (
            <CategoryPieChart data={categoryData} />
          )}
        </div>
      </div>

      {/* Category revenue table */}
      {categoryData.length > 0 && (
        <div className="surface-card animate-fadeInUp" style={{ overflow: 'hidden', padding: 0, animationDelay: '0.2s' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>Category Breakdown</p>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Transactions</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((c, i) => {
                const totalRev = categoryData.reduce((s, x) => s + x.revenue, 0)
                const share = totalRev ? ((c.revenue / totalRev) * 100).toFixed(1) : 0
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--heading)' }}>{c.category}</td>
                    <td style={{ fontWeight: 700, color: 'var(--heading)' }}>{formatCurrency(c.revenue)}</td>
                    <td style={{ color: 'var(--subtle)' }}>{c.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, maxWidth: 100 }}>
                          <div style={{ width: `${share}%`, height: '100%', background: '#555', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--subtle)', width: 36 }}>{share}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
