import {CE} from 'trans-render/lib/CE.js';
import { upgrade as upgr, getAttrInfo} from './upgrade.js';
import {XtalDecorProps, XtalDecorActions, ProxyEventDetail} from './types';
import { getDestructArgs } from 'trans-render/lib/getDestructArgs.js';
import { EventSettings } from 'trans-render/lib/types.d.js';

export const ce = new CE<XtalDecorProps, XtalDecorActions>();

export class XtalDecorCore<TTargetElement extends Element = HTMLElement> extends HTMLElement implements XtalDecorActions{
    targetToProxyMap: WeakMap<any, any> = new WeakMap();
    watchForElementsToUpgrade({upgrade, ifWantsToBe, init, actions, forceVisible}: this){
        const callback = (target: Element) => {
            this.newTarget = target as TTargetElement;
        }
        upgr({
            shadowDomPeer: this,
            upgrade: upgrade!,
            ifWantsToBe: ifWantsToBe!,
            forceVisible,
        }, callback);
    }
    pairTargetWithProxy({actions, virtualProps, targetToProxyMap, newTarget, ifWantsToBe, noParse}: this){
        const existingProxy = targetToProxyMap.get(newTarget);
        if(existingProxy){
            if(!noParse){
                const attr = getAttrInfo(newTarget!, ifWantsToBe!, true);
                if(attr !== null && attr.length > 0 && attr[0]!.length > 0){
                    Object.assign(existingProxy, JSON.parse(attr[0]!));
                }
            }
            return;
        }
        
        const virtualPropHolder: any = {};
        const self = this;
        const proxy = new Proxy(newTarget!, {
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
                        const arg = Object.assign({}, virtualPropHolder, target, {target});
                        action(arg as HTMLElement, this);
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
            target: newTarget!
        }
        const id = newTarget!.id;
        self.newTarget = undefined;
        if(id !== ''){
            self.newTargetId = id;
        }
    }
    initializeProxy({newTargetProxyPair, init, on, capture, ifWantsToBe, noParse}: this){
        const newProxy = newTargetProxyPair!.proxy;
        (<any>newProxy).self = newProxy;
        const newTarget = newTargetProxyPair!.target;
        if(init !== undefined) init(newProxy, this, newTarget);
        if(!noParse){
            const attr = getAttrInfo(newTarget, ifWantsToBe!, true);
            if(attr !== null && attr.length > 0 && attr[0]!.length > 0){
                Object.assign(newProxy, JSON.parse(attr[0]!));
            }
        }
        addEvents(on!, newTarget as EventTarget, newProxy, false);
        addEvents(capture!, newTarget, newProxy, true);
        this.newTargetProxyPair  = undefined;
    }
    attachForwarder({newTargetId}: this){
        const qry = `proxy-decor[for="${newTargetId}"]`;
        const newForwarder = (this.getRootNode() as HTMLElement)?.querySelector(qry);
        if(newForwarder){
            this.newForwarder = newForwarder as any;
            return; 
        }
        import('css-observe/css-observe.js');
        const observer = document.createElement('css-observe') as any;
        observer.observe = true;
        observer.selector = `proxy-decor[for="${newTargetId}"]`;
        observer.addEventListener('latest-match-changed', (e: Event) => {
            this.newForwarder = observer.latestMatch;
        });
        this.appendChild(observer);
    }
    doAutoForward({newForwarder, ifWantsToBe}: this){
        let rn = this.getRootNode() as Element;
        if(rn.nodeType === 9) rn = document.body;
        const el = rn.querySelector('#' + newForwarder!.getAttribute('for'));
        if(el === null) return;
        //const anyNewForwarder = newForwarder as any;
        const proxyName = ce.toCamel(ifWantsToBe!);
        //const originalVal = (<any>newForwarder)[propName];
        const proxy = this.targetToProxyMap.get(el);
        newForwarder!.setProxy(proxy, proxyName);
        //if(originalVal !== undefined) Object.assign(proxy, originalVal);
        //(anyNewForwarder)[propName] = proxy;
        newForwarder!.dispatchEvent(new Event(`${ifWantsToBe}:initialized`));
    };
}


export interface XtalDecorCore<TTargetElement extends Element = HTMLElement> extends XtalDecorProps<TTargetElement>{}

function addEvents(on: EventSettings | undefined, target: EventTarget, proxy: EventTarget, capture: boolean){
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

ce.def({
    config:{
        tagName:'xtal-decor',
        propDefaults:{
            ifWantsToBe: '',
            noParse: false,
            forceVisible: false,
        },
        style:{
            display: 'none'
        },
        actions:{
            watchForElementsToUpgrade:{
                ifAllOf: ['upgrade', 'ifWantsToBe', 'init', 'actions']
            },
            pairTargetWithProxy:{
                ifKeyIn:['actions', 'virtualProps', 'ifWantsToBe'],
                ifAllOf:['newTarget']
            },
            initializeProxy:{
                ifKeyIn: ['init', 'on', 'capture', 'ifWantsToBe'],
                ifAllOf:['newTargetProxyPair']
            },
            attachForwarder:{
                ifAllOf:['newTargetId']
            },
            doAutoForward:{
                ifAllOf:['newForwarder', 'ifWantsToBe']
            }
        }
    },
    superclass: XtalDecorCore,

});

/**
 * @element xtal-decor
 * @tag xtal-decor
 */
export const XtalDecor = ce.classDef!;

export const eventName = 'yzDz0XScOUWhk/CI+tT4vg';

