
/*

Setup:
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
*/

var wizard = function ($) {
    var _divisor = '>';
    var _dataStepAttr = 'data-step';
    var _selectedClass = 'selected';
    var _breadcrumbClass = 'breadcrumb';
    var _breadcrumbItemClass = 'breadcrumb-item';
    var _unclickableClass = 'unclickable';
    var _invisibleClass = 'invisible';

    var _$breadcrumb = $();
    var _$stepItems = $();
    var _$navPrev = $();
    var _$navNext = $();

    var _selectedIndex;
    var _maxReachedIndex;
    var _stepChangedCallback;
    var _allowJumpStatements;

    var stepChanged = function (callback) {
        _stepChangedCallback = callback;
        return this;
    }

    var init = function ($stepItems) {
        reset();

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
                .addClass(_breadcrumbItemClass)
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

    var switchStep = function (indexToSwitch) {
        if (indexToSwitch < _$stepItems.length && indexToSwitch >= 0) {
            _selectedIndex = indexToSwitch;

            if (_selectedIndex > _maxReachedIndex) {
                _maxReachedIndex = _selectedIndex;
            }

            selectStep();
        }

        return this;
    }

    var set_allowJumpStatements = function (allow) {
        if (allow === true || allow === 'true') {
            _allowJumpStatements = true;
        } else {
            _allowJumpStatements = false;
        }

        return this;
    }

    function reset() {
        _$stepItems = $();
        _$breadcrumb = $('<div>').addClass(_breadcrumbClass);
        _selectedIndex = 0;
        _maxReachedIndex = 0;

        _$navPrev = $('<span>')
            .addClass('navigate-step prev-step')
            .text('back')
            .click(on_Prev_click);

        _$navNext = $('<span>')
            .addClass('navigate-step next-step')
            .text('next')
            .click(on_Next_click);

        _stepChangedCallback = function () { };
        _allowJumpStatements = false;
    }

    function after_init() {
        selectStep();
    }

    function on_Prev_click() {
        switchStep(_selectedIndex - 1);
    }

    function on_Next_click() {
        switchStep(_selectedIndex + 1)
    }

    function on_BreadcrumbItem_click(e) {
        e.preventDefault();

        var dataStep = parseInt($(this).attr(_dataStepAttr));

        // not reclick the current / no smi /
        if (dataStep !== _selectedIndex) {
            if (_allowJumpStatements || dataStep <= _maxReachedIndex) {
                _selectedIndex = dataStep;
                selectStep();
            } else {
                // if not allowed hint the user to click the 'next' btn
                // todo:
                console.log('if not allowed hint the user to click the \'next\' btn');
            }
        }

    }

    function selectStep() {
        var $bredcrumbItems = get_breadcrumbStepItems();
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
        _stepChangedCallback({
            selectedIndex: _selectedIndex
        });

        markJumpStepItems();
        removeNavigationItems();
    }

    // mark those that are higher than current step as unclickable
    function markJumpStepItems() {
        var $bredcrumbItems = get_breadcrumbStepItems();
        $bredcrumbItems.removeClass(_unclickableClass);

        if (!_allowJumpStatements && _maxReachedIndex < _$stepItems.length - 1) {
            for (var i = _maxReachedIndex + 1; i < $bredcrumbItems.length; i++) {
                $($bredcrumbItems[i]).addClass(_unclickableClass);
            }
        }
    }

    //remove navigation btns if reach the end/start
    function removeNavigationItems() {
        _$navPrev.removeClass(_invisibleClass);
        _$navNext.removeClass(_invisibleClass);

        if (_selectedIndex == 0) {
            // no back btn
            _$navPrev.addClass(_invisibleClass);
        } else if (_selectedIndex == _$stepItems.length - 1) {
            // no next btn
            _$navNext.addClass(_invisibleClass);
        }
    }

    // gets only the step items / without navs and divisors /
    function get_breadcrumbStepItems() {
        var $items = _$breadcrumb.children().filter(function () {
            return $(this).hasClass(_breadcrumbItemClass);
        });

        return $items;
    }

    return {
        // Construct the wizard
        init: init,
        // Set the wizard step
        selectedIndex: switchStep,
        stepChanged: stepChanged,
        // allow jump over wizard steps
        allowJumpStatements: set_allowJumpStatements
    };
}(jQuery);
