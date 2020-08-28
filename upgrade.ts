import {addCSSListener} from 'xtal-element/observeCssSelector.js';
import { TargetProxyPair, TargetProxyPairCallback, UpgradeArg } from './types.d.js';

export function upgrade<T extends EventTarget>(args: UpgradeArg<T>, callback?: TargetProxyPairCallback<T>){
    const id = 'a' + (new Date()).valueOf().toString();
    const immaBeAttrib = `imma-be-${args.toBe}`;
    addCSSListener(id, args.nodeInShadowDOMRealm,`${args.upgrade}[${immaBeAttrib}]`, (e: Event) => {
        const target = e.target;
        const proxy = new Proxy(target, Object.assign({}, args.proxyHandler));
        target[Symbol.for(args.toBe)] = proxy;
        (target as Element).setAttribute(`is-${args.toBe}`, '');
        (target as Element).removeAttribute(immaBeAttrib);
        if(callback !== undefined) callback({target, proxy} as TargetProxyPair<T>);
    });
        

}