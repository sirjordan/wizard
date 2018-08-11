<h3>Setup:<h3>
<p>1. jQuery > 1.12 / tested on /</p>
<p>2. Object to make steps must have title="my step title" to dipslay in the breadcrumb or naming will be 1,2,3</p>

<h3>Usage:</h3>

```javaScript
wizard
    .init('.my-step')
    .stepChanged(function (args) {
            console.log('changed to ' + args.selectedIndex);
    })
    .selectedIndex(0)
    .allowJumpStatements(true)
    .animations(true)
    .finish(function () {
        console.log('finish callback called');
    });
```
