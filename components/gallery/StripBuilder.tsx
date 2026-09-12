'use client';

import React, { useState, useEffect } from 'react';
import { PhotoRecord, PhotoStripConfig } from '@/types/photo';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { createPhotoStripBlob } from '@/lib/export/strip';
import { STRIP_PRESETS, StripPreset, getStripPreset } from '@/lib/export/stripPresets';
import { savePhotoToDB } from '@/lib/storage/photos';
import { createThumbnailFromBlob } from '@/lib/canvas/composite';
import { Sparkles } from 'lucide-react';

interface StripBuilderProps {
  isOpen: boolean;
  photos: PhotoRecord[];
  onClose: () => void;
  onStripCreated: () => void;
}

// Inline SVGs avoid any Turbopack client module chunk resolution issues
const ThemeIcon: React.FC<{ type: string; className?: string }> = ({
  type,
  className = 'w-3.5 h-3.5',
}) => {
  switch (type) {
    case 'pirate-wanted':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 10h.01M15 10h.01M10 15h4" />
        </svg>
      );
    case 'bounty-hunter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      );
    case 'software-engineer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'black-hat':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'red-hat':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'couple':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'family':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'single':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
      );
    case 'taken':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'korean-vintage':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'vintage-3':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
  }
};

export const StripBuilder: React.FC<StripBuilderProps> = ({
  isOpen,
  photos,
  onClose,
  onStripCreated,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pirate-wanted');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [headerText, setHeaderText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#EED9B3');
  const [borderColor, setBorderColor] = useState('#3D2008');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const activePreset = getStripPreset(selectedPresetId);

  // Sync state when active preset changes
  useEffect(() => {
    setHeaderText(activePreset.defaultHeader);
    setSubtitleText(activePreset.defaultSubtitle);
    setBackgroundColor(activePreset.backgroundColor);
    setBorderColor(activePreset.borderColor);
  }, [selectedPresetId]);

  // Auto-select required photos for active preset
  useEffect(() => {
    if (isOpen && photos.length > 0) {
      const requiredShots = activePreset.shotCount;
      setSelectedIds(photos.slice(0, requiredShots).map((p) => p.id));
    }
  }, [isOpen, selectedPresetId, photos]);

  // Generate live preview on changes
  useEffect(() => {
    if (!isOpen || selectedIds.length === 0) {
      setPreviewBlobUrl(null);
      return;
    }

    let isMounted = true;
    setIsPreviewLoading(true);

    const generatePreview = async () => {
      try {
        const selectedBlobs = selectedIds
          .map((id) => photos.find((p) => p.id === id)?.processedBlob)
          .filter((b): b is Blob => !!b);

        if (selectedBlobs.length === 0) return;

        const stripBlob = await createPhotoStripBlob(selectedBlobs, {
          layout: activePreset.id as PhotoStripConfig['layout'],
          backgroundColor,
          borderColor,
          borderWidth: 18,
          padding: 20,
          headerText: headerText || activePreset.defaultHeader,
          subtitleText: subtitleText || activePreset.defaultSubtitle,
          badgeText: activePreset.badgeText,
          showDate: true,
        });

        if (isMounted) {
          const url = URL.createObjectURL(stripBlob);
          setPreviewBlobUrl((oldUrl) => {
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            return url;
          });
        }
      } catch (err) {
        console.error('Failed to generate strip preview:', err);
      } finally {
        if (isMounted) setIsPreviewLoading(false);
      }
    };

    const timer = setTimeout(generatePreview, 160);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, selectedPresetId, selectedIds, headerText, subtitleText, backgroundColor, borderColor, photos]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const toggleSelectPhoto = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= activePreset.shotCount) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleCreateStrip = async () => {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);

    try {
      const selectedBlobs = selectedIds
        .map((id) => photos.find((p) => p.id === id)?.processedBlob)
        .filter((b): b is Blob => !!b);

      const stripBlob = await createPhotoStripBlob(selectedBlobs, {
        layout: activePreset.id as PhotoStripConfig['layout'],
        backgroundColor,
        borderColor,
        borderWidth: 18,
        padding: 20,
        headerText: headerText || activePreset.defaultHeader,
        subtitleText: subtitleText || activePreset.defaultSubtitle,
        badgeText: activePreset.badgeText,
        showDate: true,
      });

      const thumbnailBlob = await createThumbnailFromBlob(stripBlob);

      const record: PhotoRecord = {
        id: `strip_${activePreset.id}_${Date.now()}`,
        originalBlob: stripBlob,
        processedBlob: stripBlob,
        thumbnailBlob,
        createdAt: Date.now(),
        width: 720,
        height: 2400,
        effectId: 'normal',
        effectSettings: {},
        type: 'strip',
        metadata: {
          title: headerText || activePreset.defaultHeader,
        },
      };

      await savePhotoToDB(record);
      onStripCreated();
      onClose();
    } catch (err) {
      console.error('Failed to assemble photo strip:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Themed Photo Strip Builder Studio" maxWidth="5xl">
      <div className="flex flex-col gap-4">
        
        {/* All Themes in 2 to 3 Clean Wrapped Lines */}
        <div className="flex flex-col gap-2 bg-zinc-950/90 p-3 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Select Strip Layout Theme
            </span>
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              {activePreset.name} • {activePreset.shotCount} Shots
            </span>
          </div>

          {/* Clean multi-line flex-wrap grid showing all themes */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {STRIP_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/40 scale-[1.02]'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <span className="p-0.5 rounded-md bg-zinc-800/80 flex items-center justify-center">
                    <ThemeIcon type={preset.id} />
                  </span>
                  <span>{preset.name}</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full ml-0.5"
                    style={{ backgroundColor: preset.borderColor }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Builder Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Left Column: Details & Photo Picker */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            {/* Customization Details */}
            <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Text & Color Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Header Title
                  </label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder={activePreset.defaultHeader}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Subtitle Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder={activePreset.defaultSubtitle}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-700">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-6 h-6 rounded-lg border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-zinc-300 font-mono">{backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Border Color
                  </label>
                  <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-700">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-6 h-6 rounded-lg border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-zinc-300 font-mono">{borderColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Selection Grid */}
            <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select Photos ({selectedIds.length} chosen)
                </span>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                  Required: {activePreset.shotCount} shots
                </span>
              </div>

              {photos.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-6">
                  No photos in gallery yet. Take some photos first!
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                  {photos.map((photo) => {
                    const selectedIndex = selectedIds.indexOf(photo.id);
                    const isSelected = selectedIndex !== -1;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => toggleSelectPhoto(photo.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40 scale-95'
                            : 'border-transparent opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={URL.createObjectURL(photo.thumbnailBlob || photo.processedBlob)}
                          alt="Choice"
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md">
                            {selectedIndex + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clean Live Strip Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-zinc-950/90 p-3 rounded-2xl border border-zinc-800 min-h-[350px]">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Live Strip Preview
            </span>

            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Assembling Strip...</span>
              </div>
            ) : previewBlobUrl ? (
              <div className="relative max-h-[340px] flex items-center justify-center">
                <img
                  src={previewBlobUrl}
                  alt="Live Photo Strip Preview"
                  className="max-h-[330px] w-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            ) : (
              <div className="text-xs text-zinc-500 text-center py-16">
                Select photos to generate live preview
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateStrip}
            disabled={selectedIds.length === 0 || isGenerating}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Assembling Strip...' : 'Generate Photo Strip'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
