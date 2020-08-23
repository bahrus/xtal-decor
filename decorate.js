import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function decorate(args) {
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.nodeInShadowDOMRealm, `${args.treat}[is-${args.as}]`, (e) => {
        const proxy = new Proxy(e.target, args.proxyHandler);
        e.target[Symbol.for(args.as)] = proxy;
    });
}
//export function 
