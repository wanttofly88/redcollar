define(['dispatcher', 'scroll/scroll.store', 'resize/resize.store'], function(dispatcher, scrollStore, resizeStore) {

	"use strict";

	var container;
	var elements  = [];
	var active = false;
	var wh;
	var ph;
	var btnActive = true;
	var btn;
	var total;

	var _handleScroll = function() {
		var scrolled = scrollStore.getData().top;
		var scrolledScreens = Math.floor((scrolled + wh/2)/wh);

		if (scrolled + wh + 10 >= ph && btnActive) {
			btnActive = false;
			if (btn) {
				btn.classList.add('hidden');
			}
		}
		if (scrolled + wh + 10 < ph && !btnActive) {
			btnActive = true;
			if (btn) {
				btn.classList.remove('hidden');
			}
		}

		if (scrolledScreens === active) return;
		active = scrolledScreens;

		for (var i = 0; i < scrolledScreens - 1; i++) {
			if (elements[i]) {
				elements[i].classList.add('viewed');
				elements[i].classList.remove('active');
			}
		}
		if (elements[active - 1]) {
			elements[active - 1].classList.add('active');
			elements[active - 1].classList.remove('viewed');
		}
		for (var i = active; i < elements.length; i++) {
			if (elements[i]) {
				elements[i].classList.remove('viewed');
				elements[i].classList.remove('active');
			}
		}
	}

	var _handleResize = function() {
		// var pw = document.getElementsByClassName('page-wrapper')[0];
		// ph = pw.clientHeight;
		wh = resizeStore.getData().height;
		ph = wh*(total + 1);
	}

	var _add = function(element, i) {
		element.addEventListener('click', function(e) {
			dispatcher.dispatch({
				type: 'scroll-to',
				position: wh*(i + 1)
			});
		});
	}

	var _handleBtn = function(btn) {
		btn.addEventListener('click', function() {
			var scrolled = scrollStore.getData().top;
			var scrolledScreens = Math.floor(scrolled/wh);

			if (btn.classList.contains('hidden')) {
				return;
			}

			scrolledScreens++;
			dispatcher.dispatch({
				type: 'scroll-to',
				position: scrolledScreens*wh
			});
		});
	}

	var _handleMutate = function() {
		var sidenav = document.getElementsByClassName('sidenav')[0];

		if (sidenav === container) return;
		container = sidenav;
		active    = false;
		elements  = [];
		btnActive = true;
		btn       = false;

		if (!container) return;

		elements = container.getElementsByClassName('item');
		total = elements.length;

		btn = container.getElementsByClassName('scroll-link')[0];
		_handleBtn(btn);

		for (var i = 0; i < elements.length; i++) {
			elements[i].style.height = 100/total + '%';
		}

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i], i);
		}
	}

	var init = function() {
		_handleMutate();
		_handleResize();
		_handleScroll();

		scrollStore.eventEmitter.subscribe(_handleScroll);
		resizeStore.eventEmitter.subscribe(_handleResize);
		resizeStore.eventEmitter.subscribe(_handleScroll);

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