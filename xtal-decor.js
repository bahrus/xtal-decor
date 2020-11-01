import { XtallatX, define, deconstruct, camelToLisp } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { upgrade as upgr } from './upgrade.js';
export { define, mergeProps } from 'xtal-element/xtal-latx.js';
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
        const attr = newTarget.getAttribute('is-' + ifWantsToBe);
        if (attr !== null && attr.length > 0) {
            Object.assign(existingProxy, JSON.parse(attr));
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
            actions.forEach(action => {
                const dependencies = deconstruct(action);
                if (dependencies.includes(key)) {
                    //TODO:  symbols
                    const arg = Object.assign({}, virtualPropHolder, target);
                    action(arg);
                }
            });
            switch (typeof key) {
                case 'string':
                    target.dispatchEvent(new CustomEvent(camelToLisp(key) + '-changed', {
                        detail: {
                            value: value
                        }
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
    delete self.newTarget;
};
const initializeProxy = ({ newTargetProxyPair, init, self, on, capture, ifWantsToBe }) => {
    if (newTargetProxyPair === undefined)
        return;
    const newProxy = newTargetProxyPair.proxy;
    newProxy.self = newProxy;
    const newTarget = newTargetProxyPair.target;
    init(newProxy);
    const attr = newTarget.getAttribute('is-' + ifWantsToBe);
    if (attr !== null && attr.length > 0) {
        Object.assign(newProxy, JSON.parse(attr));
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
const linkForwarder = ({ autoForward, ifWantsToBe, self }) => {
    if (!autoForward)
        return;
    import('css-observe/css-observe.js');
    const observer = document.createElement('css-observe');
    observer.observe = true;
    observer.selector = `proxy-props[for="${ifWantsToBe}"]`;
    observer.addEventListener('latest-match-changed', e => {
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
const doAutoForward = ({ newForwarder, upgrade, ifWantsToBe, initializedSym, targetToProxyMap }) => {
    if (newForwarder === undefined)
        return;
    const proxy = new Proxy(newForwarder, {
        set: (target, key, value) => {
            target[key] = value;
            const el = getNextSibling(target, `${upgrade}[is-${ifWantsToBe}]`);
            if (el === undefined)
                return true;
            const proxy = targetToProxyMap.get(el);
            if (proxy === undefined)
                return true;
            if (el[initializedSym] === undefined) {
                const props = {};
                Object.getOwnPropertyNames(target).forEach(targetKey => {
                    props[targetKey] = target[targetKey];
                });
                Object.assign(proxy, props);
                el[initializedSym] = true;
            }
            else {
                proxy[key] = value;
            }
            return true;
        },
    });
};
export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy, linkForwarder, doAutoForward];
export class XtalDecor extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.targetToProxyMap = new WeakMap();
        this.initializedSym = Symbol();
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
}
XtalDecor.is = 'xtal-decor';
XtalDecor.attributeProps = ({ upgrade, ifWantsToBe, init, actions, on, capture, newTarget, newTargetProxyPair, targetToProxyMap, autoForward, newForwarder }) => ({
    str: [upgrade, ifWantsToBe],
    bool: [autoForward],
    obj: [on, newTarget, init, targetToProxyMap, actions, newTargetProxyPair, newForwarder, capture],
    reflect: [upgrade, ifWantsToBe]
});
define(XtalDecor);
