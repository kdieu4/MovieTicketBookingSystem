"use client";

import { useEffect, useRef } from 'react';

// Hiệu ứng click: 8 tia sáng nhỏ toả ra từ điểm bấm rồi mờ dần (~0.4s).
// Dựng lại từ component ClickSpark của reactbits.dev nhưng vẽ bằng canvas phủ toàn
// trang nên không tạo DOM node cho từng cú click và không chặn thao tác chuột.
const SPARK_COUNT = 8;
const SPARK_SIZE = 10; // độ dài mỗi tia lúc vừa bấm (px)
const SPARK_RADIUS = 12; // tia đi được bao xa (px)
const DURATION = 330; // ms
const LINE_WIDTH = 2;

// Tia chạy nhanh lúc đầu rồi chậm dần, giống cảm giác "bụp" của video mẫu.
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Màu lấy từ token --click-spark-color để tự đổi theo theme sáng/tối.
function readSparkColor() {
  if (typeof window === 'undefined') return '#1d1d1f';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--click-spark-color')
    .trim();
  return value || '#1d1d1f';
}

export default function ClickSpark({
  color = '',
  sparkCount = SPARK_COUNT,
  sparkSize = SPARK_SIZE,
  sparkRadius = SPARK_RADIUS,
  duration = DURATION,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Người dùng tắt chuyển động thì không vẽ gì cả.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    const sparks = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // Vẽ theo đơn vị CSS px để toạ độ click khớp trực tiếp.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        const progress = Math.min(1, (now - spark.start) / duration);

        if (progress >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        // Tia vừa trượt ra xa tâm vừa ngắn dần rồi tan, nên ở tâm luôn có khoảng trống.
        const inner = easeOut(progress) * sparkRadius;
        const outer = inner + sparkSize * (1 - progress);

        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';

        for (let s = 0; s < sparkCount; s += 1) {
          const angle = (s * 2 * Math.PI) / sparkCount;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(spark.x + cos * inner, spark.y + sin * inner);
          ctx.lineTo(spark.x + cos * outer, spark.y + sin * outer);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      if (sparks.length > 0) {
        rafId = requestAnimationFrame(draw);
      } else {
        rafId = 0;
        ctx.clearRect(0, 0, width, height);
      }
    };

    const onPointerDown = (event) => {
      // Chỉ phản hồi chuột trái và chạm; bỏ qua chuột phải/giữa.
      if (event.button !== 0) return;

      sparks.push({
        x: event.clientX,
        y: event.clientY,
        start: performance.now(),
        color: color || readSparkColor(),
      });

      if (!rafId) rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    // Dùng capture ở window để vẫn bắt được click đã bị stopPropagation ở component con.
    window.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown, true);
      if (rafId) cancelAnimationFrame(rafId);
      sparks.length = 0;
      ctx.clearRect(0, 0, width, height);
    };
  }, [color, sparkCount, sparkSize, sparkRadius, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[300] h-full w-full"
    />
  );
}
