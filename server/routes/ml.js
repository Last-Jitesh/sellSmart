import express from 'express'
import axios from 'axios'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

// POST /api/ml/predict
// Collects last 6 months of data and sends to FastAPI ML service
router.post('/predict', async (req, res, next) => {
  try {
    const months = 6
    const now = new Date()
    const records = []

    // Collect historical sales per product per month
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year  = d.getFullYear()
      const month = d.getMonth() + 1
      const monthStr = String(month).padStart(2, '0')
      const from = `${year}-${monthStr}-01`
      const daysInMonth = new Date(year, month, 0).getDate()
      const to   = `${year}-${monthStr}-${daysInMonth}`

      const sales = await Sale.find({ userId: req.userId, date: { $gte: from, $lte: to } })
      const map = {}
      sales.forEach(s => {
        const key = String(s.productId)
        if (!map[key]) map[key] = { productId: key, productName: s.productName, qty: 0, month, year }
        map[key].qty += s.qty
      })
      records.push(...Object.values(map))
    }

    if (!records.length) {
      return res.json([])
    }

    // Get current stock for each product
    const productIds = [...new Set(records.map(r => r.productId))]
    const products = await Product.find({ _id: { $in: productIds }, userId: req.userId })
    const stockMap = {}
    const catMap   = {}
    products.forEach(p => {
      stockMap[String(p._id)] = p.stock
      catMap[String(p._id)]   = p.category || 'General'
    })

    // Attach stock + category to records
    const enriched = records.map(r => ({
      ...r,
      currentStock: stockMap[r.productId] ?? 0,
      category: catMap[r.productId] || 'General',
    }))

    // Send to FastAPI
    const mlRes = await axios.post(`${ML_URL}/predict`, { records: enriched })
    res.json(mlRes.data)
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service is not running. Start FastAPI on port 8000.' })
    }
    next(err)
  }
})

export default router
