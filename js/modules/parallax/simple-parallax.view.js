define(['dispatcher', 'scroll/scroll.store', 'resize/resize.store'], function(dispatcher, scrollStore, resizeStore) {

	"use strict";

	var items = {}

	var idName = 'simple-parallax-id-';
	var idNum  = 1;

	var duration;

	var transform;

	var _handleScroll = function() {
		var scrolled = scrollStore.getData().top;

		var handleItem = function(item) {
			if (item.type === 'type-1') {
				items[id].element.style.opacity = (duration - scrolled)/duration;
			}
			if (item.type === 'type-2') {
				items[id].element.style.opacity = (duration - scrolled)/duration;
				items[id].element.style[transform] = 'translateY(' + -scrolled/2 + 'px)';
			}
			if (item.type === 'type-3') {
				items[id].element.style[transform] = 'scaleY(' + (1 + (1 - (duration - scrolled)/duration)*15) + ')';
				items[id].element.style.opacity = (duration - scrolled*2)/duration;
			}
		}

		if (scrolled > duration) {
			scrolled = duration;
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				handleItem(items[id]);
			}
		}
	}

	var _handleResize = function() {
		duration = resizeStore.getData().height/1.2;
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var type = element.getAttribute('data-parallax-type');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element,
			type: type
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

		elements = document.getElementsByClassName('simple-parallax');
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
		transform = Modernizr.prefixed('transform');

		_handleMutate();
		_handleResize();
		_handleScroll();

		scrollStore.eventEmitter.subscribe(_handleScroll);
		resizeStore.eventEmitter.subscribe(_handleResize);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleResize();
				_handleScroll();
			}
		});
	}

	return {
		init: init
	}
});