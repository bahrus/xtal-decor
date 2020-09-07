import { XtallatX, define, AttributeProps, PropAction, deconstruct, EventSettings} from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { upgrade as upgr } from './upgrade.js';
import { TargetProxyPair } from './types.d.js';
export {define, AttributeProps, PropAction, EventSettings, mergeProps} from 'xtal-element/xtal-latx.js';
export {SelfReferentialHTMLElement} from './types.d.js';

// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events#Mutation_Observers_alternatives_examples
//can't we use https://developer.mozilla.org/en-US/docs/Web/API/Node/contains#:~:text=The%20Node.,direct%20children%2C%20and%20so%20on.?
function onRemove(element: Element, callback: Function) {
    let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation =>{
            mutation.removedNodes.forEach(removed =>{
                if(element === removed){
                    callback();
                    observer.disconnect();
                }
            })
        })
    });
    observer.observe(element.parentElement || element.getRootNode(), {
        childList: true,
    });
};

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
                    target.dispatchEvent(new CustomEvent(key + '-changed', {
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

const initializeProxy = ({newTargetProxyPair, init, self, on}: XtalDecor) => {
    if(newTargetProxyPair === undefined) return;
    const newProxy = newTargetProxyPair.proxy;
    (<any>newProxy).self = newProxy;
    const newTarget = newTargetProxyPair.target;
    init(newProxy);
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

export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy] as PropAction<any>[];

export class XtalDecor<TTargetElement extends Element = HTMLElement> extends XtallatX(hydrate(HTMLElement)){
    static is = 'xtal-decor';

    static attributeProps = ({upgrade, ifWantsToBe, init, actions, 
            on, newTarget, newTargetProxyPair, targetToProxyMap}: XtalDecor) => ({
        str: [upgrade, ifWantsToBe],
        obj: [on, newTarget, init, targetToProxyMap, actions, newTargetProxyPair],
        reflect: [upgrade, ifWantsToBe]
    } as AttributeProps);

    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    on: EventSettings | undefined;

    propActions = propActions;

    newTarget: TTargetElement;

    newTargetProxyPair: TargetProxyPair<TTargetElement> | undefined;

    targetToProxyMap: WeakMap<any, any> = new WeakMap();

    /**
     * Set these properties via a WeakMap, rather than on the (native) element itself.
     */
    virtualProps: string[] | undefined;

}

define(XtalDecor);