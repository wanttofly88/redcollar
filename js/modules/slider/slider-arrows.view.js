define(['dispatcher', 'slider/slider.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var idName = 'slider-arrow-id-';
	var idNum  = 1;

	var _handleChange = function() {
		var storeData = store.getData();

		var checkItem = function(item) {
			var id;
			var itemData;

			id = item.sliders[0];

			if (!storeData.items.hasOwnProperty(id)) return;

			itemData = storeData.items[id];

			if (!item.hidden && item.slide === 'prev' && itemData.index === 0) {
				item.hidden = true;
				item.element.classList.add('hidden');
			} else if (item.hidden && item.slide === 'prev' && itemData.index !== 0) {
				item.hidden = false;
				item.element.classList.remove('hidden');
			}

			if (!item.hidden && item.slide === 'next' && itemData.index === itemData.total) {
				item.hidden = true;
				item.element.classList.add('hidden');
			} else if (item.hidden && item.slide === 'next' && itemData.index !== itemData.total) {
				item.hidden = false;
				item.element.classList.remove('hidden');
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

		var sliderString = element.getAttribute('data-sliders');
		var sliders;
		var slide = element.getAttribute('data-slide');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		if (!sliderString) {
			console.warn('data-sliders attribute is missing');
			return;
		}

		if (!slide) {
			console.warn('data-slide attribute is missing');
			return;
		}

		sliders = sliderString.split('||');

		element.addEventListener('click', function() {
			for (var i = sliders.length - 1; i >= 0; i--) {
				dispatcher.dispatch({
					type: 'slider-change-' + slide,
					id: sliders[i]
				});
			}
		}, false);

		items[id] = {
			id: id,
			sliders: sliders,
			slide: slide,
			hidden: false,
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


		elements = document.getElementsByClassName('view-slider-arrow');
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
				setTimeout(function() {
					_handleMutate();
					_handleChange();
				}, 0);
			}
		});
	}

	return {
		init: init
	}
});