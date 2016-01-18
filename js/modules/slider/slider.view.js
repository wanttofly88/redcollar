define(['dispatcher', 'slider/slider.store', 'swipe'], function(dispatcher, store, swipe) {

	"use strict";

	var items = {}

	var idName = 'slider-id-';
	var idNum  = 1;

	var _handleChange = function() {
		var storeData = store.getData();

		var checkItem = function(item) {
			var itemData;

			if (!storeData || !storeData.items.hasOwnProperty(item.id)) {
				console.warn('error. no data in store for slider with id ' + item.id);
				return;
			}

			itemData = storeData.items[item.id];

			if (!item.initialized) {
				item.initialized = true;
				if (itemData.index !== item.current) {
					item.current = itemData.index;
					item.slider.slide(item.current, 0);
				}
			}

			if (itemData.index === item.current) return;

			item.current = itemData.index;
			item.slider.slide(item.current, item.speed);

			if (item.bind) {
				dispatcher.dispatch({
					type: 'slider-change-to',
					id: item.bind,
					index: item.current
				});
			}
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var index = 0;
		var speed = element.getAttribute('data-speed');
		var slider;
		var updateQuery = element.classList.contains('update-query');
		var continuous  = element.getAttribute('data-continuous');
		var bind   = element.getAttribute('data-slider-bind') || false;
		var slides = element.getElementsByClassName('slide');

		var total = slides.length - 1;

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		if (continuous && continuous === 'true') {
			continuous = true;
		} else {
			continuous = false;
		}

		if (!speed) {
			speed = 700;
		} else {
			speed = parseInt(speed);
		}

		slider = new swipe.Swipe(element, {
			speed: speed,
			startSlide: index,
			continuous: continuous,
			callback: function(index, el) {
				dispatcher.dispatch({
					type: 'slider-change-to',
					id: id,
					index: index
				});
			}
		});

		element.parentNode.classList.add('slider-initialized');

		items[id] = {
			id: id,
			element: element,
			initialized: false,
			index: index,
			slider:  slider,
			speed:   speed,
			updateQuery: updateQuery,
			bind: bind
		}

		dispatcher.dispatch({
			type: 'slider-add',
			id: id,
			continuous: continuous,
			total: total,
			index: index
		});

		if (index > 0) {
			slider.slide(index, 0);

			dispatcher.dispatch({
				type: 'slider-change-to',
				id: id,
				index: index
			});
		}
	}

	var _remove = function(items, item) {
		delete items[item.id];

		dispatcher.dispatch({
			type: 'slider-remove',
			id: item.id
		});
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


		elements = document.getElementsByClassName('view-slider');
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

		store.eventEmitter.subscribe(_handleChange);

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