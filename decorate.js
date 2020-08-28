import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function decorate(args, callback) {
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.nodeInShadowDOMRealm, `${args.treat}[is-${args.as}]`, (e) => {
        const proxy = new Proxy(e.target, Object.assign({}, args.proxyHandler));
        const target = e.target;
        target[Symbol.for(args.as)] = proxy;
        if (callback !== undefined)
            callback({ target, proxy });
    });
}
//export function 
