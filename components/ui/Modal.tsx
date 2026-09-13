import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  contentPadding?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  contentPadding = 'p-6',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'w-full sm:w-[98vw] max-w-[98vw] h-full sm:h-[96vh] max-h-full sm:max-h-[96vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full ${widthClasses[maxWidth]} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
          maxWidth === 'full' ? 'h-full sm:h-[96vh] max-h-full sm:max-h-[96vh]' : 'max-h-[92vh]'
        } text-zinc-900 dark:text-zinc-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog" className="w-7 h-7">
              <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </Button>
          </div>
        )}
        <div className={`${contentPadding} overflow-y-auto flex-1 min-h-0`}>{children}</div>
      </div>
    </div>
  );
};
