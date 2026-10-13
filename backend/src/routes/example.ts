import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Example route' });
});

router.post('/', (req, res) => {
  const { data } = req.body;
  res.json({ received: data, timestamp: new Date().toISOString() });
});

export default router;
