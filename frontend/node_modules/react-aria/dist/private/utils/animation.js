import {chain as $2cf8bb4b9e45dc81$export$e08e3b67e392101e} from "./chain.js";
import {setStyle as $cc3c3666b64debad$export$37a5fde709c1db82} from "./domHelpers.js";
import {useEffectEvent as $85567ef950781b7d$export$7f54fc3180508a52} from "./useEffectEvent.js";
import {useLayoutEffect as $53fed047b798be36$export$e5c5a5f917a5871c} from "./useLayoutEffect.js";
import {flushSync as $7ueWv$flushSync} from "react-dom";
import {useState as $7ueWv$useState, useCallback as $7ueWv$useCallback, useRef as $7ueWv$useRef} from "react";

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





function $3c19e3d939575a21$export$6d3443f2c48bfc20(ref, isReady = true, onEnter) {
    let [isEntering, setEntering] = (0, $7ueWv$useState)(true);
    let isAnimationReady = isEntering && isReady;
    // Hide the element while it prepares for entry, using only non-layout-thrashing attributes.
    // This prevents accidental flashes of content in scenarios where no hidden styling is applied
    // while the enter animation is not yet ready (e.g. popovers prior to placement calculation).
    (0, $53fed047b798be36$export$e5c5a5f917a5871c)(()=>{
        if (!isReady && ref.current) return (0, $2cf8bb4b9e45dc81$export$e08e3b67e392101e)((0, $cc3c3666b64debad$export$37a5fde709c1db82)(ref.current, 'opacity', '0'), (0, $cc3c3666b64debad$export$37a5fde709c1db82)(ref.current, 'clip', 'rect(0 0 0 0)'), (0, $cc3c3666b64debad$export$37a5fde709c1db82)(ref.current, 'clip-path', 'inset(50%)'), (0, $cc3c3666b64debad$export$37a5fde709c1db82)(ref.current, 'mask-image', 'linear-gradient(#0000, #0000)'));
    }, [
        ref,
        isReady
    ]);
    // There are two cases for entry animations:
    // 1. CSS @keyframes. The `animation` property is set during the isEntering state, and it is removed after the animation finishes.
    // 2. CSS transitions. The initial styles are applied during the isEntering state, and removed immediately, causing the transition to occur.
    //
    // In the second case, cancel any transitions that were triggered prior to the isEntering = false state (when the transition is supposed to start).
    // This can happen when isReady starts as false (e.g. popovers prior to placement calculation).
    (0, $53fed047b798be36$export$e5c5a5f917a5871c)(()=>{
        if (isAnimationReady && ref.current && 'getAnimations' in ref.current) {
            for (let animation of ref.current.getAnimations())if (animation instanceof CSSTransition) animation.cancel();
        }
    }, [
        ref,
        isAnimationReady
    ]);
    $3c19e3d939575a21$var$useAnimation(ref, isAnimationReady, onEnter, (0, $7ueWv$useCallback)(()=>setEntering(false), []));
    return isAnimationReady;
}
function $3c19e3d939575a21$export$45fda7c47f93fd48(ref, isOpen, onExit) {
    let [exitState, setExitState] = (0, $7ueWv$useState)(isOpen ? 'open' : 'closed');
    switch(exitState){
        case 'open':
            // If isOpen becomes false, set the state to exiting.
            if (!isOpen) setExitState('exiting');
            break;
        case 'closed':
        case 'exiting':
            // If we are exiting and isOpen becomes true, the animation was interrupted.
            // Reset the state to open.
            if (isOpen) setExitState('open');
            break;
    }
    let isExiting = exitState === 'exiting';
    $3c19e3d939575a21$var$useAnimation(ref, isExiting, onExit, (0, $7ueWv$useCallback)(()=>{
        // Set the state to closed, which will cause the element to be unmounted.
        setExitState((state)=>state === 'exiting' ? 'closed' : state);
    }, []));
    return isExiting;
}
function $3c19e3d939575a21$var$useAnimation(ref, isActive, onStart, onEnd) {
    let isActiveRef = (0, $7ueWv$useRef)(null);
    let start = (0, $85567ef950781b7d$export$7f54fc3180508a52)(onStart);
    (0, $53fed047b798be36$export$e5c5a5f917a5871c)(()=>{
        if (isActive && ref.current && isActiveRef.current !== isActive) {
            isActiveRef.current = isActive;
            if (!('getAnimations' in ref.current)) {
                // JSDOM
                onEnd();
                return;
            }
            let startPromise = start === null || start === void 0 ? void 0 : start(ref.current);
            let animations = ref.current.getAnimations().filter((a)=>(typeof DocumentTimeline === 'undefined' || a.timeline instanceof DocumentTimeline) && a.playState === 'running');
            if (animations.length === 0 && !startPromise) {
                onEnd();
                return;
            }
            Promise.all([
                startPromise,
                ...animations.map((a)=>a.finished)
            ]).then(()=>{
                (0, $7ueWv$flushSync)(()=>{
                    onEnd();
                });
            }).catch(()=>{});
        }
        isActiveRef.current = isActive;
    }, [
        ref,
        isActive,
        onEnd
    ]);
}


export {$3c19e3d939575a21$export$6d3443f2c48bfc20 as useEnterAnimation, $3c19e3d939575a21$export$45fda7c47f93fd48 as useExitAnimation};
//# sourceMappingURL=animation.js.map
