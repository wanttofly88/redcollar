define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {

	"use strict";

	var items = {}

	var idName = 'share-id-';
	var idNum  = 1;

	var _handleChange = function() {
		var storeData = store.getData();
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element
		}

		element.addEventListener('click', function(e) {
			var wh = resizeStore.getData().height;
			var ww = resizeStore.getData().width;
			var top, left;
			var width  = 600;
			var height = 400;

			e.preventDefault();

			top  = (wh - height)/2;
			left = (ww - width)/2;

			window.open(element.href,'Share','top=' + top + ',left=' + left + ',width=' + width + ',height=' + height + '');
		});
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


		elements = document.getElementsByClassName('view-share');
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