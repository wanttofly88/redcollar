define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}
	var initialized = false;

	var _handleEvent = function(e) {
		if (e.type === 'slider-add') {
			items[e.id] = {
				id: e.id,
				total: e.total || 0,
				index: e.index || 0,
				continious: e.continious || false
			}
		}

		if (e.type === 'slider-remove') {
			delete items[e.id];
		}


		if (e.type === 'slider-change-next') {

			if (!items.hasOwnProperty(e.id)) return;

			items[e.id].index++;
			if (items[e.id].continious) {
				if (items[e.id].index > items[e.id].total) items[e.id].index = 0;
			} else {
				if (items[e.id].index > items[e.id].total) items[e.id].index = items[e.id].total;
			}

			eventEmitter.dispatch();
		}
		if (e.type === 'slider-change-prev') {

			if (!items.hasOwnProperty(e.id)) return;

			items[e.id].index--;
			if (items[e.id].continious) {
				if (items[e.id].index < 0) items[e.id].index = items[e.id].total;
			} else {
				if (items[e.id].index < 0) items[e.id].index = 0;
			}

			eventEmitter.dispatch();
		}
		if (e.type === 'slider-change-to') {

			if (!items.hasOwnProperty(e.id)) return;

			if (items[e.id].index !== e.index) {
				if (e.index > (items[e.id].total || e.index < 0)) {
					console.warn('no slide width index ' + e.index + ' for slider width id ' + e.id);
					return
				}
				items[e.id].index = e.index;
				eventEmitter.dispatch();
			}
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