define(['dispatcher', 'utils'], function(dispatcher, utils) {

	"use strict";
	//global

	var initialized = false;
	var scrolledTop  = 0;
	var scrolledLeft = 0;
	var disabled = false;
	var requestAnimationFrame;

	var _scrollPositionTop = function() {
		var position = (window.pageYOffset || window.document.scrollTop) - (window.document.clientTop || 0);
		if (isNaN(position)) position = 0;
		return position;
	}
	var _scrollPositionLeft = function() {
		var position = (window.pageXOffset || window.document.scrollLeft) - (window.document.clientLeft || 0);
		if (isNaN(position)) position = 0;
		return position;
	}

	var _handleEvent = function(e) {
		if (e.type === 'fire-scroll') {
			scrolledTop  = _scrollPositionTop();
			scrolledLeft = _scrollPositionLeft();

			forcedEventEmitter.dispatch({
				type: 'change'
			});
			eventEmitter.dispatch({
				type: 'change'
			});
		}

		if (e.type === 'scroll-disable') {
			disabled = true;
		}
		if (e.type === 'scroll-enable') {
			disabled = false;
		}
	}

	var _loop = function() {
		var tmpTop, tmpLeft;

		tmpTop  = _scrollPositionTop();
		tmpLeft = _scrollPositionLeft();

		if (tmpTop !== scrolledTop || tmpLeft !== scrolledLeft) {
			scrolledTop  = tmpTop;
			scrolledLeft = tmpLeft;

			forcedEventEmitter.dispatch({
				type: 'change'
			});

			if (!disabled) {
				eventEmitter.dispatch({
					type: 'change'
				});
			}
		}

		requestAnimationFrame(_loop);
	}

	var _init = function() {
		requestAnimationFrame = utils.getRequestAnimationFrame();

		scrolledTop  = _scrollPositionTop();
		scrolledLeft = _scrollPositionLeft();

		var handleScroll = function() {
			scrolledTop  = _scrollPositionTop();
			scrolledLeft = _scrollPositionLeft();

			forcedEventEmitter.dispatch({
				type: 'change'
			});

			if (disabled) {
				return;
			}

			eventEmitter.dispatch({
				type: 'change'
			});
		}

		window.addEventListener('scroll', handleScroll, false);

		// _loop();

		dispatcher.subscribe(_handleEvent);
	}

	var eventEmitter = function() {
		var _handlers = [];

		var dispatch = function(event) {
			for (var i = _handlers.length - 1; i >= 0; i--) {
				_handlers[i](event);
			}
		}
		var subscribe = function(handler) {
			_handlers.push(handler);
		}
		var unsubscribe = function(handler) {
			for (var i = 0; i <= _handlers.length - 1; i++) {
				if (_handlers[i] == handler) {
					_handlers.splice(i--, 1);
				}
			}
		}

		return {
			dispatch: dispatch,
			subscribe: subscribe,
			unsubscribe: unsubscribe
		}
	}();

	var forcedEventEmitter = function() {
		var _handlers = [];

		var dispatch = function(event) {
			for (var i = _handlers.length - 1; i >= 0; i--) {
				_handlers[i](event);
			}
		}
		var subscribe = function(handler) {
			_handlers.push(handler);
		}
		var unsubscribe = function(handler) {
			for (var i = 0; i <= _handlers.length - 1; i++) {
				if (_handlers[i] == handler) {
					_handlers.splice(i--, 1);
				}
			}
		}

		return {
			dispatch: dispatch,
			subscribe: subscribe,
			unsubscribe: unsubscribe
		}
	}();

	var getData = function() {
		return {
			top:  scrolledTop,
			left: scrolledLeft
		}
	}

	if (!initialized) {
		initialized = true;
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		forcedEventEmitter: forcedEventEmitter,
		getData: getData
	}
});