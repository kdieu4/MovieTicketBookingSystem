"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import '@/styles/intro.css';

const INTRO_KEY = 'seenema-intro-seen';

export default function IntroCurtain() {
  const [active, setActive] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const skipRef = useRef(null);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {}
    document.documentElement.setAttribute('data-intro-seen', '');
    setActive(false);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === '1';
    } catch {}
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seen || reducedMotion) finish();
  }, [finish]);

  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(finish, skipping ? 400 : 2900);
    return () => window.clearTimeout(timer);
  }, [active, skipping, finish]);

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSkipping(true);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        skipRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  function handleAnimationEnd(event) {
    if (event.target === event.currentTarget && event.animationName === 'intro-curtain-out') {
      finish();
    }
  }

  if (!active) return null;

  return (
    <div
      className={`intro-curtain${skipping ? ' is-skipping' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Giới thiệu Seenema"
      onAnimationEnd={handleAnimationEnd}
    >
      <button ref={skipRef} type="button" className="intro-skip" onClick={() => setSkipping(true)}>
        Bỏ qua
      </button>

      <div className="intro-stage">
        <svg className="intro-mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle className="intro-mark-ring" cx="24" cy="24" r="21" />
          <circle className="intro-mark-dot" cx="24" cy="24" r="5.5" />
        </svg>

        <div className="intro-wordmark-wrap">
          <p className="intro-wordmark">Seenema</p>
          <span className="intro-caret" aria-hidden="true" />
        </div>

        <div className="intro-progress" aria-hidden="true">
          <span className="intro-progress-fill" />
        </div>

        <p className="intro-status" role="status">
          Đang mở màn
        </p>
      </div>
    </div>
  );
}
