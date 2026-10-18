"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getYouTubeEmbedUrl } from '@/utils/movieHelpers';
import { IconClose } from '@/components/common/Icons';

export default function TrailerModal({ isOpen, onClose, trailerUrl, title }) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) setIframeLoaded(false);
  }, [isOpen]);

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
      // Khóa cuộn trang khi mở modal
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Mở lại cuộn trang khi đóng modal
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !trailerUrl || !mounted) return null;

  // Sử dụng createPortal để gắn Modal trực tiếp vào document.body
  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md ${
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] transition-all duration-200 hover:rotate-90 hover:bg-[var(--color-fill-primary)] hover:text-[var(--color-text-primary)]"
            aria-label="Đóng"
          >
            <IconClose />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black leading-none">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white motion-reduce:animate-none" />
            </div>
          )}
          <iframe
            onLoad={() => setIframeLoaded(true)}
            src={getYouTubeEmbedUrl(trailerUrl)}
            title={`Trailer ${title}`}
            className={`absolute inset-0 block h-full w-full border-0 transition-opacity duration-500 ${
              iframeLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}