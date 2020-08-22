import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function decorate(args) {
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.rootNode, `${args.treat}[is-a-${args.asA}]`, (e) => {
        const proxy = new Proxy(e.target, args.proxyHandler);
        e.target[Symbol.for(args.asA)] = proxy;
    });
}
