import { upgrade as upgr, getAttrInfo} from './upgrade.js';
import { TargetProxyPair, Subscription } from './types.d.js';
export { SelfReferentialHTMLElement, Subscription} from './types.d.js';
import { xc,PropAction,PropDef,PropDefMap,ReactiveSurface } from 'xtal-element/lib/XtalCore.js';
import { EventSettings } from 'xtal-element/types.d.js';
import { getDestructArgs } from 'xtal-element/lib/getDestructArgs.js';
import { camelToLisp } from 'trans-render/lib/camelToLisp.js';

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
        upgrade: upgrade,
        ifWantsToBe: ifWantsToBe,
    }, callback);
}


export const linkNewTargetProxyPair = ({actions, self, virtualProps, targetToProxyMap, newTarget, ifWantsToBe}: XtalDecor) => {
    if(newTarget === undefined) return;
    const existingProxy = targetToProxyMap.get(newTarget);
    if(existingProxy){
        const attr = getAttrInfo(newTarget, ifWantsToBe, true);
        if(attr !== null && attr.length > 0 && attr[0].length > 0){
            Object.assign(existingProxy, JSON.parse(attr[0]));
        }
        return;
    }
    
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
                const dependencies = getDestructArgs(action);
                if(dependencies.includes(key as string)){
                    //TODO:  symbols
                    const arg = Object.assign({}, virtualPropHolder, target);
                    action(arg as HTMLElement);
                }
            });
            switch(typeof key){ //TODO:  remove this in favor of prop subscribers.
                case 'string':
                    target.dispatchEvent(new CustomEvent(camelToLisp(key) + '-changed', {
                        detail:{
                            value: value
                        }
                    }));
                    if(self.proxyToSubscriberMap.has(target)){
                        const subscriptions = self.proxyToSubscriberMap.get(target);
                        for(const subscription of subscriptions){
                            if(subscription.propsOfInterest.has(key)){
                                subscription.callBack(target);
                            }
                        }
                    }
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
    init(newProxy);
    const attr = getAttrInfo(newTarget, ifWantsToBe, true);
    if(attr !== null && attr.length > 0 && attr[0].length > 0){
        Object.assign(newProxy, JSON.parse(attr[0]));
    }
    addEvents(on, newTarget, newProxy, false);
    addEvents(capture, newTarget, newProxy, true);
    delete self.newTargetProxyPair;
}

function addEvents(on: EventSettings, target: HTMLElement, proxy: HTMLElement, capture: boolean){
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



export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy] as PropAction<any>[];
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
export const propDefMap: PropDefMap<XtalDecor> = {
    upgrade: str1, ifWantsToBe: str1,
    on: obj1, newTarget: obj2, init: obj1, targetToProxyMap: obj1, actions: obj1, newTargetProxyPair: obj1, newForwarder: obj1, capture: obj1,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
export class XtalDecor<TTargetElement extends Element = HTMLElement> extends HTMLElement{
    static is = 'xtal-decor';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);



    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    capture: EventSettings | undefined;

    newTarget: TTargetElement;

    newForwarder: HTMLElement;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    targetToProxyMap: WeakMap<any, any> = new WeakMap();
    proxyToSubscriberMap: WeakMap<any, Subscription[]> = new WeakMap();

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

    subscribe(target: TTargetElement, subscription: Subscription){
        if(!this.targetToProxyMap.has(target)){
            setTimeout(() => {
                this.subscribe(target, subscription);
            }, 50);
            return;
        }
        const proxy = this.targetToProxyMap.get(target);
        if(!this.proxyToSubscriberMap.has(proxy)){
            this.proxyToSubscriberMap.set(proxy, []);
        }
        const subscriptions = this.proxyToSubscriberMap.get(proxy);
        subscriptions.push(subscription);
    }

    unsubscribe(target: TTargetElement, subscription: Subscription){
        if(!this.proxyToSubscriberMap.has(target)) return;
        const subscriptions = this.proxyToSubscriberMap.get(target);
        const idx = subscriptions.findIndex(x => x.propsOfInterest === subscription.propsOfInterest && x.callBack === subscription.callBack);
        if(idx > -1) subscriptions.splice(idx, 1);
    }

}

xc.letThereBeProps<XtalDecor>(XtalDecor, slicedPropDefs, 'onPropChange');
xc.define(XtalDecor);