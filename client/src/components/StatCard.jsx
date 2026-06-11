export default function StatCard({ label, value, sub, icon, delay = 0 }) {
  return (
    <div
      className="surface-card animate-fadeInUp"
      style={{
        padding: '20px 22px',
        animationDelay: `${delay}s`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 90,
          height: 90,
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {label}
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 6 }}>{sub}</p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--subtle)',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
