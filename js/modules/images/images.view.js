define(['dispatcher', 'resize/breakpoint.store', 'touch/touch.store'], function(dispatcher, bpStore, touchStore) {

	"use strict";

	var items = {}

	var idName = 'adaptive-image-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = bpStore.getData();
		var bpName = storeData.breakpoint.name;
		var touchData = touchStore.getData();
		//костыль
		if (bpName === 'desktop' && touchData.isTouchDevice) {
			bpName = 'tablet';
		}

		var checkItem = function(item) {
			if (item.current === bpName) return;
			if (!item.sources.hasOwnProperty(bpName)) {
				console.warn('no source image for breakpoint ' + bpName);
				return;
			}

			item.current = bpName;

			if (item.element.tagName.toLowerCase() === 'img') {
				if (!item.listener) {
					item.listener = true;
					item.element.addEventListener('load', function() {
						dispatcher.dispatch({
							type: 'adaptive-image-load',
							id: item.id
						});
					});
					item.element.src = item.sources[bpName];
				}
			}

			if (item.element.tagName.toLowerCase() !== 'img') {
				if (!item.img) {
					item.img = document.createElement('img');
				}
				if (!item.listener) {
					item.listener = true;
					item.img.addEventListener('load', function() {
						dispatcher.dispatch({
							type: 'adaptive-image-load',
							id: item.id
						});
						item.element.style.backgroundImage = 'url(' + item.sources[bpName] + ')';
					});
					item.img.src = item.sources[bpName];
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
		var id = element.getAttribute('data-preload-id');

		var desktop = element.getAttribute('data-desktop-src');
		var tablet  = element.getAttribute('data-tablet-src');
		var mobile  = element.getAttribute('data-mobile-src');

		if (!tablet) {
			tablet = desktop;
		}
		if (!mobile) {
			mobile = tablet;
		}
		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-preload-id', id);
		}

		dispatcher.dispatch({
			type: 'adaptive-image-add',
			id: id
		});

		items[id] = {
			id: id,
			element: element,
			listener: false,
			fakeImg: false,
			sources: {
				desktop: desktop,
				tablet:  tablet,
				mobile:  mobile
			},
			current: false
		}
	}

	var _remove = function(items, item) {

		dispatcher.dispatch({
			type: 'adaptive-image-remove',
			id: item.id
		});

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

		elements = document.getElementsByClassName('adaptive-image');
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

		bpStore.eventEmitter.subscribe(_handleChange);

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