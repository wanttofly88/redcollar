define(['dispatcher', 'scroll/scroll.store', 'resize/resize.store', 'utils', 'images/images.store'], function(dispatcher, scrollStore, resizeStore, utils, imagesStore) {

	"use strict";

	var offset;
	var loading = false;
	var element;
	var wh;
	var id;
	var animation = 'project';
	var href;
	var scroll = false;
	var prevScroll = false;

	var _handleScroll = function() {
		var scrolled = scrollStore.getData().top;
		if (loading) return;
		if (!element) return;

		if (!prevScroll) prevScroll = scrolled;

		if (scrolled > offset - wh/5 && scrolled > prevScroll) {
			loading = true;

			dispatcher.dispatch({
				type: 'link-animation-start',
				id: id,
				animation: animation,
				scroll: scroll,
				me: 'links-view'
			});
			dispatcher.dispatch({
				type: 'route-change',
				href: href,
				me: 'links-view'
			});
		}

		prevScroll = scrolled;
	}

	var _handleResize = function() {
		if (!element) return;
		wh = resizeStore.getData().height;
		offset = utils.offset(element).top;
	}

	var _handleMutate = function() {
		var a;
		element = document.getElementsByClassName('scroll-route')[0];

		id = false;
		href    = false;

		// loading = false;

		setTimeout(function() {
			loading = false;
		}, 2000);

		if (!element) return;

		a = element.getElementsByTagName('a')[0];
		if (!a) return;

		id = a.getAttribute('data-id');
		href = a.href;
	}

	var init = function() {
		setTimeout(function() {
			_handleMutate();
			_handleResize();
			_handleScroll();

			scrollStore.eventEmitter.subscribe(_handleScroll);
			resizeStore.eventEmitter.subscribe(_handleResize);
			imagesStore.eventEmitter.subscribe(_handleResize);

			dispatcher.subscribe(function(e) {
				if (e.type === 'mutate') {
					_handleMutate();
					_handleResize();
					_handleScroll();
				}
				if (e.type === 'link-animation-start') {
					loading = true;
				}
			});
		}, 100);
	}

	return {
		init: init
	}
});