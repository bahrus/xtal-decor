# xtal-decor

## Syntax

xtal-decor provides a base class which enables attaching ES6 proxies onto other "Shadow DOM peer citizens" -- native DOM or custom elements in the same Shadow DOM realm.

Like [xtal-deco](https://github.com/bahrus/xtal-deco), properties "init", "on" and "actions" allow you to define the behavior of the ES6 proxy with a minimum of fuss.

Declarative
```html
<xtal-decor-foo upgrade=blacked-eyed-peas if-wants-to-be=on-the-next-level></xtal-decor-foo>
<xtal-decor-bar upgrade=black-eyed-peas if-wants-to-be=rocking-over-that-bass-tremble></xtal-decor-bar>
<xtal-decor-baz upgrade=blacked-eyed-peas if-wants-to-be=chilling-with-my-motherfuckin-crew></xtal-decor-baz>
...



<black-eyed-peas 
    be-on-the-next-level 
    be-rocking-over-that-bass-tremble
    be-chilling-with-my-motherfuckin-crew
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
    ifWantsToBe: // monitor for attributes that start with be-[toBe], 
}, callback);
```

API example:

```JavaScript
import {upgrade} from 'xtal-decor/upgrade.js';
upgrade({
    shadowDOMPeer: document.body,
    upgrade: 'black-eyed-peas',
    ifWantsToBe: 'on-the-next-level',
}, target => {
    ...
});
```

## Property Forwarding:

```html
<make-expandable upgrade=details if-wants-to-be=all-expandable auto-forward></make-expandable>
<make-collapsible upgrade=details if-wants-to-be=all-collapsible auto-forward></make-collapsible>

...

<proxy-props id=expandableProxy for=all-expandable></proxy-props>
<proxy-props for=all-collapsible></proxy-props>
<details be-all-expandable be-all-collapsible>
    <summary>...</summary>
    ...
    <details>
    ...
    </details>
</details>

<script>
expandableProxy.expandAll = true;
</script>
```

## Setting properties via attribute [TODO]:

```html
<list-sorter upgrade=details if-wants-to-be=sorted></list-sorter>

...

<ul be-sorted='{"direction":"asc","nodeSelectorToSortOn":"span"}'>
    <li>
        <span>Zorse</span>
    </li>
    <li>
        <span>Aardvark</span>
    </li>
</ul>

```

After performing global init based on the specified init property of list-sorter (if any), attribute is absorbed and cleansed during upgrade:

```html

<ul is-sorted>
    <li>
        <span>Aardvark</span>
    </li>
    <li>
        <span>Zorse</span>
    </li>
</ul>

```

You can then pass in new settings via the same be- attribute:


```html

<ul id=list is-sorted>
    <li>
        <span>Aardvark</span>
    </li>
    <li>
        <span>Zorse</span>
    </li>
</ul>

<script>
    list.setAttribute('be-sorted', JSON.stringify({direction: 'desc'}))
</script>

```






