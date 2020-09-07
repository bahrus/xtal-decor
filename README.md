# xtal-decor

## Syntax

xtal-decor provides a base class which enables attaching ES6 proxies onto other "Shadow DOM peer citizens" -- native DOM or custom elements in the same Shadow DOM realm.

Like [xtal-deco](https://github.com/bahrus/xtal-deco), properties "init", "on" and "actions" allow you to define the behavior of the ES6 proxy with a minimum of fuss.

Declarative
```html
<xtal-decor-foo upgrade=blacked-eyed-peas if-wants-to-be=on-the-next-level></xtal-decor-foo>
<xtal-decor-bar upgrade=black-eyed-peas if-wants-to-be=rocking-over-that-bass-tremble></xtal-decor-foo>
<xtal-decor-baz upgrade=blacked-eyed-peas if-wants-to-be=chilling-with-my-motherfuckin-crew></xtal-decor-foo>
...



<black-eyed-peas 
    imma-be-on-the-next-level 
    imma-be-rocking-over-that-bass-tremble
    imma-be-chilling-with-my-motherfuckin-crew
></black-eyed-peas>

<!-- Becomes, after upgrading -->
<black-eyed-peas 
    is-on-the-next-level 
    is-rocking-over-that-bass-tremble
    is-chilling-with-my-motherfuckin-crew
></black-eyed-peas>
```

Web component base class builds on api:

```JavaScript
upgrade({
    shadowDOMPeer: ... //Apply trait to all elements within the same ShadowDOM realm as this node.
    upgrade: ... //CSS query to monitor for matching elements within ShadowDOM Realm.
    ifWantsYoBe: // monitor for attributes start with imma-be-[toBe], 
    proxyHandler: {...}
}, callback);
```

API example:

```JavaScript
import {upgrade} from 'xtal-decor/upgrade.js';
upgrade({
    shadowDOMPeer: document.body,
    upgrade: 'black-eyed-peas',
    ifWantsToBe: 'on-the-next-level',
    proxyHandler: {}
}, ({target, proxy}) => {
    ...
});
```

## Property Forwarding:

```html
<xtal-decor-exp upgrade=details if-wants-to-be=all-expandable></xtal-decor-exp>
<xtal-decor-col upgrade=details if-wants-to-be=all-collapsible></xtal-decor-col>

...

<proxy-props for=all-expandable></proxy-props>
<proxy-props for=all-collapsible></proxy-props>
<details imma-be-all-expandable imma-be-all-collapsible>
        <summary>...</summary>
        ...
        <details>
        ...
        </details>
</details>
```
