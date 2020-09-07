import { XtallatX, define, deconstruct } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { upgrade as upgr } from './upgrade.js';
export { define, mergeProps } from 'xtal-element/xtal-latx.js';
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events#Mutation_Observers_alternatives_examples
//can't we use https://developer.mozilla.org/en-US/docs/Web/API/Node/contains#:~:text=The%20Node.,direct%20children%2C%20and%20so%20on.?
function onRemove(element, callback) {
    let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.removedNodes.forEach(removed => {
                if (element === removed) {
                    callback();
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(element.parentElement || element.getRootNode(), {
        childList: true,
    });
}
;
export function hasUndefined(arr) {
    return arr.includes(undefined);
}
const linkUpgradeProxyPair = ({ upgrade, ifWantsToBe, self, on, init, actions }) => {
    if (hasUndefined([upgrade, ifWantsToBe, self, on, init, actions]))
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
export const linkNewTargetProxyPair = ({ actions, self, virtualProps, targetToProxyMap, newTarget }) => {
    if (newTarget === undefined)
        return;
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
                    target.dispatchEvent(new CustomEvent(key + '-changed', {
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
const initializeProxy = ({ newTargetProxyPair, init, self, on }) => {
    if (newTargetProxyPair === undefined)
        return;
    const newProxy = newTargetProxyPair.proxy;
    newProxy.self = newProxy;
    const newTarget = newTargetProxyPair.target;
    init(newProxy);
    for (var key in on) {
        const eventSetting = on[key];
        switch (typeof eventSetting) {
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
};
export const propActions = [linkUpgradeProxyPair, linkNewTargetProxyPair, initializeProxy];
export class XtalDecor extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.targetToProxyMap = new WeakMap();
    }
}
XtalDecor.is = 'xtal-decor';
XtalDecor.attributeProps = ({ upgrade, ifWantsToBe, init, actions, on, newTarget, newTargetProxyPair, targetToProxyMap }) => ({
    str: [upgrade, ifWantsToBe],
    obj: [on, newTarget, init, targetToProxyMap, actions, newTargetProxyPair],
    reflect: [upgrade, ifWantsToBe]
});
define(XtalDecor);
