import { addCSSListener } from 'xtal-element/lib/observeCssSelector.js';
export function upgrade(args, callback) {
    const beAttrib = `be-${args.ifWantsToBe}`;
    const id = 'a' + (new Date()).valueOf().toString();
    monitor(id, beAttrib, args, callback);
}
function monitor(id, beAttrib, args, callback) {
    addCSSListener(id, args.shadowDomPeer, `${args.upgrade}[${beAttrib}],${args.upgrade}[data-${beAttrib}]`, (e) => {
        const target = e.target;
        const val = getAttrInfo(target, args.ifWantsToBe, false);
        if (val === null) {
            console.warn("Mismatch found.");
            return;
        }
        target.setAttribute(`${val[1]}is-${args.ifWantsToBe}`, val[0]);
        target.removeAttribute(`${val[1]}be-${args.ifWantsToBe}`);
        if (callback !== undefined)
            callback(target);
    });
}
export function getAttrInfo(newTarget, ifWantsToBe, is) {
    const bePrefix = is ? 'is-' : 'be-';
    const dataBePrefix = 'data-' + bePrefix;
    if (newTarget.hasAttribute(bePrefix + ifWantsToBe)) {
        return [newTarget.getAttribute(bePrefix + ifWantsToBe), ''];
    }
    if (newTarget.hasAttribute(dataBePrefix + ifWantsToBe)) {
        return [newTarget.getAttribute(dataBePrefix + ifWantsToBe), 'data-'];
    }
    return null;
}
