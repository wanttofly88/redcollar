define(['dispatcher', 'page-name/page-name.store'], function(dispatcher, store) {

	"use strict";

	var active = false;
	var container;

	var _handleChange = function() {
		var id = store.getData().active;
		if (!container) return;

		if (id === 'projects' && !active) {
			active = true;
			container.classList.add('visible');
		}

		if (id !== 'projects' && active) {
			active = false;
			container.classList.remove('visible');
		}
	}

	var _handleMutate = function() {
		var sidenav = document.getElementsByClassName('sidenav')[0];

		if (sidenav === container) return;
		active = false;
		container = sidenav;

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