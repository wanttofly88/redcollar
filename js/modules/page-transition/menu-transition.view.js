define(['dispatcher', 'TweenMax', 'page-transition/page-transition.store', 'resize/resize.store', 'utils'], function(dispatcher, TweenMax, store, resizeStore, utils) {

	"use strict";

	var body;

	var idName = 'menu-load-id-';
	var idNum  = 1;

	var animation = false;
	var preloaderElement;
	var preloaderBg;
	var transform;
	var scroll;

	var requestAnimationFrame;
	var loopActive = false;
	var loopImgs = [];
	var loopImgActive = 0;
	var frame = 0;

	var _preventScroll = function(e) {
		e.preventDefault();
	}

	var _animate = function() {
		for (var i = 0; i < loopImgs.length; i++) {
			loopImgs[i].style.opacity = 0;
		}

		var loop = function() {
			if (!loopActive) return;

			frame++;

			if (frame % 8 === 0) {
				loopImgs[loopImgActive].style.opacity = 0;

				loopImgActive++;
				if (loopImgActive >= loopImgs.length) {
					loopImgActive = 0;
				}

				loopImgs[loopImgActive].style.opacity = 1;
			}

			requestAnimationFrame(loop);
		}

		loop();
	}

	var _animateStep1 = function(e) {
		var tl;
		var imgs = document.getElementById('preload-imgs');
		scroll = e.scroll;

		if (!imgs) {
			console.warn('imgs elemeny is missing');
			return;
		}

		animation = e.animation;
		if (animation !== 'menu') return;

		tl = new TimelineLite();

		dispatcher.dispatch({
			type: 'svg-text-change',
			id: 'simple-preloader-text',
			text: 'menu'
		});

		tl.to(preloaderElement, 0, {
			opacity: 0
		});
		tl.to(preloaderElement, 0.6, {
			onStart: function() {
				loopActive = true;
				_animate();
				body.classList.add('prevent-scroll');
				body.addEventListener('touchmove', _preventScroll);
				preloaderElement.style.display = 'block';
			},
			opacity: 1,
			onComplete: function() {
				dispatcher.dispatch({
					type: 'transition-step-1',
					animation: 'menu'
				});
			}
		});
		tl.to(imgs, 0, {
			opacity: 1
		}, '-=0.3');
	}

	var _animateStep2 = function() {
		var l1svg = document.getElementById('simple-preloader-text');
		var tl;
		var wh = resizeStore.getData().height;
		var pw = document.getElementsByClassName('page-wrapper')[0];

		tl = new TimelineLite();

		if (animation !== 'menu') return;

		dispatcher.dispatch({
			type: 'menu-close'
		});

		if (scroll) {
			window.scrollTo(0, wh);
		} else {
			window.scrollTo(0, 0);
		}

		tl.to(l1svg, 0.6, {
			onStart: function() {
				pw.classList.remove('transition-animation-complete');
			},
			onComplete: function() {
				dispatcher.dispatch({
					type: 'transition-step-2',
					animation: 'menu'
				});
			},
			opacity: 0
		});

		// dispatcher.dispatch({
		// 	type: 'transition-step-2',
		// 	animation: 'menu'
		// });
	}

	var _animateStep3 = function() {
		var l1svg = document.getElementById('simple-preloader-text');
		var tl;
		var imgs = document.getElementById('preload-imgs');
		var pw = document.getElementsByClassName('page-wrapper')[0];

		tl = new TimelineLite();

		if (animation !== 'menu') return;

		var storeData = store.getData();
		var scheme    = storeData.scheme;
		var pageName  = storeData.pageNameId;
		var text      = storeData.text;
		var color     = storeData.color;
		var firstProjectText = storeData.projectText;

		if (scroll) {
			dispatcher.dispatch({
				type: 'svg-text-change',
				id:   'simple-preloader-text',
				text: firstProjectText
			});
		} else {
			dispatcher.dispatch({
				type: 'svg-text-change',
				id:   'simple-preloader-text',
				text: text
			});
		}

		dispatcher.dispatch({
			type: 'page-name-change',
			id:   false
		});
		dispatcher.dispatch({
			type:  'page-color-change',
			color: scheme
		});

		tl.to(l1svg, 0.2, {});
		tl.to(l1svg, 0.6, {
			opacity: 1
		});
		tl.to(imgs, 0, {
			opacity: 0,
			onComplete: function() {
				loopActive = false;
			}
		});

		tl.to(preloaderElement, 0.6, {
			opacity: 0,
			onStart: function() {
				pw.classList.add('transition-animation-complete');
			},
			onComplete: function() {
				body.classList.remove('prevent-scroll');
				body.removeEventListener('touchmove', _preventScroll);
				preloaderElement.style.display = 'none';
				animation = false;

				if (scroll) {
					dispatcher.dispatch({
						type: 'page-name-change',
						id:   'projects'
					});
				} else {
					dispatcher.dispatch({
						type: 'page-name-change',
						id:   pageName
					});
				}

				dispatcher.dispatch({
					type: 'transition-step-reset',
					animation: false
				});
			}
		});
	}

	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		preloaderElement = document.getElementById('simple-preloader');
		loopImgs = document.getElementsByClassName('loop-img');
		if (!preloaderElement) {
			console.warn('simple-preloader is missing');
			return;
		}
		preloaderBg = preloaderElement.getElementsByClassName('bg');
		if (!preloaderBg || !preloaderBg.length) {
			console.warn('simple-preloader is missing');
			return;
		}
		preloaderBg = preloaderBg[0];
	}

	var _handle = function() {
		var storeData = store.getData();
		if (storeData.step1ready === true && storeData.step2ready === false) {
			_animateStep2();
		}
		if (storeData.step1ready === true && storeData.step2ready === true) {
			_animateStep3();
		}
	}

	var init = function() {
		body = document.getElementsByTagName('body')[0];
		transform = Modernizr.prefixed('transform');

		requestAnimationFrame = utils.getRequestAnimationFrame();

		_handleMutate();
		_handle();
		store.eventEmitter.subscribe(_handle);

		dispatcher.subscribe(function(e) {
			if (e.type === 'link-animation-start') {
				_animateStep1(e);
			}
		});
	}

	return {
		init: init
	}
});