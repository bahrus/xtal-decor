# xtal-decor

## Syntax



Declarative
```html
<xtal-decor-foo treat=bebe-rexha as=a-bitch></xtal-decor-foo> <!-- doesn't do anything -->
<xtal-decor-bar treat=meredith-brooks as=a-saint></xtal-decor-bar>
<xtal-decor-baz treat=* as=a-mess></xtal-decor-baz> <!-- only applies to bebe-rexha -->
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
    as: ...// monitor for attributes start with is-a-[asA.toLispCase()], 
    proxyHandler: 
});
upgrade({
    nodeInShadowDOMRealm: ... //Apply trait to all elements within the same ShadowDOM realm as elementInScope.  If not provided, applies outside any ShadowDOM.
    treat: ... //CSS query to monitor for matching elements within ShadowDOM Realm.
    toBe: // monitor for attributes start with imma-be-[asA.toLispCase()], 
    proxyHandler: 
});
```
