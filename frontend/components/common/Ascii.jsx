"use client";

import { AsciiReveal, AsciiSkeleton } from 'ascii-reveal';

// Một cấu hình duy nhất cho toàn site: dither + tốc độ 1.5x.
export function Reveal({ children, ...props }) {
  return (
    <AsciiReveal preset="dither" speed={1.5} {...props}>
      {children}
    </AsciiReveal>
  );
}

// Khung chờ ASCII: dither mặc định, tĩnh cho danh sách dài để không tạo quá nhiều canvas.
export function Skeleton({ animate = false, ...props }) {
  return <AsciiSkeleton variant="dither" animate={animate} {...props} />;
}
