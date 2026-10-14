"use client";

import { useEffect, useState } from 'react';
import { getYouTubeEmbedUrl } from '@/utils/movieHelpers';
import { IconClose } from '@/components/common/Icons';

export default function TrailerModal({ isOpen, onClose, trailerUrl, title }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !trailerUrl) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-separator)] shadow-[var(--shadow-high)] ${
          isClosing ? 'animate-popup-out' : 'animate-popup-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-separator)] px-5 py-3.5">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
            Trailer: {title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-fill-primary)] hover:text-[var(--color-text-primary)]"
            aria-label="Đóng"
          >
            <IconClose />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getYouTubeEmbedUrl(trailerUrl)}
            title={`Trailer ${title}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}