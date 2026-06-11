import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  { type: String },
  qty:          { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true },
  date:         { type: String, required: true },   // 'YYYY-MM-DD'
  userId:       { type: String, required: true },
}, { timestamps: true })

saleSchema.index({ userId: 1, date: 1 })

export default mongoose.model('Sale', saleSchema)
