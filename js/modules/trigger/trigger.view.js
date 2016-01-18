define(['dispatcher', 'trigger/trigger.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var idName = 'trigger-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = store.getData();

		var checkItem = function(item) {
			if (!storeData.items.hasOwnProperty(item.id)) return;
			if (item.triggered === storeData.items[item.id].triggered) return;

			item.triggered = storeData.items[item.id].triggered;

			if (item.triggered) {
				item.element.classList.add('triggered');
				item.element.classList.add('triggered-once');
			} else {
				item.element.classList.remove('triggered');
			}
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-trigger-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-trigger-id', id);
		}

		items[id] = {
			id: id,
			element: element,
			triggered: false
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

		elements = document.getElementsByClassName('triggerable');
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