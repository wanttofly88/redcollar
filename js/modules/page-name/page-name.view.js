define(['dispatcher', 'page-name/page-name.store', 'TweenMax'], function(dispatcher, store, TweenMax) {

	"use strict";

	var items = {}

	var idName = 'page-id-';
	var idNum  = 1;

	var container;
	var header;
	var containerWasActive = false;
	var active;
	var menuBtn, b2;
	var tween;

	var _handleChange = function(storeData) {
		var containerActive;
		storeData = store.getData();
		containerActive = storeData.containerActive;

		if (!header) return;

		if (items.hasOwnProperty(active)) {
			items[active].element.classList.remove('active');
		}
		active = storeData.active;
		if (items.hasOwnProperty(active)) {
			items[active].element.classList.add('active');
		}

		if (!containerWasActive && containerActive) {
			containerWasActive = true;
			header.classList.add('page-name-active');

			tween = TweenMax.to(b2, 0.3, {
				x: '-140px',
				width: '75px',
				opacity: '0'
			});
		} else if (containerWasActive && !containerActive) {
			containerWasActive = false;
			header.classList.remove('page-name-active');

			tween = TweenMax.to(b2, 0.3, {
				x: '0px',
				width: '27px',
				opacity: '1'
			});
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}

		if (element.classList.contains('active')) {
			dispatcher.dispatch({
				type: 'page-name-change',
				id: id
			});
		}

		items[id] = {
			id: id,
			element: element
		}
	}

	var _handleMutate = function() {
		var elements;

		elements  = document.getElementsByClassName('page-name');
		header    = document.getElementsByTagName('header')[0];
		menuBtn   = document.getElementById('menu-btn');

		if (!header || !menuBtn) {
			console.warn('don\'t fuck with my code!');
			return;
		};

		b2 = menuBtn.getElementsByClassName('b2')[0];

		for (var i = 0; i < elements.length; i++) {
			_add(items, elements[i]);
		}
	}

	var init = function() {
		_handleMutate();
		_handleChange();

		store.eventEmitter.subscribe(_handleChange);
	}

	return {
		init: init
	}
});