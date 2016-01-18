define(['dispatcher', 'resize/resize.store', 'scroll/scroll.store'], function(dispatcher, resizeStore, scrollStore) {

	"use strict";
	var stageElement;
	var l1, l2;
	var num = 0;
	var gradient = [];
	var transform = Modernizr.prefixed('transform');
	var wh;


	var _handleScroll = function() {
		var scrollPos = scrollStore.getData().top;
		if (!l1) return;
		l1.style[transform] = 'translateY(' + (-scrollPos*2) + 'px) translateZ(0px)';
	}

	var _handleResize = function() {
		wh = resizeStore.getData().height;
	}

	var _handleMutate = function() {
		var buildGradient = function() {
			var gradientString;
			var projects = document.getElementsByClassName('color-bg-control');
			var color;
			var div;

			gradient = [];

			for (var i = 0; i < projects.length; i++) {
				color = projects[i].getAttribute('data-color');
				gradient.push(color);
			}
			num = projects.length;

			l1.style.height = (num*2 - 1)*100 + '%';
			gradientString = 'linear-gradient(to bottom';

			for (var i = 0; i < gradient.length; i++) {
				gradientString += ', ' + gradient[i] + ', ' + gradient[i]; 
			}

			gradientString += ')';

			l1.style.background = gradientString;

		}

		stageElement = document.getElementById('stage-color-bg');
		if (!stageElement) return;

		l1 = stageElement.getElementsByClassName('l1')[0];

		buildGradient();
	}

	var init = function() {
		_handleMutate();
		_handleResize();
		_handleScroll();

		resizeStore.eventEmitter.subscribe(_handleResize);
		resizeStore.eventEmitter.subscribe(_handleScroll);
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