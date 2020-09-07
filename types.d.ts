export interface UpgradeArg<T extends Object>{
    /**
     * Apply trait to all elements within the specified ShadowDOM realm.  
     */
    shadowDomPeer: Node,
    /**
     * ES6 proxy handler to attach
     */
    proxyHandler: ProxyHandler<T>,
    /**
     * CSS query to monitor for matching elements within ShadowDOM Realm.
     */
    upgrade: string,
    /**
     * Monitor for attributes that start with imma-be-[ifWantsToBe]
     */
    ifWantsToBe: string,
}

export interface TargetProxyPair<T extends EventTarget> {
    proxy: T,
    target: T,
}

export type TargetProxyPairCallback<T extends EventTarget> = (tpp: TargetProxyPair<T>) => void;

type eventHandlers = {[key: string]: ((e: Event) => void)[]};

export interface SelfReferentialHTMLElement extends HTMLElement{
    self: HTMLElement;
}