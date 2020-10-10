# xtal-decor

<a href="https://nodei.co/npm/xtal-decor/"><img src="https://nodei.co/npm/xtal-decor.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-decor">

## Syntax

xtal-decor provides a base class which enables attaching ES6 proxies onto other "Shadow DOM peer citizens" -- native DOM or custom elements in the same Shadow DOM realm.

xtal-decor provides a much more "conservative" alternative approach to enhancing existing DOM elements, in place of the controversial customized built-in element proposal.

Like [xtal-deco](https://github.com/bahrus/xtal-deco), properties "init", "on" and "actions" allow you to define the behavior of the ES6 proxy with a minimum of fuss.  And the property "virtualProps" is also supported, which allows you to define properties that aren't already part of the native DOM element or custom element you are enhancing.  Use of virtualProps is critical if you want to be guaranteed that your component doesn't break, should the native DOM element or custom element be enhanced with a new property with the same name.

xtal-decor provides the base class and web component.  Like xtal-deco, we can "informally" define a new behavior by using an inline script via something like [nomodule](https://github.com/bahrus/nomodule)

```html
<xtal-decor upgrade=button if-wants-to-be=a-butterbeer-counter virtual-props='["count"]'><script nomodule=ish>
    const decoProps = {
        actions: [
            ({count, self}) => {
                window.alert(count + " butterbeers sold");
            }
        ],
        on: {
            'click': ({self}) => {
                //console.log(self);
                self.count++;
            }
        },
        init: ({self}) =>{
            self.count = 0;
        }
    }
    Object.assign(selfish.parentElement, decoProps);
</script></xtal-decor>

<button id=butterBeerCounter be-a-butterbeer-counter='{"count": 1000}' disabled data-drink-selection="Butterbeer">Click me to Order Your Drink</button>
<p-d on="count-changed" prop=textContent val=target.count></p-d>
<span></span> drinks sold.

<button onclick="setCount()">Set count to 2000</button>
<script>
    function setCount(){
        butterBeerCounter.setAttribute('be-a-butterbeer-counter', '{"count": 2000}');
    }
</script>
```

A more "formal" way of defining new behavior is to extend the base class XtalDecor, and to set the "virtualProps", "actions", "on" and/or "init" properties during field initialization or in the constructor.  You can then define a custom element with any name you want using your extended class.  

An instance of your custom element needs to be added somewhere in the shadowDOM realm where you want it to affect behavior (or outside any ShadowDOM Realm to affect elements outside any ShadowDOM).

The attributes of your instance tag needs to define what element (optional - use * for all elements) and attribute (required) to look for.

For example:

```html
#shadow-root (open)
    <xtal-decor-foo upgrade=blacked-eyed-peas if-wants-to-be=on-the-next-level></xtal-decor-foo>
    <xtal-decor-bar upgrade=black-eyed-peas if-wants-to-be=rocking-over-that-bass-tremble></xtal-decor-bar>
    <xtal-decor-baz upgrade=blacked-eyed-peas if-wants-to-be=chilling-with-my-motherfuckin-crew></xtal-decor-baz>
    ...



    <black-eyed-peas 
        be-on-the-next-level="level 11" 
        be-rocking-over-that-bass-tremble
        be-chilling-with-my-motherfuckin-crew
    ></black-eyed-peas>

    <!-- Becomes, after upgrading -->
    <black-eyed-peas 
        is-on-the-next-level="level 11"
        is-rocking-over-that-bass-tremble
        is-chilling-with-my-motherfuckin-crew
    ></black-eyed-peas>
```



## Property Forwarding:

Since we don't want to pollute the native DOM element (or custom element) we are enhancing with properties it doesn't know about (which could become actual properties in the future), we need a way of passing properties directly to the proxy (which uses a WeakMap for the virtual properties so it should be future-safe.)

For that, make use of the reserved tag-name "proxy-props".  You can pass properties to the proxy-props tag, and those properties will be auto-forwarded to the proxy.

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

## Setting properties via attribute:

Adding a tag for auto-forwarding properties is a bit clumsy.  A more elegant solution, perhaps, which xtal-decor supports is to pass in properties via its custom attribute:

```html
<list-sorter upgrade=* if-wants-to-be=sorted></list-sorter>

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

After list-sorter does its thing, the attribute "be-sorted" switches to "is-sorted":

```html

<ul is-sorted='{"direction":"asc","nodeSelectorToSortOn":"span"}'>
    <li>
        <span>Aardvark</span>
    </li>
    <li>
        <span>Zorse</span>
    </li>
</ul>

```

You cannot pass in new values by using the is-sorted attribute.  Instead, you need to continue to use the be-sorted attribute:



```html

<ul id=list is-sorted='{"direction":"asc","nodeSelectorToSortOn":"span"}'>
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

## API

This web component base class builds on the provided api:

```JavaScript
import { upgrade } from 'xtal-decor/upgrade.js';
upgrade({
    shadowDOMPeer: ... //Apply trait to all elements within the same ShadowDOM realm as this node.
    upgrade: ... //CSS query to monitor for matching elements within ShadowDOM Realm.
    ifWantsToBe: // monitor for attributes that start with be-[ifWantsToBe], 
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

The API by itself is much more open ended, as you will need to entirely define what to do in your callback.  In other words, the api provides no built-in support for creating a proxy.

## Viewing example from git clone or github fork:

Install node.js.  Then, from a command prompt from the folder of your git clone or github fork:

```
$ npm install
$ npm run serve

Open http://localhost:3030/demo/dev.html
```







