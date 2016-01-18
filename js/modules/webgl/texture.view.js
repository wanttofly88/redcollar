define([
	'dispatcher', 
	'webgl/webgl.store',
	'svg-text/svg-text-positions.store',
	'resize/resize.store', 
	'resize/breakpoint-main-text.store',
	'svg-text/svg-text.store',
	'utils'

], function(
	dispatcher, 
	webglStore,
	textPositionsStore, 
	resizeStore, 
	breakpointStore,
	svgStore,
	utils
) {

	"use strict";

	var ww, lastWW;
	var cw, ch;
	var dpr;
	var canvas, ctx;
	var letters;
	var id = 'stage-svg-text';
	var text, lastText;
	var element;

	var disabled = false;

	var requestAnimationFrame;

	var heights = {
		'mobile':  47,
		'tablet1': 78,
		'tablet2': 155,
		'desktop': 193
	}

	var fontSizes = {
		'mobile':  36,
		'tablet1': 60,
		'tablet2': 120,
		'desktop': 150
	}

	var pathHeight = 1300; //почему? хуй знает
	var transitionDelay;

	var _render = function() {
		var bpData = breakpointStore.getData();
		var fs     = fontSizes[bpData.breakpoint.name];
		var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

		if (!canvas) return;
		if (disabled) return;

		ctx.font = '700 ' + (fs*dpr) + 'px Stem Web';
		ctx.fillStyle    = "white";
		ctx.strokeStyle  = 'white';
		ctx.textBaseline = "middle";
		if (bpData.breakpoint.name === 'mobile') {
			ctx.lineWidth = 0;
		} else {
			ctx.lineWidth = 2;
		}
		

		ctx.clearRect(0, 0, cw, ch);

		var drawLetter = function(letter) {
			if (isFirefox) {
				ctx.fillText(letter.char,   letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr*1.13);
				ctx.strokeText(letter.char, letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr*1.13);
			} else {
				ctx.fillText(letter.char,   letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr);
				ctx.strokeText(letter.char, letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr);
			}



		}

		for (var i = 0; i < letters.length; i++) {
			drawLetter(letters[i]);
		}

		dispatcher.dispatch({
			type: 'texture-update'
		});

	}

	var _handleWebglChange = function(e) {
		if (e.type === 'texture-can-update') {
			_render();
		}
	}


	var _handleResize = function() {
		var bpData = breakpointStore.getData();
		ww = resizeStore.getData().width;

		if (!canvas) return;

		cw = ww*dpr;
		ch = heights[bpData.breakpoint.name]*dpr;

		canvas.setAttribute('width',  cw);
		canvas.setAttribute('height', ch);
		canvas.style.height = heights[bpData.breakpoint.name] + 'px';
		canvas.style.width  = ww + 'px';
	}


	var _handleTextChange = function() {
		var textData = textPositionsStore.getData();
		var bpData   = breakpointStore.getData();
		var svgData  = svgStore.getData();
		var svgHeight;
		var scale;
		var needsUpdate = false;

		if (!canvas) return;

		ww = resizeStore.getData().width;

		var checkItemPosition = function() {
			var itemData;
			var lettersData;

			if (!textData.items.hasOwnProperty(id)) return;

			itemData = textData.items[id];
			lettersData = itemData.letters;

			for (var i = 0; i < letters.length; i++) {
				if (letters[i].x !==  lettersData[i].x) {
					letters[i].x = lettersData[i].x;
					needsUpdate = true;
				}
			}
		}

		var checkItemText = function() {
			var splitText;
			var itemData;
			var lettersData;
			var totalLetters;


			var addLetter = function(letter, i) {
				if (!svgData.lettersData.hasOwnProperty(letter.char)) {
					console.warn('invalid letter ' + letter.char);
					return;
				}

				letters.push({
					char: letter.char,
					x: letter.x
				});
			}

			if (!textData.items.hasOwnProperty(id) || text === textData.items[id].text) return;

			itemData = textData.items[id];
			lettersData = itemData.letters;

			lastText = text;
			text = textData.items[id].text;

			letters = [];
			totalLetters = lettersData.length;
			for (var i = 0; i < lettersData.length; i++) {
				addLetter(lettersData[i], i);
			}

			needsUpdate = true;
		}

		svgHeight = heights[bpData.breakpoint.name];
		scale = svgHeight/pathHeight;

		checkItemText();
		checkItemPosition();

		if (needsUpdate) {
			dispatcher.dispatch({
				type: 'texture-needs-update'
			});
			// _render();
		}
	}

	var _build = function(element) {
		var type = element.getAttribute('data-render');

		if (type !== 'canvas') return;

		canvas = document.getElementById('text-texture');
		if (!canvas) return;

		ctx = canvas.getContext('2d');
		letters = [];
		text = '';
		lastText = '';

		_render();
	}

	var _destruct = function() {
		canvas = false;
		ctx = false;
		letters = [];
		text = '';
		lastText = '';

		dispatcher.dispatch({
			type: 'texture-reset'
		});
	}

	var _handleMutate = function() {
		element = document.getElementById('stage-svg-text');
		if (!element) {
			_destruct();
		} else {
			_build(element);
		}
	}

	var init = function() {
		transitionDelay = Modernizr.prefixed('transition-delay');

		dpr = 1;
		// if (window.devicePixelRatio !== undefined) {
		// 	dpr = window.devicePixelRatio;
		// }

		dpr *= 1;

		requestAnimationFrame = utils.getRequestAnimationFrame();

		_handleMutate();
		_handleResize();
		_handleTextChange();
		// _handleWebglChange();

		textPositionsStore.eventEmitter.subscribe(_handleTextChange);
		resizeStore.eventEmitter.subscribe(_handleResize);
		breakpointStore.eventEmitter.subscribe(_handleResize);
		webglStore.eventEmitter.subscribe(_handleWebglChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleResize();
				_handleTextChange();
			}
			if (e.type === 'words-scroll-disable') {
				disabled = true;
			}
			if (e.type === 'words-scroll-enable') {
				disabled = false;
				_render();
			}
		});
	}

	return {
		init: init
	}
});