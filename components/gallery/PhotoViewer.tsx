'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhotoRecord } from '@/types/photo';
import { VideoRecord } from '@/types/video';
import { Download, Trash2, X, Film, Play, Pause } from 'lucide-react';
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
  const [liveVideoUrl, setLiveVideoUrl] = useState<string | null>(null);
  const [isPlayingLive, setIsPlayingLive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!item) {
      setBlobUrl(null);
      setLiveVideoUrl(null);
      setIsPlayingLive(false);
      return;
    }

    const photoRec = item as PhotoRecord;
    const isVideoOrAnimated = 'duration' in item || photoRec.type === 'boomerang' || photoRec.type === 'gif';
    const mainBlob = isVideoOrAnimated && 'blob' in item ? (item as VideoRecord).blob : photoRec.processedBlob;
    const url = URL.createObjectURL(mainBlob);
    setBlobUrl(url);

    let vUrl = '';
    if (photoRec.isLivePhoto && photoRec.liveVideoBlob) {
      vUrl = URL.createObjectURL(photoRec.liveVideoBlob);
      setLiveVideoUrl(vUrl);
      setIsPlayingLive(true); // iOS default: play motion clip on opening
    } else {
      setLiveVideoUrl(null);
      setIsPlayingLive(false);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
      if (vUrl) URL.revokeObjectURL(vUrl);
    };
  }, [item]);

  if (!item) return null;

  const photoRec = item as PhotoRecord;
  const isVideoOrAnimated = 'duration' in item || photoRec.type === 'boomerang' || photoRec.type === 'gif';
  const isLivePhoto = Boolean(photoRec.isLivePhoto && liveVideoUrl);

  const handleDownload = () => {
    const isVideo = 'duration' in item;
    const isAnimated = photoRec.type === 'gif' || photoRec.type === 'boomerang';
    const blob = 'blob' in item ? item.blob : photoRec.processedBlob;
    const ext = isVideo || isAnimated ? 'webm' : 'jpg';
    const filename = generateFilename(isVideo ? 'video' : photoRec.type, ext);
    downloadBlobAsFile(blob, filename);
  };

  const handleDownloadLiveVideo = () => {
    if (photoRec.liveVideoBlob) {
      const filename = generateFilename('live_motion', 'webm');
      downloadBlobAsFile(photoRec.liveVideoBlob, filename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header Actions */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-zinc-400 font-medium">
            Captured {new Date(item.createdAt).toLocaleString()}
          </span>
          {isLivePhoto && (
            <button
              onClick={() => setIsPlayingLive(!isPlayingLive)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                isPlayingLive
                  ? 'bg-amber-400 text-zinc-950 shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isPlayingLive ? 'bg-zinc-950 animate-ping' : 'bg-amber-400'}`} />
              <span>LIVE</span>
              {isPlayingLive ? <Pause className="w-3 h-3 ml-0.5" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
          )}
        </div>

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
          ) : isLivePhoto && isPlayingLive && liveVideoUrl ? (
            <div className="relative flex items-center justify-center group cursor-pointer" onClick={() => setIsPlayingLive(false)}>
              <video
                ref={videoRef}
                src={liveVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="max-h-[75dvh] max-w-full rounded-2xl shadow-2xl object-contain"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400/90 text-zinc-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping" />
                LIVE PHOTO
              </div>
            </div>
          ) : (
            <div 
              className={`relative flex items-center justify-center ${isLivePhoto ? 'cursor-pointer group' : ''}`}
              onClick={() => isLivePhoto && setIsPlayingLive(true)}
              onMouseDown={() => isLivePhoto && setIsPlayingLive(true)}
              onTouchStart={() => isLivePhoto && setIsPlayingLive(true)}
            >
              <img
                src={blobUrl}
                alt="Full size memory"
                className="max-h-[75dvh] max-w-full rounded-2xl shadow-2xl object-contain"
              />
              {isLivePhoto && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-zinc-900/80 text-amber-400 border border-amber-400/40 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md hover:bg-amber-400 hover:text-zinc-950 transition-all">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Click to Play Motion</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
        )}
      </div>

      {/* Bottom Action Toolbar */}
      <div className="w-full max-w-md flex items-center justify-center gap-1.5 sm:gap-3 z-10 py-2 px-2">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleDownload} 
          className="flex-1 whitespace-nowrap rounded-xl shadow-md text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>
            <span className="hidden sm:inline">Download </span>
            {isLivePhoto ? 'Photo' : 'Image'}
          </span>
        </Button>

        {isLivePhoto && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadLiveVideo} 
            className="flex-1 whitespace-nowrap text-amber-400 border-amber-500/30 hover:bg-amber-500/10 rounded-xl text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5"
          >
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>
              <span className="hidden sm:inline">Live </span>
              Motion
            </span>
          </Button>
        )}

        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            onDelete(item.id);
            onClose();
          }}
          className="whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
};
