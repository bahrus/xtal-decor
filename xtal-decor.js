import { XtallatX, define, deconstruct } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { decorate } from './decorate.js';
import { upgrade as upgr } from './upgrade.js';
export const linkProxyHandler = ({ actions, self, init, on }) => {
    if (actions === undefined || init === undefined || on === undefined)
        return;
    self.proxyHandler = {
        set: (target, key, value) => {
            target[key] = value;
            if (key === 'self')
                return true;
            actions.forEach(action => {
                const dependencies = deconstruct(action);
                if (dependencies.includes(key)) { //TODO:  symbols
                    const prevSelf = target.self;
                    target.self = target;
                    action(target);
                    target.self = prevSelf;
                }
            });
            return true;
        },
        get: (obj, key) => {
            let value = Reflect.get(obj, key);
            if (typeof (value) == "function") {
                return value.bind(obj);
            }
            return value;
        }
    };
};
const linkDecoratorProxyPair = ({ proxyHandler, treat, as, self }) => {
    if (proxyHandler === undefined || treat === undefined || as === undefined)
        return;
    const callback = (tpp) => {
        self.targetProxyPair = tpp;
    };
    decorate({
        nodeInShadowDOMRealm: self,
        treat: treat,
        as: as,
        proxyHandler: proxyHandler
    }, callback);
};
const linkUpgradeProxyPair = ({ proxyHandler, upgrade, toBe, self }) => {
    if (proxyHandler === undefined || upgrade === undefined || toBe === undefined)
        return;
    const callback = (tpp) => {
        self.targetProxyPair = tpp;
    };
    upgr({
        nodeInShadowDOMRealm: self,
        upgrade: upgrade,
        toBe: toBe,
        proxyHandler: proxyHandler,
    }, callback);
};
const initializeProxy = ({ targetProxyPair, init, self, on }) => {
    if (targetProxyPair === undefined)
        return;
    const proxy = targetProxyPair.proxy;
    const prevSelf = proxy.self;
    proxy.self = proxy;
    init(proxy);
    for (var key in on) {
        const eventSetting = on[key];
        switch (typeof eventSetting) {
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
};
export const propActions = [linkProxyHandler, linkDecoratorProxyPair, linkUpgradeProxyPair, initializeProxy];
export class XtalDecor extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
    }
}
XtalDecor.is = 'xtal-decor';
XtalDecor.attributeProps = ({ disabled, treat, as, upgrade, toBe, init, actions, proxyHandler, on, targetProxyPair }) => ({
    str: [treat, as, upgrade, toBe],
    obj: [proxyHandler, on, targetProxyPair, init],
    reflect: [treat, as, upgrade, toBe]
});
define(XtalDecor);
