import {addCSSListener} from 'xtal-element/observeCssSelector.js';
export interface DecorateArg<T extends Object>{
    rootNode: Node,
    treat: string,
    asA: string,
    proxyHandler: ProxyHandler<T>,
}
export function decorate<T extends EventTarget>(args: DecorateArg<T>){
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.rootNode,`${args.treat}[is-a-${args.asA}]`, (e: Event) => {
        const proxy = new Proxy(e.target, args.proxyHandler);
        e.target[Symbol.for(args.asA)] = proxy;
    });
}