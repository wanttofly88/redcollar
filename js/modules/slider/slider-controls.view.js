define(['dispatcher', 'slider/slider.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var idName = 'slider-control-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = store.getData();
		var checkItem = function(item) {
			var id = item.sliders[0];
			var storeItem = storeData.items[id];

			if (!storeItem) return;

			if (item.active && storeItem.index !== item.slide)  {
				item.active = false;
				item.element.classList.remove('active');
				item.element.classList.remove('viewed');
			}
			if (!item.active && storeItem.index === item.slide)  {
				item.active = true;
				item.element.classList.remove('viewed');
				item.element.classList.add('active');
			}
			if (storeItem.index > item.slide) {
				item.element.classList.add('viewed');
				item.element.classList.remove('active');
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

		if (!sliderString) {
			console.warn('data-sliders attribute is missing');
			return;
		}
		if (!slide) {
			console.warn('data-slide attribute is missing');
			return;
		}

		sliders = sliderString.split('||');
		slide = parseInt(slide);

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		element.addEventListener('click', function(e) {
			for (var i = sliders.length - 1; i >= 0; i--) {
				dispatcher.dispatch({
					type: 'slider-change-to',
					id: sliders[i],
					index: slide
				});
			}
		});

		items[id] = {
			id: id,
			element: element,
			sliders: sliders,
			slide: slide,
			active: false
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


		elements = document.getElementsByClassName('view-slider-control');
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