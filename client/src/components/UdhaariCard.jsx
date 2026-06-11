import { formatCurrency, formatDate } from '../utils/formatters'

export default function UdhaariCard({ entry, onMarkPaid, onWhatsApp }) {
  const outstanding = (entry.totalAmount || 0) - (entry.paidAmount || 0)
  const isPaid = outstanding <= 0

  return (
    <div
      className="surface-card animate-fadeInUp"
      style={{ padding: '18px 20px', opacity: isPaid ? 0.5 : 1 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {/* Left — customer info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'var(--accent)',
              flexShrink: 0,
            }}>
              {entry.customerName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--heading)', fontSize: 14 }}>{entry.customerName}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{entry.phone || 'No phone'}</p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--subtle)', marginBottom: 4 }}>
            Items: <span style={{ color: 'var(--text)' }}>{entry.items || '—'}</span>
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>Added: {formatDate(entry.createdAt)}</p>
        </div>

        {/* Right — amount */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Outstanding</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: isPaid ? 'var(--muted)' : 'var(--heading)', letterSpacing: '-0.02em' }}>
            {formatCurrency(outstanding)}
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            of {formatCurrency(entry.totalAmount)}
          </p>

          {isPaid && (
            <span className="badge badge-grey" style={{ marginTop: 8 }}>Paid</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isPaid && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-primary"
            style={{ fontSize: 12, padding: '7px 14px' }}
            onClick={() => onMarkPaid(entry._id)}
            id={`mark-paid-${entry._id}`}
          >
            ✓ Mark Paid
          </button>
          {entry.phone && (
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: '7px 14px' }}
              onClick={() => onWhatsApp(entry)}
              id={`whatsapp-${entry._id}`}
            >
              📲 WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  )
}
