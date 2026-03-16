import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: Number,
  costPrice: Number
});

const purchaseSchema = new mongoose.Schema({

  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },

  invoiceNo: String,
  purchaseDate: Date,

  items: [purchaseItemSchema],

  totalAmount: Number,

  paymentStatus: {
    type: String,
    enum: ["Paid","Pending"],
    default: "Pending"
  }

},{ timestamps:true });

export default mongoose.model("Purchase", purchaseSchema);