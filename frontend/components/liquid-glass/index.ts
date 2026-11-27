// Liquid Glass — glass components (React 19 + Tailwind CSS v4), drawn by one dependency-free engine.
// GlassButton and GlassTabs take their behaviour from UI SDK (@ui-sdk/core, @ui-sdk/react).
// Copy the whole `liquid-glass/` folder, or install with the shadcn CLI (see README).
//
//   GlassButton        press   — swells under the pointer, bends the page behind it
//   GlassActionButton  merge   — its arrow is a droplet that melts in when pressed, and stays
//   GlassTabs          travel  — the selection travels as a magnifying lens
//   GlassCard          hold    — a card of glass: holds your content, its rim bends what slides behind
//   GlassMenu          grow    — the button's glass grows into the menu
//
// Repo chỉ giữ những phần đang dùng: GlassBadge, GlassSlideToConfirm, GlassButtonGroup và
// GlassDropdownMenu đã bỏ khỏi thư mục này (không file nào import). Cần lại thì copy từ
// upstream bilalgursen/liquid-glass, commit dbccc13.
export { GlassButton, type GlassButtonProps, type GlassButtonSize } from './glass-button'
export { GlassActionButton, type GlassActionButtonProps, type GlassActionState } from './glass-action-button'
export { GlassTabs, type GlassTabsProps, type GlassTabOption } from './glass-tabs'
export { GlassCard, type GlassCardProps } from './glass-card'
export {
  GlassMenu,
  GlassMenuTrigger,
  GlassMenuContent,
  GlassMenuItem,
  GlassMenuSeparator,
  type GlassMenuProps,
  type GlassMenuTriggerProps,
  type GlassMenuContentProps,
  type GlassMenuItemProps,
} from './glass-menu'
// Checkbox của kit (controls/Checkbox) dùng three/webgpu; repo bọc nó trong
// components/common/GlassCheckbox.jsx để giữ API onChange(boolean) và ẩn nhãn.
// Building blocks: GlassLens puts the travelling lens on your own tabs (Radix Tabs, a radiogroup).
export { GlassLens, type GlassLensProps } from './glass-lens'
// GlassPopup makes a popup (a select's list, a menu, a popover) one body with the control that opens it: on a neck (`stretch`), over the control (`morph`) or grown out of it (`grow`).
export { GlassPopupAnchor, GlassPopupSurface, GlassPopupText, useGlassPopup, type GlassPopup, type GlassPopupFrom, type GlassPopupOpening } from './glass-popup'
export { GlassLayer, GlassStyles, GLASS_CSS, type GlassLayerProps, type GlassMaterial, type GlassDroplet, type GlassOptics } from './glass-layer'
