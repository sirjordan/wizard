<h2>Setup:<h2>
<p>1. jQuery > 1.12 / tested on /</p>
<p>2. Object to make steps must have title='<step title>' to dipslay in the breadcrumb or naming will be 1,2,3</p>

<h2>Usage:</h2>

<code>
wizard
    .init('.my-step')< /br>
    .stepChanged(function (args) {
            console.log('changed to ' + args.selectedIndex);
    })
    .selectedIndex(0)
    .allowJumpStatements(true);
</code>
