define(['dispatcher', 'router/router.store', 'scroll/scroll.store', 'page-transition/page-transition.store'], function(dispatcher, routerStore, scrollStore, transitionStore) {

	"use strict";

	var currentHref = false;
	var currentChangeType = 'normal';

	var _handleChange = function(storeData) {
		storeData = routerStore.getData();

		console.log(currentChangeType);

		if (currentChangeType === 'history') {
			currentChangeType = 'normal';
			return;
		}

		if (!currentHref) {
			currentHref = storeData.href;
			history.replaceState({
				href: currentHref
			}, false, currentHref);
			return;
		}

		// if (currentHref === storeData.href) return;
		currentHref = storeData.href;

		if (!Modernizr.history) return;

		history.pushState({
			href: currentHref
		}, false, currentHref);
	}

	var _handlePopState = function(event) {
		var scrolled = scrollStore.getData().top;
		var transitionData = transitionStore.getData();
		var href = event.state;
		if (!event.state) return;
		href = href.href;
		//наебем систему. после нативного скролла скроллим обратно
		window.scrollTo(0, scrolled);
		setTimeout(function() {
			window.scrollTo(0, scrolled);
		}, 0);

		if (typeof href === 'undefined') {
			location.reload();
		}

		if (transitionData.step1ready === false && transitionData.step2ready === false) {
			currentChangeType = 'history';

			dispatcher.dispatch({
				type: 'link-animation-start',
				animation: 'simple',
				scroll: 0,
				me: 'history-view'
			});
			dispatcher.dispatch({
				type: 'route-change',
				href: href,
				me: 'history-view'
			});
		}
	}

	var init = function() {
		_handleChange();

		routerStore.eventEmitter.subscribe(_handleChange);

		window.onpopstate = _handlePopState;
	}

	return {
		init: init
	}
});