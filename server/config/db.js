import mongoose from 'mongoose';

let mongoMemoryServer = null;

async function autoSeedIfEmpty() {
  try {
    const Product = (await import('../models/Product.js')).default;
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Database has no products. Auto-seeding initial demo catalog...');
      const sampleProducts = [
        { name: 'The Everyday Tee', slug: 'the-everyday-tee', description: 'A relaxed, heavyweight cotton tee designed for everyday wear.', category: 'Women', price: 899, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85', sizes: ['XS','S','M','L','XL'], stock: 35, featured: true },
        { name: 'Linen Blend Shirt', slug: 'linen-blend-shirt', description: 'An airy linen-blend shirt with an easy, slightly oversized fit.', category: 'Men', price: 1899, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85', sizes: ['S','M','L','XL'], stock: 18, featured: true },
        { name: 'Relaxed Tailored Trousers', slug: 'relaxed-tailored-trousers', description: 'Clean lines and a relaxed leg make these a wardrobe staple.', category: 'Women', price: 2199, image: 'https://images.unsplash.com/photo-1506629905607-d9a4d6f0a5b3?auto=format&fit=crop&w=900&q=85', sizes: ['XS','S','M','L'], stock: 14, featured: true },
        { name: 'Everyday Canvas Tote', slug: 'everyday-canvas-tote', description: 'A sturdy canvas tote for daily essentials, errands, and weekends.', category: 'Accessories', price: 699, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85', sizes: ['One Size'], stock: 42, featured: false },
        { name: 'Classic Overshirt', slug: 'classic-overshirt', description: 'A versatile layering piece with a minimal silhouette.', category: 'Men', price: 2499, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', sizes: ['S','M','L','XL'], stock: 11, featured: true },
        { name: 'Minimal Shoulder Bag', slug: 'minimal-shoulder-bag', description: 'A compact, structured bag with a simple, timeless profile.', category: 'Accessories', price: 1599, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85', sizes: ['One Size'], stock: 20, featured: false }
      ];
      await Product.insertMany(sampleProducts);
      console.log(`Auto-seeded ${sampleProducts.length} sample products.`);
    }
  } catch (seedErr) {
    console.warn('Auto-seed notice:', seedErr.message);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    await autoSeedIfEmpty();
    return;
  } catch (err) {
    console.warn(`Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('Spinning up embedded MongoDB instance (MongoMemoryServer)...');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoMemoryServer = await MongoMemoryServer.create({
    instance: { dbName: 'shopsphere' }
  });
  const memUri = mongoMemoryServer.getUri();
  await mongoose.connect(memUri);
  console.log(`Embedded MongoDB connected: ${mongoose.connection.name} (${memUri})`);
  await autoSeedIfEmpty();
}

export async function closeDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
