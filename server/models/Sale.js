import mongoose from 'mongoose'

// Individual line item within a bill
const saleItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  { type: String },
  qty:          { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true },
}, { _id: false })

const saleSchema = new mongoose.Schema({
  // ── legacy single-item fields (kept for backward compat) ──
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName:  { type: String },
  qty:          { type: Number },
  sellingPrice: { type: Number },

  // ── new multi-item bill fields ──
  items:        { type: [saleItemSchema], default: [] },
  customerName: { type: String, default: '' },
  customerPhone:{ type: String, default: '' },
  totalAmount:  { type: Number, default: 0 },
  isPaid:       { type: Boolean, default: true },

  date:         { type: String, required: true },   // 'YYYY-MM-DD'
  userId:       { type: String, required: true },
}, { timestamps: true })

saleSchema.index({ userId: 1, date: 1 })

export default mongoose.model('Sale', saleSchema)