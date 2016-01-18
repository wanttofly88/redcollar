define(['dispatcher', 'skrollr', 'utils'], function(dispatcher, skrollr, utils) {

	"use strict";
	var instance;
	var firstScrollCurrent = false;


	var _handleChange = function() {
	}

	var init = function() {
		// var isTouchDevice = 'ontouchstart' in document.documentElement;

		// if (Modernizr && !Modernizr.opacity) return;
		// if (isTouchDevice) return;

		instance = skrollr.init({
			forceHeight: false,
			smoothScrolling: true,
			smoothScrollingDuration: 1200,
			mobileCheck: function() {
				return false;
			}
		});


		dispatcher.subscribe(function(e) {
			var pos;
			var speed = 500;
			if (e.type === 'scroll-to') {
				if (e.hasOwnProperty('speed') && typeof e.speed === 'number') {
					speed = e.speed*1000;
				}
				if (e.hasOwnProperty('position') && typeof e.position === 'number') {
					pos = e.position;
					instance.animateTo(pos, {
						duration: speed,
						easing: 'outCubic'
					});
				} else if (e.hasOwnProperty('element')) {
					pos = utils.offset(e.element).top;
					instance.animateTo(pos, {
						duration: speed,
						easing: 'outCubic'
					});
				}
			}

			if (e.type === 'mutate') {
				instance.refresh();
				setTimeout(function() {
					var evt = document.createEvent('UIEvents');
					evt.initUIEvent('scroll', true, false, window, 0);
					window.dispatchEvent(evt);
					instance.refresh();
				}, 1500);
			}
 		});
	}

	return {
		init: init
	}
});