import express from 'express'
import Product from '../models/Product.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)

// GET all products for user
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.userId }).sort({ name: 1 })
    res.json(products)
  } catch (err) { next(err) }
})

// POST create new product
router.post('/', async (req, res, next) => {
  try {
    const { name, category, stock, costPrice, sellingPrice, threshold } = req.body
    if (!name) return res.status(400).json({ message: 'Product name is required' })
    const product = await Product.create({
      name, category, userId: req.userId,
      stock: Number(stock) || 0,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      threshold: Number(threshold) || 5,
    })
    res.status(201).json(product)
  } catch (err) { next(err) }
})

// PATCH add stock to existing product
router.patch('/:id/add-stock', async (req, res, next) => {
  try {
    const { qty } = req.body
    if (!qty || qty < 1) return res.status(400).json({ message: 'Invalid quantity' })
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $inc: { stock: Number(qty) } },
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) { next(err) }
})

// PATCH update product fields
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'costPrice', 'sellingPrice', 'threshold']
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) { next(err) }
})

// DELETE product
router.delete('/:id', async (req, res, next) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
