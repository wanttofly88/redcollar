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


	var _handleTextChange = function() {
		var textData = textPositionsStore.getData();
		var bpData   = breakpointStore.getData();
		var svgData  = svgStore.getData();
		var svgHeight;
		var scale;

		ww = resizeStore.getData().width;

		var checkItemPosition = function(item) {
			var itemData;
			var lettersData;

			if (!textData.items.hasOwnProperty(item.id)) return;

			itemData = textData.items[item.id];
			lettersData = itemData.letters;

			for (var i = 0; i < item.letters.length; i++) {
				item.letters[i].x = lettersData[i].x;
				// item.letters[i].svgText.setAttribute('x', item.letters[i].x);

				item.letters[i].svgPath.setAttribute('transform', 'scale(' + scale + ', -' + scale + ') translate(' + item.letters[i].x/scale + ', -1000)');
			}
		}

		var checkItemText = function(item) {
			var splitText;
			var itemData;
			var lettersData;
			var totalLetters;

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

				//для рисуемых путей прелоадера
				if (item.id === 'project-preloader-text-fg') {
					bezierLength = svgPath.getTotalLength();
					svgPath.setAttribute('stroke-dashoffset', 0);
					svgPath.setAttribute('stroke-dasharray',  0 + ',' + bezierLength/2 + ',' + 0 + ',' + bezierLength/2);
				}

				item.letters.push({
					svgPath: svgPath,
					char: letter.char,
					x: letter.x
				});
			}

			if (!textData.items.hasOwnProperty(item.id) || item.text === textData.items[item.id].text) return;


			itemData = textData.items[item.id];
			lettersData = itemData.letters;

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

		svgHeight = heights[bpData.breakpoint.name];
		scale = svgHeight/pathHeight;

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItemText(items[id]);
				checkItemPosition(items[id]);
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var svg, g;
		var type = element.getAttribute('data-render');

		if (type === 'canvas') return;

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}

		svg = element.getElementsByTagName('svg')[0];
		g   = element.getElementsByTagName('g')[0];

		items[id] = {
			id: id,
			element: element,
			svg: svg,
			g: g,
			letters: [],
			lastText: '',
			text: ''
		}
	}

	var _remove = function(items, item) {
		dispatcher.dispatch({
			type: 'svg-text-delete',
			id: item.id
		});

		delete items[item.id];
	}

	var _handleMutate = function() {
		var elements;

		var check = function(items, element) {
			var found = false;
			for (var id in items) {
				if (items.hasOwnProperty(id)) {
					if (items[id].element === element) {
						found = true;
						break;
					}
				}
			}
			if (!found) {
				_add(items, element);
			}
		}

		var backCheck = function(items, elements, item) {
			var element = item.element;
			var found   = false;

			for (var i = 0; i < elements.length; i++) {
				if (elements[i] === item.element) {
					found = true;
					break;
				}
			}

			if (!found) {
				_remove(items, item);
			}
		}

		elements = document.getElementsByClassName('svg-text');
		for (var i = 0; i < elements.length; i++) {
			check(items, elements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				backCheck(items, elements, items[id]);
			}
		}
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