import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },  // <-- change here
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' }, // same here for product
      quantity: { type: Number, required: true }
    }
  ],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: 'address' },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Delivered'],
    default: 'Pending'
  },
  paymentType: { type: String, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  couponCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true })

const Order = mongoose.models.order || mongoose.model('order', orderSchema)
export default Order
