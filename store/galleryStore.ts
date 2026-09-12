import { create } from 'zustand';
import { PhotoRecord } from '@/types/photo';
import { VideoRecord } from '@/types/video';

interface GalleryState {
  photos: PhotoRecord[];
  videos: VideoRecord[];
  selectedItem: PhotoRecord | VideoRecord | null;
  filterType: 'all' | 'single' | 'strip' | 'gif' | 'video';
  isLoading: boolean;
  searchQuery: string;
}

interface GalleryActions {
  setPhotos: (photos: PhotoRecord[]) => void;
  addPhoto: (photo: PhotoRecord) => void;
  removePhoto: (id: string) => void;
  setVideos: (videos: VideoRecord[]) => void;
  addVideo: (video: VideoRecord) => void;
  removeVideo: (id: string) => void;
  setSelectedItem: (item: PhotoRecord | VideoRecord | null) => void;
  setFilterType: (filterType: 'all' | 'single' | 'strip' | 'gif' | 'video') => void;
  setIsLoading: (isLoading: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useGalleryStore = create<GalleryState & GalleryActions>((set) => ({
  photos: [],
  videos: [],
  selectedItem: null,
  filterType: 'all',
  isLoading: false,
  searchQuery: '',

  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    })),
  setVideos: (videos) => set({ videos }),
  addVideo: (video) => set((state) => ({ videos: [video, ...state.videos] })),
  removeVideo: (id) =>
    set((state) => ({
      videos: state.videos.filter((v) => v.id !== id),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    })),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setFilterType: (filterType) => set({ filterType }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
