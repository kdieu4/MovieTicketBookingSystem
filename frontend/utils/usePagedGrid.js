'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRowPagination } from './useRowPagination';

/**
 * Danh sách dài lấy theo trang từ server nhưng hiển thị theo hàng.
 *
 * Mỗi lần bấm "Xem thêm" mở thêm `stepRows` hàng; nếu số ô cần hiện vượt quá số
 * bản ghi đã tải thì tự gọi trang kế tiếp. Nhờ vậy giao diện giữ đúng nhịp cũ
 * (3 hàng đầu, +2 hàng mỗi lần) mà dữ liệu vẫn về theo trang.
 *
 * @param fetchPage (page, size) => Promise<{ items, page, total, totalPages, hasMore, facets? }>
 * @param initial   dữ liệu trang 0 đã có sẵn (ví dụ render từ server), có thể bỏ trống
 */
export function usePagedGrid({
  fetchPage,
  pageSize,
  initial = null,
  initialRows = 3,
  stepRows = 2,
}) {
  const [items, setItems] = useState(initial?.items ?? []);
  const [page, setPage] = useState(initial?.page ?? 0);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [hasMore, setHasMore] = useState(Boolean(initial?.hasMore));
  const [facets, setFacets] = useState(initial?.facets ?? []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(null);

  // Bộ lọc đổi thì hàm lấy dữ liệu đổi theo; luôn dùng bản mới nhất.
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  // Chỉ nhận kết quả của lần gọi mới nhất, tránh dữ liệu cũ ghi đè.
  const requestRef = useRef(0);

  const pager = useRowPagination(items.length, { initialRows, stepRows });
  const { reset: resetRows, visibleCount, gridRef, showMore: revealMore } = pager;

  const loadPage = useCallback(
    async (nextPage, { replace = false } = {}) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchRef.current(nextPage, pageSize);
        if (requestId !== requestRef.current) return null;

        setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
        setPage(result.page);
        setTotal(result.total);
        setHasMore(Boolean(result.hasMore));
        if (result.facets) setFacets(result.facets);

        return result;
      } catch (err) {
        if (requestId === requestRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
        return null;
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [pageSize],
  );

  /** Đổi bộ lọc, đổi tab, đổi thành phố: xoá danh sách rồi tải lại từ trang 0. */
  const reload = useCallback(async () => {
    requestRef.current += 1; // huỷ kết quả của lần gọi đang chạy
    setItems([]);
    setPage(0);
    setTotal(0);
    setHasMore(false);
    resetRows();

    return loadPage(0, { replace: true });
  }, [loadPage, resetRows]);

  // Mở thêm hàng; thiếu dữ liệu thì effect bên dưới tự tải trang kế tiếp.
  const showMore = revealMore;

  useEffect(() => {
    if (loading || !hasMore) return;
    if (items.length === 0) return;
    if (visibleCount >= items.length) {
      loadPage(page + 1);
    }
  }, [visibleCount, items.length, hasMore, loading, page, loadPage]);

  // Lần đầu chưa có dữ liệu sẵn thì tải trang 0.
  useEffect(() => {
    if (initial) return;
    loadPage(0, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    facets,
    gridRef,
    visibleCount,
    total,
    // Còn dữ liệu để mở thêm: hoặc đã tải sẵn nhiều hơn số đang hiện, hoặc
    // server còn trang sau. Nếu chỉ dựa vào "server còn trang" thì trường hợp
    // tổng số mục nhỏ hơn một trang sẽ bị giấu mất nút "Xem thêm".
    canShowMore: hasMore || visibleCount < items.length,
    gridHasNextPage: hasMore,
    loading,
    error,
    showMore,
    reload,
    resetRows,
  };
}
