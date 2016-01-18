define(['dispatcher', 'resize/breakpoint.store'], function(dispatcher, bpStore) {

	"use strict";

	var initialized = false;
	var touchStart;
	var isFirefox;
	var ww;
	var touch;
	var isTouchDevice;
	var html;

	var _handleResize = function() {
		var storeData = bpStore.getData();

		if (isFirefox) {
			if (storeData.breakpoint.name === 'desktop') {
				touch = false;
			} else {
				touch = true;
			}
		} else {
			if (touchStart) {
				touch = true;
			} else {
				if (storeData.breakpoint.name === 'desktop') {
					touch = false;
				} else {
					touch = true;
				}
			}
		}


		if (touch === isTouchDevice) return;
		isTouchDevice = touch;

		if (touch) {
			html.classList.add('touch-detected');
			html.classList.remove('touch-undetected');
		} else {
			html.classList.remove('touch-detected');
			html.classList.add('touch-undetected');
		}

		eventEmitter.dispatch();
	}

	var _init = function() {
		html = document.getElementsByTagName('html')[0];

		touchStart = 'ontouchstart' in window;
		isFirefox  = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

		_handleResize();
		bpStore.eventEmitter.subscribe(_handleResize);
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
			isTouchDevice: isTouchDevice
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