define(['dispatcher'], function(dispatcher) {

	"use strict";

	var initialized = false;
	var items = {}

	var _handleEvent = function(e) {
		if (e.type === 'ajax-form-add') {
			items[e.id] = {
				id: e.id,
				status: 'waiting'
			}
		}
		if (e.type === 'ajax-form-remove') {
			if (!items.hasOwnProperty(e.id)) return;
			delete items[e.id];
		}


		if (e.type === 'ajax-form-send') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].status === 'sending') return;

			items[e.id].status = 'sending';

			eventEmitter.dispatch();
		}
		if (e.type === 'ajax-form-submit') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].status === 'submitted') return;

			items[e.id].status = 'submitted';

			eventEmitter.dispatch();
		}
		if (e.type === 'ajax-form-reset') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].status === 'waiting') return;

			items[e.id].status = 'waiting';

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