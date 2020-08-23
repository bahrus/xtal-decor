import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function upgrade(args) {
    const id = 'a' + (new Date()).valueOf().toString();
    const immaBeAttrib = `imma-be-${args.toBe}`;
    addCSSListener(id, args.nodeInShadowDOMRealm, `${args.upgrade}[${immaBeAttrib}]`, (e) => {
        const target = e.target;
        const proxy = new Proxy(target, Object.assign({}, args.proxyHandler));
        target[Symbol.for(args.toBe)] = proxy;
        target.setAttribute(`is-${args.toBe}`, '');
        target.removeAttribute(immaBeAttrib);
    });
}
