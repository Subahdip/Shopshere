import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'COD' } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty.' });
    const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'phone'];
    if (!shippingAddress || requiredFields.some((field) => !String(shippingAddress[field] || '').trim())) return res.status(400).json({ message: 'Please complete all shipping fields.' });
    if (!['COD', 'UNPAID'].includes(paymentMethod)) return res.status(400).json({ message: 'Unsupported payment method.' });
    const safeItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'One of the cart items is invalid.' });
      if (product.stock < quantity) return res.status(400).json({ message: `${product.name} does not have enough stock.` });
      if (item.size && product.sizes.length && !product.sizes.includes(item.size)) return res.status(400).json({ message: `Invalid size for ${product.name}.` });
      safeItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity, size: item.size || 'One Size' });
      subtotal += product.price * quantity;
    }
    // Stock is rechecked on the server; production deployments should use a MongoDB transaction for multi-item atomicity.
    for (const item of safeItems) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    const shipping = subtotal >= 2500 ? 0 : 99;
    const order = await Order.create({ user: req.user._id, items: safeItems, shippingAddress, subtotal, shipping, total: subtotal + shipping, paymentMethod, paymentStatus: 'pending' });
    res.status(201).json(order);
  } catch (err) { next(err); }
});
router.get('/my', protect, async (req, res, next) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } catch (err) { next(err); }
});
router.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })); } catch (err) { next(err); }
});
router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) { next(err); }
});
export default router;
