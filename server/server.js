import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'ShopSphere API' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'A record with that unique value already exists.' });
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Something went wrong on the server.' });
});
const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`ShopSphere API running on http://localhost:${port}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
