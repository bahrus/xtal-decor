import { XtalDeco, linkNextSiblingTarget } from 'xtal-deco/xtal-deco.js';
import { define, AttributeProps, mergeProps } from 'xtal-element/xtal-latx.js';
import { cd } from 'xtal-shell/cd.js';

export const linkNextSiblingTargetExt = ({self, intoNextElement}: XtalDecor) => {
    if(!intoNextElement) return;
    linkNextSiblingTarget(self);
}

export const linkScriptsAndTemplates = ({self, mutationCount}: XtalDecor) => {
    self._templates = Array.from(self.querySelectorAll('template')) as HTMLTemplateElement[];
    self._scripts = Array.from(self.querySelectorAll('script')) as HTMLScriptElement[];
    // self.attachScripts();
}

export const appendTemplatesInNextSiblingTarget = ({self, _templates, importTemplates, intoNextElement, nextSiblingTarget}: XtalDecor) => {
    if(!_templates || !importTemplates || !intoNextElement || !nextSiblingTarget) return;
    const  target = nextSiblingTarget;
    customElements.whenDefined(target.tagName.toLowerCase()).then(() => {
        _templates.forEach((template: HTMLTemplateElement) => {
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

    });
}
export const attachScripts=({}: XtalDecor) => {

}

/**
 * Attach / override behavior in next element.  Insert template elements
 * @element xtal-decor
 */
export class XtalDecor extends XtalDeco {
    static _addedNodeInsertionStyle = false;

    static is = 'xtal-decor';

    static attributeProps = ({intoNextElement, importTemplates, mutationCount, _templates, _scripts}: XtalDecor) => {
        const ap = {
            bool:[intoNextElement, importTemplates],
            num:[mutationCount],
            obj:[_templates, _scripts]
        } as AttributeProps;
        return mergeProps(ap, XtalDeco.props);
    };

    /**
     * Modify behavior of next element.
     */
    intoNextElement: boolean | undefined;

    mutationCount: number;

    /**
     * Indicates there's at least one template to insert.
     */
    importTemplates: boolean | undefined;

    propActions = [
        linkNextSiblingTargetExt,
        linkScriptsAndTemplates,
        appendTemplatesInNextSiblingTarget
    ];


    _mutationObserver: MutationObserver;
    _templates: HTMLTemplateElement[];
    _scripts: HTMLScriptElement[];


    addMutationObserver() {
        this._mutationObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
            this.mutationCount++;
        });
        this._mutationObserver.observe((<any>this as Node), { childList: true });

    }

    doScripts(target: HTMLElement){
        this._scripts.forEach((script: HTMLScriptElement) => {
            if (script.dataset.xtalScriptAttached) return;
            let subTarget = target;
            const path = script.dataset.path;
            if (path) {
                subTarget = cd(target, path);
            }
            
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

    connectedCallback(){
        super.connectedCallback();
        this.addMutationObserver();
        this.mutationCount = 0;
    }
    disconnectedCallback() {
        if (this._mutationObserver) this._mutationObserver.disconnect();
    }
}
define(XtalDecor);
