export default function LowStockBanner({ items = [] }) {
  if (!items.length) return null

  return (
    <div className="alert-banner alert-warning animate-fadeInUp" style={{ marginBottom: 20 }}>
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>
        <strong>Low Stock Alert:</strong>{' '}
        {items.map((i) => i.name).join(', ')} {items.length === 1 ? 'is' : 'are'} running low. Restock soon.
      </span>
    </div>
  )
}
