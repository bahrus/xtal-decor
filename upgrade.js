import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function upgrade(args, callback) {
    const id = 'a' + (new Date()).valueOf().toString();
    const beAttrib = `be-${args.ifWantsToBe}`;
    addCSSListener(id, args.shadowDomPeer, `${args.upgrade}[${beAttrib}]`, (e) => {
        const target = e.target;
        const val = target.getAttribute(beAttrib);
        target.setAttribute(`is-${args.ifWantsToBe}`, '');
        target.removeAttribute(beAttrib);
        if (callback !== undefined)
            callback(target);
    });
}
