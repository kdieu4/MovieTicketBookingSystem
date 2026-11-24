'use client';

import { useId } from 'react';
import { GlassLayer } from '@/components/liquid-glass';

// Ô tick kính nhẹ, dựng trên GlassLayer của kit (WebGL2 riêng của kit, không kéo `three`).
// Kit gốc có Checkbox đẹp hơn nhưng import three/webgpu ≈ 2,35 MB gzip, chỉ dùng cho vài ô tick
// nên đổi sang bản này. Hành vi vẫn là input[type=checkbox] thật: Tab, Space, đọc trình duyệt,
// tham gia form đều như cũ.
const SIZES = {
  sm: { box: 18, radius: 6, check: 'h-3 w-3' },
  md: { box: 22, radius: 7, check: 'h-3.5 w-3.5' },
  lg: { box: 28, radius: 9, check: 'h-4 w-4' },
};

/**
 * checked, onChange(boolean), label (chuỗi, dùng làm tên cho trình đọc màn hình khi hideLabel),
 * size sm|md|lg, color (hex), disabled, name, hideLabel.
 */
export function GlassCheckbox({
  checked = false,
  onChange,
  label,
  size = 'md',
  color = '#0066cc',
  disabled = false,
  name,
  hideLabel = true,
  className = '',
}) {
  const id = useId();
  const s = SIZES[size] ?? SIZES.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{ width: s.box, height: s.box }}
      >
        <label
          htmlFor={id}
          data-glass-host=""
          aria-hidden="true"
          className={`absolute inset-0 cursor-pointer overflow-hidden rounded-[var(--cb-radius)] border transition-colors duration-200 ${
            checked
              ? 'border-transparent [--glass-tint:var(--cb-color)]'
              : 'border-[var(--color-border-separator)] [--glass-tint:var(--color-fill-secondary)]'
          } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
          style={{ '--cb-radius': `${s.radius}px`, '--cb-color': color }}
        >
          <GlassLayer material="clear" tint={checked ? 1 : 0.65} swell={false} />
        </label>

        {/* Dấu tick vẽ trên kính để không bị khúc xạ làm mờ */}
        {checked && (
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`pointer-events-none relative z-10 text-white ${s.check}`}
          >
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
          </svg>
        )}

        <input
          id={id}
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          aria-label={hideLabel ? label : undefined}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        {/* Vòng focus: hiện khi input bên dưới được focus bằng bàn phím */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-[calc(var(--cb-r2))] ring-2 ring-[var(--color-brand-primary)] opacity-0 peer-focus-visible:opacity-100"
          style={{ '--cb-r2': `${s.radius + 4}px` }}
        />
      </span>

      {!hideLabel && label && (
        <label
          htmlFor={id}
          className={`cursor-pointer text-[13px] leading-5 text-[var(--color-text-primary)] ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          {label}
        </label>
      )}
    </span>
  );
}

export default GlassCheckbox;
