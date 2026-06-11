import mongoose from 'mongoose'

const udhaariSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  phone:        { type: String, trim: true, default: '' },
  items:        { type: String, default: '' },
  totalAmount:  { type: Number, required: true, min: 0 },
  paidAmount:   { type: Number, default: 0 },
  userId:       { type: String, required: true },
}, { timestamps: true })

udhaariSchema.index({ userId: 1 })

export default mongoose.model('Udhaari', udhaariSchema)
