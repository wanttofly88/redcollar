define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'group-hover-id-';
	var idNum  = 1;

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var innerHovers;

		var handleInner = function(innerElement) {
			innerElement.addEventListener('mouseenter', function() {
				element.classList.add('group-hover-active');
				for (var i = 0; i < innerHovers.length; i++) {
					innerHovers[i].classList.add('hover');
				}
			});
			innerElement.addEventListener('mouseleave', function() {
				element.classList.remove('group-hover-active');
				for (var i = 0; i < innerHovers.length; i++) {
					innerHovers[i].classList.remove('hover');
				}
			});
		}

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		innerHovers = element.getElementsByClassName('group-hover-inner');

		for (var i = 0; i < innerHovers.length; i++) {
			handleInner(innerHovers[i]);
		}

		items[id] = {
			id: id,
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


		elements = document.getElementsByClassName('group-hover');
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

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
		});
	}

	return {
		init: init
	}
});