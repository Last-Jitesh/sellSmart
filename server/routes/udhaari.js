import express from 'express'
import Udhaari from '../models/Udhaari.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)

// GET all udhaari entries for user
router.get('/', async (req, res, next) => {
  try {
    const entries = await Udhaari.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(entries)
  } catch (err) { next(err) }
})

// POST create new udhaari entry
router.post('/', async (req, res, next) => {
  try {
    const { customerName, phone, items, totalAmount } = req.body
    if (!customerName || !totalAmount) {
      return res.status(400).json({ message: 'customerName and totalAmount are required' })
    }
    const entry = await Udhaari.create({
      customerName, phone, items,
      totalAmount: Number(totalAmount),
      paidAmount: 0,
      userId: req.userId,
    })
    res.status(201).json(entry)
  } catch (err) { next(err) }
})

// PATCH — record a payment (full or partial)
// body: { amount: number } — if null/undefined, mark as fully paid
router.patch('/:id/pay', async (req, res, next) => {
  try {
    const entry = await Udhaari.findOne({ _id: req.params.id, userId: req.userId })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })

    const payAmount = req.body.amount != null
      ? Number(req.body.amount)
      : entry.totalAmount   // full payment

    entry.paidAmount = Math.min(entry.totalAmount, (entry.paidAmount || 0) + payAmount)
    await entry.save()
    res.json(entry)
  } catch (err) { next(err) }
})

// DELETE udhaari entry
router.delete('/:id', async (req, res, next) => {
  try {
    await Udhaari.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
