import express from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
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
      // Use regex range on the YYYY-MM-DD string
      query.date = { $gte: from, $lte: to }
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 })
    const total = sales.reduce((s, sale) => s + sale.qty * sale.sellingPrice, 0)
    res.json({ sales, total })
  } catch (err) { next(err) }
})

// POST log a sale — decrements stock automatically
router.post('/', async (req, res, next) => {
  try {
    const { productId, qty, sellingPrice, date } = req.body
    if (!productId || !qty || !sellingPrice) {
      return res.status(400).json({ message: 'productId, qty and sellingPrice are required' })
    }

    // Check product belongs to user and has enough stock
    const product = await Product.findOne({ _id: productId, userId: req.userId })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.stock < qty) return res.status(400).json({ message: `Insufficient stock (available: ${product.stock})` })

    // Decrement stock
    product.stock -= Number(qty)
    await product.save()

    // Create sale record
    const sale = await Sale.create({
      productId,
      productName: product.name,
      qty: Number(qty),
      sellingPrice: Number(sellingPrice),
      date: date || new Date().toISOString().split('T')[0],
      userId: req.userId,
    })

    res.status(201).json(sale)
  } catch (err) { next(err) }
})

// GET monthly sales aggregated per product (for ML)
// ?month=6&year=2025
router.get('/monthly-by-product', async (req, res, next) => {
  try {
    const now = new Date()
    const year  = req.query.year  || now.getFullYear()
    const month = req.query.month || (now.getMonth() + 1)

    // Date range for that month
    const monthStr = String(month).padStart(2, '0')
    const from = `${year}-${monthStr}-01`
    const daysInMonth = new Date(year, month, 0).getDate()
    const to = `${year}-${monthStr}-${daysInMonth}`

    const sales = await Sale.find({ userId: req.userId, date: { $gte: from, $lte: to } })

    // Aggregate by product
    const map = {}
    sales.forEach(s => {
      if (!map[s.productId]) map[s.productId] = { productId: s.productId, productName: s.productName, totalQty: 0 }
      map[s.productId].totalQty += s.qty
    })

    res.json(Object.values(map))
  } catch (err) { next(err) }
})

// GET past N months of monthly totals per product (for ML training data)
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
        const key = String(s.productId)
        if (!map[key]) map[key] = { productId: key, productName: s.productName, qty: 0, month, year }
        map[key].qty += s.qty
      })

      records.push(...Object.values(map))
    }

    res.json(records)
  } catch (err) { next(err) }
})

export default router
