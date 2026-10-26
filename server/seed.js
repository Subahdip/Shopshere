import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

const products = [
  { name: 'The Everyday Tee', slug: 'the-everyday-tee', description: 'A relaxed, heavyweight cotton tee designed for everyday wear.', category: 'Women', price: 899, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85', sizes: ['XS','S','M','L','XL'], stock: 35, featured: true },
  { name: 'Linen Blend Shirt', slug: 'linen-blend-shirt', description: 'An airy linen-blend shirt with an easy, slightly oversized fit.', category: 'Men', price: 1899, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85', sizes: ['S','M','L','XL'], stock: 18, featured: true },
  { name: 'Relaxed Tailored Trousers', slug: 'relaxed-tailored-trousers', description: 'Clean lines and a relaxed leg make these a wardrobe staple.', category: 'Women', price: 2199, image: 'https://images.unsplash.com/photo-1506629905607-d9a4d6f0a5b3?auto=format&fit=crop&w=900&q=85', sizes: ['XS','S','M','L'], stock: 14, featured: true },
  { name: 'Everyday Canvas Tote', slug: 'everyday-canvas-tote', description: 'A sturdy canvas tote for daily essentials, errands, and weekends.', category: 'Accessories', price: 699, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85', sizes: ['One Size'], stock: 42, featured: false },
  { name: 'Classic Overshirt', slug: 'classic-overshirt', description: 'A versatile layering piece with a minimal silhouette.', category: 'Men', price: 2499, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', sizes: ['S','M','L','XL'], stock: 11, featured: true },
  { name: 'Minimal Shoulder Bag', slug: 'minimal-shoulder-bag', description: 'A compact, structured bag with a simple, timeless profile.', category: 'Accessories', price: 1599, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85', sizes: ['One Size'], stock: 20, featured: false }
];

try {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  const email = (process.env.ADMIN_EMAIL || 'admin@shopsphere.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  await User.updateOne({ email }, { $set: { name: process.env.ADMIN_NAME || 'ShopSphere Admin', password: await bcrypt.hash(password, 12), role: 'admin' } }, { upsert: true });
  console.log(`Seeded ${products.length} products. Admin login: ${email}`);
  console.log('Change the sample admin password in server/.env before using this beyond local development.');
} catch (err) { console.error(err); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
