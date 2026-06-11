import { useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'

const pageNames = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/sales': 'Sales Tracker',
  '/udhaari': 'Udhaari Ledger',
  '/ml-report': 'ML Bestseller Report',
  '/analytics': 'Weekly Analytics',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const title = pageNames[pathname] || 'SellSmart'

  return (
    <header
      style={{
        height: 62,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--heading)', letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 34, height: 34 },
            },
          }}
        />
      </div>
    </header>
  )
}
