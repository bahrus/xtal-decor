import {PropAction, EventSettings} from 'xtal-element/types.d.js';

export interface XtalDecorProps<TTargetElement extends Element = HTMLElement>  {
    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    capture: EventSettings | undefined;

    newTarget: TTargetElement | undefined;

    newTargetId: string | undefined;

    newForwarder: HTMLElement | undefined;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    //autoForward: boolean | undefined;

    /**
     * Set these properties via a WeakMap, rather than on the (native) element itself.
     */
    virtualProps: string[] | undefined;
}

export interface UpgradeArg<T extends Object>{
    /**
     * Apply trait to all elements within the specified ShadowDOM realm.  
     */
    shadowDomPeer: Node,
    /**
     * CSS query to monitor for matching elements within ShadowDOM Realm.
     */
    upgrade: string,
    /**
     * Monitor for attributes that start with be-[ifWantsToBe]
     */
    ifWantsToBe: string,
}

export interface TargetProxyPair<T extends EventTarget> {
    proxy: T,
    target: T,
}

// export interface ProxyVirtualPropsPair<T extends EventTarget>{
//     proxy: T,

// }

// export type TargetProxyPairCallback<T extends EventTarget> = (tpp: TargetProxyPair<T>) => void;

type eventHandlers = {[key: string]: ((e: Event) => void)[]};

export interface SelfReferentialHTMLElement extends HTMLElement{
    self: HTMLElement;
}

export interface Subscription {propsOfInterest: Set<string>, callBack: (target: Element) => void}