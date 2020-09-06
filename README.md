# xtal-decor

## Syntax

xtal-decor provides a base class which enables attaching ES6 proxies onto other "Shadow DOM peer citizens" -- native DOM or custom elements in the same Shadow DOM realm.

Like [xtal-deco](https://github.com/bahrus/xtal-deco), properties "init", "on" and "actions" allow you to define the behavior of the ES6 proxy with a minimum of fuss.

Declarative
```html
<!-- doesn't do anything -->
<xtal-decor-foo treat=bebe-rexha as=a-bitch></xtal-decor-foo> 
<xtal-decor-bar treat=meredith-brooks as=a-saint></xtal-decor-bar>
<!-- only applies to bebe-rexha -->
<xtal-decor-baz treat=* as=a-mess></xtal-decor-baz> 
<xtal-decor-quz upgrade=blacked-eyed-peas to-be=on-the-next-level></xtal-decor-quz>
...

<meredith-brooks 
    is-a-bitch 
    is-a-lover 
    is-a-child 
    is-a-mother
    is-a-sinner
    is-a-saint
></meredith-brooks>

<bebe-rexha 
    is-a-mess 
    is-a-loser 
    is-a-hater 
    is-a-user
></bebe-rexha>

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

API
```JavaScript
decorate({
    nodeInShadowDOMRealm: ... //Apply trait to all elements within the specified ShadowDOM realm.  If not provided, applies outside any ShadowDOM.
    treat: ... //CSS query to monitor for matching elements within ShadowDOM Realm.
    as: ...// monitor for attributes matching is-[as], 
    proxyHandler: {...}
}, callback);
upgrade({
    nodeInShadowDOMRealm: ... //Apply trait to all elements within the same ShadowDOM realm as elementInScope.  If not provided, applies outside any ShadowDOM.
    upgrade: ... //CSS query to monitor for matching elements within ShadowDOM Realm.
    toBe: // monitor for attributes start with imma-be-[toBe], 
    proxyHandler: {...}
}, callback);
```

API example:

```JavaScript
import {decorate} from 'xtal-decor/decorate.js';
import {upgrade} from 'xtal-decor/upgrade.js';
decorate({
    nodeInShadowDOMRealm: document.body,
    treat: 'meredith-brooks',
    as: 'a-saint',
    proxyHandler: {}
}, ({target, proxy}) => {
    ...
}); 
upgrade({
    nodeInShadowDOMRealm: document.body,
    upgrade: 'black-eyed-peas',
    toBe: 'on-the-next-level',
    proxyHandler: {}
}, ({target, proxy}) => {
    ...
});
```

## Property Forwarding:

```html
<xtal-decor-exp treat=details as=all-expandable></xtal-decor-exp>
<xtal-decor-col treat=details as=all-collapsible></xtal-decor-col>

...

<proxy-props>
        <for-closest all-expandable></for-closest>
        <for-closest all-collapsible></for-closest>
</proxy-props>
<details is-all-expandable is-all-collapsible>
        <summary>...</summary>
        ...
        <details>
        ...
        </details>
</details>
```
