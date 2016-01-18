define([
	'dispatcher', 
	'scroll/scroll.store', 
	'resize/resize.store', 
	'utils', 
	'trigger/trigger.store', 
	'preload/preload.store',
	'images/images.store'
], function(
	dispatcher, 
	scrollStore, 
	resizeStore, 
	utils, 
	triggerStore, 
	preloadStore,
	imagesStore
) {

	"use strict";

	var items = {}

	var idName = 'scroll-trigger-id-';
	var idNum  = 1;

	var wh;

	var virtualScroll = 0;
	var requestAnimationFrame;
	var scrolled;
	var scrolldWHeight;
	var helper;

	var preloaded = false;
	var animating = false;

	var _handleScroll = function() {
		var storeData = scrollStore.getData();
		scrolled  = storeData.top;
		scrolldWHeight = scrolled + wh;
	}

	var _handleVirtualScroll = function() {
		if (helper) {
			helper.style.top = virtualScroll + 'px';
		}
		var checkItem = function(item) {
			var offset = utils.offset(item.element).top;
			// console.log(virtualScroll - 50, item.offset);

			item.offset = offset;

			var trigger = function() {
				if (item.triggered) return;
				item.triggered = true;
				dispatcher.dispatch({
					type: 'trigger-element',
					id: item.id,
					me:   'scroll-trigger'
				});
			}
			var untrigger = function() {
				if (!item.triggered) return;
				item.triggered = false;
				dispatcher.dispatch({
					type: 'untrigger-element',
					me:   'scroll-trigger',
					id: item.id
				});
			}

			// if (item.pos === 'middle') {
			// 	if (virtualScroll - item.height/2 + wh/2 > item.offset) {
			// 		trigger();
			// 	}
			// 	if (virtualScroll - item.height/2 + wh/2 <= item.offset) {
			// 		untrigger();
			// 	}
			// }

			// if (item.pos === 'top') {
			// 	if (virtualScroll - 50 > item.offset) {
			// 		trigger();
			// 	}
			// 	if (virtualScroll - 50 <= item.offset) {
			// 		untrigger();
			// 	}
			// }

			if (item.pos === 'bottom') {
				if (virtualScroll - 50 > item.offset) {
					trigger();
				}
				if (virtualScroll - 50 <= item.offset) {
					untrigger();
				}
			}
		}

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	var _loop = function() {
		if (!animating) return;

		if (virtualScroll !== scrolldWHeight) {
			scrolldWHeight = Math.floor(scrolldWHeight);
			virtualScroll = Math.floor(virtualScroll);
			virtualScroll = virtualScroll + (scrolldWHeight - virtualScroll)/20;

			_handleVirtualScroll();
		}

		requestAnimationFrame(_loop);
	}

	var _handleResize = function() {
		var checkItem = function(item) {
			var offset = utils.offset(item.element).top;
			var height = item.element.clientHeight;

			item.height = height;
			item.offset = offset;
		}

		wh = resizeStore.getData().height;
		scrolldWHeight = scrolled + wh;

		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				checkItem(items[id]);
			}
		}
	}

	// var _handlePreload = function() {
	// 	var storeData = preloadStore.getData();

	// 	if (preloaded) return;
	// 	if (storeData.complete) {

	// 		preloaded = true;


	// 	}
	// }


	var _add = function(items, element) {
		var id = element.getAttribute('data-trigger-id');
		var offset = utils.offset(element).top;
		var height = element.clientHeight;
		var triggered = false;
		var pos    = element.getAttribute('data-pos') || 'bottom';
		var shift  = element.getAttribute('data-shift');

		if (!shift) shift = 0;
		shift = parseInt(shift);

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-trigger-id', id);
		}

		dispatcher.dispatch({
			type: 'trigger-element-add',
			id: id
		});

		items[id] = {
			id: id,
			element: element,
			height: height,
			offset: offset,
			pos: pos,
			shift: shift,
			triggered: false
		}
	}

	var _remove = function(items, item) {
		dispatcher.dispatch({
			type: 'trigger-element-remove',
			id: item.id
		});

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

		elements = document.getElementsByClassName('scroll-trigger');
		for (var i = 0; i < elements.length; i++) {
			check(items, elements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				backCheck(items, elements, items[id]);
			}
		}

		animating = true;
		setTimeout(function() {
			//let's get the party started
			_loop();
		}, 0);
	}

	var init = function() {
		_handleMutate();
		helper = document.getElementById('scroll-helper');

		virtualScroll = 0;
		requestAnimationFrame = utils.getRequestAnimationFrame();

		// preloadStore.eventEmitter.subscribe(_handlePreload);

		_handleResize();
		_handleScroll();
		imagesStore.eventEmitter.subscribe(_handleResize);
		resizeStore.eventEmitter.subscribe(_handleResize);
		scrollStore.eventEmitter.subscribe(_handleScroll);

		// setTimeout(function() {
		// 	_handleResize();
		// }, 1000);

		dispatcher.subscribe(function(e) {
			if (e.type === 'link-animation-start') {
				virtualScroll = 0;
				animating = false;
			}
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