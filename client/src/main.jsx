import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key — set VITE_CLERK_PUBLISHABLE_KEY in .env')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#0f0f0f',
          colorInputBackground: '#1a1a1a',
          colorInputText: '#e5e5e5',
          colorText: '#e5e5e5',
          colorTextSecondary: '#888888',
          colorNeutral: '#333333',
          borderRadius: '10px',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          card: { backgroundColor: '#111111', border: '1px solid #2a2a2a' },
          headerTitle: { color: '#ffffff' },
          formButtonPrimary: { backgroundColor: '#ffffff', color: '#000000' },
          footerActionLink: { color: '#aaaaaa' },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
