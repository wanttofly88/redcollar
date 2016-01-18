define(['dispatcher', 'trigger/trigger.store', 'preload/preload.store'], function(dispatcher, store, preloadStore) {

	"use strict";

	var items = {}

	var preloadComplete = false;

	var idName = 'timer-trigger-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = store.getData();
		var handle = function(item) {
			setTimeout(function() {
				dispatcher.dispatch({
					type: 'element-trigger',
					me: 'timer-trigger',
					id: item.id
				});
			}, item.timeout);
		}

		var storeData = preloadStore.getData();

		if (storeData.complete === false) {
			preloadComplete = true;

			for (var id in items) {
				if (items.hasOwnProperty(id)) {
					handle(items[id]);
				}
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-trigger-id');
		var timeout = element.getAttribute('data-timer');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-trigger-id', id);
		}

		if (!timeout) {
			timeout = 1000;
		} else {
			timeout = parseInt(timeout);
		}

		items[id] = {
			id: id,
			element: element,
			timeout: timeout
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

		elements = document.getElementsByClassName('className');
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