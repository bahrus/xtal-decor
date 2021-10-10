# xtal-decor

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-decor)

<a href="https://nodei.co/npm/xtal-decor/"><img src="https://nodei.co/npm/xtal-decor.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-decor">

## Syntax

xtal-decor provides a base class which enables attaching ES6 proxies onto other "Shadow DOM peer citizens" -- native DOM or custom elements in the same Shadow DOM realm.

xtal-decor provides a much more "conservative" alternative approach to enhancing existing DOM elements, in place of the controversial "is"-based customized built-in element [standard-ish](https://bkardell.com/blog/TheWalrus.html).

Like [xtal-deco](https://github.com/bahrus/xtal-deco), properties "init", "on", "actions" and "finale" allow us to define the behavior of the ES6 proxy with a minimum of fuss.  And the property "virtualProps" is also supported, which allows us to define properties that aren't already part of the native DOM element or custom element we are enhancing.  

Use of virtualProps is critical if you want to be guaranteed that your component doesn't break, should the native DOM element or custom element be enhanced with a new property with the same name.

xtal-decor provides the base class and web component.  Like xtal-deco, we can avoid having to inherit from this class, instead "informally" defining a new behavior by using an inline script via something like [nomodule](https://github.com/bahrus/nomodule):

```html
<xtal-decor upgrade=button if-wants-to-be=a-butterbeer-counter virtual-props='["count"]'><script nomodule=ish>
    const decoProps = {
        actions: [
            ({count}) => {
                window.alert(count + " butterbeers sold");
            }
        ],
        on: {
            click: ({self}, event) => {
                self.count++;
            }
        },
        init: ({self}) =>{
            self.count = 0;
        },
        finale: ({self}, elementBeingRemoved) => {
            console.log({self, elementBeingRemoved});
        }
    }
    Object.assign(selfish.parentElement, decoProps);
</script></xtal-decor>

<button id=myButton be-a-butterbeer-counter='{"count": 1000}' disabled>Click me to Order Your Drink</button>

<button onclick="setCount()">Set count to 2000</button>
<script>
    function setCount(){
        butterBeerCounter.setAttribute('be-a-butterbeer-counter', '{"count": 2000}');
    }
</script>
```


A more "formal" way of defining new behavior is to extend the base class XtalDecor, and to set the "virtualProps", "actions", "on" and/or "init" properties during field initialization or in the constructor.  You can then define a custom element with any name you want using your extended class.  

An instance of your custom element needs to be added somewhere in the shadowDOM realm where you want it to affect behavior (or outside any Shadow DOM Realm to affect elements outside any Shadow DOM).

The attributes of your instance tag needs to define what element (optional - use * for all elements) and attribute (required) to look for.

For example:

```html
#shadow-root (open)
    <be-on-the-next-level upgrade=blacked-eyed-peas if-wants-to-be=on-the-next-level></be-on-the-next-level>
    <be-rocking-over-that-bass-tremble upgrade=black-eyed-peas if-wants-to-be=rocking-over-that-bass-tremble></be-rocking-over-that-bass-tremble>
    <be-chilling-with-my-motherfuckin-crew upgrade=blacked-eyed-peas if-wants-to-be=chilling-with-my-motherfuckin-crew></be-chilling-with-my-motherfuckin-crew>
    ...



    <black-eyed-peas 
        be-on-the-next-level='{"level":"level 11"}' 
        be-rocking-over-that-bass-tremble
        be-chilling-with-my-motherfuckin-crew
    ></black-eyed-peas>

    <!-- Becomes, after upgrading -->
    <black-eyed-peas 
        is-on-the-next-level='{"level":"level 11"}'
        is-rocking-over-that-bass-tremble
        is-chilling-with-my-motherfuckin-crew
    ></black-eyed-peas>
```


## Setting properties of the proxy externally

Just as we need to be able to pass property values to custom elements, we need a way to do this with xtal-decor.  But how?

The tricky thing about proxies is they're great if you have access to them, useless if you don't.  

###  Approach I.  Programmatically (Ugly)

If you need to modify a property of a proxy, you can do that via the xtal-decor element, or the element extending xtal-decor:

```html
<xtal-decor id=decor upgrade=button if-wants-to-be=a-butterbeer-counter virtual-props='["count"]'>
    ...
</xtal-decor>
<button id=butterBeerCounter be-a-butterbeer-counter='{"count": 1000}' disabled>Click me to Order Your Drink</button>
...
<script>
    function setCount(newCount){
        if(decor.targetToProxyMap === undefined || !decor.targetToProxyMap.has(butterBeerCounter)){
            setTimeout(() => setCount(newCount), 50);
            return;
        }
        const proxy = decor.targetToProxyMap.get(butterBeerCounter);
        proxy.count = newCount;
    }
</script>
```

###  Approach II. Setting properties via the controlling attribute:

A more elegant solution, perhaps, which xtal-decor supports, is to pass in properties via its custom attribute:

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

A [vscode plug-in](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available that makes editing JSON attributes like these much less susceptible to human fallibility.

## Approach III.  Proxy Forwarding with a Light Touch

A reusable component, [https://github.com/bahrus/proxy-decor](proxy-decor) serves as a useful companion to xtal-decor. Whereas xtal-decor can have specialized logic (either via prop setting or class extension), proxy-decor is very light-weight and generic.  Think of it as a very [thin client](https://www.dell.com/premier/us/en/RC1378895?gacd=9684689-1077-5763017-265940558-0&dgc=st&gclid=9f0071f121cb1a930be2117f5bd9e116&gclsrc=3p.ds&msclkid=9f0071f121cb1a930be2117f5bd9e116#/systems/cloud-client-computing) that easily connects to / switch between different remote, fully loaded desktop/server/VMs, sitting in some well-ventilated server room.

proxy-decor not only allows properties to be passed in to the proxy, it also raises custom events after any property of the proxy changes.

proxy-decor uses a "for" attribute, similar to the "for" attribute for a label.

Sample syntax:

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
                console.log(self);
                self.count++;
            }
        },
        init: ({self}) =>{
            self.count = 0;
        }
    }
    Object.assign(selfish.parentElement, decoProps);
</script></xtal-decor>


<button id=butterbeerCounter be-a-butterbeer-counter='{"count": 1000}' disabled>
    Click Me to Order Your Drink
</button>
<proxy-decor id=proxyDecor for=butterbeerCounter></proxy-decor>
<pass-down
    on="a-butterbeer-counter:count-changed" 
    to=[-text-content] 
    m=1 
    val-from-target=aButterBeerCounter.count
    init-event=a-butterbeer-counter:initialized>
</pass-down>
<span -text-content></span> drinks sold.

<button onclick="setCount()">Set count to 2000</button>
<script>
    function setCount(){
        const bbc = (proxyDecor.aButterbeerCounter ??= {});
        bbc.count = 2000;
    }
</script>
```

proxy-decor:

1.  Does an id search within the shadow dom realm (like label for).
2.  Multiple proxies can be "fronted" by a single proxy-decor tag.
3.  Event names are namespaced only for virtual properties.






## Approach IV.  Integrate with other decorators -- binding decorators -- that hide the complexity

[WIP](https://github.com/bahrus/be-observant#inserting-dynamic-settings-todo)

## [Demo](https://codepen.io/bahrus/pen/XWpvmZr)



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

## For the sticklers

If you are concerned about using attributes that are prefixed with the non standard be-, use data-be instead:


```html
<list-sorter upgrade=* if-wants-to-be=sorted></list-sorter>

...

<ul data-be-sorted='{"direction":"asc","nodeSelectorToSortOn":"span"}'>
    <li>
        <span>Zorse</span>
    </li>
    <li>
        <span>Aardvark</span>
    </li>
</ul>

```



## Viewing example from git clone or github fork:

Install node.js.  Then, from a command prompt from the folder of your git clone or github fork:

```
$ npm install
$ npm run serve

Open http://localhost:3030/demo/dev.html
```







