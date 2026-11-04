interface QueuedCallback {
    (isTransition: boolean): void;
}
/**
 * Delays a callback execution until all elements finished their transition.
 */
export declare function runAfterTransition(fn: QueuedCallback): () => void;
export {};
