import {getActiveElement as $23f2114a1b82827e$export$cd4e5573fbe2b576} from "./shadowdom/DOMFunctions.mjs";
import {isKeyboardOpen as $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7, supportsKeyboard as $bb39c0fc1c19b34c$export$a986ed8aea890397, willOpenKeyboard as $bb39c0fc1c19b34c$export$c57958e35f31ed73} from "./keyboard.mjs";
import {isWebKit as $2add3ce32c6007eb$export$78551043582a6a98} from "./platform.mjs";

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


const $e0a0e4399f316b76$var$WEBKIT_OPEN_DELAY = 200;
const $e0a0e4399f316b76$var$TRANSITION_FRAMETIME = 50;
const $e0a0e4399f316b76$var$TRANSITION_TIMEOUT = 600;
const $e0a0e4399f316b76$var$listenersByWindow = new WeakMap();
const $e0a0e4399f316b76$var$transitionCallbacks = new Set();
const $e0a0e4399f316b76$var$resizeCallbacks = new Set();
function $e0a0e4399f316b76$var$onTransitionFrame(wasOpenKeyboard, signal) {
    let isOpenKeyboard = (0, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7)();
    // Flush resize callbacks when the keyboard has affected layout or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $e0a0e4399f316b76$var$resizeCallbacks){
        callback(isOpenKeyboard);
        $e0a0e4399f316b76$var$resizeCallbacks.delete(callback);
    }
    // WebKit only fires a single resize event at the start of an opening transition.
    // The animation takes ~200ms, so restart the listener and flush when it runs out of time.
    if (!wasOpenKeyboard && isOpenKeyboard && (0, $2add3ce32c6007eb$export$78551043582a6a98)() && !signal.aborted) {
        window.clearInterval($e0a0e4399f316b76$var$listenersByWindow.get(window));
        $e0a0e4399f316b76$var$listenersByWindow.set(window, $e0a0e4399f316b76$var$setupGlobalListeners($e0a0e4399f316b76$var$WEBKIT_OPEN_DELAY));
        return;
    }
    // Flush transition callbacks when the animation has completed or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $e0a0e4399f316b76$var$transitionCallbacks){
        callback(isOpenKeyboard);
        $e0a0e4399f316b76$var$transitionCallbacks.delete(callback);
    }
    // Cancel the observer when no pending updates remain or we ran out of time.
    if ($e0a0e4399f316b76$var$resizeCallbacks.size + $e0a0e4399f316b76$var$transitionCallbacks.size <= 0 || signal.aborted) {
        window.clearInterval($e0a0e4399f316b76$var$listenersByWindow.get(window));
        $e0a0e4399f316b76$var$listenersByWindow.delete(window);
    }
}
function $e0a0e4399f316b76$var$setupGlobalListeners(timeout = $e0a0e4399f316b76$var$TRANSITION_TIMEOUT) {
    return window.setInterval($e0a0e4399f316b76$var$onTransitionFrame, $e0a0e4399f316b76$var$TRANSITION_FRAMETIME, (0, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7)(), AbortSignal.timeout(timeout));
}
function $e0a0e4399f316b76$export$b80f73f72d03c10f(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $bb39c0fc1c19b34c$export$a986ed8aea890397)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $23f2114a1b82827e$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = (0, $bb39c0fc1c19b34c$export$c57958e35f31ed73)(activeElement);
            // If keyboard won't change, call the function immediately.
            if ((0, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7)() === willKeyboardOpen) return fn(willKeyboardOpen);
            // On close, fire immediately since consumers may assert the ICB.
            if ((0, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7)() && !willKeyboardOpen) return fn(willKeyboardOpen);
            $e0a0e4399f316b76$var$resizeCallbacks.add(fn);
            if (!$e0a0e4399f316b76$var$listenersByWindow.has(window)) $e0a0e4399f316b76$var$listenersByWindow.set(window, $e0a0e4399f316b76$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $e0a0e4399f316b76$var$resizeCallbacks.delete(fn);
    };
}
function $e0a0e4399f316b76$export$c82b8fe1ad51fcd9(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $bb39c0fc1c19b34c$export$a986ed8aea890397)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $23f2114a1b82827e$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = (0, $bb39c0fc1c19b34c$export$c57958e35f31ed73)(activeElement);
            // If keyboard won't transition, fire immediately.
            if ((0, $bb39c0fc1c19b34c$export$b1f1c83775b8b5f7)() === willKeyboardOpen) return fn(willKeyboardOpen);
            $e0a0e4399f316b76$var$transitionCallbacks.add(fn);
            if (!$e0a0e4399f316b76$var$listenersByWindow.has(window)) $e0a0e4399f316b76$var$listenersByWindow.set(window, $e0a0e4399f316b76$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $e0a0e4399f316b76$var$transitionCallbacks.delete(fn);
    };
}


export {$e0a0e4399f316b76$export$b80f73f72d03c10f as runAfterKeyboard, $e0a0e4399f316b76$export$c82b8fe1ad51fcd9 as runAfterKeyboardTransition};
//# sourceMappingURL=runAfterKeyboard.mjs.map
