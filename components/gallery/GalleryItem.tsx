'use client';

import React, { useState, useEffect } from 'react';
import { PhotoRecord } from '@/types/photo';
import { VideoRecord } from '@/types/video';
import { Download, Trash2, Film, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface GalleryItemProps {
  item: PhotoRecord | VideoRecord;
  onSelect: (item: PhotoRecord | VideoRecord) => void;
  onDelete: (id: string) => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  item,
  onSelect,
  onDelete,
}) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let url = '';
    const isVideoOrAnimated = 'duration' in item || (item as PhotoRecord).type === 'boomerang' || (item as PhotoRecord).type === 'gif';

    if (isVideoOrAnimated && item.thumbnailBlob) {
      url = URL.createObjectURL(item.thumbnailBlob);
    } else if ('thumbnailBlob' in item && item.thumbnailBlob) {
      url = URL.createObjectURL(item.thumbnailBlob);
    } else if ('processedBlob' in item && item.processedBlob) {
      url = URL.createObjectURL(item.processedBlob);
    }

    setImgUrl(url || null);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [item]);

  const isVideoOrAnimated = 'duration' in item || (item as PhotoRecord).type === 'boomerang' || (item as PhotoRecord).type === 'gif';
  const isStrip = !isVideoOrAnimated && (item as PhotoRecord).type === 'strip';
  const isGif = (item as PhotoRecord).type === 'gif' || (item as PhotoRecord).type === 'boomerang';

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-lg aspect-square cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 select-none"
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt="Saved memory"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/10">
          {isVideoOrAnimated ? (
            <>
              <Film className="w-3 h-3 text-blue-400" />
              <span>Video</span>
            </>
          ) : isStrip ? (
            <>
              <ImageIcon className="w-3 h-3 text-indigo-400" />
              <span>Strip</span>
            </>
          ) : isGif ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>GIF</span>
            </>
          ) : (
            <span>Photo</span>
          )}
        </span>
      </div>

      {/* Hover action overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-300 font-medium">
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <Button
            variant="danger"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="w-8 h-8 min-w-0 min-h-0 p-1.5"
            aria-label="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
