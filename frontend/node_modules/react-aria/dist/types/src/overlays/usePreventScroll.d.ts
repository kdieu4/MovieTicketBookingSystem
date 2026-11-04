interface PreventScrollOptions {
    /** Whether the scroll lock is disabled. */
    isDisabled?: boolean;
    /**
     * Whether to override the `focus()` method so it does not scroll the page.
     * This is temporary and will be removed after fully testing all overlays.
     *
     * @private
     */
    UNSTABLE_overrideFocus?: boolean;
}
/**
 * Prevents scrolling on the document body on mount, and
 * restores it on unmount. Also ensures that content does not
 * shift due to the scrollbars disappearing.
 */
export declare function usePreventScroll(options?: PreventScrollOptions): void;
export {};
