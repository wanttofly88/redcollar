define(['dispatcher'], function(dispatcher) {

	"use strict";

	//local

	var initialized = false;
	var items = {};

	var _handleEvent = function(e) {

		if (e.type === 'video-add') {
			if (items.hasOwnProperty(e.id)) return;
			items[e.id] = {
				id: e.id,
				status: 'not-ready'
			}
		}

		if (e.type === 'video-remove') {
			if (!items.hasOwnProperty(e.id)) return;
			delete items[e.id];
		}

		if (e.type === 'video-ready') {
			if (items.hasOwnProperty(e.id)) {
				items[e.id].status = 'ready';

				eventEmitter.dispatch({
					type: 'change'
				});
			}
		}

		if (e.type === 'video-play') {
			if (items.hasOwnProperty(e.id)) {
				items[e.id].status = 'play';
				eventEmitter.dispatch({
					type: 'change'
				});
			}
		}

		if (e.type === 'video-stop') {
			if (items.hasOwnProperty(e.id)) {
				items[e.id].status = 'stop';
				eventEmitter.dispatch({
					type: 'change'
				});
			}
		}

		if (e.type === 'video-reset') {
			if (items.hasOwnProperty(e.id)) {
				items[e.id].status = 'not-ready';
				eventEmitter.dispatch({
					type: 'change'
				});
			}
		}
	}

	var _init = function() {
		items = {};

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