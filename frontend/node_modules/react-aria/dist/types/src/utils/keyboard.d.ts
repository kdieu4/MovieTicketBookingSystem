interface KeyPressEvent {
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
}
export declare function supportsKeyboard(): boolean;
export declare function willOpenKeyboard(target: Element | null): boolean;
export declare function isCtrlKeyPressed(event: KeyPressEvent): boolean;
export declare function isKeyboardOpen(): boolean;
export {};
