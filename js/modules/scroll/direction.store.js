define(['dispatcher'], function(dispatcher) {

	"use strict";

	var way = false;

	var initialized = false;

	var _handleEvent = function(e) {
		if (e.type === 'direction-change') {
			if (way === e.way) return;
			way = e.way;

			eventEmitter.dispatch({
				type: 'change'
			});
		}
	}

	var _init = function() {
		if (initialized) return;
		initialized = true;

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

	var getData = function() {
		return {
			way: way
		}
	}

	if (!initialized) {
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});