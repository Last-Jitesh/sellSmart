import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const GREY_SHADES = ['#ffffff', '#aaaaaa', '#666666', '#3a3a3a', '#1e1e1e']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: 'var(--text)', fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: 'var(--subtle)' }}>₹{Number(d.value).toLocaleString('en-IN')}</p>
    </div>
  )
}

export default function CategoryPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: 13 }}>
        No category data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="revenue"
          nameKey="category"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={GREY_SHADES[index % GREY_SHADES.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: 'var(--subtle)', fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
