import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function decorate(args) {
    return new Promise((resolve, reject) => {
        const id = 'a' + (new Date()).valueOf().toString();
        addCSSListener(id, args.nodeInShadowDOMRealm, `${args.treat}[is-${args.as}]`, (e) => {
            const proxy = new Proxy(e.target, Object.assign({}, args.proxyHandler));
            const target = e.target;
            target[Symbol.for(args.as)] = proxy;
            resolve({ target, proxy });
        });
    });
}
//export function 
