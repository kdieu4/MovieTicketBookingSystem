// Token màu theo theme, chuyển thẳng từ JSON "Apple HIG Inspired Theme System" người dùng cung cấp.
// Mỗi key là tên CSS custom property sẽ được gắn lên <html> bởi ThemeProvider.
// Không tự thêm/bớt giá trị so với JSON gốc để giữ đúng chuẩn Apple.

export const themes = {
  light: {
    '--color-brand-primary': '#007AFF',
    '--color-brand-primary-hover': '#0056B3',
    '--color-brand-on-primary': '#FFFFFF',
    '--color-brand-primary-container': '#E5F1FF',
    '--color-brand-on-primary-container': '#004085',

    '--color-bg-primary': '#FFFFFF',
    '--color-bg-secondary': '#F2F2F7',
    '--color-bg-tertiary': '#FFFFFF',
    '--color-bg-grouped-primary': '#F2F2F7',
    '--color-bg-grouped-secondary': '#FFFFFF',

    '--color-text-primary': '#000000',
    '--color-text-secondary': 'rgba(60, 60, 67, 0.60)',
    '--color-text-tertiary': 'rgba(60, 60, 67, 0.30)',
    '--color-text-quaternary': 'rgba(60, 60, 67, 0.18)',

    '--color-border-separator': 'rgba(60, 60, 67, 0.29)',
    '--color-border-opaque-separator': '#C6C6C8',

    '--color-fill-primary': 'rgba(120, 120, 128, 0.20)',
    '--color-fill-secondary': 'rgba(120, 120, 128, 0.16)',
    '--color-fill-tertiary': 'rgba(118, 118, 128, 0.12)',
    '--color-fill-quaternary': 'rgba(116, 116, 128, 0.08)',

    '--color-system-success': '#34C759',
    '--color-system-warning': '#FF9500',
    '--color-system-error': '#FF3B30',
    '--color-system-info': '#007AFF',
  },
  dark: {
    '--color-brand-primary': '#BF5AF2',
    '--color-brand-primary-hover': '#D380F5',
    '--color-brand-on-primary': '#FFFFFF',
    '--color-brand-primary-container': '#3A1D4D',
    '--color-brand-on-primary-container': '#E8B8F9',

    '--color-bg-primary': '#000000',
    '--color-bg-secondary': '#1C1C1E',
    '--color-bg-tertiary': '#2C2C2E',
    '--color-bg-grouped-primary': '#000000',
    '--color-bg-grouped-secondary': '#1C1C1E',

    '--color-text-primary': '#FFFFFF',
    '--color-text-secondary': 'rgba(235, 235, 245, 0.60)',
    '--color-text-tertiary': 'rgba(235, 235, 245, 0.30)',
    '--color-text-quaternary': 'rgba(235, 235, 245, 0.18)',

    '--color-border-separator': 'rgba(84, 84, 88, 0.65)',
    '--color-border-opaque-separator': '#38383A',

    '--color-fill-primary': 'rgba(120, 120, 128, 0.36)',
    '--color-fill-secondary': 'rgba(120, 120, 128, 0.32)',
    '--color-fill-tertiary': 'rgba(118, 118, 128, 0.24)',
    '--color-fill-quaternary': 'rgba(116, 116, 128, 0.18)',

    '--color-system-success': '#30D158',
    '--color-system-warning': '#FF9F0A',
    '--color-system-error': '#FF453A',
    '--color-system-info': '#64D2FF',
  },
};

export const DEFAULT_THEME = 'dark';