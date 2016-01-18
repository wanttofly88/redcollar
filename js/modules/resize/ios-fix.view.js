define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {

	"use strict";

	var mobileSafari = false;

	// var fixViewportHeight = function() {
	// 	document.documentElement.style.height = window.innerHeight + "px";
	// 	if (document.body.scrollTop !== 0) {
	// 		window.scrollTo(0, 0);
	// 	}
	// }

	var _handleResize = function() {
		document.documentElement.style.height = (window.innerHeight) + 'px';
		document.body.style.height = (window.innerHeight) + 'px';
	}

	var debounceFix = (function() {
		var timeWindow = 500;
		var timeout;
	
		var debounceFix = function(args) {
			fixViewportHeight();
		}
	
		return function() {
			var context = this;
			var args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				debounceFix.apply(context, args);
			}, timeWindow);
		};
	}());

	var init = function() {
		// var nVer = navigator.appVersion;
		var userAgent = navigator.userAgent;
		if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
			if (userAgent.indexOf('Safari') !== -1) {
				mobileSafari = true;
			}
		}

		if (mobileSafari) {
			resizeStore.eventEmitter.subscribe(_handleResize);
			_handleResize();

			// document.body.style.webkitTransform = "translate3d(0,0,0)";
		}
	}

	return {
		init: init
	}
});