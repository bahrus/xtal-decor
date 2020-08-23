import {addCSSListener} from 'xtal-element/observeCssSelector.js';
export interface UpgradeArg<T extends Object>{
    nodeInShadowDOMRealm: Node,
    upgrade: string,
    toBe: string,
    proxyHandler: ProxyHandler<T>,
}
export function upgrade<T extends EventTarget>(args: UpgradeArg<T>){
    const id = 'a' + (new Date()).valueOf().toString();
    const immaBeAttrib = `imma-be-${args.toBe}`;
    addCSSListener(id, args.nodeInShadowDOMRealm,`${args.upgrade}[${immaBeAttrib}]`, (e: Event) => {
        const target = e.target;
        const proxy = new Proxy(target, Object.assign({}, args.proxyHandler));
        target[Symbol.for(args.toBe)] = proxy;
        (target as Element).setAttribute(`is-${args.toBe}`, '');
        (target as Element).removeAttribute(immaBeAttrib);
    });
}