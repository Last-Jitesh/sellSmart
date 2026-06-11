import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

export default function Settings() {
  const [profile, setProfile] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    gstNumber: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/api/shopkeeper')
      .then(res => {
        setProfile({
          shopName: res.data.shopName || '',
          ownerName: res.data.ownerName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          gstNumber: res.data.gstNumber || ''
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await api.patch('/api/shopkeeper', profile)
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Shop Settings</h1>
        
        {message && (
          <div style={{ 
            padding: 12, marginBottom: 20, borderRadius: 8, 
            background: message.includes('Failed') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
            color: message.includes('Failed') ? '#ff6b6b' : '#4ade80',
            border: `1px solid ${message.includes('Failed') ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)'}`
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#888' }}>Loading settings...</p>
        ) : (
          <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSave}>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
              These details will be printed on the header of all your PDF invoices.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Shop Name</label>
              <input
                name="shopName"
                value={profile.shopName}
                onChange={handleChange}
                placeholder="e.g. Sharma General Store"
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Owner Name</label>
              <input
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Sharma"
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Phone Number</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="e.g. Shop No. 4, Main Market, Delhi"
                rows={3}
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>GST Number (Optional)</label>
              <input
                name="gstNumber"
                value={profile.gstNumber}
                onChange={handleChange}
                placeholder="e.g. 22AAAAA0000A1Z5"
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12, justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
