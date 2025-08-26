import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

import authRouter from './routes/auth.js';
import contentRouter from './routes/content.js';
import tasksRouter from './routes/tasks.js';
import payRouter from './routes/pay.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Static frontend
const webappPath = path.join(__dirname, '..', 'webapp');
app.use(express.static(webappPath));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/pay', payRouter);

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[CodeQuest] Server is running on :${PORT}`);
});
