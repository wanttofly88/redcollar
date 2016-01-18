define(['dispatcher', 'scroll/scroll.store', 'resize/resize.store', 'utils'], function(dispatcher, scrollStore, resizeStore, utils) {

	"use strict";

	var idName = 'page-name-scroll-id-';
	var idNum  = 1;

	var anchorElement;
	var offset;
	var wh;

	var active = false;

	var _handleResize = function() {
		if (!anchorElement) return;

		wh = resizeStore.getData().height;
		offset = utils.offset(anchorElement).top;
	}
	var _handleScroll = function() {
		var scrollData = scrollStore.getData();

		if (!anchorElement) return;

		if (scrollData.top > offset - wh/2 && !active) {
			active = true;
			dispatcher.dispatch({
				type: 'page-name-change',
				id: 'projects'
			});
		}
		if (scrollData.top <= offset - wh/2 && active) {
			active = false;
			dispatcher.dispatch({
				type: 'page-name-change',
				id: false
			});
		}
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element
		}
	}

	var _remove = function(item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		var anchorElements = document.getElementsByClassName('project-name-scroll');
		active = false;

		if (!anchorElements || !anchorElements.length) {
			anchorElement = false;
			return;
		}
		anchorElement = anchorElements[0];
	}

	var init = function() {
		_handleMutate();
		_handleResize();
		_handleScroll();

		resizeStore.eventEmitter.subscribe(_handleResize);
		scrollStore.eventEmitter.subscribe(_handleScroll);

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