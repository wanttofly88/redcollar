define(['dispatcher'], function(dispatcher) {

	"use strict";

	var initialized = false;
	var step1counter = 0;
	var step2counter = 0;
	var step1total   = 2;
	var step2total   = 3;
	var step1ready   = false;
	var step2ready   = false;
	var animation    = false;
	var scheme       = 'light';
	var pageNameId   = false;
	var text         = '';
	var projectText = '';
	var color        = 'ffffff';
	var id = false;

	var _handleEvent = function(e) {
		if (e.type === 'transition-step-1') {
			step1counter++;
			if (e.hasOwnProperty('animation') && e.animation !== false) {
				animation = e.animation;
			}
			if (e.hasOwnProperty('id') && e.id !== false) {
				id = e.id;
			}
			if (step1counter >= step1total) {
				step1ready = true;
				eventEmitter.dispatch();
			}
		}
		if (e.type === 'transition-step-2') {
			if (step1counter < step1total) return;

			step2counter++;
			if (e.hasOwnProperty('animation') && e.animation !== false) {
				animation = e.animation;
			}
			if (e.hasOwnProperty('scheme') && e.scheme !== false) {
				scheme = e.scheme;
			}
			if (e.hasOwnProperty('pageNameId') && e.pageNameId !== false) {
				pageNameId = e.pageNameId;
			}
			if (e.hasOwnProperty('text') && e.pageNameId !== text) {
				text = e.text;
			}
			if (e.hasOwnProperty('color') && e.color !== false) {
				color = e.color;
			}
			if (e.hasOwnProperty('projectText') && e.projectText !== false) {
				projectText = e.projectText;
			}
			if (e.hasOwnProperty('id') && e.id !== false) {
				id = e.id;
			}
			if (step2counter >= step2total) {
				step2ready = true;
				eventEmitter.dispatch();
			}
		}
		if (e.type === 'transition-step-reset') {
			step1counter = 0;
			step2counter = 0;
			step1ready = false;
			step2ready = false;
			animation  = false;
			scheme       = 'light';
			text         = '';
			projectText  = '';
			color        = 'ffffff';
			pageNameId = false;
			id = false;
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
			step1ready: step1ready,
			step2ready: step2ready,
			animation: animation,
			scheme: scheme,
			pageNameId: pageNameId,
			text: text,
			color: color,
			projectText: projectText
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