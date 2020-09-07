import { XtallatX, define, AttributeProps, PropAction, deconstruct, EventSettings} from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { upgrade as upgr } from './upgrade.js';
import {TargetProxyPair} from './types.d.js';
export {define, AttributeProps, PropAction, EventSettings, mergeProps} from 'xtal-element/xtal-latx.js';
export {SelfReferentialHTMLElement} from './types.d.js';


export const linkProxyHandler = ({actions, self, init, on}: XtalDecor) => {
    if(actions === undefined || init === undefined || on === undefined) return;
    self.proxyHandler = {
        set: (target: any, key, value) => {
            target[key] = value;
            if(key === 'self') return true;
            actions.forEach(action =>{
                const dependencies = deconstruct(action);
                if(dependencies.includes(key as string)){ //TODO:  symbols
                    const prevSelf = target.self;
                    target.self = target;
                    action(target as HTMLElement);
                    target.self = prevSelf;
                }
            });
            return true;
        },
        get:(obj,key)=>{
            let value = Reflect.get(obj,key);
            if(typeof(value) == "function"){
                return value.bind(obj);
            }
            return value;
        }
    }
}


const linkUpgradeProxyPair = ({proxyHandler, upgrade, ifWantsToBe: toBe, self}: XtalDecor) => {
    if(proxyHandler === undefined || upgrade === undefined || toBe === undefined) return;
    const callback = (tpp: TargetProxyPair<any>) => {
        self.targetProxyPair = tpp;
    }
    upgr({
        shadowDomPeer: self,
        upgrade: upgrade,
        ifWantsToBe: toBe,
        proxyHandler: proxyHandler,
    }, callback);
}

const initializeProxy = ({targetProxyPair, init, self, on}: XtalDecor) => {
    if(targetProxyPair === undefined) return;
    const proxy = targetProxyPair.proxy as any;
    const prevSelf = proxy.self;
    proxy.self = proxy;
    init(proxy);
    for(var key in on){
        const eventSetting = on[key];
        switch(typeof eventSetting){
            case 'function':
                targetProxyPair.target.addEventListener(key, e => {
                    const prevSelf = proxy.self;
                    proxy.self = proxy;
                    eventSetting(proxy, e);
                    proxy.self = prevSelf;
                });
                return eventSetting;
                break;
            default:
                throw 'not implemented yet';
        }
    }    
    proxy.self = prevSelf;
}

export const propActions = [linkProxyHandler, linkUpgradeProxyPair, initializeProxy];

export class XtalDecor<TTargetElement extends HTMLElement = HTMLElement> extends XtallatX(hydrate(HTMLElement)){
    static is = 'xtal-decor';

    static attributeProps = ({disabled, treat, as, upgrade, ifWantsToBe, init, actions, proxyHandler, on, targetProxyPair}: XtalDecor) => ({
        str: [treat, as, upgrade, ifWantsToBe],
        obj: [proxyHandler, on, targetProxyPair, init],
        reflect: [treat, as, upgrade, ifWantsToBe]
    } as AttributeProps);

    treat: string | undefined;

    as: string | undefined;

    upgrade: string | undefined;

    ifWantsToBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    proxyHandler: ProxyHandler<TTargetElement> | undefined;

    on: EventSettings | undefined;

    propActions = propActions;

    targetProxyPair: TargetProxyPair<TTargetElement> | undefined;
}

define(XtalDecor);