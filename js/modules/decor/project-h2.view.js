define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'project-h2-id-';
	var idNum  = 1;
	var transitionDuration;


	var _handleChange = function(storeData) {
		storeData = store.getData();
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var h2 = element.getElementsByTagName('h2');
		var decorContainer = document.createElement('span');
		var text;
		var letters = [];
		var chars;

		var addLetter = function(ch) {
			var char  = document.createElement('span');
			var bl    = document.createElement('span');
			var wh    = document.createElement('span');
			var fk    = document.createElement('span');
			var lt    = document.createElement('span');
			var whInner = document.createElement('span');

			var delay = Math.random()/1 + 0.2;

			fk.classList.add('fk');
			bl.classList.add('bl');
			wh.classList.add('wh');
			lt.classList.add('lt');

			fk.innerHTML = ch;
			bl.innerHTML = ch;
			whInner.innerHTML = ch;
			wh.appendChild(whInner);

			bl.style[transitionDuration] = delay + 's';
			wh.style[transitionDuration] = delay + 's';

			lt.appendChild(bl);
			lt.appendChild(wh);
			lt.appendChild(fk);
			h2.appendChild(lt);
		}

		if (!h2) return;
		h2 = h2[0];

		text  = h2.innerHTML;
		chars = text.split('');

		h2.innerHTML = ''

		// decorContainer.classList.add('decor');
		// h2.appendChild(decorContainer);

		for (var i = 0; i < chars.length; i++) {
			addLetter(chars[i]);
		}

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			h2: h2,
			element: element
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
		transitionDuration = Modernizr.prefixed('transition-duration');
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