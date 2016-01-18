define(['dispatcher', 'resize/resize.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var idName = 'resize-element-id-';
	var idNum  = 1;


	var _handleChange = function() {

		var handleItem = function(item) {
			var cw, ch, ew, eh, cc, ec;
			var tmp;

			if (item.resize === 'none') return;
			cw = item.container.clientWidth;
			ch = item.container.clientHeight;
			cc = cw/ch;
			ew = item.element.width;
			eh = item.element.height;
			ec = ew/eh;

			if (item.resize === 'width' || (cc >= ec && item.resize === 'all')) {
				tmp = Math.floor(cw/ec);
				item.element.style.width = cw + 'px';
				item.element.style.height = 'auto';
				item.element.style.left = 'auto';
				item.element.style.top = Math.floor((ch - tmp)/2) + 'px';
			} else if (item.resize === 'height' || (cc < ec && item.resize === 'all')) {
				tmp = Math.floor(ch*ec);
				item.element.style.width = 'auto';
				item.element.style.height = ch + 'px';
				item.element.style.top = '0px';
				item.element.style.left = Math.floor((cw - tmp)/2) + 'px';
			}
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				handleItem(items[id]);
			}
		}

	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var container = element.parentNode;
		var resize = element.getAttribute('data-resize');
		if (!resize) resize = 'all';

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			resize: resize,
			element: element,
			container: container
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

		elements = document.getElementsByClassName('resize-element');
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