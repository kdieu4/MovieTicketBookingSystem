// Khung chờ xám (pulse) cho danh sách dài: không tạo canvas như ASCII nên không lag khi có nhiều phim.
export default function Skeleton({ lines, widths = [], width, height, className = '' }) {
  if (lines) {
    return (
      <div aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]"
            style={{ width: widths[index] ?? '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[var(--color-fill-tertiary)] ${className}`}
      style={{ width, height }}
    />
  );
}
