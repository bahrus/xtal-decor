import { upgrade as upgr, getAttrInfo } from './upgrade.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { getDestructArgs } from 'xtal-element/lib/getDestructArgs.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
export const eventName = 'yzDz0XScOUWhk/CI+tT4vg';
//#region Props
const str0 = {
    type: String,
    dry: true
};
const str1 = {
    ...str0,
    reflect: true,
};
const str2 = {
    ...str0,
    stopReactionsIfFalsy: true,
};
const obj1 = {
    type: Object,
    dry: true
};
const obj2 = {
    type: Object,
};
const obj3 = {
    ...obj1,
    stopReactionsIfFalsy: true,
};
export const propDefMap = {
    upgrade: str1, ifWantsToBe: str1,
    on: obj1, newTarget: obj2, init: obj1, targetToProxyMap: obj1, actions: obj1, newTargetProxyPair: obj1, newForwarder: obj3, capture: obj1,
    newTargetId: str2,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
//#endregion
/**
 * @element xtal-decor
 * @tag xtal-decor
 */
export class XtalDecor extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        this.targetToProxyMap = new WeakMap();
        this.initializedSym = Symbol();
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
}
XtalDecor.is = 'xtal-decor';
XtalDecor.observedAttributes = [...slicedPropDefs.boolNames, ...slicedPropDefs.strNames];
export function hasUndefined(arr) {
    return arr.includes(undefined);
}
const linkUpgradeProxyPair = ({ upgrade, ifWantsToBe, self, init, actions }) => {
    if (hasUndefined([upgrade, ifWantsToBe, self, init, actions]))
        return;
    const callback = (target) => {
        self.newTarget = target;
    };
    upgr({
        shadowDomPeer: self,
        upgrade: upgrade,
        ifWantsToBe: ifWantsToBe,
    }, callback);
};
export const linkNewTargetProxyPair = ({ actions, self, virtualProps, targetToProxyMap, newTarget, ifWantsToBe }) => {
    if (newTarget === undefined)
        return;
    const existingProxy = targetToProxyMap.get(newTarget);
    if (existingProxy) {
        const attr = getAttrInfo(newTarget, ifWantsToBe, true);
        if (attr !== null && attr.length > 0 && attr[0].length > 0) {
            Object.assign(existingProxy, JSON.parse(attr[0]));
        }
        return;
    }
    const virtualPropHolder = {};
    const proxy = new Proxy(newTarget, {
        set: (target, key, value) => {
            if (key === 'self' || (virtualProps !== undefined && virtualProps.includes(key))) {
                virtualPropHolder[key] = value;
            }
            else {
                target[key] = value;
            }
            if (key === 'self')
                return true;
            actions?.forEach(action => {
                const dependencies = getDestructArgs(action);
                if (dependencies.includes(key)) {
                    //TODO:  symbols
                    const arg = Object.assign({}, virtualPropHolder, target);
                    action(arg);
                }
            });
            switch (typeof key) { //TODO:  remove this in favor of prop subscribers.
                case 'string':
                    const isVirtualProp = self.virtualProps?.includes(key) === true;
                    const detail = {
                        prop: key,
                        isVirtualProp,
                        customAttr: ifWantsToBe,
                        value
                    };
                    target.dispatchEvent(new CustomEvent(eventName, {
                        detail
                    }));
                    break;
            }
            return true;
        },
        get: (target, key) => {
            let value; // = Reflect.get(target, key);
            if (key === 'self' || (virtualProps !== undefined && virtualProps.includes(key))) {
                value = virtualPropHolder[key];
            }
            else {
                value = target[key]; // = value;
            }
            if (typeof (value) == "function") {
                return value.bind(target);
            }
            return value;
        }
    });
    targetToProxyMap.set(newTarget, proxy);
    self.newTargetProxyPair = {
        proxy: proxy,
        target: newTarget
    };
    const id = newTarget.id;
    delete self.newTarget;
    if (id !== '') {
        self.newTargetId = id;
    }
};
const initializeProxy = ({ newTargetProxyPair, init, self, on, capture, ifWantsToBe }) => {
    if (newTargetProxyPair === undefined)
        return;
    const newProxy = newTargetProxyPair.proxy;
    newProxy.self = newProxy;
    const newTarget = newTargetProxyPair.target;
    if (init !== undefined)
        init(newProxy);
    const attr = getAttrInfo(newTarget, ifWantsToBe, true);
    if (attr !== null && attr.length > 0 && attr[0].length > 0) {
        Object.assign(newProxy, JSON.parse(attr[0]));
    }
    addEvents(on, newTarget, newProxy, false);
    addEvents(capture, newTarget, newProxy, true);
    delete self.newTargetProxyPair;
};
function addEvents(on, target, proxy, capture) {
    if (on === undefined)
        return;
    for (var key in on) {
        const eventSetting = on[key];
        switch (typeof eventSetting) {
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
const linkForwarder = ({ newTargetId, self }) => {
    import('css-observe/css-observe.js');
    const observer = document.createElement('css-observe');
    observer.observe = true;
    observer.selector = `proxy-decor[for="${newTargetId}"]`;
    observer.addEventListener('latest-match-changed', (e) => {
        self.newForwarder = observer.latestMatch;
    });
    self.appendChild(observer);
};
//https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
function getNextSibling(elem, selector) {
    // Get the next sibling element
    var sibling = elem.nextElementSibling;
    if (selector === undefined)
        return sibling;
    // If the sibling matches our selector, use it
    // If not, jump to the next sibling and continue the loop
    while (sibling) {
        if (sibling.matches(selector))
            return sibling;
        sibling = sibling.nextElementSibling;
    }
    return sibling;
}
;
const doAutoForward = ({ newForwarder, self }) => {
    let rn = self.getRootNode();
    if (rn.nodeType === 9)
        rn = document.body;
    const el = rn.querySelector('#' + rn.getAttribute('for'));
    if (el === null)
        return;
    const ifWantsToBe = self.ifWantsToBe;
    const propName = lispToCamel(ifWantsToBe);
    const originalVal = newForwarder[propName];
    const proxy = self.targetToProxyMap.get(el);
    if (originalVal !== undefined)
        Object.assign(proxy, originalVal);
    newForwarder[propName] = proxy;
    newForwarder.dispatchEvent(new Event(`${ifWantsToBe}:initialized`));
};
export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy, linkForwarder, doAutoForward];
xc.letThereBeProps(XtalDecor, slicedPropDefs, 'onPropChange');
xc.define(XtalDecor);
