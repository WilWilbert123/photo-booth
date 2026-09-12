import { useEffect, useCallback } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { getAllPhotosFromDB, deletePhotoFromDB } from '@/lib/storage/photos';
import { getAllVideosFromDB, deleteVideoFromDB } from '@/lib/storage/videos';

export function useGallery() {
  const {
    photos,
    videos,
    selectedItem,
    filterType,
    isLoading,
    searchQuery,
    setPhotos,
    removePhoto,
    setVideos,
    removeVideo,
    setSelectedItem,
    setFilterType,
    setIsLoading,
    setSearchQuery,
  } = useGalleryStore();

  const loadGalleryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPhotos, fetchedVideos] = await Promise.all([
        getAllPhotosFromDB(),
        getAllVideosFromDB(),
      ]);
      setPhotos(fetchedPhotos);
      setVideos(fetchedVideos);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setPhotos, setVideos, setIsLoading]);

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        const { photos, videos, removePhoto, removeVideo } = useGalleryStore.getState();
        
        const isVideo = videos.some(v => v.id === id);
        const isPhoto = photos.some(p => p.id === id);

        if (isVideo) {
          await deleteVideoFromDB(id);
          removeVideo(id);
        } else if (isPhoto) {
          await deletePhotoFromDB(id);
          removePhoto(id);
        }
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    },
    []
  );

  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  return {
    photos,
    videos,
    selectedItem,
    filterType,
    isLoading,
    searchQuery,
    loadGalleryData,
    deleteItem,
    setSelectedItem,
    setFilterType,
    setSearchQuery,
  };
}
