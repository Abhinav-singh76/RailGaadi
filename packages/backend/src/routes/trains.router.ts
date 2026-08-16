import { Router, Request, Response } from 'express';
import { TrainService } from '../services/train.service.js';
import { ApiResponse } from '@railgaadi/types';

export const trainsRouter = Router();
const trainService = new TrainService();

// GET /api/trains/search?q=
trainsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const trains = await trainService.searchTrains(query);
    const response: ApiResponse<typeof trains> = {
      data: trains,
      meta: {
        timestamp: new Date().toISOString(),
        provider: 'RailRadarLive',
      },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'SEARCH_FAILED',
        message: error.message || 'Failed to search trains',
      },
    });
  }
});

// GET /api/trains/between?from=NDLS&to=MMCT
trainsRouter.get('/between', async (req: Request, res: Response) => {
  try {
    const from = (req.query.from as string) || '';
    const to = (req.query.to as string) || '';
    if (!from || !to) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Both "from" and "to" station codes or names are required',
        },
      });
    }
    const trains = await trainService.getTrainsBetweenStations(from, to);
    const response: ApiResponse<typeof trains> = {
      data: trains,
      meta: {
        timestamp: new Date().toISOString(),
        provider: 'RailRadarLive',
      },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'BETWEEN_SEARCH_FAILED',
        message: error.message || 'Failed to find trains between stations',
      },
    });
  }
});

// GET /api/trains/:id/live
trainsRouter.get('/:id/live', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = await trainService.getLiveJourney(id);

    if (!status) {
      return res.status(404).json({
        error: {
          code: 'TRAIN_NOT_FOUND',
          message: `Train with ID ${id} was not found or has no active run`,
        },
      });
    }

    const response: ApiResponse<typeof status> = {
      data: status,
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'LIVE_DATA_UNAVAILABLE',
        message: error.message || 'Live tracking currently unavailable',
      },
    });
  }
});

// GET /api/trains/:id/route
trainsRouter.get('/:id/route', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const route = await trainService.getRouteGeometry(id);

    if (!route) {
      return res.status(404).json({
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Route for train ID ${id} was not found`,
        },
      });
    }

    const response: ApiResponse<typeof route> = {
      data: route,
      meta: {
        timestamp: new Date().toISOString(),
        cached: true,
      },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'ROUTE_FETCH_FAILED',
        message: error.message || 'Failed to fetch route geometry',
      },
    });
  }
});

// GET /api/trains/:id/analytics
trainsRouter.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analytics = await trainService.getJourneyAnalytics(id);

    if (!analytics) {
      return res.status(404).json({
        error: {
          code: 'ANALYTICS_NOT_FOUND',
          message: `Analytics for train ID ${id} unavailable`,
        },
      });
    }

    const response: ApiResponse<typeof analytics> = {
      data: analytics,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'ANALYTICS_FAILED',
        message: error.message || 'Failed to fetch analytics',
      },
    });
  }
});
