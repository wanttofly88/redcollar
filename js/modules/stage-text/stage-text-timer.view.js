define(['dispatcher', 'svg-text/svg-text.store', 'scroll/scroll.store', 'resize/resize.store'], function(dispatcher, store, scrollStore, resizeStore) {

	"use strict";

	var items = []

	var current = 0;
	var active  = false;
	var interval;
	var disabled = false;


	var _handleInterval = function() {
		if (!items || !items.length) return;

		if (disabled) return;

		dispatcher.dispatch({
			type: 'svg-text-change',
			id: 'stage-svg-text',
			text: items[current].text
		});
		
		current++;
		if (current >= items.length) {
			current = 0;
		}
	}

	var _handleScroll = function() {
		var scrolled = scrollStore.getData().top;
		var wh = resizeStore.getData().height;

		if (scrolled < wh/2 && !active) {
			active = true;
			_handleInterval();
			clearInterval(interval);
			interval = setInterval(_handleInterval, 3000);
		}
		if (scrolled >= wh/2 && active) {
			active = false;
			clearInterval(interval);
		}
	}

	var _add = function(element) {
		var text = element.innerHTML;

		items.push({
			element: element,
			text: text
		});
	}

	var _destroy = function() {
		clearInterval(interval);
		items = [];
	}

	var _handleMutate = function() {
		var elements = document.getElementsByClassName('main-word-item');
		if (!elements || !elements.length) {
			_destroy();
			return;
		}

		current = 0;
		active  = false;

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i]);
		}
	}

	var init = function() {
		_handleMutate();

		scrollStore.eventEmitter.subscribe(_handleScroll);
		_handleScroll();

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				setTimeout(function() {
					_handleMutate();
					_handleScroll();
				}, 0);
			}
			if (e.type === 'words-scroll-disable') {
				disabled = true;
			}
			if (e.type === 'words-scroll-enable') {
				disabled = false;
			}
		});
	}

	return {
		init: init
	}
});