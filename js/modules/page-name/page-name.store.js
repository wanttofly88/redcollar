define(['dispatcher'], function(dispatcher) {

	"use strict";

	var initialized = false;
	var active = false;
	var containerActive = false;

	var _handleEvent = function(e) {
		if (e.type === 'page-name-change') {
			if (e.id === active) return;
			active = e.id;
			if (active) {
				containerActive = true;
			} else {
				containerActive = false;
			}

			eventEmitter.dispatch();
		}
	}

	var _init = function() {
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
			active: active,
			containerActive: containerActive
		}
	}

	if (!initialized) {
		initialized = true;
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});