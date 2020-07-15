import { XtalDeco, linkNextSiblingTarget } from 'xtal-deco/xtal-deco.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { cd } from 'xtal-shell/cd.js';
export const linkNextSiblingTargetExt = ({ self, intoNextElement }) => {
    if (!intoNextElement)
        return;
    linkNextSiblingTarget(self);
};
export const linkScriptsAndTemplates = ({ self, mutationCount }) => {
    self._templates = Array.from(self.querySelectorAll('template'));
    self._scripts = Array.from(self.querySelectorAll('script'));
    // self.attachScripts();
};
export const appendTemplatesInNextSiblingTarget = ({ self, _templates, importTemplates, intoNextElement, nextSiblingTarget }) => {
    if (!_templates || !importTemplates || !intoNextElement || !nextSiblingTarget)
        return;
    const target = nextSiblingTarget;
    customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
        _templates.forEach((template) => {
            if (template.dataset.xtalTemplInserted)
                return;
            let subTarget = target;
            const path = template.dataset.path;
            if (path) {
                subTarget = cd(target, path);
            }
            const clone = document.importNode(template.content, true);
            subTarget.shadowRoot.appendChild(clone);
            template.dataset.xtalTemplInserted = 'true';
        });
    });
};
export const attachScripts = ({}) => {
};
/**
 * Attach / override behavior in next element.  Insert template elements
 * @element xtal-decor
 */
export class XtalDecor extends XtalDeco {
    constructor() {
        super(...arguments);
        this.propActions = [
            linkNextSiblingTargetExt,
            linkScriptsAndTemplates,
            appendTemplatesInNextSiblingTarget
        ];
    }
    addMutationObserver() {
        this._mutationObserver = new MutationObserver((mutationsList) => {
            this.mutationCount++;
        });
        this._mutationObserver.observe(this, { childList: true });
    }
    doScripts(target) {
        this._scripts.forEach((script) => {
            if (script.dataset.xtalScriptAttached)
                return;
            let subTarget = target;
            const path = script.dataset.path;
            if (path) {
                subTarget = cd(target, path);
            }
        });
    }
    attachScripts(target) {
        if (!this._scripts)
            return;
        if (!target && this.intoNextElement)
            target = this.nextSiblingTarget;
        if (this.attachScript && target) {
            const ln = target.localName;
            if (ln.indexOf('-') > -1) {
                customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
                    //const target = this._nextSibling;
                    this.doScripts(target);
                });
            }
            else {
                this.doScripts(target);
            }
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.addMutationObserver();
        this.mutationCount = 0;
    }
    disconnectedCallback() {
        if (this._mutationObserver)
            this._mutationObserver.disconnect();
    }
}
XtalDecor._addedNodeInsertionStyle = false;
XtalDecor.is = 'xtal-decor';
XtalDecor.attributeProps = ({ intoNextElement, importTemplates, mutationCount, _templates, _scripts }) => {
    const ap = {
        bool: [intoNextElement, importTemplates],
        num: [mutationCount],
        obj: [_templates, _scripts]
    };
    return mergeProps(ap, XtalDeco.props);
};
define(XtalDecor);
