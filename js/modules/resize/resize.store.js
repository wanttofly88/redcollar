define(['dispatcher'], function(dispatcher) {

	"use strict";
	//global

	var initialized = false;
	var size = {
		width: 0,
		height: 0
	}

	var disabled = false;

	var _windowSize = function() {
		var width = 0, height = 0;
		if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
			width = document.documentElement.clientWidth;
			height = document.documentElement.clientHeight;
		} else if( typeof( window.innerWidth ) === 'number' ) {
			console.dir(window);
			width = window.innerWidth;
			height = window.innerHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			width = document.body.clientWidth;
			height = document.body.clientHeight;
		}
		return {
			height: height,
			width: width
		}
	}


	var _handleEvent = function(e) {
		if (e.type === 'fire-resize') {
			size = _windowSize();
			forcedEventEmitter.dispatch({
				type: 'change'
			});
			eventEmitter.dispatch({
				type: 'change'
			});
		}

		if (e.type === 'resize-disable') {
			disabled = true;
		}
		if (e.type === 'resize-enable') {
			disabled = false;
		}
	}

	// var _loop = function() {
	// 	var tmpSize = {}

	// 	tmpSize = _windowSize();

	// 	if (tmpSize.width !== size.width || tmpSize.height !== size.height) {
	// 		size.width  = tmpSize.width;
	// 		size.height = tmpSize.height;

	// 		forcedEventEmitter.dispatch({
	// 			type: 'change'
	// 		});

	// 		if (!disabled) {
	// 			eventEmitter.dispatch({
	// 				type: 'change'
	// 			});
	// 		}
	// 	}

	// 	requestAnimationFrame(_loop);
	// }

	var _init = function() {
		size = _windowSize();

		// _loop();
		window.addEventListener('resize', function() {
			size = _windowSize();

			forcedEventEmitter.dispatch({
				type: 'change'
			});

			if (disabled) return;

			eventEmitter.dispatch({
				type: 'change'
			});
		}, false);
		window.addEventListener('orientationchange', function() {
			size = _windowSize();

			forcedEventEmitter.dispatch({
				type: 'change'
			});

			if (disabled) return;

			eventEmitter.dispatch({
				type: 'change'
			});
		}, false);
		window.addEventListener('load', function() {
			size = _windowSize();

			forcedEventEmitter.dispatch({
				type: 'change'
			});

			if (disabled) return;

			eventEmitter.dispatch({
				type: 'change'
			});
		}, false);

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
			height: size.height,
			width: size.width
		};
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