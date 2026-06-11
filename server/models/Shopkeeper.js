import mongoose from 'mongoose'

const shopkeeperSchema = new mongoose.Schema({
  userId:    { type: String, required: true, unique: true },
  shopName:  { type: String, default: 'My Retail Shop', trim: true },
  ownerName: { type: String, default: '', trim: true },
  phone:     { type: String, default: '', trim: true },
  address:   { type: String, default: '', trim: true },
  gstNumber: { type: String, default: '', trim: true },
}, { timestamps: true })

export default mongoose.model('Shopkeeper', shopkeeperSchema)
