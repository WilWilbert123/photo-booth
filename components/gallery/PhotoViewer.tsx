'use client';

import React, { useState, useEffect } from 'react';
import { PhotoRecord } from '@/types/photo';
import { VideoRecord } from '@/types/video';
import { Download, Trash2, X, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { downloadBlobAsFile, generateFilename } from '@/lib/export/image';

interface PhotoViewerProps {
  item: PhotoRecord | VideoRecord | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  item,
  onClose,
  onDelete,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      setBlobUrl(null);
      return;
    }

    const isVideoOrAnimated = 'duration' in item || (item as PhotoRecord).type === 'boomerang' || (item as PhotoRecord).type === 'gif';
    const blob = isVideoOrAnimated && 'blob' in item ? (item as VideoRecord).blob : (item as PhotoRecord).processedBlob;
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [item]);

  if (!item) return null;

  const isVideoOrAnimated = 'duration' in item || (item as PhotoRecord).type === 'boomerang' || (item as PhotoRecord).type === 'gif';

  const handleDownload = () => {
    const isVideo = 'duration' in item;
    const isAnimated = (item as PhotoRecord).type === 'gif' || (item as PhotoRecord).type === 'boomerang';
    const blob = 'blob' in item ? item.blob : (item as PhotoRecord).processedBlob;
    const ext = isVideo || isAnimated ? 'webm' : 'jpg';
    const filename = generateFilename(isVideo ? 'video' : (item as PhotoRecord).type, ext);
    downloadBlobAsFile(blob, filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header Actions */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <span className="text-xs sm:text-sm text-zinc-400 font-medium">
          Captured {new Date(item.createdAt).toLocaleString()}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Lightbox">
          <X className="w-6 h-6 text-zinc-300" />
        </Button>
      </div>

      {/* Main Lightbox Media Frame */}
      <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center py-4 overflow-hidden">
        {blobUrl ? (
          isVideoOrAnimated ? (
            <video
              src={blobUrl}
              controls
              autoPlay
              loop
              className="max-h-[75dvh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
          ) : (
            <img
              src={blobUrl}
              alt="Full size memory"
              className="max-h-[75dvh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
          )
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
        )}
      </div>

      {/* Bottom Action Toolbar */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 z-10 py-2">
        <Button variant="primary" size="lg" onClick={handleDownload} className="flex-1">
          <Download className="w-5 h-5" />
          <span>Download</span>
        </Button>

        <Button
          variant="danger"
          size="lg"
          onClick={() => {
            onDelete(item.id);
            onClose();
          }}
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
};
