import { EventSettings} from 'xtal-element/types.d.js';
import { ProxyDecorMethods } from 'proxy-decor/types.d.js';

export type PropAction<T extends Element = HTMLElement> = (t: T, d: XtalDecorProps<T>, t2?: T) => any;
export interface XtalDecorProps<TTargetElement extends Element = HTMLElement>  {
    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    capture: EventSettings | undefined;

    newTarget: TTargetElement | undefined;

    newTargetId: string | undefined;

    newForwarder: ProxyDecorMethods | undefined;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    //autoForward: boolean | undefined;

    /**
     * Set these properties via a WeakMap, rather than on the (native) element itself.
     */
    virtualProps: string[] | undefined;

    noParse: boolean;

    forceVisible: boolean;
}

export interface XtalDecorActions<TTargetElement extends Element = HTMLElement>{
    watchForElementsToUpgrade(self: this): void;
    pairTargetWithProxy(self: this): void;
    initializeProxy(self: this): void;
    attachForwarder(self: this): void;
    doAutoForward(self: this): void;
}

export interface ProxyEventDetail{
    customAttr: string,
    prop: string,
    isVirtualProp: boolean
    value: any,
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

    forceVisible: boolean,
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