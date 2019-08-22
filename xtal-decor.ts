import { XtalDeco } from 'xtal-deco/xtal-deco.js';
import { define } from 'trans-render/define.js';

import { cd } from 'xtal-shell/cd.js';


//const where_css_matches = 'where-css-matches';
const into_next_element = 'into-next-element';
const import_template = 'import-template';
const attach_script = 'attach-script';


/**
 * `xtal-decor`
 * Attach / override behavior in next element.  Insert template elements
 * @attribute: into-next-element:  boolean -- Modify behavior of next element.
 * @attribute: import-template: boolean -- Indicates there's at least one template to insert.
 * @attribute: attach-script: boolean -- Indicates there's script to attach.
 */
export class XtalDecor extends XtalDeco {
    static _addedNodeInsertionStyle = false;

    static get is() { return 'xtal-decor'; }



    _intoNextElement: boolean;
    /**
     * Modify behavior of next element.
     */
    get intoNextElement() {
        return this._intoNextElement;
    }
    set intoNextElement(val) {
        this.attr(into_next_element, val, '');
    }

    _importTemplate: boolean;
    /**
     * Indicates there's at least one template to insert.
     */
    get importTemplate() {
        return this._importTemplate;
    }
    set importTemplate(val) {
        this.attr(import_template, val, '');
    }

    _attachScript: boolean;
    /**
     * Indicates there's script to attach.
     */
    get attachScript() {
        return this._attachScript;
    }
    set attachScript(val) {
        this.attr(attach_script, val, '');
    }

    static get observedAttributes() {
        return super.observedAttributes.concat([
            /**
            * Indicates there's at least one template to insert.
            */
            into_next_element,
            import_template,
            attach_script
        ]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        super.attributeChangedCallback(name, oldVal, newVal);
        switch (name) {
            case import_template:
                this._importTemplate = newVal !== null;
                break;
            case attach_script:
                this._attachScript = newVal !== null;
                break;
            case into_next_element:
                this._intoNextElement = (newVal !== null);
                break;

        }
        this.onDecoPropsChange();
    }

    _connected: boolean;
    _mutationObserver: MutationObserver;
    connectedCallback() {
        this.propUp(['disabled', 'attachScript', 'importTemplate', 'intoNextElement', 'whereCSSMatches']);
        this._connected = true;
        this.onDecoPropsChange();
        this.addMutationObserver();
    }
    disconnectedCallback() {
        if (this._mutationObserver) this._mutationObserver.disconnect();
    }
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
    onDecoPropsChange() {
        if (!this._connected || this.disabled) return;
        if (this._intoNextElement && !this._nextSibling) {
            this.getElement('_nextSibling', t => (t.nextElementSibling as HTMLElement));
            return;
        }
        this.addMutationObserver();

        //if (this._attachScript && this._intoNextElement) this.attachScripts();
    }

    appendTemplates(target?: HTMLElement) {
        if (!this._templates) return;
        if (!target && this._intoNextElement) target = this._nextSibling;
        if (this._importTemplate && target) {
            customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
                //const target = this._nextSibling;
                this._templates.forEach((template: HTMLTemplateElement) => {
                    if (template.dataset.xtalTemplInserted) return;
                    let subTarget = target;
                    const path = template.dataset.path;
                    if (path) {
                        subTarget = cd(target, path);
                        // $hell.$0 = target;
                        // subTarget = $hell.cd(path);
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
        if (!target && this._intoNextElement) target = this._nextSibling;
        if (this._attachScript && target) {
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
}
define(XtalDecor);
