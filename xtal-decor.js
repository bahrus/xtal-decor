import { XtalDeco } from 'xtal-deco/xtal-deco.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { cd } from 'xtal-shell/cd.js';
const onDisabled = ({ disabled, self }) => {
    if (disabled)
        return;
    self.addMutationObserver();
};
const onIntoNextElement = ({ intoNextElement, self }) => {
    if (!intoNextElement || self.nextSiblingTarget)
        return;
    self.getElement('nextSiblingTarget', t => t.nextElementSibling);
};
const onNextElementSibling = ({ nextSiblingTarget, self }) => {
    self.do();
};
/**
 * Attach / override behavior in next element.  Insert template elements
 * @element xtal-decor
 */
let XtalDecor = /** @class */ (() => {
    class XtalDecor extends XtalDeco {
        constructor() {
            super(...arguments);
            this.propActions = [
                onDisabled,
                onIntoNextElement,
                onNextElementSibling,
            ];
        }
        do() {
            this.appendTemplates();
            this.attachScripts();
        }
        addMutationObserver() {
            this._mutationObserver = new MutationObserver((mutationsList) => {
                this.getTemplatesAndScripts();
                this.do();
            });
            this.getTemplatesAndScripts();
            this.do();
            this._mutationObserver.observe(this, { childList: true });
        }
        getTemplatesAndScripts() {
            this._templates = Array.from(this.querySelectorAll('template'));
            this._scripts = Array.from(this.querySelectorAll('script'));
        }
        appendTemplates(target) {
            if (!this._templates)
                return;
            if (!target && this.intoNextElement)
                target = this.nextSiblingTarget;
            if (this.importTemplate && target) {
                customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
                    this._templates.forEach((template) => {
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
            }
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
                this.evaluateCode(script);
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
        disconnectedCallback() {
            if (this._mutationObserver)
                this._mutationObserver.disconnect();
        }
    }
    XtalDecor._addedNodeInsertionStyle = false;
    XtalDecor.is = 'xtal-decor';
    XtalDecor.attributeProps = ({ intoNextElement, importTemplate, }) => {
        const ap = {
            bool: [intoNextElement, importTemplate]
        };
        return mergeProps(ap, XtalDeco.props);
    };
    return XtalDecor;
})();
export { XtalDecor };
define(XtalDecor);
