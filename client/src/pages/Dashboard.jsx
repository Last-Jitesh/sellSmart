import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import StatCard from '../components/StatCard'
import LowStockBanner from '../components/LowStockBanner'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, invRes] = await Promise.all([
          api.get('/api/analytics/dashboard-stats'),
          api.get('/api/products'),
        ])
        setStats(statsRes.data)
        setLowStock(invRes.data.filter(p => p.stock <= p.threshold))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const quickLinks = [
    { label: 'Add Stock', path: '/inventory', icon: '📦', desc: 'Update inventory levels' },
    { label: 'Log Sale', path: '/sales', icon: '🧾', desc: 'Record today\'s sales' },
    { label: 'Add Udhaari', path: '/udhaari', icon: '🤝', desc: 'Add credit entry' },
    { label: 'ML Report', path: '/ml-report', icon: '🤖', desc: 'View demand predictions' },
    { label: 'Analytics', path: '/analytics', icon: '📊', desc: 'Weekly earnings chart' },
  ]

  return (
    <div>
      {/* Greeting */}
      <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', letterSpacing: '-0.03em' }}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
          Here's a snapshot of your shop today.
        </p>
      </div>

      {/* Low stock banner */}
      <LowStockBanner items={lowStock} />

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="surface-card" style={{ height: 100, background: 'linear-gradient(90deg,#161616,#1e1e1e,#161616)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(stats?.todayRevenue || 0)}
            sub="Sales logged today"
            delay={0.0}
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <StatCard
            label="Total Products"
            value={stats?.totalProducts || 0}
            sub="In inventory"
            delay={0.07}
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
          />
          <StatCard
            label="Pending Udhaari"
            value={formatCurrency(stats?.pendingUdhaari || 0)}
            sub="Outstanding credit"
            delay={0.14}
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard
            label="Monthly Revenue"
            value={formatCurrency(stats?.monthRevenue || 0)}
            sub="This month"
            delay={0.21}
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 8 }}>
        <p className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {quickLinks.map((q, i) => (
            <button
              key={q.path}
              id={`quick-${q.label.toLowerCase().replace(/\s/g,'-')}`}
              onClick={() => navigate(q.path)}
              className="surface-card"
              style={{
                padding: '18px 16px',
                textAlign: 'left',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                background: 'var(--card)',
                borderRadius: 12,
                animation: `fadeInUp 0.4s ease ${0.3 + i * 0.06}s both`,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{q.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)' }}>{q.label}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{q.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
