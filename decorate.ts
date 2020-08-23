import {addCSSListener} from 'xtal-element/observeCssSelector.js';
export interface DecorateArg<T extends Object>{
    nodeInShadowDOMRealm: Node,
    treat: string,
    as: string,
    proxyHandler: ProxyHandler<T>,
}
export function decorate<T extends EventTarget>(args: DecorateArg<T>){
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.nodeInShadowDOMRealm,`${args.treat}[is-${args.as}]`, (e: Event) => {
        const proxy = new Proxy(e.target, args.proxyHandler);
        e.target[Symbol.for(args.as)] = proxy;
    });
}

//export function 