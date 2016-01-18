define(['dispatcher', 'THREE'], function(dispatcher, THREE) {

	"use strict";

	var initialized = false;

	var uniforms = {}
	var attributes = {}
	var fragmentShader = false;
	var vertexShader = false;
	var sectors = [];

	var _handleEvent = function(e) {
		if (e.type === 'net-sectors-change') {
			sectors = e.sectors;

			// for (var i = 0; i < sectors.length; i++) {
			// 	uniforms.sectors[i] = sectors[i].opacity;
			// }
		}
	}

	var _init = function() {

		for (var i = 0; i < 54; i++) {
			sectors[i] = new THREE.Vector2();
		}

		uniforms = {
			'tDiffuse': {type: 't', value: 0, texture: null},
			'sectors': {type: 'v2v', value: sectors}
		}

		attributes = {}

		vertexShader = [
			'varying vec2 vUv;',
			'void main() {',
				'vUv = uv;',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join('\n');

		fragmentShader = [
			'#define ARRAYMAX 54 \n',
			'uniform sampler2D tDiffuse;',
			'varying vec2 vUv;',
			'uniform vec2 sectors[ARRAYMAX];',

			'void main() {',
				'float vx = vUv.x;',
				'float vy = vUv.y;',
				'float secX = floor(vx*9.0);',
				'float secY = floor((1.0 - vy)*6.0);',
				'float sec  = secX + secY*9.0;',

				'vec4 color = texture2D(tDiffuse, vec2(vx, vy));',

				'if (sectors[5].x < 0.01) {color.r = 0.0;}',
				'gl_FragColor = color;',
			'}'
		].join('\n')

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
			uniforms: uniforms,
			attributes: attributes,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
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