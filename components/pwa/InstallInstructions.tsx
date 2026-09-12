'use client';

import React from 'react';
import { Share, PlusSquare } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface InstallInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallInstructions: React.FC<InstallInstructionsProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Home Screen" maxWidth="md">
      <div className="flex flex-col gap-4 text-zinc-300 text-sm">
        <p>
          To install Photo Booth on your iOS or iPadOS device for complete offline operation:
        </p>

        <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-2xl border border-zinc-700/50">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
            <Share className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100">1. Tap Share Button</p>
            <p className="text-xs text-zinc-400">Located in Safari browser menu bar</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-2xl border border-zinc-700/50">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100">2. Select &apos;Add to Home Screen&apos;</p>
            <p className="text-xs text-zinc-400">Scroll down the share options list</p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
