var $da02ee888921bc9e$exports = require("./shadowdom/DOMFunctions.cjs");
var $d74c59468d7890a7$exports = require("./keyboard.cjs");
var $d0b4a781cf26e80b$exports = require("./platform.cjs");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "runAfterKeyboard", function () { return $54be4fbc1cc8581a$export$b80f73f72d03c10f; });
$parcel$export(module.exports, "runAfterKeyboardTransition", function () { return $54be4fbc1cc8581a$export$c82b8fe1ad51fcd9; });
/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $54be4fbc1cc8581a$var$WEBKIT_OPEN_DELAY = 200;
const $54be4fbc1cc8581a$var$TRANSITION_FRAMETIME = 50;
const $54be4fbc1cc8581a$var$TRANSITION_TIMEOUT = 600;
const $54be4fbc1cc8581a$var$listenersByWindow = new WeakMap();
const $54be4fbc1cc8581a$var$transitionCallbacks = new Set();
const $54be4fbc1cc8581a$var$resizeCallbacks = new Set();
function $54be4fbc1cc8581a$var$onTransitionFrame(wasOpenKeyboard, signal) {
    let isOpenKeyboard = (0, $d74c59468d7890a7$exports.isKeyboardOpen)();
    // Flush resize callbacks when the keyboard has affected layout or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $54be4fbc1cc8581a$var$resizeCallbacks){
        callback(isOpenKeyboard);
        $54be4fbc1cc8581a$var$resizeCallbacks.delete(callback);
    }
    // WebKit only fires a single resize event at the start of an opening transition.
    // The animation takes ~200ms, so restart the listener and flush when it runs out of time.
    if (!wasOpenKeyboard && isOpenKeyboard && (0, $d0b4a781cf26e80b$exports.isWebKit)() && !signal.aborted) {
        window.clearInterval($54be4fbc1cc8581a$var$listenersByWindow.get(window));
        $54be4fbc1cc8581a$var$listenersByWindow.set(window, $54be4fbc1cc8581a$var$setupGlobalListeners($54be4fbc1cc8581a$var$WEBKIT_OPEN_DELAY));
        return;
    }
    // Flush transition callbacks when the animation has completed or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $54be4fbc1cc8581a$var$transitionCallbacks){
        callback(isOpenKeyboard);
        $54be4fbc1cc8581a$var$transitionCallbacks.delete(callback);
    }
    // Cancel the observer when no pending updates remain or we ran out of time.
    if ($54be4fbc1cc8581a$var$resizeCallbacks.size + $54be4fbc1cc8581a$var$transitionCallbacks.size <= 0 || signal.aborted) {
        window.clearInterval($54be4fbc1cc8581a$var$listenersByWindow.get(window));
        $54be4fbc1cc8581a$var$listenersByWindow.delete(window);
    }
}
function $54be4fbc1cc8581a$var$setupGlobalListeners(timeout = $54be4fbc1cc8581a$var$TRANSITION_TIMEOUT) {
    return window.setInterval($54be4fbc1cc8581a$var$onTransitionFrame, $54be4fbc1cc8581a$var$TRANSITION_FRAMETIME, (0, $d74c59468d7890a7$exports.isKeyboardOpen)(), AbortSignal.timeout(timeout));
}
function $54be4fbc1cc8581a$export$b80f73f72d03c10f(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $d74c59468d7890a7$exports.supportsKeyboard)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $da02ee888921bc9e$exports.getActiveElement)() : null;
            let willKeyboardOpen = (0, $d74c59468d7890a7$exports.willOpenKeyboard)(activeElement);
            // If keyboard won't change, call the function immediately.
            if ((0, $d74c59468d7890a7$exports.isKeyboardOpen)() === willKeyboardOpen) return fn(willKeyboardOpen);
            // On close, fire immediately since consumers may assert the ICB.
            if ((0, $d74c59468d7890a7$exports.isKeyboardOpen)() && !willKeyboardOpen) return fn(willKeyboardOpen);
            $54be4fbc1cc8581a$var$resizeCallbacks.add(fn);
            if (!$54be4fbc1cc8581a$var$listenersByWindow.has(window)) $54be4fbc1cc8581a$var$listenersByWindow.set(window, $54be4fbc1cc8581a$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $54be4fbc1cc8581a$var$resizeCallbacks.delete(fn);
    };
}
function $54be4fbc1cc8581a$export$c82b8fe1ad51fcd9(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $d74c59468d7890a7$exports.supportsKeyboard)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $da02ee888921bc9e$exports.getActiveElement)() : null;
            let willKeyboardOpen = (0, $d74c59468d7890a7$exports.willOpenKeyboard)(activeElement);
            // If keyboard won't transition, fire immediately.
            if ((0, $d74c59468d7890a7$exports.isKeyboardOpen)() === willKeyboardOpen) return fn(willKeyboardOpen);
            $54be4fbc1cc8581a$var$transitionCallbacks.add(fn);
            if (!$54be4fbc1cc8581a$var$listenersByWindow.has(window)) $54be4fbc1cc8581a$var$listenersByWindow.set(window, $54be4fbc1cc8581a$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $54be4fbc1cc8581a$var$transitionCallbacks.delete(fn);
    };
}


//# sourceMappingURL=runAfterKeyboard.cjs.map
