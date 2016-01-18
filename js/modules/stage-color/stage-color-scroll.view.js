define(['dispatcher', 'resize/resize.store', 'scroll/scroll.store', 'utils'], function(dispatcher, resizeStore, scrollStore, utils) {

	"use strict";

	var items = {}
	var idName = 'color-bg-';
	var idNum  = 1;


	var _handleResize = function() {
		var storeData = resizeStore.getData();
		var wh = storeData.height;

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				items[id].offset = utils.offset(items[id].element).top - wh/2;
			}
		}
	}

	var _handleScroll = function() {
		var scrollData = scrollStore.getData();
		var check = false;

		for (var id1 in items) { //больше себя, но меньше всех остальных
			check = false;
			if (items.hasOwnProperty(id1)) {
				if (scrollData.top < items[id1].offset) continue;
				check = true;

				for (var id2 in items) {
					if (items.hasOwnProperty(id2)) {
						if (id2 === id1 || items[id2].offset < items[id1].offset) continue; //если это мы же или кто-то выше
						if (scrollData.top > items[id2].offset) {
							check = false;
						}
					}
				}

				if (check === true) {
					
					dispatcher.dispatch({
						type: 'stage-color-change',
						color: items[id1].color
					});

					break;
				}
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var color = element.getAttribute('data-color');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}


		items[id] = {
			id: id,
			element: element,
			color: color,
			offset: false
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

		elements = document.getElementsByClassName('color-bg-control');
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
		_handleResize();
		_handleScroll();
		scrollStore.eventEmitter.subscribe(_handleScroll);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleResize();
				_handleScroll();
			}
		});
	}

	return {
		init: init
	}
});