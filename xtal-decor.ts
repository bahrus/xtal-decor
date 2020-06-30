import { XtalDeco } from 'xtal-deco/xtal-deco.js';
import { define, AttributeProps, mergeProps } from 'xtal-element/xtal-latx.js';
import { cd } from 'xtal-shell/cd.js';

const onDisabled = ({disabled, self}: XtalDecor) =>{
    if(disabled) return;
    self.addMutationObserver();
}
const onIntoNextElement = ({intoNextElement, self}: XtalDecor) =>{
    if(!intoNextElement || self.nextSiblingTarget) return;
    self.getElement('nextSiblingTarget', t => (t.nextElementSibling as HTMLElement));
}
const onNextElementSibling = ({nextSiblingTarget, self}: XtalDecor) => {
    self.do();
}
/**
 * Attach / override behavior in next element.  Insert template elements
 * @element xtal-decor
 */
export class XtalDecor extends XtalDeco {
    static _addedNodeInsertionStyle = false;

    static is = 'xtal-decor';

    static attributeProps = ({intoNextElement, importTemplate, }: XtalDecor) => {
        const ap = {
            bool:[intoNextElement, importTemplate]
        } as AttributeProps;
        return mergeProps(ap, XtalDeco.props);
    };

    /**
     * Modify behavior of next element.
     */
    intoNextElement: boolean | undefined;

    /**
     * Indicates there's at least one template to insert.
     */
    importTemplate: boolean | undefined;

    propActions = [
        onDisabled,
        onIntoNextElement,
        onNextElementSibling,
    ];


    _mutationObserver: MutationObserver;


    do(){
        this.appendTemplates();
        this.attachScripts();
    }
    addMutationObserver() {
        this._mutationObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
            this.getTemplatesAndScripts();
            this.do();
            
        });
        this.getTemplatesAndScripts();
        this.do();
        this._mutationObserver.observe((<any>this as Node), { childList: true });

    }
    getTemplatesAndScripts() {
        this._templates = Array.from(this.querySelectorAll('template')) as HTMLTemplateElement[];
        this._scripts = Array.from(this.querySelectorAll('script')) as HTMLScriptElement[];
    }
    _templates: HTMLTemplateElement[];
    _scripts: HTMLScriptElement[];


    appendTemplates(target?: HTMLElement) {
        if (!this._templates) return;
        if (!target && this.intoNextElement) target = this.nextSiblingTarget;
        if (this.importTemplate && target) {
            customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
                this._templates.forEach((template: HTMLTemplateElement) => {
                    if (template.dataset.xtalTemplInserted) return;
                    let subTarget = target;
                    const path = template.dataset.path;
                    if (path) {
                        subTarget = cd(target, path);
                    }
                    const clone = document.importNode(template.content, true) as HTMLDocument;
                    subTarget.shadowRoot.appendChild(clone);
                    template.dataset.xtalTemplInserted = 'true';
                })

            })
        }

    }
    doScripts(target: HTMLElement){
        this._scripts.forEach((script: HTMLScriptElement) => {
            if (script.dataset.xtalScriptAttached) return;
            let subTarget = target;
            const path = script.dataset.path;
            if (path) {
                subTarget = cd(target, path);
            }
            this.evaluateCode(script);
        })
    }
    attachScripts(target?: HTMLElement) {
        if (!this._scripts) return;
        if (!target && this.intoNextElement) target = this.nextSiblingTarget;
        if (this.attachScript && target) {
            const ln = target.localName;
            if(ln.indexOf('-') > -1){
                customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
                    //const target = this._nextSibling;
                    this.doScripts(target)
    
                })
            }else{
                this.doScripts(target);
            }
            
        }
    }
    disconnectedCallback() {
        if (this._mutationObserver) this._mutationObserver.disconnect();
    }
}
define(XtalDecor);
