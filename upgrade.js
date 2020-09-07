import { addCSSListener } from 'xtal-element/observeCssSelector.js';
export function upgrade(args, callback) {
    const id = 'a' + (new Date()).valueOf().toString();
    const immaBeAttrib = `imma-be-${args.ifWantsToBe}`;
    addCSSListener(id, args.shadowDomPeer, `${args.upgrade}[${immaBeAttrib}]`, (e) => {
        const target = e.target;
        target.setAttribute(`is-${args.ifWantsToBe}`, '');
        target.removeAttribute(immaBeAttrib);
        if (callback !== undefined)
            callback(target);
    });
}
