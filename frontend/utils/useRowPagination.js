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
  const [rows, setRows] = useState(null);
  // Người dùng đã tự mở thêm hàng thì thôi không tự cắt theo số hàng mặc định.
  const [expanded, setExpanded] = useState(false);

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

  // `rows === null` = hiện hết dữ liệu đã tải. Server không biết số cột nên cứ vẽ
  // hết; cắt ngay từ khung hình đầu sẽ làm footer nhảy (server vẽ 3 thẻ, client đo
  // ra 3 cột rồi vẽ 9 thẻ → CLS ~0,18 ở /rap-chieu).
  //
  // Đo được số cột rồi mới áp số hàng mặc định, và chỉ khi lưới nhiều cột: một cột
  // thì cuộn dọc là tự nhiên, cắt còn 3 thẻ chỉ làm trang ngắn đi.
  useEffect(() => {
    if (expanded || rows !== null || columns < 2) return;
    setRows(initialRows);
  }, [expanded, rows, columns, initialRows]);

  const visibleCount = rows === null ? total : Math.min(total, rows * columns);
  // Số ô cần có để lấp đủ số hàng đang mở (không bị chặn bởi số đã tải); dùng để
  // biết có phải gọi thêm trang hay không. `null` = chưa giới hạn hàng.
  const desiredCount = rows === null ? null : rows * columns;

  const showMore = useCallback(() => {
    setExpanded(true);
    setRows((current) => (current === null ? initialRows + stepRows : current + stepRows));
  }, [initialRows, stepRows]);

  const reset = useCallback(() => {
    setExpanded(false);
    setRows(null);
  }, []);

  return {
    gridRef,
    visibleCount,
    desiredCount,
    hasMore: visibleCount < total,
    showMore,
    reset,
  };
}
