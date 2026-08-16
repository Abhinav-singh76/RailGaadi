import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { trainsRouter } from './routes/trains.router.js';
import { contextRouter } from './routes/context.router.js';
import { shareRouter } from './routes/share.router.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RailGaadi Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/trains', trainsRouter);
app.use('/api', contextRouter);
app.use('/api/share', shareRouter);

// Serve the built frontend
// __dirname at runtime is packages/backend/dist, so go up to packages/frontend/dist
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Any non-API route falls through to the frontend's index.html (for client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global 404 (only reached for unmatched /api or /health routes now)
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚆 RailGaadi Backend API running on http://localhost:${PORT}`);
});

export default app;
