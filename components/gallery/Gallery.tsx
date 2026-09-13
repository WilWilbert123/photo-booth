'use client';

import React, { useState, useRef } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { GalleryItem } from './GalleryItem';
import { PhotoViewer } from './PhotoViewer';
import { StripBuilder } from './StripBuilder';
import { Button } from '../ui/Button';
import { Image as ImageIcon, Film, Layers, Sparkles, Search, Trash2, Upload, RotateCw } from 'lucide-react';
import { PhotoRecord } from '@/types/photo';
import { processAndSaveUploadedFile } from '@/lib/storage/upload';

export const Gallery: React.FC = () => {
  const {
    photos,
    videos,
    selectedItem,
    filterType,
    isLoading,
    searchQuery,
    deleteItem,
    setSelectedItem,
    setFilterType,
    setSearchQuery,
    loadGalleryData,
  } = useGallery();

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgress(`Uploading ${i + 1}/${fileList.length}...`);
      try {
        await processAndSaveUploadedFile(file);
        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        alert(`Failed to upload ${file.name}. Please ensure it is a valid image or video format (JPEG, PNG, MP4, etc).`);
      }
    }

    if (successCount > 0 && successCount < fileList.length) {
      alert(`Successfully uploaded ${successCount} out of ${fileList.length} files.`);
    }

    await loadGalleryData();
    setIsUploading(false);
    setUploadProgress(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Combine items for filtering
  const allItems = [...photos, ...videos].sort((a, b) => b.createdAt - a.createdAt);

  const filteredItems = allItems.filter((item) => {
    const isVideo = 'duration' in item;
    if (filterType === 'video') return isVideo;
    if (filterType === 'strip') return !isVideo && (item as PhotoRecord).type === 'strip';
    if (filterType === 'gif') return !isVideo && ((item as PhotoRecord).type === 'gif' || (item as PhotoRecord).type === 'boomerang');
    if (filterType === 'single') return !isVideo && (item as PhotoRecord).type === 'single';
    return true;
  });

  return (
    <div className="flex-1 w-full p-4 sm:p-6 flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header bar & Filter controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">My Gallery</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your captured photos and videos
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm, video/quicktime"
            multiple
            className="hidden"
          />

          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search your memories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 shrink-0"
          >
            {isUploading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{uploadProgress || 'Uploading...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('single')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterType === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setFilterType('video')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterType === 'video'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          Videos
        </button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-2" />
        <button
          onClick={() => setIsBuilderOpen(true)}
          disabled={photos.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Strip Builder</span>
        </button>
      </div>

      {/* Grid items */}
      {filteredItems.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4 border border-zinc-100 dark:border-zinc-800">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 mb-1">No Memories Found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-6">
            You haven't captured or uploaded any photos in this category yet. Snap a photo in the booth or upload photos from your device!
          </p>
          <Button
            variant="primary"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photos / Videos</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <GalleryItem
              key={item.id}
              item={item}
              onSelect={setSelectedItem}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Viewer */}
      {selectedItem && (
        <PhotoViewer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={deleteItem}
        />
      )}

      {/* Photo Strip Builder Studio Modal */}
      {isBuilderOpen && (
        <StripBuilder
          isOpen={isBuilderOpen}
          photos={photos.filter(p => p.type === 'single' || p.type === 'polaroid')}
          onClose={() => setIsBuilderOpen(false)}
          onStripCreated={loadGalleryData}
        />
      )}
    </div>
  );
};
