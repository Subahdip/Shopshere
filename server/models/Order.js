import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: 'One Size' }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'UNPAID'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
