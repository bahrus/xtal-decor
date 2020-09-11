import {addCSSListener} from 'xtal-element/observeCssSelector.js';
import { UpgradeArg } from './types.d.js';

export function upgrade<T extends EventTarget>(args: UpgradeArg<T>, callback?: (t: T) => void){
    const id = 'a' + (new Date()).valueOf().toString();
    const beAttrib = `be-${args.ifWantsToBe}`;
    addCSSListener(id, args.shadowDomPeer,`${args.upgrade}[${beAttrib}]`, (e: Event) => {
        const target = e.target;
        const val =  (target as Element).getAttribute(beAttrib);
        (target as Element).setAttribute(`is-${args.ifWantsToBe}`, val);
        (target as Element).removeAttribute(beAttrib);
        if(callback !== undefined) callback(target as T);
    });
        

}