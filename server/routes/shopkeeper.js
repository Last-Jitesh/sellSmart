import express from 'express'
import Shopkeeper from '../models/Shopkeeper.js'
import clerkAuth from '../middleware/clerkAuth.js'

const router = express.Router()
router.use(clerkAuth)

// GET /api/shopkeeper
// Fetch profile for current user. Create a default one if it doesn't exist.
router.get('/', async (req, res, next) => {
  try {
    let profile = await Shopkeeper.findOne({ userId: req.userId })
    if (!profile) {
      profile = await Shopkeeper.create({ userId: req.userId })
    }
    res.json(profile)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/shopkeeper
// Update the shopkeeper profile fields
router.patch('/', async (req, res, next) => {
  try {
    const { shopName, ownerName, phone, address, gstNumber } = req.body
    
    const updates = {}
    if (shopName !== undefined) updates.shopName = shopName
    if (ownerName !== undefined) updates.ownerName = ownerName
    if (phone !== undefined) updates.phone = phone
    if (address !== undefined) updates.address = address
    if (gstNumber !== undefined) updates.gstNumber = gstNumber

    const profile = await Shopkeeper.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    )
    
    res.json(profile)
  } catch (err) {
    next(err)
  }
})

export default router
