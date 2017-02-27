# wizard
Setup wizard

Setup:
1. jQuery > 1.12
2. Object to make steps must have title='<step title>' to dipslay in the breadcrumb or naming will be 1,2,3

Usage:

wizard.init('.my-step').stepChanged(function () {
            console.log('changed...');
        });
