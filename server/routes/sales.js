import express from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import Udhaari from '../models/Udhaari.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)

// GET sales for a date (or date range)
// ?date=YYYY-MM-DD  OR  ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const { date, from, to } = req.query
    let query = { userId: req.userId }

    if (date) {
      query.date = date
    } else if (from && to) {
      query.date = { $gte: from, $lte: to }
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 })

    // Compute total — works for both legacy and new bill format
    const total = sales.reduce((s, sale) => {
      if (sale.items && sale.items.length > 0) {
        return s + (sale.totalAmount || 0)
      }
      return s + (sale.qty * sale.sellingPrice || 0)
    }, 0)

    res.json({ sales, total })
  } catch (err) { next(err) }
})

// POST /api/sales — log a multi-item bill
// Body: {
//   customerName, customerPhone,
//   items: [{ productId, qty, sellingPrice }],
//   isPaid: true/false,
//   date: 'YYYY-MM-DD'
// }
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerPhone, items, isPaid, date } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    const today = date || new Date().toISOString().split('T')[0]
    const resolvedItems = []
    let totalAmount = 0

    // Validate and decrement stock for each item
    for (const item of items) {
      const { productId, qty, sellingPrice } = item
      if (!productId || !qty || !sellingPrice) {
        return res.status(400).json({ message: 'Each item needs productId, qty and sellingPrice' })
      }

      const product = await Product.findOne({ _id: productId, userId: req.userId })
      if (!product) return res.status(404).json({ message: `Product not found: ${productId}` })
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}" (available: ${product.stock})` })
      }

      product.stock -= Number(qty)
      await product.save()

      resolvedItems.push({
        productId,
        productName: product.name,
        qty: Number(qty),
        sellingPrice: Number(sellingPrice),
      })
      totalAmount += Number(qty) * Number(sellingPrice)
    }

    // Create the sale/bill
    const sale = await Sale.create({
      items: resolvedItems,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      totalAmount,
      isPaid: isPaid !== false,   // default true
      date: today,
      userId: req.userId,
    })

    // If unpaid → auto-create Udhaari entry
    if (!isPaid) {
      const itemsSummary = resolvedItems.map(i => `${i.productName} x${i.qty}`).join(', ')
      await Udhaari.create({
        customerName: customerName || 'Unknown Customer',
        phone: customerPhone || '',
        items: itemsSummary,
        totalAmount,
        paidAmount: 0,
        userId: req.userId,
      })
    }

    res.status(201).json(sale)
  } catch (err) { next(err) }
})

// GET monthly sales aggregated per product (for ML)
router.get('/monthly-by-product', async (req, res, next) => {
  try {
    const now = new Date()
    const year  = req.query.year  || now.getFullYear()
    const month = req.query.month || (now.getMonth() + 1)

    const monthStr = String(month).padStart(2, '0')
    const from = `${year}-${monthStr}-01`
    const daysInMonth = new Date(year, month, 0).getDate()
    const to = `${year}-${monthStr}-${daysInMonth}`

    const sales = await Sale.find({ userId: req.userId, date: { $gte: from, $lte: to } })

    const map = {}
    sales.forEach(s => {
      // Handle both legacy and new bill format
      const lineItems = s.items && s.items.length > 0
        ? s.items
        : [{ productId: s.productId, productName: s.productName, qty: s.qty }]

      lineItems.forEach(item => {
        const key = String(item.productId)
        if (!map[key]) map[key] = { productId: key, productName: item.productName, totalQty: 0 }
        map[key].totalQty += item.qty
      })
    })

    res.json(Object.values(map))
  } catch (err) { next(err) }
})

// GET historical sales for ML training
router.get('/historical', async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6
    const now = new Date()
    const records = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const monthStr = String(month).padStart(2, '0')
      const from = `${year}-${monthStr}-01`
      const daysInMonth = new Date(year, month, 0).getDate()
      const to = `${year}-${monthStr}-${daysInMonth}`

      const sales = await Sale.find({ userId: req.userId, date: { $gte: from, $lte: to } })

      const map = {}
      sales.forEach(s => {
        const lineItems = s.items && s.items.length > 0
          ? s.items
          : [{ productId: s.productId, productName: s.productName, qty: s.qty }]

        lineItems.forEach(item => {
          const key = String(item.productId)
          if (!map[key]) map[key] = { productId: key, productName: item.productName, qty: 0, month, year }
          map[key].qty += item.qty
        })
      })

      records.push(...Object.values(map))
    }

    res.json(records)
  } catch (err) { next(err) }
})

export default router