import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import img3 from '../assets/img3.png'
import logo from '../assets/logo.png'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

      {/* ── Navbar ─────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logo} alt="SellSmart" style={{ height: 38, width: 38, objectFit: 'contain' }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            Sell<span style={{ color: '#666' }}>Smart</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-secondary" id="home-signin-btn" style={{ fontSize: 13, padding: '8px 20px' }}>
                Sign In
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn-primary" id="home-getstarted-btn" style={{ fontSize: 13, padding: '8px 20px' }}>
                Get Started →
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button
              className="btn-primary"
              id="home-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              style={{ fontSize: 13, padding: '8px 20px' }}
            >
              Go to Dashboard →
            </button>
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>

        {/* Background image — right half */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img3})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          opacity: 0.35,
        }} />

        {/* Dark gradient overlay — stronger on left */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #0a0a0a 42%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.3) 100%)',
        }} />

        {/* Subtle noise texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
          opacity: 0.5,
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: 640,
          padding: '0 48px',
          marginTop: 80,
          animation: 'fadeInUp 0.7s ease both',
        }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#aaa', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#aaa', letterSpacing: '0.04em' }}>
              Intelligent Retail OS — Built for Bharat
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.07,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            marginBottom: 10,
          }}>
            Your Shop,
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #ffffff 0%, #888888 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Running Itself.
            </span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontSize: 18,
            color: '#777',
            marginBottom: 16,
            fontWeight: 400,
            lineHeight: 1.6,
          }}>
            Stop counting stock on paper. Stop forgetting who owes you.
          </p>
          <p style={{
            fontSize: 15,
            color: '#555',
            marginBottom: 40,
            lineHeight: 1.7,
            maxWidth: 500,
          }}>
            SellSmart gives you real-time inventory, daily sales tracking, digital udhaari ledger,
            and AI-powered demand prediction — all in one clean dashboard.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="btn-primary"
                  id="hero-start-btn"
                  style={{ fontSize: 15, padding: '13px 28px', borderRadius: 10 }}
                >
                  Start Free — No Card Needed →
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button
                className="btn-primary"
                id="hero-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                style={{ fontSize: 15, padding: '13px 28px', borderRadius: 10 }}
              >
                Open Dashboard →
              </button>
            </SignedIn>
            <button
              className="btn-secondary"
              id="hero-learn-btn"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontSize: 14, padding: '13px 24px', borderRadius: 10 }}
            >
              See Features
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 44 }}>
            <div style={{ display: 'flex', gap: -8 }}>
              {['S', 'R', 'K', 'A'].map((l, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `hsl(0,0%,${25 + i * 10}%)`,
                  border: '2px solid #0a0a0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  marginLeft: i > 0 ? -8 : 0,
                }}>
                  {l}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#555' }}>
              Trusted by shopkeepers across India
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────── */}
      <section id="features" style={{ padding: '80px 48px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: 12 }}>
            Everything You Need
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 52 }}>
            Run smarter. Sell faster. Worry less.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '📦', title: 'Live Inventory',
                desc: 'Track every item in real-time. Get low-stock alerts before you run out.',
              },
              {
                icon: '🧾', title: 'Sales Tracker',
                desc: 'Log sales instantly. See daily revenue and browse history by date.',
              },
              {
                icon: '🤝', title: 'Udhaari Ledger',
                desc: 'Digital khata for credit customers. Send WhatsApp reminders in one tap.',
              },
              {
                icon: '🤖', title: 'ML Demand Prediction',
                desc: 'AI tells you what to stock next month — so you never over or under-order.',
              },
              {
                icon: '📊', title: 'Weekly Analytics',
                desc: 'Bar charts, best-selling days, category breakdown — your business at a glance.',
              },
              {
                icon: '🧾', title: 'PDF Invoices',
                desc: 'Generate professional receipts instantly after every bulk sale.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="surface-card"
                style={{ padding: '24px 22px', animation: `fadeInUp 0.5s ease ${i * 0.07}s both` }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        padding: '36px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="SellSmart" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#555' }}>SellSmart</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#555' }}>
            For help, contact: <strong style={{ color: '#888' }}>Jitesh</strong> | Phone: <strong style={{ color: '#888' }}>+91 8295059893</strong>
          </p>
          <p style={{ fontSize: 12, color: '#555' }}>
            For queries, email: <a href="mailto:jiteshyadav3104@gmail.com" style={{ color: '#888', textDecoration: 'none' }}>jiteshyadav3104@gmail.com</a>
          </p>
        </div>

        <p style={{ fontSize: 12, color: '#444' }}>© {new Date().getFullYear()} SellSmart. All rights reserved.</p>
      </footer>
    </div>
  )
}
