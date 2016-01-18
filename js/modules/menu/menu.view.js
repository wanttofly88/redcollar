define(['dispatcher', 'menu/menu.store', 'page-name/page-name.store'], function(dispatcher, menuStore, pageNameStore) {

	"use strict";

	var menu;
	var header, body;
	var pageNameWasActive = false;

	var _preventScroll = function(e) {
		e.preventDefault();
	}

	var _handleChange = function(storeData) {
		storeData = menuStore.getData();

		if (!menu) return;

		if (storeData.active) {
			pageNameWasActive = pageNameStore.getData().containerActive;
			if (pageNameWasActive) {
				header.classList.remove('page-name-active');
			}
			menu.classList.add('active');
			body.classList.add('prevent-scroll');
			//fuck iphones. seriously. can't aplle stop showing off and make shit working
			body.addEventListener('touchmove', _preventScroll);
		} else {
			if (pageNameWasActive) {
				header.classList.add('page-name-active');
			}
			menu.classList.remove('active');
			body.classList.remove('prevent-scroll');
			body.removeEventListener('touchmove', _preventScroll);
		}
	}

	var _handleMutate = function() {
		menu   = document.getElementById('menu-container');
		header = document.getElementsByTagName('header');
		body   = document.getElementsByTagName('body')[0];
		if (!menu) {
			console.warn('menu-container element is missing');
			return;
		}
		if (!header) {
			console.warn('header element is missing');
			return;
		}
		header = header[0];
	}

	var init = function() {
		_handleMutate();
		_handleChange();

		menuStore.eventEmitter.subscribe(_handleChange);
	}

	return {
		init: init
	}
});