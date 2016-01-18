define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'input-id-';
	var idNum  = 1;


	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		element.addEventListener('focus', function() {
			element.parentNode.classList.remove('error');
			element.parentNode.classList.add('focus');
		}, false);
		element.addEventListener('blur', function() {
			element.parentNode.classList.remove('focus');
		}, false);

		element.addEventListener('keyup', function() {
			if (element.value) {
				element.parentNode.classList.add('not-empty');
			} else {
				element.parentNode.classList.remove('not-empty');
			}
		}, false);

		if (!id) {
			id = idName + idNum;
			idNum++;
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

		var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
		var textareas = Array.prototype.slice.call(document.getElementsByTagName('textarea'));

		elements = inputs.concat(textareas);
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