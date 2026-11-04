import {getActiveElement as $d8ac7ed472840322$export$cd4e5573fbe2b576} from "./shadowdom/DOMFunctions.js";
import {isKeyboardOpen as $2224c9ee07fd529d$export$b1f1c83775b8b5f7, supportsKeyboard as $2224c9ee07fd529d$export$a986ed8aea890397, willOpenKeyboard as $2224c9ee07fd529d$export$c57958e35f31ed73} from "./keyboard.js";
import {isWebKit as $d5a2be505488529f$export$78551043582a6a98} from "./platform.js";

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


const $c18c609e5f10df69$var$WEBKIT_OPEN_DELAY = 200;
const $c18c609e5f10df69$var$TRANSITION_FRAMETIME = 50;
const $c18c609e5f10df69$var$TRANSITION_TIMEOUT = 600;
const $c18c609e5f10df69$var$listenersByWindow = new WeakMap();
const $c18c609e5f10df69$var$transitionCallbacks = new Set();
const $c18c609e5f10df69$var$resizeCallbacks = new Set();
function $c18c609e5f10df69$var$onTransitionFrame(wasOpenKeyboard, signal) {
    let isOpenKeyboard = (0, $2224c9ee07fd529d$export$b1f1c83775b8b5f7)();
    // Flush resize callbacks when the keyboard has affected layout or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $c18c609e5f10df69$var$resizeCallbacks){
        callback(isOpenKeyboard);
        $c18c609e5f10df69$var$resizeCallbacks.delete(callback);
    }
    // WebKit only fires a single resize event at the start of an opening transition.
    // The animation takes ~200ms, so restart the listener and flush when it runs out of time.
    if (!wasOpenKeyboard && isOpenKeyboard && (0, $d5a2be505488529f$export$78551043582a6a98)() && !signal.aborted) {
        window.clearInterval($c18c609e5f10df69$var$listenersByWindow.get(window));
        $c18c609e5f10df69$var$listenersByWindow.set(window, $c18c609e5f10df69$var$setupGlobalListeners($c18c609e5f10df69$var$WEBKIT_OPEN_DELAY));
        return;
    }
    // Flush transition callbacks when the animation has completed or we ran out of time.
    if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) for (let callback of $c18c609e5f10df69$var$transitionCallbacks){
        callback(isOpenKeyboard);
        $c18c609e5f10df69$var$transitionCallbacks.delete(callback);
    }
    // Cancel the observer when no pending updates remain or we ran out of time.
    if ($c18c609e5f10df69$var$resizeCallbacks.size + $c18c609e5f10df69$var$transitionCallbacks.size <= 0 || signal.aborted) {
        window.clearInterval($c18c609e5f10df69$var$listenersByWindow.get(window));
        $c18c609e5f10df69$var$listenersByWindow.delete(window);
    }
}
function $c18c609e5f10df69$var$setupGlobalListeners(timeout = $c18c609e5f10df69$var$TRANSITION_TIMEOUT) {
    return window.setInterval($c18c609e5f10df69$var$onTransitionFrame, $c18c609e5f10df69$var$TRANSITION_FRAMETIME, (0, $2224c9ee07fd529d$export$b1f1c83775b8b5f7)(), AbortSignal.timeout(timeout));
}
function $c18c609e5f10df69$export$b80f73f72d03c10f(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $2224c9ee07fd529d$export$a986ed8aea890397)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $d8ac7ed472840322$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = (0, $2224c9ee07fd529d$export$c57958e35f31ed73)(activeElement);
            // If keyboard won't change, call the function immediately.
            if ((0, $2224c9ee07fd529d$export$b1f1c83775b8b5f7)() === willKeyboardOpen) return fn(willKeyboardOpen);
            // On close, fire immediately since consumers may assert the ICB.
            if ((0, $2224c9ee07fd529d$export$b1f1c83775b8b5f7)() && !willKeyboardOpen) return fn(willKeyboardOpen);
            $c18c609e5f10df69$var$resizeCallbacks.add(fn);
            if (!$c18c609e5f10df69$var$listenersByWindow.has(window)) $c18c609e5f10df69$var$listenersByWindow.set(window, $c18c609e5f10df69$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $c18c609e5f10df69$var$resizeCallbacks.delete(fn);
    };
}
function $c18c609e5f10df69$export$c82b8fe1ad51fcd9(fn) {
    // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
    // or devices which did not open their OSK within our opening timeout.
    if (!(0, $2224c9ee07fd529d$export$a986ed8aea890397)()) return fn(false), ()=>{};
    // Wait two frames to see if focus lands on an input.
    let frame = window.requestAnimationFrame(()=>{
        frame = window.requestAnimationFrame(()=>{
            let activeElement = document.hasFocus() ? (0, $d8ac7ed472840322$export$cd4e5573fbe2b576)() : null;
            let willKeyboardOpen = (0, $2224c9ee07fd529d$export$c57958e35f31ed73)(activeElement);
            // If keyboard won't transition, fire immediately.
            if ((0, $2224c9ee07fd529d$export$b1f1c83775b8b5f7)() === willKeyboardOpen) return fn(willKeyboardOpen);
            $c18c609e5f10df69$var$transitionCallbacks.add(fn);
            if (!$c18c609e5f10df69$var$listenersByWindow.has(window)) $c18c609e5f10df69$var$listenersByWindow.set(window, $c18c609e5f10df69$var$setupGlobalListeners());
        });
    });
    return ()=>{
        window.cancelAnimationFrame(frame);
        $c18c609e5f10df69$var$transitionCallbacks.delete(fn);
    };
}


export {$c18c609e5f10df69$export$b80f73f72d03c10f as runAfterKeyboard, $c18c609e5f10df69$export$c82b8fe1ad51fcd9 as runAfterKeyboardTransition};
//# sourceMappingURL=runAfterKeyboard.js.map
