'use client';

import React from 'react';
import { Share, PlusSquare, X, Download, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS?: boolean;
  onInstallClick?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  isIOS = false,
  onInstallClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 p-2 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="PhotoBooth Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Install PhotoBooth App
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Offline-first experience & full screen camera
            </p>
          </div>
        </div>

        {/* Modal Content depending on Platform */}
        {isIOS ? (
          <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>iOS Safari Installation</span>
            </div>

            <ol className="flex flex-col gap-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span className="flex-1 leading-relaxed">
                  Tap the <strong className="text-zinc-900 dark:text-white inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded"><Share className="w-3.5 h-3.5 text-blue-500 inline" /> Share</strong> button at the bottom of Safari.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span className="flex-1 leading-relaxed">
                  Scroll down the share options and tap <strong className="text-zinc-900 dark:text-white inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded"><PlusSquare className="w-3.5 h-3.5 text-blue-500 inline" /> Add to Home Screen</strong>.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span className="flex-1 leading-relaxed">
                  Tap <strong className="text-zinc-900 dark:text-white">Add</strong> in the top right corner to install to your iPhone home screen!
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Install PhotoBooth Studio on your device for instant offline access, full-screen camera mode, and faster performance directly from your home screen or desktop.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (onInstallClick) onInstallClick();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl"
            >
              <Download className="w-5 h-5" />
              <span>Install Application</span>
            </Button>
          </div>
        )}

        {/* Modal Action / Footer */}
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-3 py-2"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
