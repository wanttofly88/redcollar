define(['dispatcher'], function(dispatcher) {

	"use strict";

	var initialized = false;

	var items = {}

	var _handleEvent = function(e) {
		if (e.type === 'svg-text-reposition') {

			items[e.id] = {
				id: e.id,
				letters: e.letters,
				spacing: e.spacing,
				left: e.left,
				text: e.text
			}

			eventEmitter.dispatch();
		}

		if (e.type === 'svg-text-delete') {
			if (items.hasOwnProperty(e.id)) {
				delete items[e.id];
			}
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
			items: items
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