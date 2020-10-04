import { XtallatX, define, AttributeProps, PropAction, deconstruct, EventSettings, camelToLisp } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { upgrade as upgr } from './upgrade.js';
import { TargetProxyPair } from './types.d.js';
export {define, AttributeProps, PropAction, EventSettings, mergeProps } from 'xtal-element/xtal-latx.js';
export {SelfReferentialHTMLElement} from './types.d.js';

export function hasUndefined(arr: any[]){
    return arr.includes(undefined);
}

const linkUpgradeProxyPair = ({upgrade, ifWantsToBe, self, on, init, actions}: XtalDecor) => {
    if(hasUndefined([upgrade, ifWantsToBe, self, on, init, actions])) return;
    const callback = (target: HTMLElement) => {
        self.newTarget = target;
    }
    upgr({
        shadowDomPeer: self,
        upgrade: upgrade,
        ifWantsToBe: ifWantsToBe,
    }, callback);
}

export const linkNewTargetProxyPair = ({actions, self, virtualProps, targetToProxyMap, newTarget}: XtalDecor) => {
    if(newTarget === undefined) return;
    const virtualPropHolder = {};
    const proxy = new Proxy(newTarget, {
        set: (target: any, key, value) => {
            if(key === 'self' || (virtualProps !== undefined && virtualProps.includes(key as string))){
                virtualPropHolder[key] = value;
            }else{
                target[key] = value;
            }
            if(key === 'self') return true;
            actions.forEach(action =>{
                const dependencies = deconstruct(action);
                if(dependencies.includes(key as string)){
                    //TODO:  symbols
                    const arg = Object.assign({}, virtualPropHolder, target);
                    action(arg as HTMLElement);
                }
            });
            switch(typeof key){
                case 'string':
                    target.dispatchEvent(new CustomEvent(camelToLisp(key) + '-changed', {
                        detail:{
                            value: value
                        }
                    }));
                    break;
            }
            return true;            
        },
        get:(target, key)=>{
            let value;// = Reflect.get(target, key);
            if(key === 'self' || (virtualProps !== undefined && virtualProps.includes(key as string))){
                value = virtualPropHolder[key];
            }else{
                value = target[key];// = value;
            }
            if(typeof(value) == "function"){
                return value.bind(target);
            }
            return value;
        }
    });
    targetToProxyMap.set(newTarget, proxy);
    self.newTargetProxyPair = {
        proxy: proxy,
        target: newTarget
    }
    delete self.newTarget;
}

const initializeProxy = ({newTargetProxyPair, init, self, on, ifWantsToBe}: XtalDecor) => {
    if(newTargetProxyPair === undefined) return;
    const newProxy = newTargetProxyPair.proxy;
    (<any>newProxy).self = newProxy;
    const newTarget = newTargetProxyPair.target;
    init(newProxy);
    const attr = newTarget.getAttribute('is-' + ifWantsToBe);
    if(attr !== null && attr.length > 0){
        Object.assign(newProxy, JSON.parse(attr));
    }
    for(var key in on){
        const eventSetting = on[key];
        switch(typeof eventSetting){
            case 'function':
                newTarget.addEventListener(key, e => {
                    eventSetting(newProxy, e);
                });
                break;
            default:
                throw 'not implemented yet';
        }
    }    
    delete self.newTargetProxyPair;
}

const linkForwarder = ({autoForward, ifWantsToBe, self}: XtalDecor) => {
    if(!autoForward) return;
    import('css-observe/css-observe.js');
    const observer = document.createElement('css-observe') as any;
    observer.observe = true;
    observer.selector = `proxy-props[for="${ifWantsToBe}"]`;
    observer.addEventListener('latest-match-changed', e => {
        self.newForwarder = observer.latestMatch;
    });
    self.appendChild(observer);
}

//https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
function getNextSibling (elem: Element, selector: string | undefined) {

	// Get the next sibling element
    var sibling = elem.nextElementSibling;
    if(selector === undefined) return sibling;

	// If the sibling matches our selector, use it
	// If not, jump to the next sibling and continue the loop
	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling
	}
    return sibling;
};

const doAutoForward = ({newForwarder, upgrade, ifWantsToBe, initializedSym, targetToProxyMap}: XtalDecor) => {
    if(newForwarder === undefined) return;
    const proxy = new Proxy(newForwarder, {
        set: (target, key, value) => {
            target[key] = value;
            const el = getNextSibling(target, `${upgrade}[is-${ifWantsToBe}]`);
            if(el === undefined) return true;
            const proxy = targetToProxyMap.get(el);
            if(proxy === undefined) return true;
            if(el[initializedSym] === undefined){
                const props: any = {};
                Object.getOwnPropertyNames(target).forEach(targetKey => {
                    props[targetKey] = target[targetKey];
                });
                Object.assign(proxy, props);
                el[initializedSym] = true;
            }else{
                proxy[key] = value;
            }
            return true;
        },
        // get: (target, key) => {
        //     const el = getNextSibling(target, `${upgrade}[is-${ifWantsToBe}]`);
        //     if(el === undefined) return undefined;

        // }
    });
};

export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy, linkForwarder, doAutoForward] as PropAction<any>[];

export class XtalDecor<TTargetElement extends Element = HTMLElement> extends XtallatX(hydrate(HTMLElement)){
    static is = 'xtal-decor';

    static attributeProps = ({upgrade, ifWantsToBe, init, actions, 
        on, newTarget, newTargetProxyPair, targetToProxyMap, autoForward, newForwarder}: XtalDecor) => ({
        str: [upgrade, ifWantsToBe],
        bool: [autoForward],
        obj: [on, newTarget, init, targetToProxyMap, actions, newTargetProxyPair, newForwarder],
        reflect: [upgrade, ifWantsToBe]
    } as AttributeProps);

    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    propActions = propActions;

    newTarget: TTargetElement;

    newForwarder: HTMLElement;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    targetToProxyMap: WeakMap<any, any> = new WeakMap();

    autoForward: boolean | undefined;

    initializedSym = Symbol();

    /**
     * Set these properties via a WeakMap, rather than on the (native) element itself.
     */
    virtualProps: string[] | undefined;

    connectedCallback(){
        this.style.display = 'none';
        super.connectedCallback();
    }

}

define(XtalDecor);