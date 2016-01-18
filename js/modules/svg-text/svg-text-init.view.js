define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'svg-text-i-';
	var idNum  = 1;

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var text = element.getAttribute('data-default');
		if (!text) text = '';

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}

		dispatcher.dispatch({
			type: 'svg-text-change',
			id: id,
			text: text
		});

		items[id] = {
			id: id,
			text: text,
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