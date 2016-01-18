define([
	'dispatcher', 
	'svg-text/svg-text-positions.store',
	'resize/resize.store', 
	'resize/breakpoint-main-text.store',
	'svg-text/svg-text.store',
	'utils'
], function(
	dispatcher, 
	textPositionsStore, 
	resizeStore, 
	breakpointStore,
	svgStore,
	utils
) {

	"use strict";

	var items = {}

	var idName = 'svg-text-v-';
	var idNum  = 1;

	var ww;
	var cw, ch;
	var dpr;

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


	var _renderAll = function() {
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				_render(items[id]);
			}
		}

		// requestAnimationFrame(function() {
		// 	_renderAll();
		// });
	}

	var _render = function(item) {
		var bpData = breakpointStore.getData();
		var fs     = fontSizes[bpData.breakpoint.name];


		item.ctx.font = '700 ' + (fs*dpr) + 'px Stem Web';
		item.ctx.fillStyle    = "white";
		item.ctx.strokeStyle  = 'white';
		item.ctx.textBaseline = "middle";
		item.ctx.lineWidth    = 2*dpr;

		item.ctx.clearRect(0, 0, cw, ch);

		// var shardAnimate = function(shard) {
		// 	var p1 = 0;
		// 	var p2 = 0;
		// 	var val1, val2;
		// 	var key1, key2;
		// 	var x, y;
		// 	var coef;
		// 	var relFrame = shard.currentFrame/shard.totalFrames;
		// 	var shift, opacity;

		// 	if (!shard.coords || !shard.coords.length) return;

		// 	for (var i = 0; i < shard.keyTimes.length - 1; i++) {
		// 		if (relFrame >= shard.keyTimes[i] && relFrame < shard.keyTimes[i + 1]) {
		// 			p1 = i;
		// 			p2 = i + 1;
		// 			break;
		// 		}
		// 	}

		// 	val1 = shard.values[p1];
		// 	val2 = shard.values[p2];

		// 	key1 = shard.keyTimes[p1]
		// 	key2 = shard.keyTimes[p2]

		// 	for (var i = 0; i < shard.coords.length; i++) {
		// 		coef  = (relFrame - key1)/(key2 - key1);
		// 		shard.coords[i].x = val1[i].x + (val2[i].x - val1[i].x)*coef;
		// 		shard.coords[i].y = val1[i].y + (val2[i].y - val1[i].y)*coef;
		// 		shift = shard.shifts[p1] + (shard.shifts[p2] - shard.shifts[p1])*coef;
		// 		opacity = shard.opacitys[p1] + (shard.opacitys[p2] - shard.opacitys[p1])*coef;
		// 	}

		// 	item.fakeCtx.clearRect(0, 0, cw, ch)
		// 	item.fakeCtx.drawImage(item.canvas, shift, shard.shift, cw + shift, ch + shift);

		// 	//вырезаем осколок
		// 	item.ctx.globalCompositeOperation = 'destination-out';
		// 	item.ctx.beginPath();
		// 	item.ctx.moveTo(shard.coords[0].x*cw, shard.coords[0].y*ch);
		// 	for (var i = 1; i < shard.coords.length; i++) {
		// 		item.ctx.lineTo(shard.coords[i].x*cw, shard.coords[i].y*ch);
		// 	}
		// 	item.ctx.closePath();
		// 	item.ctx.fill();
		// 	item.ctx.globalCompositeOperation = 'source-over';

		// 	//берем сохраненный осколок
		// 	item.fakeCtx.globalCompositeOperation = 'destination-in';
		// 	item.fakeCtx.beginPath();
		// 	item.fakeCtx.moveTo(shard.coords[0].x*cw, shard.coords[0].y*ch);
		// 	for (var i = 1; i < shard.coords.length; i++) {
		// 		item.fakeCtx.lineTo(shard.coords[i].x*cw, shard.coords[i].y*ch);
		// 	}
		// 	item.fakeCtx.closePath();
		// 	item.fakeCtx.fill();
		// 	item.ctx.globalAlpha = opacity;
		// 	item.ctx.drawImage(item.fakeCanvas, 0, 0, cw, ch);
		// 	item.fakeCtx.globalCompositeOperation = 'source-over';
		// 	item.ctx.globalAlpha = 1;


		// 	// item.ctx.stroke();

		// 	shard.currentFrame++;
		// 	if (shard.currentFrame >= shard.totalFrames) {
		// 		shard.currentFrame = 0;
		// 	}

		// 	// item.ctx.clearRect(0, 0, cw, ch);
		// 	// item.ctx.drawImage(item.fakeCanvas, 0, 0, cw, ch);
		// }

		var drawLetter = function(letter) {
			item.ctx.fillText(letter.char,   letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr);
			item.ctx.strokeText(letter.char, letter.x*dpr, heights[bpData.breakpoint.name]/2*dpr);
		}

		for (var i = 0; i < item.letters.length; i++) {
			drawLetter(item.letters[i]);
		}

		// for (var i = 0; i < item.shards.length; i++) {
		// 	shardAnimate(item.shards[i]);
		// }


		dispatcher.dispatch({
			type: 'texture-change',
			id: item.id
		});

	}


	var _handleResize = function() {
		var bpData = breakpointStore.getData();
		ww = resizeStore.getData().width;

		cw = ww*dpr;
		ch = heights[bpData.breakpoint.name]*dpr;

		var checkItem = function(item) {
			item.canvas.setAttribute('width',  cw);
			item.canvas.setAttribute('height', ch);
			item.fakeCanvas.setAttribute('width', cw);
			item.fakeCanvas.setAttribute('height', ch);
			item.element.style.height = heights[bpData.breakpoint.name] + 'px';
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
			}
		}

		var checkItemText = function(item) {
			var splitText;
			var itemData;
			var lettersData;
			var totalLetters;


			var addLetter = function(letter, i) {
				if (!svgData.lettersData.hasOwnProperty(letter.char)) {
					console.warn('invalid letter ' + letter.char);
					return;
				}

				item.letters.push({
					char: letter.char,
					x: letter.x
				});
			}

			if (!textData.items.hasOwnProperty(item.id) || item.text === textData.items[item.id].text) return;

			itemData = textData.items[item.id];
			lettersData = itemData.letters;

			item.lastText = item.text;
			item.text = textData.items[item.id].text;

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
				_render(items[id]);
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var canvas, ctx;
		var type = element.getAttribute('data-render');
		var shards = [];
		var fakeCanvas, fakeCtx;

		var addShard = function(type) {
			var coords = [];
			var values;
			var shift;
			var shifts;
			var opacitys;
			var totalFrames;
			var opacity;

			var values1 = [
				[{x: 0.00, y: 0}, {x: 0.00, y: 0}, {x: 0.00,  y: 1}, {x: 0.00, y: 1}],
				[{x: 0.22, y: 0}, {x: 0.25, y: 0}, {x: 0.32,  y: 1}, {x: 0.25, y: 1}],
				[{x: 0.45, y: 0}, {x: 0.45, y: 0}, {x: 0.50,  y: 1}, {x: 0.50, y: 1}]
			];
			var values2 = [
				[{x: 0.45, y: 0}, {x: 0.45, y: 0}, {x: 0.42, y: 1}, {x: 0.42, y: 1}],
				[{x: 0.52, y: 0}, {x: 0.58, y: 0}, {x: 0.55, y: 1}, {x: 0.53, y: 1}],
				[{x: 0.65, y: 0}, {x: 0.65, y: 0}, {x: 0.63, y: 1}, {x: 0.63, y: 1}]
			];
			var values3 = [
				[{x: 1,     y: 0}, {x: 1,     y: 0}, {x: 0.95,  y: 1}, {x: 0.95, y: 1}],
				[{x: 0.5,   y: 0}, {x: 0.6,   y: 0}, {x: 0.72,  y: 1}, {x: 0.5,  y: 1}],
				[{x: 0.35,  y: 0}, {x: 0.35,  y: 0}, {x: 0.35,  y: 1}, {x: 0.35, y: 1}]
			];

			var shifts1 = [0,  3, 0];
			var shifts2 = [0,  5, 0];
			var shifts3 = [0, -3, 0];
			var opacitys1 = [1, 0.8, 1];
			var opacitys2 = [1, 0.7, 1];
			var opacitys3 = [1, 0.8, 1];


			// console.log(values[1]);

			var keyTimes = [0, 0.5, 1];

			if (type === 1) {
				shifts   = shifts1;
				opacitys = opacitys1;
				shift    = 3;
				opacity  = 0.9;
				totalFrames = 240;
				values = values1;
			}
			if (type === 2) {
				shifts   = shifts2;
				opacitys = opacitys2;
				shift    = 5;
				opacity  = 0.8;
				totalFrames = 300;
				values = values2;
			}
			if (type === 3) {
				shifts   = shifts3;
				opacitys = opacitys2;
				shift    = -3;
				opacity  = 0.9;
				totalFrames = 600;
				values = values3;
			}


			coords = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];

			// console.log(values[1][0].x);

			shards.push({
				shift: shift,
				shifts: shifts,
				coords: coords,
				opacity: opacity,
				opacitys: opacitys,
				values: values,
				currentFrame: 0,
				totalFrames: totalFrames,
				keyTimes: keyTimes
			});
		}

		if (type !== 'canvas') return;

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}

		canvas = element.getElementsByTagName('canvas')[0];
		if (!canvas) return;

		fakeCanvas = document.createElement('canvas');

		ctx = canvas.getContext('2d');
		fakeCtx = fakeCanvas.getContext('2d');

		// addShard(1);
		// addShard(2);
		// addShard(3);

		items[id] = {
			id: id,
			element: element,
			canvas: canvas,
			fakeCanvas: fakeCanvas,
			ctx: ctx,
			fakeCtx: fakeCtx,
			shards: shards,
			letters: [],
			lastText: '',
			text: ''
		}

		_render(items[id]);
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

		dpr = 1;
		if (window.devicePixelRatio !== undefined) {
			dpr = window.devicePixelRatio;
		}

		requestAnimationFrame = utils.getRequestAnimationFrame();

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