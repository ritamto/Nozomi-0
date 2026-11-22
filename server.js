import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// for serving static files from the public directory duhh (also, with no caching.)

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`NOZOMI-0 running at http://localhost:${PORT}`);
});