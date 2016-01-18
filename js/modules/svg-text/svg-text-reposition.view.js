define([
	'dispatcher', 
	'svg-text/svg-text.store',
	'resize/resize.store',
	'resize/breakpoint-main-text.store',
], function(
	dispatcher, 
	textStore,
	resizeStore,
	breakpointStore
) {

	"use strict";

	var idName = 'svg-text-p-';
	var idNum  = 1;

	var items  = {};

	var frameWidth = 80/100; //процент от ширины экрана
	var frameLeft  = 10/100; //сдвиг слева в процентах от ширины экрана

	var lastWw = false;

	var minSpacings = {
		'mobile':  10,
		'tablet1': 15,
		'tablet2': 15,
		'desktop': 20
	}
	var fontSizes = {
		'mobile':  36,
		'tablet1': 60,
		'tablet2': 120,
		'desktop': 150
	}

	var heights = {
		'mobile':  47,
		'tablet1': 78,
		'tablet2': 155,
		'desktop': 193
	}

	var _handleChange = function() {
		var ww     = resizeStore.getData().width;
		var bpData = breakpointStore.getData();
		var textData = textStore.getData();
		var fontSize;
		var minSpacing;

		fontSize   = fontSizes[bpData.breakpoint.name]/100;
		minSpacing = minSpacings[bpData.breakpoint.name];

		var checkItem = function(item) {
			var chars;
			var letters = [];
			var spacingResult;
			var tmpFontSize = fontSize;
			var tmpContainerHeight;
			var tmpContainerFontSize;
			var tmpWidth;
			var charWidth;
			var charSpacing;
			var currentSpacing;
			var nextCharSpacing;

			if (!textData.items.hasOwnProperty(item.id)) return;
			if (item.text === textData.items[item.id].text && lastWw === ww) return; //ничего не поменялось

			item.text = textData.items[item.id].text;

			if (!item.text) {
				item.text = '';
			}

			item.text = item.text.toUpperCase();
			chars = item.text.split('');

			for (var i = 0; i < chars.length; i++) {
				letters.push({
					char: chars[i],
					x: 0
				});
			};

			//0 - 2мс на все итерации, даже с максимальным изменением размера шрифта. неплохо.
			var getSpacing = function(fontSize) { //получаем межбуквенные коеффициент, сдвиг вддево и ширину блока
				var firstCharWidth;
				var lastCharWidth;
				var cw, cl;
				var spacing = minSpacing;
				var op = 0;
				var check = false;

				var cw = ww * frameWidth;
				var cl = ww * frameLeft;

				firstCharWidth = textData.lettersData[letters[0].char].width * fontSize;
				lastCharWidth  = textData.lettersData[letters[letters.length - 1].char].width * fontSize;

				cl = cl - (firstCharWidth / 2) + 1;
				cw = cw + (firstCharWidth / 2) + (lastCharWidth / 2);

				while (spacing <= 1000) { //перебором
					tmpWidth = 0;

					//ширина буквы + среднее арифметическое межбуквенных интервалов соседних букв
					for (var i = 0; i <= letters.length - 1; i++) {
						charWidth      = textData.lettersData[letters[i].char].width * fontSize;
						charSpacing    = textData.lettersData[letters[i].char].spacing * fontSize / 2;
						nextCharSpacing = 0;
						if (letters[i + 1]) nextCharSpacing = textData.lettersData[letters[i + 1].char].spacing * fontSize / 2;
						charSpacing = (nextCharSpacing + charSpacing) / 2;

						currentSpacing = charSpacing * spacing / 100;

						tmpWidth += charWidth;

						op++;

						//если ширина текста стала больше нужной, выходим, запоминаем интервал
						if (tmpWidth >= cw) {
							check = true;
						}

						tmpWidth += currentSpacing;
					}

					if (check) break;

					spacing += 0.1;
				}

				return {
					spacing: parseFloat(spacing.toFixed(1)),
					cw: cw,
					cl: cl
				}
			}

			// item.svg.setAttribute('width',  ww);
			// item.svg.setAttribute('height', heights[bpData.breakpoint.name]);
			// item.svg.setAttribute('viewBox', '0 0 ' + (ww) + ' ' + (heights[bpData.breakpoint.name]));
			// item.element.style.height = heights[bpData.breakpoint.name] + 'px';

			if (letters.length === 0) {
				return;
			}

			spacingResult = getSpacing(tmpFontSize);

			//если текст не влезает, уменьшаем размер шрифта и пробуем снова
			// while (spacingResult.spacing === minSpacing) {
			// 	tmpFontSize = tmpFontSize - 0.1;
			// 	spacingResult = getSpacing(tmpFontSize)
			// }

			//стили контэйнера
			//tmpContainerFontSize = tmpFontSize*100;
			//проверяем, поменялось ли что-либо
			// if (tmpContainerFontSize !== currentContainerFontSize) {
			// 	currentContainerFontSize = tmpContainerFontSize;
			// 	tmpContainerHeight = letterItems[0].element.clientHeight;
			// 	textContainer.style.fontSize = (tmpFontSize*100) + 'px';
			// 	textContainer.style.height   = letterItems[0].element.clientHeight + 'px';
			// }

			//рисуем буквы
			tmpWidth = 0;
			for (var i = 0; i <= letters.length - 1; i++) {
				letters[i].x = (tmpWidth + spacingResult.cl);
				// letters[i].svgText.setAttribute('x', letters[i].x);

				charWidth   = textData.lettersData[letters[i].char].width * tmpFontSize;
				charSpacing = textData.lettersData[letters[i].char].spacing * tmpFontSize / 2;
				nextCharSpacing = 0;
				if (letters[i + 1]) nextCharSpacing = textData.lettersData[letters[i + 1].char].spacing * tmpFontSize / 2;
				charSpacing = (nextCharSpacing + charSpacing)/2;
				currentSpacing = charSpacing * spacingResult.spacing / 100;

				tmpWidth += (charWidth + currentSpacing);
			}

			dispatcher.dispatch({
				type: 'svg-text-reposition',
				me:   'svg-text-reposition.view',
				id: item.id,
				letters: letters,
				spacing: spacingResult.spacing,
				left: spacingResult.cl,
				text: item.text
			});
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}

		lastWw = ww;
	}

	var _debounceChange = (function() {
		var timeWindow = 100;
		var timeout;
	
		var _debounceChange = function(args) {
			_handleChange();
		};
	
		return function() {
			var context = this;
			var args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				_debounceChange.apply(context, args);
			}, timeWindow);
		};
	}());


	var _add = function(items, element) {
		var id   = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}

		items[id] = {
			id: id,
			text: '',
			letters: [],
			element: element
		}
	}

	var _remove = function(items, item) {
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
		_handleMutate();
		_handleChange();

		resizeStore.eventEmitter.subscribe(_debounceChange);
		textStore.eventEmitter.subscribe(_debounceChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleChange();
			}
		});
	}

	return {
		init: init
	}
});