define(['dispatcher', 'resize/resize.store', 'scroll/scroll.store'], function(dispatcher, resizeStore, scrollStore) {

	"use strict";

	var items = {}

	var idName = 'project-hover-';
	var idNum  = 1;
	var number = 5;
	var transform;
	var cursor;
	var transform;
	var shown = false;
	var x = 0;
	var y = 0;
	var sc;

	var _hadleScroll = function() {
		sc = scrollStore.getData().top;
		_draw();
	}

	var _draw = function() {
		if (!cursor) return;
		cursor.style[transform] = 'translateX(' + x + 'px) translateY(' + (y) + 'px) translateZ(0px)';
	}

	var _show = function(item, e) {
		var wh = resizeStore.getData().height;

		if (!cursor) return;

		shown = true;
		cursor.classList.remove('hidden');
		
		x = e.clientX;
		y = e.clientY;

		_draw();
	}
	var _move = function(item, e) {
		var wh = resizeStore.getData().height;

		if (!cursor) return;
		if (!shown) return;

		cursor.classList.remove('hidden');

		x = e.clientX;
		y = e.clientY;

		_draw();
	}
	var _hide = function(item, e) {
		var wh = resizeStore.getData().height;

		if (!cursor) return;

		shown = false;

		cursor.classList.add('hidden');

		if (!e) return;

		x = e.clientX;
		y = e.clientY;

		_draw();
	}



	var _add = function(items, element) {
		var link   = element.getElementsByClassName('img')[0];
		var id = element.getAttribute('data-id');


		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			cursor: cursor,
			element: element
		}

		link.addEventListener('mouseenter', function(e) {
			_show(items[id], e);
		});
		link.addEventListener('mousemove', function(e) {
			_move(items[id], e);
		});
		link.addEventListener('mouseleave', function(e) {
			_hide(items[id], e);
		});
	}

	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		var elements;

		cursor = document.getElementById('cursor');

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


		elements = document.getElementsByClassName('project-preview');
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
		_hadleScroll();

		scrollStore.eventEmitter.subscribe(_hadleScroll);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_hide(false, false);
			}
			if (e.type === 'project-open') {
				if (items.hasOwnProperty(e.id)) {
					_hide(items[e.id])
				}
			}
		});
	}

	return {
		init: init
	}
});