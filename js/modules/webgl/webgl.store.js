define(['dispatcher', 'TweenMax'], function(dispatcher, TweenMax) {

	"use strict";

	var initialized = false;
	var textureInitialized = false;
	var animating = false;

	var globalAlpha = 1;
	var maskShift = 0;
	var alpha = 1;
	var displacementX = 0;
	var displacementY = 0;
	var maskAlpha = 0;
	var webglSupport = true;

	var shadersData = {
		globalAlpha: globalAlpha,
		maskShift: maskShift,
		alpha: alpha,
		displacementX: displacementX,
		displacementY: displacementY,
		maskAlpha: maskAlpha
	}

	var tl = new TimelineLite();

	var _handleEvent = function(e) {
		if (e.type === 'texture-reset') {
			textureInitialized = false;
		}
		if (e.type === 'texture-needs-update') {
			if (textureInitialized) {
				if (animating) return;

				animating = true;
				tl.to(shadersData, 0, {
					maskShift: 0.05,
					maskAlpha: 0
				});
				tl.to(shadersData, 0.6, {
					globalAlpha: 0,
					displacementY: 0.5,
					maskShift: 0.07,
					alpha: 0.5,
 					onComplete: function() {
						eventEmitter.dispatch({
							type: 'texture-can-update'
						});
						animating = false;
					}
				});
				tl.to(shadersData, 0, {
					alpha: 0,
					maskShift: 0,
					displacementX: 1,
					displacementY: 2,
					maskAlpha: 0
				});
				tl.to(shadersData, 0.6, {
					globalAlpha: 1,
					maskAlpha: 1
				});
				tl.to(shadersData, 2, {
					maskShift: 0.05,
					displacementX: 0,
					displacementY: 0
				}, '-=0.6');
				tl.to(shadersData, 1, {
					alpha: 1,
					maskAlpha: 0
				}, '-=1.6');
				tl.to(shadersData, 0, {
					maskShift: 0,
					displacementY: 0,
					onComplete: function() {

					}
				});
			} else {
				textureInitialized = true;
				eventEmitter.dispatch({
					type: 'texture-can-update'
				});
			}
		}
	}

	var _init = function() {
		var canvas = document.createElement('canvas');
		var gl = canvas.getContext("webgl");
		var html = document.getElementsByTagName('html')[0];

		if (gl) {
			webglSupport = true;
		} else {
			webglSupport = false;
			html.classList.remove('webgl');
			html.classList.add('no-webgl');
		}

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
			shadersData: shadersData,
			webglSupport: webglSupport
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