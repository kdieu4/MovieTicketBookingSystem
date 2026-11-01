import {addEvent as $d447af545b77c9f1$export$f531f92e2a15358f} from "./domHelpers.mjs";
import {getActiveElement as $23f2114a1b82827e$export$cd4e5573fbe2b576, getEventTarget as $23f2114a1b82827e$export$e58f029f0fbfdb29} from "./shadowdom/DOMFunctions.mjs";
import {getMetaValue as $7096878c21af5e66$export$a929f3f93e2cc67e} from "./getMetaValue.mjs";
import {isAndroid as $2add3ce32c6007eb$export$a11b0059900ceec8, isMac as $2add3ce32c6007eb$export$9ac100e40613ea10, isWebKit as $2add3ce32c6007eb$export$78551043582a6a98} from "./platform.mjs";
import {isFocusable as $3b8b240c1bf84ab9$export$4c063cf1350e6fed} from "./isFocusable.mjs";

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 




const $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT = 100;
const $bb39c0fc1c19b34c$var$KEYBOARD_TIMEOUT = 600;
// Tracks layout state of the on-screen keyboard.
const $bb39c0fc1c19b34c$var$state = {
    isOpen: false,
    screenWidth: 0,
    screenHeight: 0,
    screenAngle: 0,
    screenTimeout: 0,
    startTimeStamp: 0,
    endTimeStamp: 0,
    resizeTimeStamp: 0,
    resizeTimeout: 0
};
// HTML input types that do not cause the software keyboard to appear.
const $bb39c0fc1c19b34c$var$nonTextInputTypes = new Set([
    'checkbox',
    'radio',
    'range',
    'color',
    'file',
    'image',
    'button',
    'submit',
    'reset'
]);
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && !Reflect.has(window, 'visualViewport')) {
    const visualViewport = Object.assign(new EventTarget(), {
        offsetTop: 0,
        offsetLeft: 0,
        pageTop: 0,
        pageLeft: 0,
        scale: 1
    });
    Reflect.defineProperty(visualViewport, 'width', {
        get: ()=>window.innerWidth,
        configurable: true
    });
    Reflect.defineProperty(visualViewport, 'height', {
        get: ()=>window.innerHeight,
        configurable: true
    });
    Reflect.defineProperty(window, 'visualViewport', {
        value: visualViewport,
        configurable: true,
        writable: true
    });
}
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && !Reflect.has(window.screen, 'orientation')) {
    const orientation = Object.assign(new EventTarget(), {
        type: 'landscape-primary'
    });
    Reflect.defineProperty(window.screen, 'orientation', {
        value: orientation,
        configurable: true,
        writable: true
    });
    Reflect.defineProperty(window.screen.orientation, 'angle', {
        get: ()=>window.orientation ?? 0,
        configurable: true
    });
}
function $bb39c0fc1c19b34c$var$getTouchScreen() {
    // Normalize the screen by any scaling to get the layout coordinate space.
    let screenWidth = Number(window.visualViewport?.width ?? window.innerWidth);
    let screenHeight = Number(window.visualViewport?.height ?? window.innerHeight);
    let visualScale = Number(window.visualViewport?.scale ?? 1);
    return {
        width: screenWidth * visualScale,
        height: screenHeight * visualScale,
        angle: window.screen.orientation?.angle ?? 0
    };
}
function $bb39c0fc1c19b34c$var$onResizeStart(e) {
    // So we don't constantly call clearTimeout and setTimeout, keep track of the
    // current timeout time and only reschedule the timer when it is getting close.
    if ($bb39c0fc1c19b34c$var$state.resizeTimeStamp <= e.timeStamp + 50) {
        $bb39c0fc1c19b34c$var$state.resizeTimeStamp = e.timeStamp + 150;
        window.clearTimeout($bb39c0fc1c19b34c$var$state.resizeTimeout);
        $bb39c0fc1c19b34c$var$state.resizeTimeout = window.setTimeout($bb39c0fc1c19b34c$var$onResizeEnd, 150);
    }
}
function $bb39c0fc1c19b34c$var$onResizeEnd() {
    let viewportMeta = (0, $7096878c21af5e66$export$a929f3f93e2cc67e)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to measure.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $2add3ce32c6007eb$export$a11b0059900ceec8)() && viewportMeta?.includes('overlays-content')) return;
    let time = performance.now();
    let screen = $bb39c0fc1c19b34c$var$getTouchScreen();
    let elapsed = time - $bb39c0fc1c19b34c$var$state.startTimeStamp;
    let delta = $bb39c0fc1c19b34c$var$state.screenHeight - screen.height;
    let rotation = $bb39c0fc1c19b34c$var$state.screenAngle - screen.angle;
    // Update the screen once an open keyboard that rotated along closes. The state swap was
    // deferred, so the old width predicts the height it should close towards.
    if (Math.abs(rotation) % 180 && $bb39c0fc1c19b34c$var$state.screenWidth - screen.height < $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT) {
        $bb39c0fc1c19b34c$var$state.screenWidth = screen.width;
        $bb39c0fc1c19b34c$var$state.screenHeight = screen.height;
        $bb39c0fc1c19b34c$var$state.screenAngle = screen.angle;
        delta = 0;
    }
    // Update the screen if a resize happens outside the capture timeframe. We debounce
    // because WebKit may fire its single opening resize before the focus event.
    if (elapsed > $bb39c0fc1c19b34c$var$KEYBOARD_TIMEOUT) {
        window.clearTimeout($bb39c0fc1c19b34c$var$state.screenTimeout);
        $bb39c0fc1c19b34c$var$state.screenTimeout = window.setTimeout(()=>{
            let activeElement = document.hasFocus() ? (0, $23f2114a1b82827e$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = $bb39c0fc1c19b34c$export$c57958e35f31ed73(activeElement);
            let screen = $bb39c0fc1c19b34c$var$getTouchScreen();
            if (Math.abs($bb39c0fc1c19b34c$var$state.screenAngle - screen.angle) % 180) return;
            if ($bb39c0fc1c19b34c$var$state.isOpen && willKeyboardOpen) return;
            $bb39c0fc1c19b34c$var$state.screenWidth = screen.width;
            $bb39c0fc1c19b34c$var$state.screenHeight = screen.height;
            $bb39c0fc1c19b34c$var$state.screenAngle = screen.angle;
            $bb39c0fc1c19b34c$var$state.isOpen = false;
        }, $bb39c0fc1c19b34c$var$KEYBOARD_TIMEOUT);
    }
    // Otherwise, record an opening if the height changed by more than our threshold.
    // This may fail if the layout viewport changes for other reasons during this timeframe.
    if (elapsed <= $bb39c0fc1c19b34c$var$KEYBOARD_TIMEOUT && delta >= $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT) $bb39c0fc1c19b34c$var$state.endTimeStamp = time;
    // Store the new open state since the viewport is stable when this is reached.
    $bb39c0fc1c19b34c$var$state.isOpen = delta >= $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT;
}
function $bb39c0fc1c19b34c$var$onOrientationChange() {
    let screen = $bb39c0fc1c19b34c$var$getTouchScreen();
    let rotation = $bb39c0fc1c19b34c$var$state.screenAngle - screen.angle;
    // Rotation may cause the resize buffer to be filled, but we need to make sure a screen
    // estimate is already available in case focus lands before it expires. This could fail
    // if a top bar exceeds the keyboard threshold, in which case we may need to revisit.
    if (Math.abs(rotation) % 180 && !$bb39c0fc1c19b34c$var$state.isOpen) {
        let width = $bb39c0fc1c19b34c$var$state.screenWidth;
        let height = $bb39c0fc1c19b34c$var$state.screenHeight;
        $bb39c0fc1c19b34c$var$state.screenWidth = height;
        $bb39c0fc1c19b34c$var$state.screenHeight = width;
    }
    if (!$bb39c0fc1c19b34c$var$state.isOpen) $bb39c0fc1c19b34c$var$state.screenAngle = screen.angle;
}
function $bb39c0fc1c19b34c$var$onFocus(e) {
    let target = (0, $23f2114a1b82827e$export$e58f029f0fbfdb29)(e);
    let willKeyboardOpen = $bb39c0fc1c19b34c$export$c57958e35f31ed73(target);
    let time = performance.now();
    let screen = $bb39c0fc1c19b34c$var$getTouchScreen();
    let delta = $bb39c0fc1c19b34c$var$state.screenHeight - screen.height;
    // Update the screen and start the timer if we are about to open.
    if (delta < $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT && willKeyboardOpen) {
        $bb39c0fc1c19b34c$var$state.screenWidth = screen.width;
        $bb39c0fc1c19b34c$var$state.screenHeight = screen.height;
        $bb39c0fc1c19b34c$var$state.screenAngle = screen.angle;
        $bb39c0fc1c19b34c$var$state.startTimeStamp = time;
    }
    // This focus will open a keyboard so reset the buffer.
    if (willKeyboardOpen) window.clearTimeout($bb39c0fc1c19b34c$var$state.screenTimeout);
    // Stop the timer if the keyboard is already open.
    if (delta >= $bb39c0fc1c19b34c$var$KEYBOARD_HEIGHT && willKeyboardOpen) $bb39c0fc1c19b34c$var$state.endTimeStamp = time;
}
function $bb39c0fc1c19b34c$var$setupGlobalEvents() {
    let screen = $bb39c0fc1c19b34c$var$getTouchScreen();
    // WebKit only fires a single event per resize.
    (0, $d447af545b77c9f1$export$f531f92e2a15358f)(window.visualViewport, 'resize', (0, $2add3ce32c6007eb$export$78551043582a6a98)() ? $bb39c0fc1c19b34c$var$onResizeEnd : $bb39c0fc1c19b34c$var$onResizeStart);
    // oxlint-disable-next-line - looks like the lint for this is a little too aggressive
    (0, $d447af545b77c9f1$export$f531f92e2a15358f)(window.screen.orientation, 'change', $bb39c0fc1c19b34c$var$onOrientationChange);
    (0, $d447af545b77c9f1$export$f531f92e2a15358f)(window, 'focus', $bb39c0fc1c19b34c$var$onFocus, {
        capture: true,
        passive: true
    });
    // Store the initial screen dimensions.
    $bb39c0fc1c19b34c$var$state.screenWidth = screen.width;
    $bb39c0fc1c19b34c$var$state.screenHeight = screen.height;
    $bb39c0fc1c19b34c$var$state.screenAngle = screen.angle;
}
if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') $bb39c0fc1c19b34c$var$setupGlobalEvents();
    else (0, $d447af545b77c9f1$export$f531f92e2a15358f)(document, 'DOMContentLoaded', $bb39c0fc1c19b34c$var$setupGlobalEvents);
}
function $bb39c0fc1c19b34c$export$a986ed8aea890397() {
    let viewportMeta = (0, $7096878c21af5e66$export$a929f3f93e2cc67e)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to await.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $2add3ce32c6007eb$export$a11b0059900ceec8)() && viewportMeta?.includes('overlays-content')) return false;
    // WebKit may resize before focus, but an open keyboard always means we have support.
    if ($bb39c0fc1c19b34c$var$state.isOpen) return true;
    // As long as no input has ever been focused, we return default support.
    if (!$bb39c0fc1c19b34c$var$state.startTimeStamp) return window.navigator.maxTouchPoints > 0;
    // If keyboard geometry changed within the timeout period, we have support.
    if ($bb39c0fc1c19b34c$var$state.endTimeStamp >= $bb39c0fc1c19b34c$var$state.startTimeStamp) return true;
    // If a geometry change is mid-flight we return the most recent support.
    // Supported platforms may have a hardware keyboard, which this won't catch, but thats
    // about as far as we can reasonably go to exclude non-touch devices.
    return performance.now() - $bb39c0fc1c19b34c$var$state.startTimeStamp <= $bb39c0fc1c19b34c$var$KEYBOARD_TIMEOUT ? $bb39c0fc1c19b34c$var$state.endTimeStamp > 0 || window.navigator.maxTouchPoints > 0 : false;
}
function $bb39c0fc1c19b34c$export$c57958e35f31ed73(target) {
    if (!(target instanceof Element) || !(0, $3b8b240c1bf84ab9$export$4c063cf1350e6fed)(target)) return false;
    let isTextArea = target instanceof HTMLTextAreaElement;
    let isEditable = target instanceof HTMLElement && target.isContentEditable;
    let isTextInput = target instanceof HTMLInputElement && !$bb39c0fc1c19b34c$var$nonTextInputTypes.has(target.type);
    return isTextArea || isEditable || isTextInput;
}
function $bb39c0fc1c19b34c$export$16792effe837dba3(event) {
    return (0, $2add3ce32c6007eb$export$9ac100e40613ea10)() ? event.metaKey : event.ctrlKey;
}
function $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7() {
    return $bb39c0fc1c19b34c$var$state.isOpen;
}


export {$bb39c0fc1c19b34c$export$c57958e35f31ed73 as willOpenKeyboard, $bb39c0fc1c19b34c$export$a986ed8aea890397 as supportsKeyboard, $bb39c0fc1c19b34c$export$16792effe837dba3 as isCtrlKeyPressed, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7 as isKeyboardOpen};
//# sourceMappingURL=keyboard.mjs.map
