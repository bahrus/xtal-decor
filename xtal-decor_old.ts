import { upgrade as upgr, getAttrInfo} from './upgrade.js';
import { TargetProxyPair, Subscription, XtalDecorProps, ProxyEventDetail } from './types.js';
export { SelfReferentialHTMLElement, Subscription, XtalDecorProps} from './types.js';
import { xc,PropAction,PropDef,PropDefMap,ReactiveSurface, IReactor } from 'xtal-element/lib/XtalCore.js';
import { EventSettings } from 'xtal-element/types.d.js';
import { getDestructArgs } from 'xtal-element/lib/getDestructArgs.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';


export const eventName = 'yzDz0XScOUWhk/CI+tT4vg';

//#region Props
const str0: PropDef = {
    type: String,
    dry: true
}
const str1: PropDef = {
    ...str0,
    reflect: true,
};
const str2: PropDef = {
    ...str0,
    stopReactionsIfFalsy: true,
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
const obj4: PropDef = {
    ...obj1,
    parse: true,
};
export const propDefMap: PropDefMap<XtalDecor> = {
    upgrade: str1, ifWantsToBe: str1,
    on: obj1, newTarget: obj2, init: obj1, targetToProxyMap: obj1, actions: obj1, newTargetProxyPair: obj1, newForwarder: obj3, capture: obj1,
    newTargetId: str2,
    virtualProps: obj4,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
//#endregion

/**
 * @element xtal-decor
 * @tag xtal-decor
 */
export class XtalDecor<TTargetElement extends Element = HTMLElement> extends HTMLElement implements ReactiveSurface{
    static is = 'xtal-decor';
    static observedAttributes = [...slicedPropDefs.boolNames, ...slicedPropDefs.strNames, ...slicedPropDefs.parseNames];
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);

    targetToProxyMap: WeakMap<any, any> = new WeakMap();

    initializedSym = Symbol();

    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }

}

export interface XtalDecor extends XtalDecorProps{}

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
                    const isVirtualProp =  self.virtualProps?.includes(key) === true;
                    const detail: ProxyEventDetail = {
                        prop: key,
                        isVirtualProp,
                        customAttr: ifWantsToBe!,
                        value
                    };
                    target.dispatchEvent(new CustomEvent(eventName, {
                        detail
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
    const id = newTarget.id;
    delete self.newTarget;
    if(id !== ''){
        self.newTargetId = id;
    }
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

const linkForwarder = ({newTargetId, self}: XtalDecor) => {
    import('css-observe/css-observe.js');
    const observer = document.createElement('css-observe') as any;
    observer.observe = true;
    observer.selector = `proxy-decor[for="${newTargetId}"]`;
    observer.addEventListener('latest-match-changed', (e: Event) => {
        self.newForwarder = observer.latestMatch;
    });
    self.appendChild(observer);
}

//https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
// function getNextSibling (elem: Element, selector: string | undefined) {

// 	// Get the next sibling element
//     var sibling = elem.nextElementSibling;
//     if(selector === undefined) return sibling;

// 	// If the sibling matches our selector, use it
// 	// If not, jump to the next sibling and continue the loop
// 	while (sibling) {
// 		if (sibling.matches(selector)) return sibling;
// 		sibling = sibling.nextElementSibling
// 	}
//     return sibling;
// };

const doAutoForward = ({newForwarder, self}: XtalDecor) => {
    let rn = self.getRootNode() as Element;
    if(rn.nodeType === 9) rn = document.body;
    const el = rn.querySelector('#' + newForwarder!.getAttribute('for'));
    if(el === null) return;
    //const anyNewForwarder = newForwarder as any;
    const ifWantsToBe = self.ifWantsToBe!;
    const proxyName = lispToCamel(ifWantsToBe!);
    //const originalVal = (<any>newForwarder)[propName];
    const proxy = self.targetToProxyMap.get(el);
    newForwarder!.setProxy(proxy, proxyName);
    //if(originalVal !== undefined) Object.assign(proxy, originalVal);
    //(anyNewForwarder)[propName] = proxy;
    newForwarder!.dispatchEvent(new Event(`${ifWantsToBe}:initialized`));
};

export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy, linkForwarder, doAutoForward] as PropAction<any>[];



xc.letThereBeProps<XtalDecor>(XtalDecor, slicedPropDefs, 'onPropChange');
xc.define(XtalDecor);