define(['dispatcher', 'router/router.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var idName = 'processed-link-id-';
	var idNum  = 1;

	var _handleChange = function(storeData) {
		var href;
		var checkItem = function(item) {
			if (href === item.element.href) {
				item.element.classList.add('link-active');
			} else {
				item.element.classList.remove('link-active');
			}
		}

		storeData = store.getData();
		href = storeData.href;

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var animation = element.getAttribute('data-animation');
		var href = element.getAttribute('href');
		var scroll = element.getAttribute('data-scroll');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		if (!animation) animation = 'simple';
		if (!scroll || scroll === 'false') {
			scroll = false;
		} else {
			scroll = true;
		}

		element.addEventListener('click', function(e) {
			var href = element.href;
			e.preventDefault();

			if (href === location.href) return;

			dispatcher.dispatch({
				type: 'link-animation-start',
				id: id,
				animation: animation,
				scroll: scroll,
				me: 'links-view'
			});
			dispatcher.dispatch({
				type: 'route-change',
				href: href,
				me: 'links-view'
			});
		});

		items[id] = {
			id: id,
			element: element,
			animation: animation
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

		elements = document.getElementsByClassName('inner-link');
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