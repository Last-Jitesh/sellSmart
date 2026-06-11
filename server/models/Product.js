import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, default: 'General', trim: true },
  stock:         { type: Number, default: 0, min: 0 },
  costPrice:     { type: Number, default: 0 },
  sellingPrice:  { type: Number, default: 0 },
  threshold:     { type: Number, default: 5 },
  userId:        { type: String, required: true },
}, { timestamps: true })

productSchema.index({ userId: 1 })

export default mongoose.model('Product', productSchema)
