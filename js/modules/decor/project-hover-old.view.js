define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'project-hover-';
	var idNum  = 1;
	var number = 5;
	var transform;

	var _show = function(item) {
		var coef;
		for (var i = 0; i < item.imgs.length; i++) {
			coef = -(i - number/2) * 0.03 + 1;
			item.imgs[i].style[transform] = 'scale(' + coef + ')';
		}
	}

	var _hide = function(item) {
		for (var i = 0; i < item.imgs.length; i++) {
			item.imgs[i].style[transform] = 'scale(1)';
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		var links = element.getElementsByTagName('a');
		var img = element.getElementsByClassName('img')[0];
		var parent;

		var newImg;
		var imgs = [];
		var bg;

		var addImage = function(i, image) {
			var img = image || document.createElement('div');
			var canvas;

			img.classList.add('img');
			img.style.backgroundImage = bg;
			img.style.zIndex = number - i;
			img.style.opacity = (i + 2)/(number + 1);

			imgs.push(img);
			parent.appendChild(img);
		}

		if (!img) {
			console.warn('img element is missing');
			return;
		}

		// imgs.push(img);
		// img.style.zIndex = number + 1;
		// img.style.opacity = 1/(number + 1);

		parent = img.parentNode;
		bg = img.style.backgroundImage;

		addImage(0, img)

		for (var i = 1; i < number; i++) {
			addImage(i);
		}

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			img: img,
			imgs: imgs,
			links: links,
			element: element
		}


		for (var i = 0; i < links.length; i++) {
			links[i].addEventListener('mouseenter', function(e) {
				_show(items[id]);
			});
			links[i].addEventListener('mouseleave', function(e) {
				_hide(items[id]);
			});
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


		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
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