export default function Badge({ children, tone = 'neutral' }) {
  const toneClass =
    tone === 'brand'
      ? 'bg-[var(--color-brand-primary-container)] text-[var(--color-brand-on-primary-container)]'
      : 'bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)]';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium leading-[1.4] ${toneClass}`}
    >
      {children}
    </span>
  );
}