define([
	'dispatcher', 
	'svg-text/svg-text-positions.store',
	'resize/resize.store', 
	'resize/breakpoint-main-text.store',
	'svg-text/svg-text.store'
], function(
	dispatcher, 
	textPositionsStore, 
	resizeStore, 
	breakpointStore,
	svgStore
) {

	"use strict";

	var items = {}

	var idName = 'svg-text-v-';
	var idNum  = 1;

	var id = 'stage-svg-text';

	var ww;

	var heights = {
		'mobile':  47,
		'tablet1': 78,
		'tablet2': 155,
		'desktop': 193
	}

	var pathHeight = 1300; //почему? хуй знает

	var xmlns = "http://www.w3.org/2000/svg";

	var transitionDelay;

	var timeout;


	var _handleResize = function() {
		var bpData = breakpointStore.getData();
		ww = resizeStore.getData().width;

		var checkItem = function(item) {
			if (item.svg) {
				item.svg.setAttribute('width',  ww);
				item.svg.setAttribute('height', heights[bpData.breakpoint.name]);
				item.svg.setAttribute('viewBox', '0 0 ' + (ww) + ' ' + (heights[bpData.breakpoint.name]));
			}
			if (item.element) {
				item.element.style.height = heights[bpData.breakpoint.name] + 'px';
			}
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	var _render = function(item) {
		var textData;
		var itemData;
		var svgData  = svgStore.getData();
		var svgHeight;
		var lettersData;
		var totalLetters;
		var bpData   = breakpointStore.getData();
		var scale;

		if (!item) return;

		var deleteLetter = function(letter, i) {
			item.g.removeChild(letter.svgPath);
		}
		var addLetter = function(letter, i) {
			var svgPath = document.createElementNS(xmlns, 'path');
			var svgBezier;
			var bezierLength;

			if (!svgData.lettersData.hasOwnProperty(letter.char)) {
				console.warn('invalid letter ' + letter.char);
				return;
			}

			svgBezier = svgData.lettersData[letter.char].bezier;

			svgPath.setAttribute('d', svgBezier);

			item.g.appendChild(svgPath);
			svgPath.setAttribute('transform', 'scale(' + scale + ', -' + scale + ') translate(' + letter.x/scale + ', -1000)');

			item.letters.push({
				svgPath: svgPath,
				char: letter.char,
				x: letter.x
			});
		}

		if (!item) return;

		textData = textPositionsStore.getData();
		itemData = textData.items[item.id];

		itemData = textData.items[item.id];
		lettersData = itemData.letters;

		svgHeight = heights[bpData.breakpoint.name];
		scale = svgHeight/pathHeight;

		item.lastText = item.text;
		item.text = textData.items[item.id].text;

		for (var i = 0; i < item.letters.length; i++) {
			deleteLetter(item.letters[i], i);
		}
		item.letters = [];
		totalLetters = lettersData.length;
		for (var i = 0; i < lettersData.length; i++) {
			addLetter(lettersData[i], i);
		}
	}

	var _handleTextChange = function() {
		var textData = textPositionsStore.getData();

		var flag = false;

		ww = resizeStore.getData().width;

		var checkItemPosition = function(item) {
			var itemData;
			var lettersData;

			if (!textData.items.hasOwnProperty(item.id)) return;

			itemData = textData.items[item.id];
			lettersData = itemData.letters;

			flag = true;
		}

		var checkItemText = function(item) {
			var itemData;
			var lettersData;
			var totalLetters;

			if (!textData.items.hasOwnProperty(item.id) || item.text === textData.items[item.id].text) return;

			flag = true;
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItemText(items[id]);
				checkItemPosition(items[id]);
			}
		}

		if (flag) {
			clearTimeout(timeout);
			items[id].svg.classList.add('hidden');
			timeout = setTimeout(function() {

				if (!items.hasOwnProperty(id)) return;

				_render(items[id]);
				items[id].svg.classList.remove('hidden');
			}, 600);
			
		}
	}

	var _build = function(container) {
		var id = 'stage-svg-text';
		var svg, g;
		var type = container.getAttribute('data-render');

		if (type !== 'canvas') return;

		if (!id) {
			id = idName + idNum;
			idNum++;
			container.setAttribute('data-id', id);
		}

		svg = container.getElementsByTagName('svg')[0];
		g   = container.getElementsByTagName('g')[0];

		items[id] = {
			id: id,
			element: container,
			svg: svg,
			g: g,
			letters: [],
			lastText: '',
			text: ''
		}
	}

	var _destroy = function() {
		delete items[id];
	}

	var _handleMutate = function() {
		var container = document.getElementById('stage-svg-text');
		if (!container) {
			_destroy();
			return;
		}

		_build(container);
	}

	var init = function() {
		transitionDelay = Modernizr.prefixed('transition-delay');

		_handleMutate();
		_handleResize();
		_handleTextChange();

		textPositionsStore.eventEmitter.subscribe(_handleTextChange);
		resizeStore.eventEmitter.subscribe(_handleResize);
		breakpointStore.eventEmitter.subscribe(_handleResize);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleResize();
				_handleTextChange();
			}
		});
	}

	return {
		init: init
	}
});