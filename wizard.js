
/*

Setup:
1. jQuery > 1.12 / tested on /
2. Object to make steps must have title='my step title' to dipslay in the breadcrumb or naming will be 1,2,3

Usage:

wizard
    .init('.my-step')
    .stepChanged(function (args) {
            console.log('changed to ' + args.selectedIndex);
    })
    .selectedIndex(0)
    .allowJumpStatements(true)
    .animation(true)
    .finish(function () {
        console.log('finish callback called');
    });
*/

var wizard = function ($) {
    var _divisor = '>';
    var _dataStepAttr = 'data-step';
    var _selectedClass = 'selected';
    var _breadcrumbClass = 'breadcrumb';
    var _breadcrumbItemClass = 'breadcrumb-item';
    var _unclickableClass = 'unclickable';
    var _invisibleClass = 'invisible';
    var _animatedClass = 'animated';

    var _$breadcrumb = $();
    var _$stepItems = $();
    var _$navPrev = $();
    var _$navNext = $();
    var _$navFinish = $();

    var _selectedIndex;
    var _maxReachedIndex;
    var _stepChangedCallback;
    var _allowJumpStatements;
    var _animationOn;
    var _finishCallback;

    var stepChanged = function (callback) {
        _stepChangedCallback = callback;
        return this;
    }

    var finishClick = function (callback) {
        _finishCallback = callback;
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
        _$breadcrumb.append(_$navFinish);
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

    var set_animation = function (on) {
        if (on === true || on === 'true') {
            _animationOn = true;
        } else {
            _animationOn = false;
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

        _$navFinish = $('<span>')
            .addClass('navigate-step finish-step')
            .text('finish')
            .click(on_Finish_Click);

        _stepChangedCallback = function () { };
        _finishCallback = function () { };
        _allowJumpStatements = false;
        _animationOn = false;
    }

    function after_init() {
        selectStep();
    }

    function on_Prev_click() {
        slide(_selectedIndex, _selectedIndex - 1, function () {
            switchStep(_selectedIndex - 1);
            riseStepChanged();
        });
    }

    function on_Next_click() {
        slide(_selectedIndex, _selectedIndex + 1, function () {
            switchStep(_selectedIndex + 1);
            riseStepChanged();
        });
    }

    function on_Finish_Click() {
        _finishCallback();
    }

    function on_BreadcrumbItem_click(e) {
        e.preventDefault();

        var dataStep = parseInt($(this).attr(_dataStepAttr));

        // not reclick the current / no smi /
        if (dataStep !== _selectedIndex) {
            if (_allowJumpStatements || dataStep <= _maxReachedIndex) {
                _selectedIndex = dataStep;
                selectStep();
                riseStepChanged();
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

        var $stepItem = get_currentStepItem();
        _$stepItems.removeClass(_selectedClass);
        $stepItem.addClass(_selectedClass);

        markJumpStepItems();
        removeNavigationItems();
    }

    // fire step change callback
    function riseStepChanged() {
        _stepChangedCallback({
            selectedIndex: _selectedIndex
        });
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
        _$navFinish.addClass(_invisibleClass);

        if (_selectedIndex == 0) {
            // no back btn
            _$navPrev.addClass(_invisibleClass);
        } else if (_selectedIndex == _$stepItems.length - 1) {
            // no next btn
            _$navNext.addClass(_invisibleClass);
            _$navFinish.removeClass(_invisibleClass);
        }
    }

    // gets only the step items / without navs and divisors /
    function get_breadcrumbStepItems() {
        var $items = _$breadcrumb.children().filter(function () {
            return $(this).hasClass(_breadcrumbItemClass);
        });

        return $items;
    }

    function get_currentStepItem() {
        var $stepItem = _$stepItems.filter(function () {
            // gets the window/steps that has attr as selected index
            return parseInt($(this).attr(_dataStepAttr)) === _selectedIndex;
        })

        return $stepItem;
    }

    function slide(positionFrom, positionTo, afterSlideCallback) {

        _$breadcrumb.removeClass(_animatedClass);
        _$stepItems.removeClass(_animatedClass);

        if (_animationOn) {
            _$breadcrumb.addClass(_animatedClass);
            _$stepItems.addClass(_animatedClass);

            var sign;
            var offset = positionFrom - positionTo;
            if (offset < 0) {
                sign = '-=';
            } else {
                sign = '+=';
            }

            var $current = get_currentStepItem();
            var width = $current.width();

            var animation = {
                'left': sign + width
            };

            $current.animate(animation, 250, function () {
                $current.css('left', 0);
                afterSlideCallback()
            });
        }
    }

    return {
        // Construct the wizard
        init: init,
        // Set the wizard step
        selectedIndex: switchStep,
        // rised when the the step is changed
        stepChanged: stepChanged,
        // allow jump over wizard steps
        allowJumpStatements: set_allowJumpStatements,
        // turn slide animation on/off
        animations: set_animation,
        // rised after the last (finish) step is clicked
        finish: finishClick,
    };
}(jQuery);
