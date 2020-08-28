interface NodeToProxy<T extends Object>{
    /**
     * Apply trait to all elements within the specified ShadowDOM realm.  
     * If not provided, applies outside any ShadowDOM.
     */
    nodeInShadowDOMRealm: Node,
    /**
     * ES6 proxy to attach
     */
    proxyHandler: ProxyHandler<T>,
}
export interface DecorateArg<T extends Object> extends NodeToProxy<T>{
    /**
     * CSS query to monitor for matching elements within ShadowDOM Realm.
     */
    treat: string,
    /**
     * Monitor for attributes matching is-[as]
     */
    as: string,
}

export interface UpgradeArg<T extends Object> extends NodeToProxy<T>{
    /**
     * CSS query to monitor for matching elements within ShadowDOM Realm.
     */
    upgrade: string,
    /**
     * Monitor for attributes start with imma-be-[toBe]
     */
    toBe: string,
}

export interface TargetProxyPair<T extends EventTarget> {
    proxy: T,
    target: T,
}

export type TargetProxyPairCallback<T extends EventTarget> = (tpp: TargetProxyPair<T>) => void;

type eventHandlers = {[key: string]: ((e: Event) => void)[]};