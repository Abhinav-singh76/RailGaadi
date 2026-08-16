import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { trainsRouter } from './routes/trains.router.js';
import { contextRouter } from './routes/context.router.js';
import { shareRouter } from './routes/share.router.js';

dotenv.config();

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

// Global 404
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
