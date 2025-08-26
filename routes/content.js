import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const dataPath = path.join(__dirname, '..', 'data', 'seed.json');

function loadData() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

router.get('/bootstrap', (req, res) => {
  const data = loadData();
  res.json({ ok: true, ...data });
});

export default router;
