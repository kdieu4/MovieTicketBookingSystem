'use client';

import { Checkbox } from '@/components/liquid-glass/controls/Checkbox';

// Giữ nguyên API cũ của GlassCheckbox (onChange nhận boolean, hideLabel) nhưng dùng
// đúng Checkbox gốc của kit liquid-glass: kính three/webgpu, hiệu ứng đầy đủ, và đèn
// chuột chỉ sáng khi con trỏ ở gần (patch NEAR_FULL/NEAR_FADE trong runtime.ts).
// hideLabel: ẩn nhãn khỏi giao diện nhưng vẫn giữ tên cho trình đọc màn hình.
export function GlassCheckbox({
  checked = false,
  onChange,
  label,
  size = 'md',
  color,
  disabled = false,
  name,
  hideLabel = true,
  className = '',
}) {
  return (
    <span className={`inline-flex items-center ${hideLabel ? '[&_label]:sr-only' : ''} ${className}`}>
      <Checkbox
        checked={checked}
        onChange={onChange}
        label={label}
        size={size}
        color={color}
        disabled={disabled}
        name={name}
      />
    </span>
  );
}

export default GlassCheckbox;
