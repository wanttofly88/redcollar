define(['dispatcher', 'menu/menu.store'], function(dispatcher, menuStore) {

	"use strict";

	var header;
	var menuActive = false;
	var pageColor  = false;
	var currentScheme = false;
	var scheme = false;
	var body;

	var _handleChange = function() {
		if (!header) return;

		if (menuActive) {
			scheme = 'dark';
		} else {
			scheme = pageColor;
		}

		if (scheme === currentScheme) return;
		currentScheme = scheme;

		if (scheme === 'dark') {
			header.classList.remove('light');
			header.classList.add('dark');
		} else if (scheme === 'light') {
			header.classList.remove('dark');
			header.classList.add('light');
		}
	}

	var _handlePageChange = function(e) {
		if (e.color === 'dark') {
			pageColor = 'dark';
			body.style.background = '#1c2227';
		} else if (e.color === 'light') {
			pageColor = 'light';
			body.style.background = '#ffffff';
		}

		_handleChange();
	}

	var _handleMenuChange = function(storeData) {
		storeData  = menuStore.getData();
		menuActive = storeData.active;

		_handleChange();
	}

	var _handleMutate = function() {
		header = document.getElementsByTagName('header')[0];
		body = document.getElementsByTagName('body')[0];

		if (!header) {
			console.warn('header is missing. somehow..');
			return;
		}

		if (header.classList.contains('dark')) {
			pageColor = 'dark';
		}
		if (header.classList.contains('light')) {
			pageColor = 'light';
		}
	}

	var init = function() {
		_handleMutate();
		_handleMenuChange();

		menuStore.eventEmitter.subscribe(_handleMenuChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'page-color-change') {
				_handlePageChange(e);
			}
		});
	}

	return {
		init: init
	}
});