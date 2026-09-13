'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { ShieldCheck, FileText, Heart, Lock, HardDrive, Sparkles, CheckCircle2, User } from 'lucide-react';

interface AboutPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPrivacyModal: React.FC<AboutPrivacyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>('privacy');

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" contentPadding="p-0">
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl overflow-hidden">
        
        {/* Header Hero Banner (Black & White Monochrome Gradient) */}
        <div className="relative bg-gradient-to-r from-black via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-zinc-900 p-5 sm:p-6 text-white border-b border-zinc-800 shrink-0 overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">PhotoBooth</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-zinc-200 px-2 py-0.5 rounded-full border border-white/20">
                    v2.0 • Local First
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-medium mt-0.5">
                  Privacy-first, 100% client-side web photo booth & video strip generator
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Black & White styling) */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 px-3 sm:px-4 pt-2 gap-1.5 sm:gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950 shadow-xs'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy & Data</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950 shadow-xs'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950 shadow-xs'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>About Creator</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4">
          
          {/* TAB 1: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-sm mb-0.5">100% Client-Side Private Storage</span>
                  Your privacy is fully protected. All photos, live video recordings, photo strip presets, and custom settings remain <strong>exclusively inside your browser</strong>. Nothing is ever uploaded to external servers or third-party cloud services.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <HardDrive className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Browser Storage</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Media files and strip drafts are stored directly in browser IndexedDB on your local device.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Zero Remote Tracking</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    No account registration required, no hidden cookies, and zero external analytics scripts tracking you.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Full Data Ownership</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    You own 100% of all images and videos generated. Download, export, or save them anytime directly.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Offline PWA Ready</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Works seamlessly offline once installed. Camera capture and photo strip rendering happen locally via Canvas.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TERMS */}
          {activeTab === 'terms' && (
            <div className="space-y-3 animate-in fade-in duration-200 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">1. Usage Rights</h4>
                <p className="text-[11px] sm:text-xs">
                  PhotoBooth is free to use for personal, creative, and non-commercial photo capture and strip generator projects. You maintain full ownership over all your photos, GIF animations, and photo strips created.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">2. Local Storage Disclaimer</h4>
                <p className="text-[11px] sm:text-xs">
                  Because all media files are stored locally in your browser's IndexedDB, clearing your browser data or site data will delete your stored gallery items unless you export or download them first.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">3. Camera Access</h4>
                <p className="text-[11px] sm:text-xs">
                  Camera access is used strictly in real-time within your active browser tab for previewing and capturing photos/videos. No camera feed is recorded or broadcasted to any external endpoint.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT CREATOR */}
          {activeTab === 'about' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border border-zinc-700">
                  WG
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-extrabold text-white">
                    Wilbert Gamis
                  </h3>
                  <p className="text-xs text-zinc-300 font-semibold">
                    Creator & Lead Developer
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    Crafted with passion using Next.js, TypeScript, TailwindCSS, and HTML5 Canvas APIs for a premium, privacy-conscious digital photo booth experience.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-zinc-900 dark:text-zinc-100 fill-zinc-900 dark:fill-zinc-100" /> Key Features
                </h4>
                <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Custom photo strip templates (Polaroid, 4-Shot, Grid, Theme Presets)</li>
                  <li>Real-time canvas filter effects and AR face tracking filters</li>
                  <li>Smooth video strip capture and high-quality PNG export</li>
                  <li>Responsive light mode & dark mode interface</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer with Copyright */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>© 2026</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">Wilbert Gamis</span>
            <span>•</span>
            <span>All Rights Reserved</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};
