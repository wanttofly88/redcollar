define(['dispatcher', 'utils', 'TweenMax', 'scroll/scroll.store'], function(dispatcher, utils, TweenMax, scrollStore) {

	"use strict";

	var _scroll = function(e) {
		var speed = 0.6;
		var pos;

		var animate = function() {
			var obj = {
				y: 0
			}
			var scrollPos = scrollStore.getData().top;
			obj.y = scrollPos;

			TweenMax.to(obj, speed, {
				y: pos,
				ease:Sine.easeInOut,
				onUpdate: function() {
					window.scrollTo(0, obj.y);
				}
			});
		}

		if (e.hasOwnProperty('speed') && typeof e.speed === 'number') {
			speed = e.speed;
		}
		if (e.hasOwnProperty('position') && typeof e.position === 'number') {
			pos = e.position;
			animate();
		} else if (e.hasOwnProperty('element')) {
			pos = utils.offset(e.element).top;
			animate();
		}
	}

	var init = function() {
		dispatcher.subscribe(function(e) {
			if (e.type === 'scroll-to') {
				_scroll(e);
			}
		});
	}

	return {
		init: init
	}
});