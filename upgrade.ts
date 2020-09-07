import {addCSSListener} from 'xtal-element/observeCssSelector.js';
import { UpgradeArg } from './types.d.js';

export function upgrade<T extends EventTarget>(args: UpgradeArg<T>, callback?: (t: T) => void){
    const id = 'a' + (new Date()).valueOf().toString();
    const immaBeAttrib = `imma-be-${args.ifWantsToBe}`;
    addCSSListener(id, args.shadowDomPeer,`${args.upgrade}[${immaBeAttrib}]`, (e: Event) => {
        const target = e.target;
        (target as Element).setAttribute(`is-${args.ifWantsToBe}`, '');
        (target as Element).removeAttribute(immaBeAttrib);
        if(callback !== undefined) callback(target as T);
    });
        

}