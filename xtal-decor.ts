import { XtallatX, define, AttributeProps, PropAction, deconstruct, EventSettings} from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { decorate } from './decorate.js';
import {TargetProxyPair} from './types.d.js';

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

const linkTargetProxyPair = ({proxyHandler, treat, as, self}: XtalDecor) => {
    if(proxyHandler === undefined || treat === undefined || as === undefined){
        decorate({
            nodeInShadowDOMRealm: self,
            treat: treat,
            as: as,
            proxyHandler: proxyHandler
        }).then((value: TargetProxyPair<any>) => {
            self.targetProxyPair = value;
        })
    }
}

const initializeProxy = ({targetProxyPair, init, self, on}: XtalDecor) => {
    const proxy = targetProxyPair.proxy as any;
    const prevSelf = proxy.self;
    init(targetProxyPair.proxy);
    for(var key in on){
        const eventSetting = on[key];
        switch(typeof eventSetting){
            case 'function':
                proxy.addEventListener(key, e => {
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

export const propActions = [linkProxyHandler, linkTargetProxyPair, initializeProxy];

export class XtalDecor<TTargetElement extends HTMLElement = HTMLElement> extends XtallatX(hydrate(HTMLElement)){
    static is = 'xtal-decor';

    static attributeProps = ({disabled, treat, as, upgrade, toBe, init, actions, proxyHandler, on, targetProxyPair}: XtalDecor) => ({
        str: [treat, as, upgrade, toBe],
        obj: [proxyHandler, on, targetProxyPair],
        reflect: [treat, as, upgrade, toBe]
    } as AttributeProps);

    treat: string | undefined;

    as: string | undefined;

    upgrade: string | undefined;

    toBe: string | undefined;

    init: PropAction<TTargetElement> | undefined;

    actions: PropAction<any>[] | undefined;

    proxyHandler: ProxyHandler<TTargetElement> | undefined;

    on: EventSettings | undefined;

    propActions = propActions;

    targetProxyPair: TargetProxyPair<TTargetElement> | undefined;
}

define(XtalDecor);