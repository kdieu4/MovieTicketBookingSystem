import {addEvent as $cc3c3666b64debad$export$f531f92e2a15358f} from "./domHelpers.js";
import {getActiveElement as $d8ac7ed472840322$export$cd4e5573fbe2b576, getEventTarget as $d8ac7ed472840322$export$e58f029f0fbfdb29} from "./shadowdom/DOMFunctions.js";
import {getMetaValue as $e5cbb54a67a6569d$export$a929f3f93e2cc67e} from "./getMetaValue.js";
import {isAndroid as $d5a2be505488529f$export$a11b0059900ceec8, isMac as $d5a2be505488529f$export$9ac100e40613ea10, isWebKit as $d5a2be505488529f$export$78551043582a6a98} from "./platform.js";
import {isFocusable as $ee5e22534121197a$export$4c063cf1350e6fed} from "./isFocusable.js";

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




const $2224c9ee07fd529d$var$KEYBOARD_HEIGHT = 100;
const $2224c9ee07fd529d$var$KEYBOARD_TIMEOUT = 600;
// Tracks layout state of the on-screen keyboard.
const $2224c9ee07fd529d$var$state = {
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
const $2224c9ee07fd529d$var$nonTextInputTypes = new Set([
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
        get: ()=>{
            var _window_orientation;
            return (_window_orientation = window.orientation) !== null && _window_orientation !== void 0 ? _window_orientation : 0;
        },
        configurable: true
    });
}
function $2224c9ee07fd529d$var$getTouchScreen() {
    var _window_visualViewport, _window_visualViewport1, _window_visualViewport2, _window_screen_orientation;
    var _window_visualViewport_width;
    // Normalize the screen by any scaling to get the layout coordinate space.
    let screenWidth = Number((_window_visualViewport_width = (_window_visualViewport = window.visualViewport) === null || _window_visualViewport === void 0 ? void 0 : _window_visualViewport.width) !== null && _window_visualViewport_width !== void 0 ? _window_visualViewport_width : window.innerWidth);
    var _window_visualViewport_height;
    let screenHeight = Number((_window_visualViewport_height = (_window_visualViewport1 = window.visualViewport) === null || _window_visualViewport1 === void 0 ? void 0 : _window_visualViewport1.height) !== null && _window_visualViewport_height !== void 0 ? _window_visualViewport_height : window.innerHeight);
    var _window_visualViewport_scale;
    let visualScale = Number((_window_visualViewport_scale = (_window_visualViewport2 = window.visualViewport) === null || _window_visualViewport2 === void 0 ? void 0 : _window_visualViewport2.scale) !== null && _window_visualViewport_scale !== void 0 ? _window_visualViewport_scale : 1);
    var _window_screen_orientation_angle;
    return {
        width: screenWidth * visualScale,
        height: screenHeight * visualScale,
        angle: (_window_screen_orientation_angle = (_window_screen_orientation = window.screen.orientation) === null || _window_screen_orientation === void 0 ? void 0 : _window_screen_orientation.angle) !== null && _window_screen_orientation_angle !== void 0 ? _window_screen_orientation_angle : 0
    };
}
function $2224c9ee07fd529d$var$onResizeStart(e) {
    // So we don't constantly call clearTimeout and setTimeout, keep track of the
    // current timeout time and only reschedule the timer when it is getting close.
    if ($2224c9ee07fd529d$var$state.resizeTimeStamp <= e.timeStamp + 50) {
        $2224c9ee07fd529d$var$state.resizeTimeStamp = e.timeStamp + 150;
        window.clearTimeout($2224c9ee07fd529d$var$state.resizeTimeout);
        $2224c9ee07fd529d$var$state.resizeTimeout = window.setTimeout($2224c9ee07fd529d$var$onResizeEnd, 150);
    }
}
function $2224c9ee07fd529d$var$onResizeEnd() {
    let viewportMeta = (0, $e5cbb54a67a6569d$export$a929f3f93e2cc67e)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to measure.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $d5a2be505488529f$export$a11b0059900ceec8)() && (viewportMeta === null || viewportMeta === void 0 ? void 0 : viewportMeta.includes('overlays-content'))) return;
    let time = performance.now();
    let screen = $2224c9ee07fd529d$var$getTouchScreen();
    let elapsed = time - $2224c9ee07fd529d$var$state.startTimeStamp;
    let delta = $2224c9ee07fd529d$var$state.screenHeight - screen.height;
    let rotation = $2224c9ee07fd529d$var$state.screenAngle - screen.angle;
    // Update the screen once an open keyboard that rotated along closes. The state swap was
    // deferred, so the old width predicts the height it should close towards.
    if (Math.abs(rotation) % 180 && $2224c9ee07fd529d$var$state.screenWidth - screen.height < $2224c9ee07fd529d$var$KEYBOARD_HEIGHT) {
        $2224c9ee07fd529d$var$state.screenWidth = screen.width;
        $2224c9ee07fd529d$var$state.screenHeight = screen.height;
        $2224c9ee07fd529d$var$state.screenAngle = screen.angle;
        delta = 0;
    }
    // Update the screen if a resize happens outside the capture timeframe. We debounce
    // because WebKit may fire its single opening resize before the focus event.
    if (elapsed > $2224c9ee07fd529d$var$KEYBOARD_TIMEOUT) {
        window.clearTimeout($2224c9ee07fd529d$var$state.screenTimeout);
        $2224c9ee07fd529d$var$state.screenTimeout = window.setTimeout(()=>{
            let activeElement = document.hasFocus() ? (0, $d8ac7ed472840322$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = $2224c9ee07fd529d$export$c57958e35f31ed73(activeElement);
            let screen = $2224c9ee07fd529d$var$getTouchScreen();
            if (Math.abs($2224c9ee07fd529d$var$state.screenAngle - screen.angle) % 180) return;
            if ($2224c9ee07fd529d$var$state.isOpen && willKeyboardOpen) return;
            $2224c9ee07fd529d$var$state.screenWidth = screen.width;
            $2224c9ee07fd529d$var$state.screenHeight = screen.height;
            $2224c9ee07fd529d$var$state.screenAngle = screen.angle;
            $2224c9ee07fd529d$var$state.isOpen = false;
        }, $2224c9ee07fd529d$var$KEYBOARD_TIMEOUT);
    }
    // Otherwise, record an opening if the height changed by more than our threshold.
    // This may fail if the layout viewport changes for other reasons during this timeframe.
    if (elapsed <= $2224c9ee07fd529d$var$KEYBOARD_TIMEOUT && delta >= $2224c9ee07fd529d$var$KEYBOARD_HEIGHT) $2224c9ee07fd529d$var$state.endTimeStamp = time;
    // Store the new open state since the viewport is stable when this is reached.
    $2224c9ee07fd529d$var$state.isOpen = delta >= $2224c9ee07fd529d$var$KEYBOARD_HEIGHT;
}
function $2224c9ee07fd529d$var$onOrientationChange() {
    let screen = $2224c9ee07fd529d$var$getTouchScreen();
    let rotation = $2224c9ee07fd529d$var$state.screenAngle - screen.angle;
    // Rotation may cause the resize buffer to be filled, but we need to make sure a screen
    // estimate is already available in case focus lands before it expires. This could fail
    // if a top bar exceeds the keyboard threshold, in which case we may need to revisit.
    if (Math.abs(rotation) % 180 && !$2224c9ee07fd529d$var$state.isOpen) {
        let width = $2224c9ee07fd529d$var$state.screenWidth;
        let height = $2224c9ee07fd529d$var$state.screenHeight;
        $2224c9ee07fd529d$var$state.screenWidth = height;
        $2224c9ee07fd529d$var$state.screenHeight = width;
    }
    if (!$2224c9ee07fd529d$var$state.isOpen) $2224c9ee07fd529d$var$state.screenAngle = screen.angle;
}
function $2224c9ee07fd529d$var$onFocus(e) {
    let target = (0, $d8ac7ed472840322$export$e58f029f0fbfdb29)(e);
    let willKeyboardOpen = $2224c9ee07fd529d$export$c57958e35f31ed73(target);
    let time = performance.now();
    let screen = $2224c9ee07fd529d$var$getTouchScreen();
    let delta = $2224c9ee07fd529d$var$state.screenHeight - screen.height;
    // Update the screen and start the timer if we are about to open.
    if (delta < $2224c9ee07fd529d$var$KEYBOARD_HEIGHT && willKeyboardOpen) {
        $2224c9ee07fd529d$var$state.screenWidth = screen.width;
        $2224c9ee07fd529d$var$state.screenHeight = screen.height;
        $2224c9ee07fd529d$var$state.screenAngle = screen.angle;
        $2224c9ee07fd529d$var$state.startTimeStamp = time;
    }
    // This focus will open a keyboard so reset the buffer.
    if (willKeyboardOpen) window.clearTimeout($2224c9ee07fd529d$var$state.screenTimeout);
    // Stop the timer if the keyboard is already open.
    if (delta >= $2224c9ee07fd529d$var$KEYBOARD_HEIGHT && willKeyboardOpen) $2224c9ee07fd529d$var$state.endTimeStamp = time;
}
function $2224c9ee07fd529d$var$setupGlobalEvents() {
    let screen = $2224c9ee07fd529d$var$getTouchScreen();
    // WebKit only fires a single event per resize.
    (0, $cc3c3666b64debad$export$f531f92e2a15358f)(window.visualViewport, 'resize', (0, $d5a2be505488529f$export$78551043582a6a98)() ? $2224c9ee07fd529d$var$onResizeEnd : $2224c9ee07fd529d$var$onResizeStart);
    // oxlint-disable-next-line - looks like the lint for this is a little too aggressive
    (0, $cc3c3666b64debad$export$f531f92e2a15358f)(window.screen.orientation, 'change', $2224c9ee07fd529d$var$onOrientationChange);
    (0, $cc3c3666b64debad$export$f531f92e2a15358f)(window, 'focus', $2224c9ee07fd529d$var$onFocus, {
        capture: true,
        passive: true
    });
    // Store the initial screen dimensions.
    $2224c9ee07fd529d$var$state.screenWidth = screen.width;
    $2224c9ee07fd529d$var$state.screenHeight = screen.height;
    $2224c9ee07fd529d$var$state.screenAngle = screen.angle;
}
if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') $2224c9ee07fd529d$var$setupGlobalEvents();
    else (0, $cc3c3666b64debad$export$f531f92e2a15358f)(document, 'DOMContentLoaded', $2224c9ee07fd529d$var$setupGlobalEvents);
}
function $2224c9ee07fd529d$export$a986ed8aea890397() {
    let viewportMeta = (0, $e5cbb54a67a6569d$export$a929f3f93e2cc67e)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to await.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $d5a2be505488529f$export$a11b0059900ceec8)() && (viewportMeta === null || viewportMeta === void 0 ? void 0 : viewportMeta.includes('overlays-content'))) return false;
    // WebKit may resize before focus, but an open keyboard always means we have support.
    if ($2224c9ee07fd529d$var$state.isOpen) return true;
    // As long as no input has ever been focused, we return default support.
    if (!$2224c9ee07fd529d$var$state.startTimeStamp) return window.navigator.maxTouchPoints > 0;
    // If keyboard geometry changed within the timeout period, we have support.
    if ($2224c9ee07fd529d$var$state.endTimeStamp >= $2224c9ee07fd529d$var$state.startTimeStamp) return true;
    // If a geometry change is mid-flight we return the most recent support.
    // Supported platforms may have a hardware keyboard, which this won't catch, but thats
    // about as far as we can reasonably go to exclude non-touch devices.
    return performance.now() - $2224c9ee07fd529d$var$state.startTimeStamp <= $2224c9ee07fd529d$var$KEYBOARD_TIMEOUT ? $2224c9ee07fd529d$var$state.endTimeStamp > 0 || window.navigator.maxTouchPoints > 0 : false;
}
function $2224c9ee07fd529d$export$c57958e35f31ed73(target) {
    if (!(target instanceof Element) || !(0, $ee5e22534121197a$export$4c063cf1350e6fed)(target)) return false;
    let isTextArea = target instanceof HTMLTextAreaElement;
    let isEditable = target instanceof HTMLElement && target.isContentEditable;
    let isTextInput = target instanceof HTMLInputElement && !$2224c9ee07fd529d$var$nonTextInputTypes.has(target.type);
    return isTextArea || isEditable || isTextInput;
}
function $2224c9ee07fd529d$export$16792effe837dba3(event) {
    return (0, $d5a2be505488529f$export$9ac100e40613ea10)() ? event.metaKey : event.ctrlKey;
}
function $2224c9ee07fd529d$export$b1f1c83775b8b5f7() {
    return $2224c9ee07fd529d$var$state.isOpen;
}


export {$2224c9ee07fd529d$export$c57958e35f31ed73 as willOpenKeyboard, $2224c9ee07fd529d$export$a986ed8aea890397 as supportsKeyboard, $2224c9ee07fd529d$export$16792effe837dba3 as isCtrlKeyPressed, $2224c9ee07fd529d$export$b1f1c83775b8b5f7 as isKeyboardOpen};
//# sourceMappingURL=keyboard.js.map
