define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {};
	var imgs = {};
	var active = false;
	var container;
	var lock = false;

	var _addItem = function(element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			console.warn('data-id attribute is missing');
			return;
		}

		items[id] = {
			id: id,
			element: element
		}
	}

	var _addImg = function(element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			console.warn('data-id attribute is missing');
			return;
		}

		if (!imgs.hasOwnProperty(id)) {
			imgs[id] = [];
		}

		imgs[id].push({
			id: id,
			element: element
		});
	}

	var _handleMouseEnter = function(id) {
		if (!imgs.hasOwnProperty(id)) return;
		if (lock) return;
		active = id;
		for (var i = 0; i < imgs[active].length; i++) {
			imgs[active][i].element.classList.add('active');
		}
		container.classList.add('hide-decor');
	}
	var _handleMouseLeave = function() {
		if (!imgs.hasOwnProperty(active)) return;
		if (lock) return;
		for (var i = 0; i < imgs[active].length; i++) {
			imgs[active][i].element.classList.remove('active');
		}
		container.classList.remove('hide-decor');
	}

	var _handleHover = function(item) {
		item.element.addEventListener('mouseenter', function(e) {
			_handleMouseEnter(item.id);
		});
		item.element.addEventListener('mouseleave', function(e) {
			_handleMouseLeave();
		});
	}

	var _handleMutate = function() {
		var elements = document.getElementsByClassName('menu-link');
		var imgElements = document.getElementsByClassName('menu-img');
		container  = document.getElementById('menu-container');

		if (!container) return;

		for (var i = 0; i < elements.length; i++) {
			_addItem(elements[i]);
		}
		for (var i = 0; i < imgElements.length; i++) {
			_addImg(imgElements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				_handleHover(items[id]);
			}
		}
	}

	var init = function() {
		_handleMutate();

		dispatcher.subscribe(function(e) {
			if (e.type === 'menu-hover-lock') {
				lock = true;
			}
			if (e.type === 'menu-hover-unlock') {
				lock = false;
				_handleMouseLeave();
			}
		});
	}

	return {
		init: init
	}
});