import { Router, Request, Response } from 'express';
import { TrainService } from '../services/train.service.js';
import { ApiResponse } from '@railgaadi/types';

export const contextRouter = Router();
const trainService = new TrainService();

// GET /api/weather?lat=&lng=
contextRouter.get('/weather', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.076;
    const lng = parseFloat(req.query.lng as string) || 72.8777;

    const weather = await trainService.getWeather(lat, lng);
    const response: ApiResponse<typeof weather> = {
      data: weather,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'WEATHER_FAILED', message: error.message || 'Weather lookup failed' },
    });
  }
});

// GET /api/weather/journey/:trainId
contextRouter.get('/weather/journey/:trainId', async (req: Request, res: Response) => {
  try {
    const { trainId } = req.params;
    const companion = await trainService.getJourneyWeather(trainId);
    if (!companion) {
      return res.status(404).json({
        error: { code: 'JOURNEY_WEATHER_NOT_FOUND', message: `Weather companion for train ${trainId} unavailable` },
      });
    }

    const response: ApiResponse<typeof companion> = {
      data: companion,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'JOURNEY_WEATHER_FAILED', message: error.message || 'Journey weather lookup failed' },
    });
  }
});

// GET /api/route/context?lat=&lng=
contextRouter.get('/route/context', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.076;
    const lng = parseFloat(req.query.lng as string) || 72.8777;

    const context = await trainService.getRouteContext(lat, lng);
    const response: ApiResponse<typeof context> = {
      data: context,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'CONTEXT_FAILED', message: error.message || 'Route context lookup failed' },
    });
  }
});
