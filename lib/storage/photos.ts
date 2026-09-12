import { getDB } from './db';
import { PhotoRecord } from '@/types/photo';

export async function savePhotoToDB(photo: PhotoRecord): Promise<void> {
  const db = await getDB();
  await db.put('photos', photo);
}

export async function getAllPhotosFromDB(): Promise<PhotoRecord[]> {
  const db = await getDB();
  const photos = await db.getAllFromIndex('photos', 'createdAt');
  return photos.reverse(); // Newest first
}

export async function getPhotoByIdFromDB(id: string): Promise<PhotoRecord | undefined> {
  const db = await getDB();
  return db.get('photos', id);
}

export async function deletePhotoFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}

export async function clearAllPhotosFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('photos');
}
