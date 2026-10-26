import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.search) filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
    const sort = req.query.sort === 'price-asc' ? { price: 1 } : req.query.sort === 'price-desc' ? { price: -1 } : { createdAt: -1 };
    res.json(await Product.find(filter).sort(sort));
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});
router.post('/', protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Product.create(req.body)); } catch (err) { next(err); }
});
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) { next(err); }
});
export default router;
