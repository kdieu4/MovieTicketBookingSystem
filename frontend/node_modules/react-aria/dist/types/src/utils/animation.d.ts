import { RefObject } from 'react';
export declare function useEnterAnimation(ref: RefObject<HTMLElement | null>, isReady?: boolean, onEnter?: (element: HTMLElement) => void | Promise<void>): boolean;
export declare function useExitAnimation(ref: RefObject<HTMLElement | null>, isOpen: boolean, onExit?: (element: HTMLElement) => void | Promise<void>): boolean;
