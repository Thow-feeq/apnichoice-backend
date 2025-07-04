import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
      quantity: { type: Number, required: true }
    }
  ],
  amount: { type: Number, required: true },            // ✅ Original price before discount
  totalAmount: { type: Number, required: true },       // ✅ Final price after discount + tax
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  address: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'address' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Dispatched', 'Delivered'],
    default: 'Pending'
  },
  paymentType: { type: String, required: true },      
  isPaid: { type: Boolean, required: true, default: false },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentInfo: {
    id: String,
    status: String,
  },
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;
