interface QueuedCallback {
    (isKeyboardOpen: boolean): void;
}
/**
 * Delays a callback execution until a keyboard transition may no longer impact layout.
 * Guarantees an invocation if an expected transition did not finish within 300ms.
 */
export declare function runAfterKeyboard(fn: QueuedCallback): () => void;
/**
 * Delays a callback execution until the on-screen keyboard has finished its transition.
 * Guarantees an invocation if an expected transition did not finish within 600ms.
 */
export declare function runAfterKeyboardTransition(fn: QueuedCallback): () => void;
export {};
