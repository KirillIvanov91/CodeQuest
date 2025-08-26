import { Router } from 'express';

const router = Router();

// Заглушки продуктов/перков
const products = [
  { key: 'premium_month', type: 'subscription', price_cents: 999, perks: ['gold_access','diamond_access','advanced_stats'] },
  { key: 'module_sql_gold', type: 'module', price_cents: 399, perks: ['sql_gold'] }
];

router.get('/products', (req, res) => {
  res.json({ ok: true, products });
});

router.post('/create', (req, res) => {
  const { productKey } = req.body || {};
  const product = products.find(p => p.key === productKey);
  if (!product) return res.status(404).json({ ok: false, error: 'product_not_found' });
  // Здесь должен создаваться invoice (Telegram Payments / Stars)
  // Для MVP вернём фиктивный payload
  res.json({ ok: true, invoice: { provider: 'mock', product } });
});

export default router;
