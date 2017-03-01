<h2>Setup:<h2>
1. jQuery > 1.12 / tested on /
2. Object to make steps must have title='<step title>' to dipslay in the breadcrumb or naming will be 1,2,3

Usage:

wizard
    .init('.my-step')
    .stepChanged(function (args) {
            console.log('changed to ' + args.selectedIndex);
    })
    .selectedIndex(0)
    .allowJumpStatements(true);
