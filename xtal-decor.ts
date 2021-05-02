import { upgrade as upgr, getAttrInfo} from './upgrade.js';
import { TargetProxyPair, Subscription } from './types.d.js';
export { SelfReferentialHTMLElement, Subscription} from './types.d.js';
import { xc,PropAction,PropDef,PropDefMap,ReactiveSurface, IReactor } from 'xtal-element/lib/XtalCore.js';
import { EventSettings } from 'xtal-element/types.d.js';
import { getDestructArgs } from 'xtal-element/lib/getDestructArgs.js';

export const eventName = 'yzDz0XScOUWhk/CI+tT4vg';
/**
 * @element xtal-decor
 */
export class XtalDecor<TTargetElement extends Element = HTMLElement> extends HTMLElement implements ReactiveSurface{
    static is = 'xtal-decor';
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);



    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    capture: EventSettings | undefined;

    newTarget: TTargetElement | undefined;

    newForwarder: HTMLElement | undefined;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    targetToProxyMap: WeakMap<any, any> = new WeakMap();
    //proxyToSubscriberMap: WeakMap<any, Subscription[]> = new WeakMap();

    autoForward: boolean | undefined;

    initializedSym = Symbol();

    /**
     * Set these properties via a WeakMap, rather than on the (native) element itself.
     */
    virtualProps: string[] | undefined;

    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }



}
export function hasUndefined(arr: any[]){
    return arr.includes(undefined);
}

const linkUpgradeProxyPair = ({upgrade, ifWantsToBe, self, init, actions}: XtalDecor) => {
    if(hasUndefined([upgrade, ifWantsToBe, self, init, actions])) return;
    const callback = (target: HTMLElement) => {
        self.newTarget = target;
    }
    upgr({
        shadowDomPeer: self,
        upgrade: upgrade!,
        ifWantsToBe: ifWantsToBe!,
    }, callback);
}


export const linkNewTargetProxyPair = ({actions, self, virtualProps, targetToProxyMap, newTarget, ifWantsToBe}: XtalDecor) => {
    if(newTarget === undefined) return;
    const existingProxy = targetToProxyMap.get(newTarget);
    if(existingProxy){
        const attr = getAttrInfo(newTarget, ifWantsToBe!, true);
        if(attr !== null && attr.length > 0 && attr[0]!.length > 0){
            Object.assign(existingProxy, JSON.parse(attr[0]!));
        }
        return;
    }
    
    const virtualPropHolder: any = {};
    const proxy = new Proxy(newTarget, {
        set: (target: any, key, value) => {
            if(key === 'self' || (virtualProps !== undefined && virtualProps.includes(key as string))){
                virtualPropHolder[key] = value;
            }else{
                target[key] = value;
            }
            if(key === 'self') return true;
            actions?.forEach(action =>{
                const dependencies = getDestructArgs(action);
                if(dependencies.includes(key as string)){
                    //TODO:  symbols
                    const arg = Object.assign({}, virtualPropHolder, target);
                    action(arg as HTMLElement);
                }
            });
            switch(typeof key){ //TODO:  remove this in favor of prop subscribers.
                case 'string':
                    target.dispatchEvent(new CustomEvent(eventName, {
                        detail:{
                            key: key,
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

const initializeProxy = ({newTargetProxyPair, init, self, on, capture, ifWantsToBe}: XtalDecor) => {
    if(newTargetProxyPair === undefined) return;
    const newProxy = newTargetProxyPair.proxy;
    (<any>newProxy).self = newProxy;
    const newTarget = newTargetProxyPair.target;
    if(init !== undefined) init(newProxy);
    const attr = getAttrInfo(newTarget, ifWantsToBe!, true);
    if(attr !== null && attr.length > 0 && attr[0]!.length > 0){
        Object.assign(newProxy, JSON.parse(attr[0]!));
    }
    addEvents(on!, newTarget, newProxy, false);
    addEvents(capture!, newTarget, newProxy, true);
    delete self.newTargetProxyPair;
}

function addEvents(on: EventSettings | undefined, target: HTMLElement, proxy: HTMLElement, capture: boolean){
    if(on === undefined) return;
    for(var key in on){
        const eventSetting = on[key];
        switch(typeof eventSetting){
            case 'function':
                target.addEventListener(key, e => {
                    eventSetting(proxy, e);
                }, capture);
                break;
            default:
                //TODO:
                throw 'not implemented yet';
        }
    }  
}

const linkForwarder = ({autoForward, ifWantsToBe, self}: XtalDecor) => {
    import('css-observe/css-observe.js');
    const observer = document.createElement('css-observe') as any;
    observer.observe = true;
    observer.selector = `proxy-decor[for="${ifWantsToBe}"]`;
    observer.addEventListener('latest-match-changed', (e: Event) => {
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

const doAutoForward = ({newForwarder, upgrade, ifWantsToBe, initializedSym, targetToProxyMap, self}: XtalDecor) => {
    const el = getNextSibling(newForwarder!, `${upgrade}[is-${ifWantsToBe}],${upgrade}[be-${ifWantsToBe}]`);
    if(el === undefined || !targetToProxyMap.has(el)){
        setTimeout(() => doAutoForward(self), 50);
        return;
    };
    const proxy = targetToProxyMap.get(el);
    (<any>newForwarder).proxy = proxy;
    newForwarder!.dispatchEvent(new Event('initialized'));
    if(newForwarder === undefined) return;
};

export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy, linkForwarder, doAutoForward] as PropAction<any>[];
const str1: PropDef = {
    type: String,
    dry: true,
    reflect: true,
};
const obj1: PropDef = {
    type: Object,
    dry: true
};
const obj2: PropDef = {
    type: Object,
};
const obj3: PropDef={
    ...obj1,
    stopReactionsIfFalsy: true,
}
export const propDefMap: PropDefMap<XtalDecor> = {
    upgrade: str1, ifWantsToBe: str1,
    on: obj1, newTarget: obj2, init: obj1, targetToProxyMap: obj1, actions: obj1, newTargetProxyPair: obj1, newForwarder: obj3, capture: obj1,
    autoForward:{
        type: Boolean,
        dry: true,
        stopReactionsIfFalsy: true,
    },
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);


xc.letThereBeProps<XtalDecor>(XtalDecor, slicedPropDefs, 'onPropChange');
xc.define(XtalDecor);