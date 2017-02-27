
/*

Setup:
1. jQuery > 1.12
2. Object to make steps must have title='<step title>' to dipslay in the breadcrumb or naming will be 1,2,3

Usage:

wizard.init('.my-step').stepChanged(function () {
            console.log('changed...');
        });
*/

var wizard = function ($) {
    var _divisor = '>';
    var _dataStepAttr = 'data-step';
    var _selectedClass = 'selected';
    var _breadcrumbClass = 'breadcrumb';

    var _$breadcrumb;
    var _$stepItems;
    var _$navPrev;
    var _$navNext;

    var _selectedIndex;

    var _stepChangedCallback
    var stepChanged = function (callback) {
        _stepChangedCallback = callback;
        return this;
    }

    var init = function ($stepItems) {
        brefore_init();

        if (!($stepItems instanceof $)) {
            $stepItems = $($stepItems);
        }

        // cache the items
        _$stepItems = $stepItems;

        // initiate selected items as wizard step items
        $stepItems.addClass('wizard-item');

        // make breadcrumbItems for every step
        var $divisor = $('<span>').addClass('divisor').text(_divisor);

        for (var i = 0; i < $stepItems.length; i++) {
            var $current = $($stepItems[i]);

            // breadcrumb text content
            var title = $current.attr('title').trim();
            if (title === '') {
                title = 'Step ' + i;
            }

            // the wizard item and the breadcrumb item has to have equal data-step attributes
            $current.attr(_dataStepAttr, i);

            var $breadcrumbItem = $('<a>')
                .text(title)
                .attr('href', '#')
                .attr(_dataStepAttr, i)
                .click(on_BreadcrumbItem_click);

            _$breadcrumb.append($breadcrumbItem);

            // add divisor
            if (i < $stepItems.length - 1) {
                _$breadcrumb.append($divisor.clone());
            }
        }

        // prev / next buttons
        _$breadcrumb.append(_$navPrev);
        _$breadcrumb.append(_$navNext);

        _$breadcrumb.insertAfter($stepItems.last());

        after_init();

        return this;
    }

    function brefore_init() {
        _$stepItems = $();
        _$breadcrumb = $('<div>').addClass(_breadcrumbClass);
        _selectedIndex = 0;

        _$navPrev = $('<span>')
        .addClass('navigate-step prev-step')
        .text('back')
        .click(moveBackward);

        _$navNext = $('<span>')
        .addClass('navigate-step next-step')
        .text('next')
        .click(moveForward);

        _stepChangedCallback = function () { };
    }

    function after_init() {
        selectStep();
    }

    function moveForward() {
        if (_selectedIndex < _$stepItems.length) {
            _selectedIndex++;
            selectStep();
        }
    }

    function moveBackward() {
        if (_selectedIndex > 0) {
            _selectedIndex--;
            selectStep();
        }
    }

    function on_BreadcrumbItem_click(e) {
        e.preventDefault();
        var dataStep = parseInt($(this).attr(_dataStepAttr));
        _selectedIndex = dataStep;
        selectStep();
    }

    function selectStep() {
        var $bredcrumbItems = _$breadcrumb.children();
        var $breadcrumbItem = $bredcrumbItems.filter(function () {
            // gets the item that has attr as selected index
            return parseInt($(this).attr(_dataStepAttr)) === _selectedIndex;
        });
        $bredcrumbItems.removeClass(_selectedClass);
        $breadcrumbItem.addClass(_selectedClass);

        var $stepItem = _$stepItems.filter(function () {
            // gets the window/steps that has attr as selected index
            return parseInt($(this).attr(_dataStepAttr)) === _selectedIndex;
        });
        _$stepItems.removeClass(_selectedClass);
        $stepItem.addClass(_selectedClass);

        // fire step change callback
        _stepChangedCallback();
    }

    return {
        // Construct the wizard
        init: init,
        // Set the starting step (default: 0)
        selectedIndex: _selectedIndex,
        stepChanged: stepChanged
    };
}(jQuery);
