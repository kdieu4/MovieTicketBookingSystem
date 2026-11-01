import { AriaLabelingProps, DOMAttributes, DOMProps, FocusableElement, RefObject } from '@react-types/shared';
export interface AriaDialogProps extends DOMProps, AriaLabelingProps {
    /**
     * The accessibility role for the dialog.
     *
     * @default 'dialog'
     */
    role?: 'dialog' | 'alertdialog';
    /**
     * Whether the dialog is currently performing an entry animation. Focus is not moved into the
     * dialog until the animation completes, since moving the screen reader cursor may cause scrolling
     * that interrupts the animation.
     */
    isEntering?: boolean;
}
export interface DialogAria {
    /** Props for the dialog container element. */
    dialogProps: DOMAttributes;
    /** Props for the dialog title element. */
    titleProps: DOMAttributes;
    /** Props for the dialog content/description element. Used for aria-describedby on alertdialogs. */
    contentProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export declare function useDialog(props: AriaDialogProps, ref: RefObject<FocusableElement | null>): DialogAria;
