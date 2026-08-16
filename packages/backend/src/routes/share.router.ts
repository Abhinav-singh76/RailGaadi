import { Router, Request, Response } from 'express';
import { ShareService } from '../services/share.service.js';
import { ApiResponse } from '@railgaadi/types';

export const shareRouter = Router();
const shareService = new ShareService();

// POST /api/share
shareRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { journeyId, trainId } = req.body;
    if (!journeyId || !trainId) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'journeyId and trainId are required',
        },
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const shareLink = await shareService.createShareLink(journeyId, trainId, baseUrl);
    const response: ApiResponse<typeof shareLink> = {
      data: shareLink,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'SHARE_FAILED', message: error.message || 'Share link creation failed' },
    });
  }
});

// GET /api/share/:id
shareRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shareLink = await shareService.getShareLink(id);

    if (!shareLink) {
      return res.status(404).json({
        error: {
          code: 'LINK_EXPIRED',
          message: 'Shareable journey link has expired or is invalid',
        },
      });
    }

    const response: ApiResponse<typeof shareLink> = {
      data: shareLink,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: { code: 'SHARE_RESOLVE_FAILED', message: error.message || 'Failed to resolve share link' },
    });
  }
});
