import { ShareLink } from '@railgaadi/types';

export class ShareService {
  private shareStore = new Map<string, ShareLink>();

  async createShareLink(journeyId: string, trainId: string, baseUrl: string): Promise<ShareLink> {
    const id = `share-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 Hours

    const shareLink: ShareLink = {
      id,
      journeyId,
      trainId,
      createdAt,
      expiresAt,
      shareUrl: `${baseUrl}/share/${id}`,
    };

    this.shareStore.set(id, shareLink);
    return shareLink;
  }

  async getShareLink(id: string): Promise<ShareLink | null> {
    const item = this.shareStore.get(id);
    if (!item) return null;

    if (new Date(item.expiresAt).getTime() < Date.now()) {
      this.shareStore.delete(id);
      return null;
    }

    return item;
  }
}
