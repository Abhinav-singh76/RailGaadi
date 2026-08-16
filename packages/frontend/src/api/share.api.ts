import { apiClient } from './client.js';
import { ShareLink, ApiResponse } from '@railgaadi/types';

export async function createShareLink(journeyId: string, trainId: string): Promise<ShareLink> {
  const res = await apiClient.post<ApiResponse<ShareLink>>('/share', { journeyId, trainId });
  if (res.data.error || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to create share link');
  }
  return res.data.data;
}

export async function resolveShareLink(shareId: string): Promise<ShareLink | null> {
  const res = await apiClient.get<ApiResponse<ShareLink>>(`/share/${shareId}`);
  return res.data.data || null;
}
