'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhotoRecord, PhotoStripConfig } from '@/types/photo';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { createPhotoStripBlob } from '@/lib/export/strip';
import { 
  STRIP_PRESETS, 
  StripPreset, 
  getStripPreset,
  LAYOUT_FORMAT_OPTIONS,
  THEME_PATTERN_OPTIONS,
  COLOR_PALETTE_PRESETS,
  THEME_CATEGORY_TABS
} from '@/lib/export/stripPresets';
import { savePhotoToDB } from '@/lib/storage/photos';
import { createThumbnailFromBlob } from '@/lib/canvas/composite';
import { 
  Sparkles, Move, ArrowUp, ArrowDown, MoveVertical, RotateCcw, 
  ChevronLeft, ChevronRight, Palette, Layers, Grid, Skull, 
  Terminal, Heart, Camera, Film, Sun, Moon, Flower2, Zap, 
  Ban, LayoutList, Columns2, Square, Grid2x2, Sparkles as ThemeSparklesIcon 
} from 'lucide-react';

interface StripBuilderProps {
  isOpen: boolean;
  photos: PhotoRecord[];
  onClose: () => void;
  onStripCreated: () => void;
}

const CategoryIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-3.5 h-3.5' }) => {
  switch (icon) {
    case 'grid': return <Grid className={className} />;
    case 'skull': return <Skull className={className} />;
    case 'terminal': return <Terminal className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'camera': return <Camera className={className} />;
    case 'film': return <Film className={className} />;
    default: return <Grid className={className} />;
  }
};

const PatternIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-3.5 h-3.5' }) => {
  switch (icon) {
    case 'ban': return <Ban className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'sun': return <Sun className={className} />;
    case 'flower': return <Flower2 className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'terminal': return <Terminal className={className} />;
    case 'skull': return <Skull className={className} />;
    case 'camera': return <Camera className={className} />;
    case 'cherry': return <Heart className={`${className} text-rose-500`} />;
    case 'ribbon': return <Sparkles className={`${className} text-pink-400`} />;
    case 'star': return <Zap className={`${className} text-amber-400`} />;
    case 'paw-print': return <Layers className={`${className} text-amber-600`} />;
    case 'cloud': return <Sun className={`${className} text-sky-400`} />;
    case 'grid-3x3': return <Grid className={className} />;
    default: return <Sparkles className={className} />;
  }
};

const LayoutIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-3.5 h-3.5' }) => {
  switch (icon) {
    case 'layout-list': return <LayoutList className={className} />;
    case 'columns': return <Columns2 className={className} />;
    case 'grid': return <Grid2x2 className={className} />;
    case 'square': return <Square className={className} />;
    default: return <LayoutList className={className} />;
  }
};

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
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('vertical-3');
  const [selectedPatternId, setSelectedPatternId] = useState<PhotoStripConfig['themePattern']>('hearts');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('red-hearts-black');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageOffsets, setImageOffsets] = useState<Array<{ x: number; y: number }>>([
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
  ]);
  const [headerText, setHeaderText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#0F0F12');
  const [borderColor, setBorderColor] = useState('#EF4444');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState<number>(18);
  const [padding, setPadding] = useState<number>(20);
  const [frameRadius, setFrameRadius] = useState<number>(4);
  const [fitExactEdges, setFitExactEdges] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const activeLayout = LAYOUT_FORMAT_OPTIONS.find((l) => l.id === selectedLayoutId) || LAYOUT_FORMAT_OPTIONS[0];

  // Auto-select required photos for active layout
  useEffect(() => {
    if (isOpen && photos.length > 0) {
      const requiredShots = activeLayout.shotCount;
      setSelectedIds(photos.slice(0, requiredShots).map((p) => p.id));
    }
  }, [isOpen, selectedLayoutId, photos]);

  const handleSelectPreset = (preset: StripPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.id === 'grid-2x2') setSelectedLayoutId('grid-2x2');
    else if (preset.id === 'polaroid') setSelectedLayoutId('polaroid');
    else if (preset.shotCount === 4) setSelectedLayoutId('classic-4');
    else setSelectedLayoutId('vertical-3');

    setSelectedPatternId(preset.pattern || 'none');
    setHeaderText(preset.defaultHeader);
    setSubtitleText(preset.defaultSubtitle);
    setBackgroundColor(preset.backgroundColor);
    setBorderColor(preset.borderColor);
    setTextColor(preset.textColor || '#FFFFFF');
    setBorderWidth(18);
    setPadding(20);
    setFrameRadius(preset.frameRadius ?? 4);
    setFitExactEdges(false);
  };

  const handleSelectPattern = (patternId: typeof selectedPatternId) => {
    setSelectedPatternId(patternId);
    const themeOpt = THEME_PATTERN_OPTIONS.find((t) => t.id === patternId);
    if (themeOpt) {
      setBackgroundColor(themeOpt.defaultBg);
      setBorderColor(themeOpt.defaultBorder);
      setTextColor(themeOpt.defaultText || '#FFFFFF');
    }
  };

  // Generate live preview on changes
  useEffect(() => {
    if (!isOpen || selectedIds.length === 0) {
      setPreviewBlobUrl(null);
      return;
    }

    let isMounted = true;
    
    setPreviewBlobUrl((currentUrl) => {
      if (!currentUrl) {
        setIsPreviewLoading(true);
      }
      return currentUrl;
    });

    const generatePreview = async () => {
      try {
        const selectedBlobs = selectedIds
          .map((id) => photos.find((p) => p.id === id)?.processedBlob)
          .filter((b): b is Blob => !!b);

        if (selectedBlobs.length === 0) return;

        const stripBlob = await createPhotoStripBlob(selectedBlobs, {
          layout: selectedLayoutId as PhotoStripConfig['layout'],
          themePattern: selectedPatternId,
          backgroundColor,
          borderColor,
          textColor,
          headerColor: textColor,
          borderWidth,
          padding,
          fitExactEdges,
          frameRadius,
          headerText: headerText,
          subtitleText: subtitleText,
          badgeText: '',
          showDate: true,
          imageOffsets,
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

    const timer = setTimeout(generatePreview, 40);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, selectedLayoutId, selectedPatternId, selectedIds, headerText, subtitleText, backgroundColor, borderColor, textColor, borderWidth, padding, fitExactEdges, frameRadius, imageOffsets, photos]);

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
      if (prev.length >= activeLayout.shotCount) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const setSlotYOffset = (slotIndex: number, yVal: number, xVal: number = 0.5) => {
    setImageOffsets((prev) => {
      const next = [...prev];
      while (next.length <= slotIndex) next.push({ x: 0.5, y: 0.5 });
      next[slotIndex] = { x: xVal, y: yVal };
      return next;
    });
  };

  const movePhotoOrder = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedIds.length) return;

    const nextIds = [...selectedIds];
    const tempId = nextIds[index];
    nextIds[index] = nextIds[targetIndex];
    nextIds[targetIndex] = tempId;
    setSelectedIds(nextIds);

    const nextOffsets = [...imageOffsets];
    const tempOffset = nextOffsets[index] || { x: 0.5, y: 0.5 };
    nextOffsets[index] = nextOffsets[targetIndex] || { x: 0.5, y: 0.5 };
    nextOffsets[targetIndex] = tempOffset;
    setImageOffsets(nextOffsets);
  };

  // Interactive Live Preview Dragging Handler
  const handlePreviewMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current || selectedIds.length === 0) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = previewContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const relY = (clientY - rect.top) / rect.height;
    const relX = (clientX - rect.left) / rect.width;

    const slotCount = activeLayout.shotCount;
    let slotIndex = 0;

    if (selectedLayoutId === 'grid-2x2') {
      const col = relX > 0.5 ? 1 : 0;
      const row = relY > 0.5 ? 1 : 0;
      slotIndex = row * 2 + col;
    } else if (selectedLayoutId === 'polaroid') {
      slotIndex = 0;
    } else {
      const photoAreaStart = 0.15;
      const photoAreaEnd = 0.85;
      const normalizedY = Math.max(0, Math.min(1, (relY - photoAreaStart) / (photoAreaEnd - photoAreaStart)));
      slotIndex = Math.min(slotCount - 1, Math.floor(normalizedY * slotCount));
    }

    setIsDragging(true);
    const startX = clientX;
    const startY = clientY;
    const initialOffset = imageOffsets[slotIndex] || { x: 0.5, y: 0.5 };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }

      const curX = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const curY = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;

      const deltaX = curX - startX;
      const deltaY = curY - startY;

      const sensitivity = 220;
      const newX = Math.max(0, Math.min(1, initialOffset.x - deltaX / sensitivity));
      const newY = Math.max(0, Math.min(1, initialOffset.y - deltaY / sensitivity));

      setImageOffsets((prev) => {
        const next = [...prev];
        while (next.length <= slotIndex) next.push({ x: 0.5, y: 0.5 });
        next[slotIndex] = { x: newX, y: newY };
        return next;
      });
    };

    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
  };

  const handleCreateStrip = async () => {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);

    try {
      const selectedBlobs = selectedIds
        .map((id) => photos.find((p) => p.id === id)?.processedBlob)
        .filter((b): b is Blob => !!b);

      const stripBlob = await createPhotoStripBlob(selectedBlobs, {
        layout: selectedLayoutId as PhotoStripConfig['layout'],
        themePattern: selectedPatternId,
        backgroundColor,
        borderColor,
        textColor,
        headerColor: textColor,
        borderWidth,
        padding,
        fitExactEdges,
        frameRadius,
        headerText: headerText,
        subtitleText: subtitleText,
        badgeText: '',
        showDate: true,
        imageOffsets,
      });

      const thumbnailBlob = await createThumbnailFromBlob(stripBlob);

      const record: PhotoRecord = {
        id: `strip_${selectedLayoutId}_${Date.now()}`,
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
          title: headerText || `${activeLayout.name} Strip`,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Themed Photo Strip Studio" maxWidth="5xl" contentPadding="p-3 sm:p-4">
      <div className="flex flex-col gap-2">
        
        {/* Step 1: Select Layout Format */}
        <div className="bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 1. Select Layout Format
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              {activeLayout.name} • {activeLayout.shotCount} Shots
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {LAYOUT_FORMAT_OPTIONS.map((layout) => {
              const isSelected = selectedLayoutId === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setSelectedLayoutId(layout.id)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 dark:border-blue-400 shadow-sm scale-[1.01]'
                      : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutIcon icon={layout.icon} className="w-3.5 h-3.5" />
                  <span>{layout.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Theme Presets & Category Tabs */}
        <div className="bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ThemeSparklesIcon className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" /> 2. Select Theme Preset Style
            </span>
                       {/* Clean Vector Icon Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {THEME_CATEGORY_TABS.map((tab) => {
                const isActive = activeCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <CategoryIcon icon={tab.icon} className="w-3 h-3" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Vector Filtered Preset Cards Grid (No Circle Dots!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
            {STRIP_PRESETS.filter(
              (preset) => activeCategoryTab === 'all' || preset.category === activeCategoryTab
            ).map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center gap-2 p-1.5 px-2.5 rounded-lg text-left transition-all border relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 dark:from-pink-950/80 dark:to-purple-950/80 border-pink-500 text-pink-950 dark:text-white ring-1 ring-pink-500 font-bold'
                      : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <ThemeIcon type={preset.decorationType} className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold truncate text-[11px] leading-tight text-zinc-900 dark:text-zinc-100">{preset.name}</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono capitalize truncate">{preset.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clean Pattern Overlay Row (Flex-Wrap so all patterns fit on screen) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap shrink-0">Pattern Overlay:</span>
            <div className="flex flex-wrap items-center gap-1">
              {THEME_PATTERN_OPTIONS.map((pattern) => {
                const isSelected = selectedPatternId === pattern.id;
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => handleSelectPattern(pattern.id)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <PatternIcon icon={pattern.icon} className="w-3 h-3" />
                    <span>{pattern.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Studio Workspace (Fit 1-Screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          
          {/* Left Column: Customization, Photo Picker & Frame Controls */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            
            {/* Step 3: Background & Text Details */}
            <div className="bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> 3. Background & Text Details
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5">Header Title (Optional)</label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. PHOTO BOOTH"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5">Subtitle Tagline (Optional)</label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder="e.g. meow / #memories"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Color Pickers & Clean Swatches */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Color Pickers & Swatches:</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 cursor-pointer" title="Header Title & Text Color">
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">Title Color:</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-4 h-4 rounded border-none cursor-pointer bg-transparent"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 cursor-pointer" title="Background Color">
                      <span>BG:</span>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-4 h-4 rounded border-none cursor-pointer bg-transparent"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 cursor-pointer" title="Border Color">
                      <span>Border:</span>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-4 h-4 rounded border-none cursor-pointer bg-transparent"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {COLOR_PALETTE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBackgroundColor(preset.bg);
                        setBorderColor(preset.border);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="w-2.5 h-2.5 rounded-sm border border-zinc-300 dark:border-zinc-700 shrink-0" style={{ backgroundColor: preset.bg }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Sizing & Top/Bottom Edge Alignment */}
              <div className="flex flex-col gap-1 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Frame Spacing & Edges:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (fitExactEdges) {
                        setFitExactEdges(false);
                        setPadding(20);
                        setBorderWidth(18);
                      } else {
                        setFitExactEdges(true);
                        setPadding(0);
                        setBorderWidth(0);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                      fitExactEdges
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}
                  >
                    {fitExactEdges ? 'Exact Top & Bottom' : 'Standard Margins'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <div>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5">Photo Spacing:</span>
                    <div className="flex items-center gap-1">
                      {[0, 8, 16, 24].map((pVal) => (
                        <button
                          key={pVal}
                          type="button"
                          onClick={() => {
                            setPadding(pVal);
                            if (pVal === 0) setFitExactEdges(true);
                          }}
                          className={`flex-1 py-0.5 text-[9px] font-semibold rounded border ${
                            padding === pVal
                              ? 'bg-blue-600/90 text-white border-blue-500'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          {pVal === 0 ? 'Edge' : `${pVal}px`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5">Frame Thickness:</span>
                    <div className="flex items-center gap-1">
                      {[0, 6, 14, 20].map((bVal) => (
                        <button
                          key={bVal}
                          type="button"
                          onClick={() => setBorderWidth(bVal)}
                          className={`flex-1 py-0.5 text-[9px] font-semibold rounded border ${
                            borderWidth === bVal
                              ? 'bg-blue-600/90 text-white border-blue-500'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          {bVal === 0 ? 'None' : `${bVal}px`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5">Photo Corner Radius:</span>
                    <div className="flex items-center gap-1">
                      {[0, 4, 12, 24].map((rVal) => (
                        <button
                          key={rVal}
                          type="button"
                          onClick={() => setFrameRadius(rVal)}
                          className={`flex-1 py-0.5 text-[9px] font-semibold rounded border ${
                            frameRadius === rVal
                              ? 'bg-blue-600/90 text-white border-blue-500'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          {rVal === 0 ? 'Square' : `${rVal}px`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Selection Grid */}
            <div className="bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Select Photos ({selectedIds.length} / {activeLayout.shotCount})
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Required: {activeLayout.shotCount} shots
                </span>
              </div>

              {photos.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-4">
                  No photos in gallery yet. Take some photos first!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {photos.map((photo) => {
                    const selectedIndex = selectedIds.indexOf(photo.id);
                    const isSelected = selectedIndex !== -1;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => toggleSelectPhoto(photo.id)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 shrink-0 transition-all ${
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
                          <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold shadow-md">
                            {selectedIndex + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Photo Crop Position & Order Toolbar */}
            {selectedIds.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Frame Position & Order
                  </span>
                  <button
                    onClick={() => setImageOffsets(Array(activeLayout.shotCount).fill({ x: 0.5, y: 0.5 }))}
                    className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset All
                  </button>
                </div>

                <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                  {selectedIds.map((id, index) => {
                    const currentOffset = imageOffsets[index] || { x: 0.5, y: 0.5 };
                    return (
                      <div
                        key={`${id}_${index}`}
                        className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-300 font-semibold truncate max-w-[80px]">
                            Shot {index + 1}
                          </span>

                          {/* Reorder Left/Right */}
                          <div className="flex items-center gap-0.5 ml-1">
                            <button
                              disabled={index === 0}
                              onClick={() => movePhotoOrder(index, 'left')}
                              className="p-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move photo earlier"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              disabled={index === selectedIds.length - 1}
                              onClick={() => movePhotoOrder(index, 'right')}
                              className="p-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move photo later"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Vertical Position Presets */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSlotYOffset(index, 0.0)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              currentOffset.y <= 0.1
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                            title="Position photo to show top (head/face)"
                          >
                            <ArrowUp className="w-2.5 h-2.5 inline mr-0.5" /> Top
                          </button>
                          <button
                            onClick={() => setSlotYOffset(index, 0.5)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              currentOffset.y > 0.4 && currentOffset.y < 0.6
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                            title="Center photo vertically"
                          >
                            <MoveVertical className="w-2.5 h-2.5 inline mr-0.5" /> Center
                          </button>
                          <button
                            onClick={() => setSlotYOffset(index, 1.0)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              currentOffset.y >= 0.9
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                            title="Position photo to show bottom"
                          >
                            <ArrowDown className="w-2.5 h-2.5 inline mr-0.5" /> Bottom
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Clean Interactive Live Strip Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 h-full min-h-[300px] overflow-hidden relative">
            <div className="flex items-center justify-between w-full mb-1 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Live Strip Preview
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <Move className="w-3 h-3 animate-pulse" /> Drag photo to reposition
              </span>
            </div>

            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500 my-auto">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Assembling Strip...</span>
              </div>
            ) : previewBlobUrl ? (
              <div
                ref={previewContainerRef}
                onMouseDown={handlePreviewMouseDown}
                onTouchStart={handlePreviewMouseDown}
                className={`relative w-full h-[270px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none rounded-lg p-1.5 bg-zinc-200/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 transition-all my-auto ${
                  isDragging ? 'ring-2 ring-blue-500/60 scale-[0.99]' : ''
                }`}
              >
                <img
                  src={previewBlobUrl}
                  alt="Live Photo Strip Preview"
                  className="max-h-[100%] max-w-[100%] object-contain rounded-lg shadow-xl pointer-events-none"
                />
              </div>
            ) : (
              <div className="text-xs text-zinc-500 text-center py-12 my-auto">
                Select photos to generate live preview
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateStrip}
            disabled={selectedIds.length === 0 || isGenerating}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Assembling Strip...' : 'Generate Photo Strip'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
