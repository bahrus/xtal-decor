export interface DecorateArg<T extends Object>{
    nodeInShadowDOMRealm: Node,
    treat: string,
    as: string,
    proxyHandler: ProxyHandler<T>,
}
export interface TargetProxyPair<T extends EventTarget> {
    proxy: T,
    target: T,
}

type eventHandlers = {[key: string]: ((e: Event) => void)[]};