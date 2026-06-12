import express from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import Udhaari from '../models/Udhaari.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)

// Helper — works for both legacy single-item and new multi-item bills
const calcRevenue = (sale) =>
  sale.items?.length > 0
    ? (sale.totalAmount || 0)
    : (sale.qty * sale.sellingPrice || 0)

// GET /api/analytics/dashboard-stats
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const now   = new Date()
    const monthStr = String(now.getMonth() + 1).padStart(2, '0')
    const monthFrom = `${now.getFullYear()}-${monthStr}-01`
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthTo   = `${now.getFullYear()}-${monthStr}-${daysInMonth}`

    const [todaySales, monthSales, products, udhaaris] = await Promise.all([
      Sale.find({ userId: req.userId, date: today }),
      Sale.find({ userId: req.userId, date: { $gte: monthFrom, $lte: monthTo } }),
      Product.countDocuments({ userId: req.userId }),
      Udhaari.find({ userId: req.userId }),
    ])

    const todayRevenue   = todaySales.reduce((s, x) => s + calcRevenue(x), 0)
    const monthRevenue   = monthSales.reduce((s, x) => s + calcRevenue(x), 0)
    const pendingUdhaari = udhaaris.reduce((s, u) => s + Math.max(0, u.totalAmount - (u.paidAmount || 0)), 0)

    res.json({ todayRevenue, monthRevenue, totalProducts: products, pendingUdhaari })
  } catch (err) { next(err) }
})

// GET /api/analytics/weekly?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/weekly', async (req, res, next) => {
  try {
    const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const to   = req.query.to   || new Date().toISOString().split('T')[0]

    const sales = await Sale.find({
      userId: req.userId,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 })

    // Group by date
    const byDate = {}
    sales.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { label: s.date, earnings: 0, count: 0 }
      byDate[s.date].earnings += calcRevenue(s)
      byDate[s.date].count    += 1
    })

    const weekly = Object.values(byDate).map(d => ({
      ...d,
      label: new Date(d.label + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
    }))

    const totalRevenue = weekly.reduce((s, d) => s + d.earnings, 0)
    const avgDaily = weekly.length ? Math.round(totalRevenue / weekly.length) : 0
    const totalTxns = sales.length

    let bestDay = null, bestDayRevenue = 0
    Object.entries(byDate).forEach(([date, d]) => {
      if (d.earnings > bestDayRevenue) {
        bestDayRevenue = d.earnings
        bestDay = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
      }
    })

    res.json({ weekly, summary: { totalRevenue, avgDaily, bestDay, bestDayRevenue, totalTxns } })
  } catch (err) { next(err) }
})

// GET /api/analytics/categories?from=&to=
router.get('/categories', async (req, res, next) => {
  try {
    const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const to   = req.query.to   || new Date().toISOString().split('T')[0]

    const sales = await Sale.find({
      userId: req.userId,
      date: { $gte: from, $lte: to },
    })

    // Collect all productIds — from both legacy and new bill format
    const productIds = new Set()
    sales.forEach(s => {
      if (s.items?.length > 0) {
        s.items.forEach(i => productIds.add(String(i.productId)))
      } else if (s.productId) {
        productIds.add(String(s.productId))
      }
    })

    const products = await Product.find({ _id: { $in: [...productIds] } })
    const catMap = {}
    products.forEach(p => { catMap[String(p._id)] = p.category || 'General' })

    // Aggregate revenue by category
    const byCategory = {}
    sales.forEach(s => {
      if (s.items?.length > 0) {
        // New multi-item bill — iterate each item
        s.items.forEach(item => {
          const cat = catMap[String(item.productId)] || 'General'
          if (!byCategory[cat]) byCategory[cat] = { category: cat, revenue: 0, count: 0 }
          byCategory[cat].revenue += item.qty * item.sellingPrice
          byCategory[cat].count   += 1
        })
      } else {
        // Legacy single-item
        const cat = catMap[String(s.productId)] || 'General'
        if (!byCategory[cat]) byCategory[cat] = { category: cat, revenue: 0, count: 0 }
        byCategory[cat].revenue += s.qty * s.sellingPrice
        byCategory[cat].count   += 1
      }
    })

    const result = Object.values(byCategory).sort((a, b) => b.revenue - a.revenue)
    res.json(result)
  } catch (err) { next(err) }
})

export default router