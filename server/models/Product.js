import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Women', 'Men', 'Accessories'] },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  sizes: [{ type: String }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
