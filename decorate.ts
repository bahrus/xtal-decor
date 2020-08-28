import {addCSSListener} from 'xtal-element/observeCssSelector.js';
import {DecorateArg, TargetProxyPair, TargetProxyPairCallback} from './types.d.js';

export function decorate<T extends EventTarget>(args: DecorateArg<T>, callback?: TargetProxyPairCallback<T>){
    const id = 'a' + (new Date()).valueOf().toString();
    addCSSListener(id, args.nodeInShadowDOMRealm,`${args.treat}[is-${args.as}]`, (e: Event) => {
        const proxy = new Proxy(e.target, Object.assign({}, args.proxyHandler));
        const target = e.target;
        target[Symbol.for(args.as)] = proxy;
        if(callback !== undefined) callback({target, proxy} as TargetProxyPair<T>);
    });
}

//export function 