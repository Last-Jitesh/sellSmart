import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'

import productRoutes from './routes/products.js'
import salesRoutes from './routes/sales.js'
import udhaariRoutes from './routes/udhaari.js'
import analyticsRoutes from './routes/analytics.js'
import mlRoutes from './routes/ml.js'
import shopkeeperRoutes from './routes/shopkeeper.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ─────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://sellsmart-india.vercel.app'],
  credentials: true,
}))

app.use(express.json())
app.use(morgan('dev'))
app.use(clerkMiddleware())


// ── Routes ─────────────────────────────────────────
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/udhaari', udhaariRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/ml', mlRoutes)
app.use('/api/shopkeeper', shopkeeperRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

// ── Error handler ──────────────────────────────────
app.use(errorHandler)

// ── DB + Start ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sellsmart')
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

// Trigger nodemon restart
