var $49582955cc364b1c$exports = require("./domHelpers.cjs");
var $da02ee888921bc9e$exports = require("./shadowdom/DOMFunctions.cjs");
var $3632a2abc5d34548$exports = require("./getMetaValue.cjs");
var $d0b4a781cf26e80b$exports = require("./platform.cjs");
var $48f566b6becd50da$exports = require("./isFocusable.cjs");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "willOpenKeyboard", function () { return $d74c59468d7890a7$export$c57958e35f31ed73; });
$parcel$export(module.exports, "supportsKeyboard", function () { return $d74c59468d7890a7$export$a986ed8aea890397; });
$parcel$export(module.exports, "isCtrlKeyPressed", function () { return $d74c59468d7890a7$export$16792effe837dba3; });
$parcel$export(module.exports, "isKeyboardOpen", function () { return $d74c59468d7890a7$export$b1f1c83775b8b5f7; });
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




const $d74c59468d7890a7$var$KEYBOARD_HEIGHT = 100;
const $d74c59468d7890a7$var$KEYBOARD_TIMEOUT = 600;
// Tracks layout state of the on-screen keyboard.
const $d74c59468d7890a7$var$state = {
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
const $d74c59468d7890a7$var$nonTextInputTypes = new Set([
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
function $d74c59468d7890a7$var$getTouchScreen() {
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
function $d74c59468d7890a7$var$onResizeStart(e) {
    // So we don't constantly call clearTimeout and setTimeout, keep track of the
    // current timeout time and only reschedule the timer when it is getting close.
    if ($d74c59468d7890a7$var$state.resizeTimeStamp <= e.timeStamp + 50) {
        $d74c59468d7890a7$var$state.resizeTimeStamp = e.timeStamp + 150;
        window.clearTimeout($d74c59468d7890a7$var$state.resizeTimeout);
        $d74c59468d7890a7$var$state.resizeTimeout = window.setTimeout($d74c59468d7890a7$var$onResizeEnd, 150);
    }
}
function $d74c59468d7890a7$var$onResizeEnd() {
    let viewportMeta = (0, $3632a2abc5d34548$exports.getMetaValue)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to measure.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $d0b4a781cf26e80b$exports.isAndroid)() && viewportMeta?.includes('overlays-content')) return;
    let time = performance.now();
    let screen = $d74c59468d7890a7$var$getTouchScreen();
    let elapsed = time - $d74c59468d7890a7$var$state.startTimeStamp;
    let delta = $d74c59468d7890a7$var$state.screenHeight - screen.height;
    let rotation = $d74c59468d7890a7$var$state.screenAngle - screen.angle;
    // Update the screen once an open keyboard that rotated along closes. The state swap was
    // deferred, so the old width predicts the height it should close towards.
    if (Math.abs(rotation) % 180 && $d74c59468d7890a7$var$state.screenWidth - screen.height < $d74c59468d7890a7$var$KEYBOARD_HEIGHT) {
        $d74c59468d7890a7$var$state.screenWidth = screen.width;
        $d74c59468d7890a7$var$state.screenHeight = screen.height;
        $d74c59468d7890a7$var$state.screenAngle = screen.angle;
        delta = 0;
    }
    // Update the screen if a resize happens outside the capture timeframe. We debounce
    // because WebKit may fire its single opening resize before the focus event.
    if (elapsed > $d74c59468d7890a7$var$KEYBOARD_TIMEOUT) {
        window.clearTimeout($d74c59468d7890a7$var$state.screenTimeout);
        $d74c59468d7890a7$var$state.screenTimeout = window.setTimeout(()=>{
            let activeElement = document.hasFocus() ? (0, $da02ee888921bc9e$exports.getActiveElement)() : null;
            let willKeyboardOpen = $d74c59468d7890a7$export$c57958e35f31ed73(activeElement);
            let screen = $d74c59468d7890a7$var$getTouchScreen();
            if (Math.abs($d74c59468d7890a7$var$state.screenAngle - screen.angle) % 180) return;
            if ($d74c59468d7890a7$var$state.isOpen && willKeyboardOpen) return;
            $d74c59468d7890a7$var$state.screenWidth = screen.width;
            $d74c59468d7890a7$var$state.screenHeight = screen.height;
            $d74c59468d7890a7$var$state.screenAngle = screen.angle;
            $d74c59468d7890a7$var$state.isOpen = false;
        }, $d74c59468d7890a7$var$KEYBOARD_TIMEOUT);
    }
    // Otherwise, record an opening if the height changed by more than our threshold.
    // This may fail if the layout viewport changes for other reasons during this timeframe.
    if (elapsed <= $d74c59468d7890a7$var$KEYBOARD_TIMEOUT && delta >= $d74c59468d7890a7$var$KEYBOARD_HEIGHT) $d74c59468d7890a7$var$state.endTimeStamp = time;
    // Store the new open state since the viewport is stable when this is reached.
    $d74c59468d7890a7$var$state.isOpen = delta >= $d74c59468d7890a7$var$KEYBOARD_HEIGHT;
}
function $d74c59468d7890a7$var$onOrientationChange() {
    let screen = $d74c59468d7890a7$var$getTouchScreen();
    let rotation = $d74c59468d7890a7$var$state.screenAngle - screen.angle;
    // Rotation may cause the resize buffer to be filled, but we need to make sure a screen
    // estimate is already available in case focus lands before it expires. This could fail
    // if a top bar exceeds the keyboard threshold, in which case we may need to revisit.
    if (Math.abs(rotation) % 180 && !$d74c59468d7890a7$var$state.isOpen) {
        let width = $d74c59468d7890a7$var$state.screenWidth;
        let height = $d74c59468d7890a7$var$state.screenHeight;
        $d74c59468d7890a7$var$state.screenWidth = height;
        $d74c59468d7890a7$var$state.screenHeight = width;
    }
    if (!$d74c59468d7890a7$var$state.isOpen) $d74c59468d7890a7$var$state.screenAngle = screen.angle;
}
function $d74c59468d7890a7$var$onFocus(e) {
    let target = (0, $da02ee888921bc9e$exports.getEventTarget)(e);
    let willKeyboardOpen = $d74c59468d7890a7$export$c57958e35f31ed73(target);
    let time = performance.now();
    let screen = $d74c59468d7890a7$var$getTouchScreen();
    let delta = $d74c59468d7890a7$var$state.screenHeight - screen.height;
    // Update the screen and start the timer if we are about to open.
    if (delta < $d74c59468d7890a7$var$KEYBOARD_HEIGHT && willKeyboardOpen) {
        $d74c59468d7890a7$var$state.screenWidth = screen.width;
        $d74c59468d7890a7$var$state.screenHeight = screen.height;
        $d74c59468d7890a7$var$state.screenAngle = screen.angle;
        $d74c59468d7890a7$var$state.startTimeStamp = time;
    }
    // This focus will open a keyboard so reset the buffer.
    if (willKeyboardOpen) window.clearTimeout($d74c59468d7890a7$var$state.screenTimeout);
    // Stop the timer if the keyboard is already open.
    if (delta >= $d74c59468d7890a7$var$KEYBOARD_HEIGHT && willKeyboardOpen) $d74c59468d7890a7$var$state.endTimeStamp = time;
}
function $d74c59468d7890a7$var$setupGlobalEvents() {
    let screen = $d74c59468d7890a7$var$getTouchScreen();
    // WebKit only fires a single event per resize.
    (0, $49582955cc364b1c$exports.addEvent)(window.visualViewport, 'resize', (0, $d0b4a781cf26e80b$exports.isWebKit)() ? $d74c59468d7890a7$var$onResizeEnd : $d74c59468d7890a7$var$onResizeStart);
    // oxlint-disable-next-line - looks like the lint for this is a little too aggressive
    (0, $49582955cc364b1c$exports.addEvent)(window.screen.orientation, 'change', $d74c59468d7890a7$var$onOrientationChange);
    (0, $49582955cc364b1c$exports.addEvent)(window, 'focus', $d74c59468d7890a7$var$onFocus, {
        capture: true,
        passive: true
    });
    // Store the initial screen dimensions.
    $d74c59468d7890a7$var$state.screenWidth = screen.width;
    $d74c59468d7890a7$var$state.screenHeight = screen.height;
    $d74c59468d7890a7$var$state.screenAngle = screen.angle;
}
if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') $d74c59468d7890a7$var$setupGlobalEvents();
    else (0, $49582955cc364b1c$exports.addEvent)(document, 'DOMContentLoaded', $d74c59468d7890a7$var$setupGlobalEvents);
}
function $d74c59468d7890a7$export$a986ed8aea890397() {
    let viewportMeta = (0, $3632a2abc5d34548$exports.getMetaValue)('viewport');
    // Overlaying keyboards do not impact geometry, so there is nothing to await.
    // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
    if ((0, $d0b4a781cf26e80b$exports.isAndroid)() && viewportMeta?.includes('overlays-content')) return false;
    // WebKit may resize before focus, but an open keyboard always means we have support.
    if ($d74c59468d7890a7$var$state.isOpen) return true;
    // As long as no input has ever been focused, we return default support.
    if (!$d74c59468d7890a7$var$state.startTimeStamp) return window.navigator.maxTouchPoints > 0;
    // If keyboard geometry changed within the timeout period, we have support.
    if ($d74c59468d7890a7$var$state.endTimeStamp >= $d74c59468d7890a7$var$state.startTimeStamp) return true;
    // If a geometry change is mid-flight we return the most recent support.
    // Supported platforms may have a hardware keyboard, which this won't catch, but thats
    // about as far as we can reasonably go to exclude non-touch devices.
    return performance.now() - $d74c59468d7890a7$var$state.startTimeStamp <= $d74c59468d7890a7$var$KEYBOARD_TIMEOUT ? $d74c59468d7890a7$var$state.endTimeStamp > 0 || window.navigator.maxTouchPoints > 0 : false;
}
function $d74c59468d7890a7$export$c57958e35f31ed73(target) {
    if (!(target instanceof Element) || !(0, $48f566b6becd50da$exports.isFocusable)(target)) return false;
    let isTextArea = target instanceof HTMLTextAreaElement;
    let isEditable = target instanceof HTMLElement && target.isContentEditable;
    let isTextInput = target instanceof HTMLInputElement && !$d74c59468d7890a7$var$nonTextInputTypes.has(target.type);
    return isTextArea || isEditable || isTextInput;
}
function $d74c59468d7890a7$export$16792effe837dba3(event) {
    return (0, $d0b4a781cf26e80b$exports.isMac)() ? event.metaKey : event.ctrlKey;
}
function $d74c59468d7890a7$export$b1f1c83775b8b5f7() {
    return $d74c59468d7890a7$var$state.isOpen;
}


//# sourceMappingURL=keyboard.cjs.map
