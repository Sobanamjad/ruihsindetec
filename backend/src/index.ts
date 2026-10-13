import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import exampleRouter from './routes/example.js';
import contentRouter from './routes/content.js';
import authRouter from './routes/auth.js';
import newsRouter from './routes/news.js';
import { fetchAndStoreNews } from './services/newsService.js';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/example', exampleRouter);
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/news', newsRouter);

// Schedule news refresh every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled news refresh...');
  const result = await fetchAndStoreNews();
  console.log('Scheduled refresh result:', result.message);
});

// Initial news fetch on startup
fetchAndStoreNews().then(result => {
  console.log('Initial news fetch:', result.message);
}).catch(err => {
  console.error('Initial news fetch failed:', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
