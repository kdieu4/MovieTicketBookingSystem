import {chain as $a4e76a5424781910$export$e08e3b67e392101e} from "./chain.mjs";
import {setStyle as $d447af545b77c9f1$export$37a5fde709c1db82} from "./domHelpers.mjs";
import {useEffectEvent as $fe16bffc7a557bf0$export$7f54fc3180508a52} from "./useEffectEvent.mjs";
import {useLayoutEffect as $c4867b2f328c2698$export$e5c5a5f917a5871c} from "./useLayoutEffect.mjs";
import {flushSync as $5MIG0$flushSync} from "react-dom";
import {useState as $5MIG0$useState, useCallback as $5MIG0$useCallback, useRef as $5MIG0$useRef} from "react";

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





function $fcc7165e876206c6$export$6d3443f2c48bfc20(ref, isReady = true, onEnter) {
    let [isEntering, setEntering] = (0, $5MIG0$useState)(true);
    let isAnimationReady = isEntering && isReady;
    // Hide the element while it prepares for entry, using only non-layout-thrashing attributes.
    // This prevents accidental flashes of content in scenarios where no hidden styling is applied
    // while the enter animation is not yet ready (e.g. popovers prior to placement calculation).
    (0, $c4867b2f328c2698$export$e5c5a5f917a5871c)(()=>{
        if (!isReady && ref.current) return (0, $a4e76a5424781910$export$e08e3b67e392101e)((0, $d447af545b77c9f1$export$37a5fde709c1db82)(ref.current, 'opacity', '0'), (0, $d447af545b77c9f1$export$37a5fde709c1db82)(ref.current, 'clip', 'rect(0 0 0 0)'), (0, $d447af545b77c9f1$export$37a5fde709c1db82)(ref.current, 'clip-path', 'inset(50%)'), (0, $d447af545b77c9f1$export$37a5fde709c1db82)(ref.current, 'mask-image', 'linear-gradient(#0000, #0000)'));
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
    (0, $c4867b2f328c2698$export$e5c5a5f917a5871c)(()=>{
        if (isAnimationReady && ref.current && 'getAnimations' in ref.current) {
            for (let animation of ref.current.getAnimations())if (animation instanceof CSSTransition) animation.cancel();
        }
    }, [
        ref,
        isAnimationReady
    ]);
    $fcc7165e876206c6$var$useAnimation(ref, isAnimationReady, onEnter, (0, $5MIG0$useCallback)(()=>setEntering(false), []));
    return isAnimationReady;
}
function $fcc7165e876206c6$export$45fda7c47f93fd48(ref, isOpen, onExit) {
    let [exitState, setExitState] = (0, $5MIG0$useState)(isOpen ? 'open' : 'closed');
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
    $fcc7165e876206c6$var$useAnimation(ref, isExiting, onExit, (0, $5MIG0$useCallback)(()=>{
        // Set the state to closed, which will cause the element to be unmounted.
        setExitState((state)=>state === 'exiting' ? 'closed' : state);
    }, []));
    return isExiting;
}
function $fcc7165e876206c6$var$useAnimation(ref, isActive, onStart, onEnd) {
    let isActiveRef = (0, $5MIG0$useRef)(null);
    let start = (0, $fe16bffc7a557bf0$export$7f54fc3180508a52)(onStart);
    (0, $c4867b2f328c2698$export$e5c5a5f917a5871c)(()=>{
        if (isActive && ref.current && isActiveRef.current !== isActive) {
            isActiveRef.current = isActive;
            if (!('getAnimations' in ref.current)) {
                // JSDOM
                onEnd();
                return;
            }
            let startPromise = start?.(ref.current);
            let animations = ref.current.getAnimations().filter((a)=>(typeof DocumentTimeline === 'undefined' || a.timeline instanceof DocumentTimeline) && a.playState === 'running');
            if (animations.length === 0 && !startPromise) {
                onEnd();
                return;
            }
            Promise.all([
                startPromise,
                ...animations.map((a)=>a.finished)
            ]).then(()=>{
                (0, $5MIG0$flushSync)(()=>{
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


export {$fcc7165e876206c6$export$6d3443f2c48bfc20 as useEnterAnimation, $fcc7165e876206c6$export$45fda7c47f93fd48 as useExitAnimation};
//# sourceMappingURL=animation.mjs.map
