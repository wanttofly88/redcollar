define(['dispatcher'], function(dispatcher) {

	"use strict";

	var initialized = false;
	var items = {};

	var _handleEvent = function(e) {
		if (e.type === 'trigger-element-add') {
			items[e.id] = {
				id: e.id,
				triggered: false
			}
		}
		if (e.type === 'trigger-element-remove') {
			delete items[e.id];
		}
		if (e.type === 'trigger-element') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].triggered === true) return;

			items[e.id].triggered = true;

			eventEmitter.dispatch();
		}
		if (e.type === 'untrigger-element') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].triggered === false) return;

			items[e.id].triggered = false;

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
			items: items
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