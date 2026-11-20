'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Cuộn theo hàng: hiện `initialRows` hàng đầu, mỗi lần bấm "Xem thêm" mở thêm
 * `stepRows` hàng. Số cột lấy từ gridTemplateColumns thật của lưới nên đúng ở
 * mọi breakpoint (phim 2/3/5 cột, rạp 1/2/3 cột, vé 1 cột).
 *
 * `gridRef` là callback ref để hook biết khi lưới được gắn lại (ví dụ đổi tab),
 * nhờ đó số cột luôn đọc từ đúng phần tử đang hiển thị.
 */
export function useRowPagination(total, { initialRows = 3, stepRows = 2 } = {}) {
  const [gridEl, setGridEl] = useState(null);
  const [columns, setColumns] = useState(1);
  const [rows, setRows] = useState(initialRows);

  const gridRef = useCallback((node) => {
    setGridEl(node ?? null);
  }, []);

  useEffect(() => {
    if (!gridEl) return undefined;

    function readColumns() {
      const value = window.getComputedStyle(gridEl).gridTemplateColumns;
      const count = value && value !== 'none' ? value.trim().split(/\s+/).filter(Boolean).length : 1;
      setColumns(count > 0 ? count : 1);
    }

    readColumns();

    // Đổi kích thước cửa sổ có thể đổi số cột, khi đó số mục đang hiện cũng đổi.
    const observer = new ResizeObserver(readColumns);
    observer.observe(gridEl);

    return () => observer.disconnect();
  }, [gridEl]);

  const visibleCount = Math.min(total, rows * columns);

  const showMore = useCallback(() => setRows((current) => current + stepRows), [stepRows]);
  const reset = useCallback(() => setRows(initialRows), [initialRows]);

  return {
    gridRef,
    visibleCount,
    hasMore: visibleCount < total,
    showMore,
    reset,
  };
}
