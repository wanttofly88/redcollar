define(['dispatcher', 'utils'], function(dispatcher, utils) {

	"use strict";

	var initialized = false;
	var uniforms;
	var requestAnimationFrame;

	var _handleEvent = function(e) {

	}

	var _loop = function() {

		uniforms['lineL1'].value -= 0.001;
		uniforms['lineL2'].value += 0.0001;

		requestAnimationFrame(_loop);
	}

	var _init = function() {
		requestAnimationFrame = utils.getRequestAnimationFrame();

		uniforms = {
			'lineK1':  {type: 'f', value:  2},
			'lineL1':  {type: 'f', value:  0.3},
			'lineK2':  {type: 'f', value: -1.5},
			'lineL2':  {type: 'f', value:  0.9}
		}

		_loop();

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
			uniforms: uniforms
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