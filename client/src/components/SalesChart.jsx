import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: 'var(--subtle)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: '#e5e5e5', fontWeight: 600 }}>
          ₹{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

export default function SalesChart({ data = [], type = 'bar' }) {
  if (!data.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--muted)', fontSize: 13 }}>
        No earnings data yet
      </div>
    )
  }

  const ChartComponent = type === 'line' ? LineChart : BarChart

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ChartComponent data={data} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        {type === 'line' ? (
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#ffffff"
            strokeWidth={2}
            dot={{ fill: '#888', r: 3 }}
            activeDot={{ r: 5, fill: '#fff' }}
          />
        ) : (
          <Bar dataKey="earnings" fill="#3a3a3a" radius={[4, 4, 0, 0]} />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}
