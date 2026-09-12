import { getDB } from './db';
import { VideoRecord } from '@/types/video';

export async function saveVideoToDB(video: VideoRecord): Promise<void> {
  const db = await getDB();
  await db.put('videos', video);
}

export async function getAllVideosFromDB(): Promise<VideoRecord[]> {
  const db = await getDB();
  const videos = await db.getAllFromIndex('videos', 'createdAt');
  return videos.reverse();
}

export async function deleteVideoFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('videos', id);
}
