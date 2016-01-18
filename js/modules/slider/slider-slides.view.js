define(['dispatcher', 'slider/slider.store'], function(dispatcher, sliderStore) {

	"use strict";

	var items = {}

	var idName = 'slider-slides-id-';
	var idNum  = 1;

	var _handleChange = function() {
		var storeData = sliderStore.getData();

		var checkItem = function(item) {
			var id = item.id;
			var itemData = storeData.items[id];

			if (!itemData) {
				console.warn('slider with id ' + id + ' is missing');
				return;
			}

			if (item.current === itemData.index) return;
			item.current = itemData.index;

			for (var i = 0; i < item.slides.length; i++) {
				if (i < item.current) {
					item.slides[i].classList.remove('to-right');
					item.slides[i].classList.remove('to-center');
					item.slides[i].classList.add('to-left');
				}
				if (i === item.current) {
					item.slides[i].classList.remove('to-right');
					item.slides[i].classList.add('to-center');
					item.slides[i].classList.remove('to-left');
				}
				if (i > item.current) {
					item.slides[i].classList.add('to-right');
					item.slides[i].classList.remove('to-center');
					item.slides[i].classList.remove('to-left');
				}
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
		var slides = element.getElementsByClassName('slide');
		var currentSlide = false;

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element,
			current: currentSlide,
			slides: slides
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

		sliderStore.eventEmitter.subscribe(_handleChange);

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